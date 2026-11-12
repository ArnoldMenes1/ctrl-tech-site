import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";

type AdminIdentity = { sub: string; email: string; name?: string };
type Sql = ReturnType<typeof neon>;

function getSql() {
  if (!process.env.DB_URL) throw new Error("DB_NOT_CONFIGURED");
  return neon(process.env.DB_URL);
}

async function requireAdmin(req: VercelRequest, sql: Sql): Promise<AdminIdentity> {
  const header = req.headers.authorization;
  const authorization = Array.isArray(header) ? header[0] : header;
  if (!authorization?.startsWith("Bearer ")) throw new Error("AUTH_REQUIRED");
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
  if (!jwksUrl) throw new Error("AUTH_NOT_CONFIGURED");
  const { payload } = await jwtVerify(authorization.slice(7), createRemoteJWKSet(new URL(jwksUrl)));
  if (typeof payload.sub !== "string" || typeof payload.email !== "string") throw new Error("INVALID_SESSION");
  const users = await sql`
    SELECT id, name, email, role, banned
    FROM neon_auth."user"
    WHERE id = ${payload.sub}::uuid AND email = ${payload.email}
    LIMIT 1
  `;
  const account = users[0];
  if (!account) throw new Error("INVALID_SESSION");
  if (account.banned) throw new Error("ACCOUNT_SUSPENDED");
  if (account.role !== "admin") throw new Error("ADMIN_REQUIRED");
  return { sub: String(account.id), email: String(account.email), name: String(account.name || "") };
}

function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}

function parseBody(req: VercelRequest) {
  return typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
}

function sendError(res: VercelResponse, status: number, error: string) {
  return res.status(status).json({ error });
}

async function audit(sql: Sql, actor: AdminIdentity, action: string, entity: string, id: string | number | null, details: unknown = {}) {
  await sql`
    INSERT INTO storefront.admin_audit_logs (actor_user_id, action, entity_type, entity_id, details)
    VALUES (${actor.sub}::uuid, ${action}, ${entity}, ${id === null ? null : String(id)}, ${JSON.stringify(details)}::jsonb)
  `;
}

function validImageUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch { return false; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!["GET", "POST", "PATCH"].includes(req.method || "")) {
    res.setHeader("Allow", "GET, POST, PATCH");
    return sendError(res, 405, "Méthode non autorisée.");
  }

  try {
    const sql = getSql();
    const actor = await requireAdmin(req, sql);
    const resource = String(req.query.resource || "dashboard");

    if (req.method === "GET") {
      if (resource === "me") return res.status(200).json({ user: actor, role: "admin" });

      if (resource === "dashboard") {
        const rows = await sql`
          SELECT
            (SELECT COUNT(*)::int FROM storefront.catalog_products WHERE is_active = true) AS active_products,
            (SELECT COUNT(*)::int FROM neon_auth."user" WHERE COALESCE(banned, false) = false) AS accounts,
            (SELECT COUNT(*)::int FROM storefront.orders) AS orders,
            (SELECT COUNT(*)::int FROM storefront.orders WHERE status = 'pending_confirmation') AS pending_orders,
            (SELECT COALESCE(SUM(total_usd), 0)::numeric FROM storefront.orders WHERE payment_status = 'paid') AS paid_revenue_usd
        `;
        return res.status(200).json({ dashboard: rows[0] });
      }

      if (resource === "products") {
        const rows = await sql`
          SELECT p.product_id AS id, p.slug, p.name, p.brand, p.category,
            p.category_slug AS "categorySlug", p.description, p.image_url AS image,
            p.badge, p.specifications AS specs, p.featured, p.is_active AS active,
            p.created_at, p.updated_at, COALESCE(pr.price_usd, 0)::numeric AS price_usd,
            COALESCE(pr.price_cdf, 0)::numeric AS price_cdf,
            COALESCE(pr.price_confirmed, false) AS price_confirmed
          FROM storefront.catalog_products p
          LEFT JOIN storefront.catalog_prices pr ON pr.product_id = p.product_id
          ORDER BY p.created_at DESC, p.name ASC
        `;
        return res.status(200).json({ products: rows });
      }

      if (resource === "categories") {
        const rows = await sql`
          SELECT slug, name, description, image_url AS image, sort_order, is_active AS active
          FROM storefront.catalog_categories ORDER BY sort_order ASC, name ASC
        `;
        return res.status(200).json({ categories: rows });
      }

      if (resource === "orders") {
        const rows = await sql`
          SELECT o.id, o.reference, o.auth_user_id, o.customer_name, o.customer_email,
            o.customer_phone, o.delivery_address, o.delivery_area, o.notes,
            o.total_usd, o.total_cdf, o.status, o.payment_status, o.payment_method,
            o.created_at, o.updated_at,
            COALESCE(json_agg(json_build_object(
              'product_id', i.product_id, 'product_name', i.product_name,
              'brand', i.brand, 'quantity', i.quantity,
              'unit_price_usd', i.unit_price_usd, 'line_total_usd', i.line_total_usd
            )) FILTER (WHERE i.id IS NOT NULL), '[]'::json) AS items
          FROM storefront.orders o
          LEFT JOIN storefront.order_items i ON i.order_id = o.id
          GROUP BY o.id
          ORDER BY o.created_at DESC
          LIMIT 200
        `;
        return res.status(200).json({ orders: rows });
      }

      if (resource === "customers") {
        const rows = await sql`
          SELECT u.id, u.name, u.email, u.role, COALESCE(u.banned, false) AS banned,
            u."createdAt" AS created_at, COUNT(o.id)::int AS order_count,
            COALESCE(SUM(o.total_usd), 0)::numeric AS total_spent_usd
          FROM neon_auth."user" u
          LEFT JOIN storefront.orders o ON o.auth_user_id = u.id::text
          GROUP BY u.id
          ORDER BY u."createdAt" DESC
          LIMIT 200
        `;
        return res.status(200).json({ customers: rows });
      }

      return sendError(res, 404, "Ressource introuvable.");
    }

    const body = parseBody(req);

    if (req.method === "POST" && resource === "products") {
      const name = String(body.name || "").trim().slice(0, 160);
      const brand = String(body.brand || "").trim().slice(0, 80);
      const category = String(body.category || "").trim().slice(0, 80);
      const description = String(body.description || "").trim().slice(0, 4000);
      const image = String(body.image || "").trim();
      const priceUsd = Number(body.priceUsd);
      const slug = slugify(String(body.slug || name));
      const categorySlug = slugify(String(body.categorySlug || category));
      const specs = Array.isArray(body.specs) ? body.specs.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 20) : [];
      const exchangeRate = Number(process.env.USD_TO_CDF_RATE || 2800);
      if (!name || !brand || !category || !slug || !validImageUrl(image) || !Number.isFinite(priceUsd) || priceUsd <= 0) {
        return sendError(res, 400, "Nom, marque, catégorie, image HTTPS et prix USD valide sont obligatoires.");
      }
      await sql`
        INSERT INTO storefront.catalog_categories (slug, name, description, image_url)
        VALUES (${categorySlug}, ${category}, '', ${image})
        ON CONFLICT (slug) DO NOTHING
      `;
      const next = await sql`
        SELECT 'P' || LPAD((COALESCE(MAX(CASE WHEN product_id ~ '^P[0-9]+$' THEN SUBSTRING(product_id FROM 2)::int END), 0) + 1)::text, 3, '0') AS product_id
        FROM storefront.catalog_products
      `;
      const productId = String(next[0].product_id);
      await sql`
        WITH inserted AS (
          INSERT INTO storefront.catalog_products
            (product_id, slug, name, brand, category, category_slug, description, image_url, badge, specifications, featured, is_active)
          VALUES
            (${productId}, ${slug}, ${name}, ${brand}, ${category}, ${categorySlug},
             ${description}, ${image}, ${String(body.badge || "").trim() || null},
             ${JSON.stringify(specs)}::jsonb, ${Boolean(body.featured)}, ${body.active !== false})
          RETURNING product_id
        )
        INSERT INTO storefront.catalog_prices (product_id, price_usd, price_cdf, exchange_rate, price_confirmed)
        SELECT product_id, ${priceUsd}, ROUND(${priceUsd} * ${exchangeRate} / 100) * 100, ${exchangeRate}, true
        FROM inserted
      `;
      await audit(sql, actor, "product.created", "product", productId, { name, priceUsd });
      return res.status(201).json({ productId, message: "Produit créé." });
    }

    if (req.method === "PATCH" && resource === "products") {
      const productId = String(body.productId || "").trim();
      if (!productId) return sendError(res, 400, "Identifiant produit manquant.");
      if (body.action === "toggle") {
        const active = Boolean(body.active);
        const updated = await sql`
          UPDATE storefront.catalog_products SET is_active = ${active}, updated_at = now()
          WHERE product_id = ${productId} RETURNING product_id
        `;
        if (!updated.length) return sendError(res, 404, "Produit introuvable.");
        await audit(sql, actor, active ? "product.activated" : "product.deactivated", "product", productId);
        return res.status(200).json({ message: active ? "Produit activé." : "Produit désactivé." });
      }
      const name = String(body.name || "").trim().slice(0, 160);
      const brand = String(body.brand || "").trim().slice(0, 80);
      const category = String(body.category || "").trim().slice(0, 80);
      const description = String(body.description || "").trim().slice(0, 4000);
      const image = String(body.image || "").trim();
      const priceUsd = Number(body.priceUsd);
      const slug = slugify(String(body.slug || name));
      const categorySlug = slugify(String(body.categorySlug || category));
      const specs = Array.isArray(body.specs) ? body.specs.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 20) : [];
      const exchangeRate = Number(process.env.USD_TO_CDF_RATE || 2800);
      if (!name || !brand || !category || !slug || !validImageUrl(image) || !Number.isFinite(priceUsd) || priceUsd <= 0) {
        return sendError(res, 400, "Vérifiez les champs obligatoires et le prix USD.");
      }
      const updated = await sql`
        UPDATE storefront.catalog_products SET
          slug = ${slug}, name = ${name}, brand = ${brand}, category = ${category},
          category_slug = ${categorySlug}, description = ${description}, image_url = ${image},
          badge = ${String(body.badge || "").trim() || null}, specifications = ${JSON.stringify(specs)}::jsonb,
          featured = ${Boolean(body.featured)}, is_active = ${body.active !== false}, updated_at = now()
        WHERE product_id = ${productId} RETURNING product_id
      `;
      if (!updated.length) return sendError(res, 404, "Produit introuvable.");
      await sql`
        UPDATE storefront.catalog_prices SET price_usd = ${priceUsd},
          price_cdf = ROUND(${priceUsd} * ${exchangeRate} / 100) * 100,
          exchange_rate = ${exchangeRate}, price_confirmed = true, updated_at = now()
        WHERE product_id = ${productId}
      `;
      await audit(sql, actor, "product.updated", "product", productId, { name, priceUsd });
      return res.status(200).json({ message: "Produit mis à jour." });
    }

    if (req.method === "POST" && resource === "categories") {
      const name = String(body.name || "").trim().slice(0, 80);
      const slug = slugify(String(body.slug || name));
      const description = String(body.description || "").trim().slice(0, 500);
      const image = validImageUrl(body.image) ? String(body.image) : null;
      if (!name || !slug) return sendError(res, 400, "Le nom de la catégorie est obligatoire.");
      await sql`
        INSERT INTO storefront.catalog_categories (slug, name, description, image_url, sort_order)
        VALUES (${slug}, ${name}, ${description}, ${image}, 100)
      `;
      await audit(sql, actor, "category.created", "category", slug, { name });
      return res.status(201).json({ message: "Catégorie créée." });
    }

    if (req.method === "PATCH" && resource === "categories") {
      const slug = String(body.slug || "").trim();
      const active = body.active === undefined ? true : Boolean(body.active);
      if (!slug) return sendError(res, 400, "Identifiant catégorie manquant.");
      if (body.action === "toggle") {
        await sql`UPDATE storefront.catalog_categories SET is_active = ${active}, updated_at = now() WHERE slug = ${slug}`;
      } else {
        const name = String(body.name || "").trim().slice(0, 80);
        const description = String(body.description || "").trim().slice(0, 500);
        const image = validImageUrl(body.image) ? String(body.image) : null;
        if (!name) return sendError(res, 400, "Le nom de la catégorie est obligatoire.");
        await sql`UPDATE storefront.catalog_categories SET name = ${name}, description = ${description}, image_url = COALESCE(${image}, image_url), updated_at = now() WHERE slug = ${slug}`;
      }
      await audit(sql, actor, "category.updated", "category", slug, { active });
      return res.status(200).json({ message: "Catégorie mise à jour." });
    }

    if (req.method === "PATCH" && resource === "orders") {
      const orderId = Number(body.orderId);
      const allowedStatus = ["pending_confirmation", "confirmed", "processing", "ready_for_pickup", "completed", "cancelled"];
      const allowedPayment = ["unpaid", "paid", "refunded"];
      const status = String(body.status || "");
      const paymentStatus = String(body.paymentStatus || "");
      if (!Number.isInteger(orderId) || orderId < 1 || !allowedStatus.includes(status) || !allowedPayment.includes(paymentStatus)) {
        return sendError(res, 400, "Statut de commande ou de paiement invalide.");
      }
      const updated = await sql`
        UPDATE storefront.orders SET status = ${status}, payment_status = ${paymentStatus}, updated_at = now()
        WHERE id = ${orderId} RETURNING reference
      `;
      if (!updated.length) return sendError(res, 404, "Commande introuvable.");
      await audit(sql, actor, "order.updated", "order", orderId, { status, paymentStatus, reference: updated[0].reference });
      return res.status(200).json({ message: "Commande mise à jour." });
    }

    if (req.method === "PATCH" && resource === "customers") {
      const userId = String(body.userId || "").trim();
      const banned = Boolean(body.banned);
      const reason = String(body.reason || "").trim().slice(0, 500);
      if (!userId) return sendError(res, 400, "Identifiant client manquant.");
      if (userId === actor.sub) return sendError(res, 400, "Vous ne pouvez pas suspendre votre propre compte.");
      const updated = await sql`
        UPDATE neon_auth."user" SET banned = ${banned}, banReason = ${banned ? (reason || "Suspendu par un administrateur") : null},
          banExpires = NULL, "updatedAt" = now()
        WHERE id = ${userId}::uuid RETURNING id
      `;
      if (!updated.length) return sendError(res, 404, "Client introuvable.");
      await audit(sql, actor, banned ? "customer.suspended" : "customer.reactivated", "customer", userId, { reason });
      return res.status(200).json({ message: banned ? "Compte suspendu." : "Compte réactivé." });
    }

    return sendError(res, 404, "Action ou ressource introuvable.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "SERVER_ERROR";
    if (message === "AUTH_REQUIRED" || message === "INVALID_SESSION") return sendError(res, 401, "Connectez-vous pour accéder à cette ressource.");
    if (message === "ADMIN_REQUIRED") return sendError(res, 403, "Ce compte ne possède pas les droits administrateur.");
    if (message === "ACCOUNT_SUSPENDED") return sendError(res, 403, "Ce compte est suspendu.");
    if (message === "AUTH_NOT_CONFIGURED" || message === "DB_NOT_CONFIGURED") return sendError(res, 503, "Le service d'administration n'est pas configuré.");
    console.error("CTRL-TECH admin API:", error);
    return sendError(res, 500, "Impossible de traiter cette action pour le moment.");
  }
}
