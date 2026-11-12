import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { randomUUID } from "node:crypto";

type AdminIdentity = { id: string; email: string; name: string };
type ProductInput = {
  id?: string; slug?: string; name?: string; brand?: string; category?: string;
  categorySlug?: string; description?: string; image?: string; badge?: string;
  specs?: string[]; featured?: boolean; isActive?: boolean; priceUsd?: number;
};

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
function getSql() {
  if (!process.env.ADMIN_DB_URL) throw new Error("ADMIN_DATABASE_NOT_CONFIGURED");
  return neon(process.env.ADMIN_DB_URL);
}
async function requireAdmin(req: VercelRequest, sql: ReturnType<typeof neon>): Promise<AdminIdentity> {
  const raw = req.headers.authorization;
  const authorization = Array.isArray(raw) ? raw[0] : raw;
  if (!authorization?.startsWith("Bearer ")) throw new Error("AUTH_REQUIRED");
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
  if (!jwksUrl) throw new Error("AUTH_NOT_CONFIGURED");
  const { payload } = await jwtVerify(authorization.slice(7), createRemoteJWKSet(new URL(jwksUrl)));
  if (typeof payload.sub !== "string") throw new Error("INVALID_SESSION");
  const rows = await sql`
    SELECT id, email, name, role, COALESCE(banned, false) AS banned
    FROM neon_auth."user"
    WHERE id = ${payload.sub}::uuid
    LIMIT 1
  `;
  const user = rows[0];
  if (!user || user.role !== "admin" || user.banned) throw new Error("ADMIN_REQUIRED");
  return { id: String(user.id), email: String(user.email), name: String(user.name || "") };
}
async function audit(sql: ReturnType<typeof neon>, actor: AdminIdentity, action: string, entity: string, id: string | null, details: unknown = {}) {
  await sql`
    INSERT INTO storefront.admin_audit_logs (actor_user_id, action, entity_type, entity_id, details)
    VALUES (${actor.id}::uuid, ${action}, ${entity}, ${id}, ${JSON.stringify(details)}::jsonb)
  `;
}
function fail(res: VercelResponse, status: number, message: string) {
  return res.status(status).json({ error: message });
}
function clean(value: unknown, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}
function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!["GET", "POST", "PATCH", "DELETE"].includes(req.method || "")) {
    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return fail(res, 405, "Méthode non autorisée.");
  }
  try {
    const sql = getSql();
    const actor = await requireAdmin(req, sql);
    const resource = queryValue(req.query.resource) || "dashboard";
    const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}) as Record<string, unknown>;

    if (req.method === "GET") {
      if (resource === "dashboard") {
        const [orders, customers, products, revenue, recent] = await Promise.all([
          sql`SELECT count(*)::int AS total FROM storefront.orders`,
          sql`SELECT count(*)::int AS total FROM neon_auth."user" WHERE COALESCE(banned, false) = false`,
          sql`SELECT count(*)::int AS total FROM storefront.catalog_products WHERE is_active = true`,
          sql`SELECT COALESCE(sum(total_usd), 0)::numeric AS total FROM storefront.orders WHERE payment_status = 'paid'`,
          sql`SELECT id, reference, customer_name, customer_email, total_usd, total_cdf, status, payment_status, created_at FROM storefront.orders ORDER BY created_at DESC LIMIT 8`,
        ]);
        return res.status(200).json({ metrics: { orders: orders[0]?.total || 0, customers: customers[0]?.total || 0, products: products[0]?.total || 0, revenue: Number(revenue[0]?.total || 0) }, recentOrders: recent });
      }
      if (resource === "products") {
        const products = await sql`
          SELECT p.product_id AS id, p.slug, p.name, p.brand, p.category, p.category_slug AS "categorySlug",
            p.description, p.image_url AS image, p.badge, p.specifications AS specs, p.featured,
            p.is_active AS "isActive", COALESCE(pr.price_usd, 0)::numeric AS "priceUsd",
            COALESCE(pr.price_cdf, 0)::numeric AS "priceCdf", pr.price_confirmed AS "priceConfirmed"
          FROM storefront.catalog_products p
          LEFT JOIN storefront.catalog_prices pr ON pr.product_id = p.product_id
          ORDER BY p.created_at DESC, p.name ASC
        `;
        return res.status(200).json({ products });
      }
      if (resource === "orders") {
        const orders = await sql`
          SELECT o.id, o.reference, o.customer_name, o.customer_email, o.customer_phone,
            o.delivery_address, o.delivery_area, o.notes, o.total_usd, o.total_cdf,
            o.status, o.payment_status, o.payment_method, o.created_at,
            COALESCE(json_agg(json_build_object('product_id', i.product_id, 'product_name', i.product_name,
              'brand', i.brand, 'quantity', i.quantity, 'unit_price_usd', i.unit_price_usd,
              'line_total_usd', i.line_total_usd)) FILTER (WHERE i.id IS NOT NULL), '[]'::json) AS items
          FROM storefront.orders o LEFT JOIN storefront.order_items i ON i.order_id = o.id
          GROUP BY o.id ORDER BY o.created_at DESC LIMIT 300
        `;
        return res.status(200).json({ orders });
      }
      if (resource === "customers") {
        const customers = await sql`
          SELECT id, name, email, "createdAt" AS created_at, role,
            COALESCE(banned, false) AS banned, "banReason" AS ban_reason
          FROM neon_auth."user" ORDER BY "createdAt" DESC LIMIT 300
        `;
        return res.status(200).json({ customers });
      }
      if (resource === "categories") {
        const categories = await sql`SELECT slug, name, description, image_url AS image, sort_order, is_active AS "isActive" FROM storefront.catalog_categories ORDER BY sort_order, name`;
        return res.status(200).json({ categories });
      }
      if (resource === "brands") {
        const brands = await sql`SELECT id, name, slug, description, is_active AS "isActive" FROM public.brands ORDER BY name`;
        return res.status(200).json({ brands });
      }
      if (resource === "activity") {
        const activity = await sql`
          SELECT l.id, l.action, l.entity_type, l.entity_id, l.details, l.created_at,
            u.name AS actor_name, u.email AS actor_email
          FROM storefront.admin_audit_logs l
          LEFT JOIN neon_auth."user" u ON u.id = l.actor_user_id
          ORDER BY l.created_at DESC LIMIT 100
        `;
        return res.status(200).json({ activity });
      }
      return fail(res, 404, "Ressource inconnue.");
    }

    if (req.method === "POST" && resource === "products") {
      const name = clean(body.name, 160);
      const brand = clean(body.brand, 100);
      const category = clean(body.category, 100);
      const categorySlug = clean(body.categorySlug || slugify(category), 100);
      const slug = clean(body.slug || slugify(name), 180);
      const image = clean(body.image, 2000);
      const priceUsd = Number(body.priceUsd);
      if (!name || !brand || !category || !slug || !image || !/^https?:\/\//i.test(image) || !Number.isFinite(priceUsd) || priceUsd <= 0) {
        return fail(res, 400, "Nom, marque, catégorie, image URL et prix USD valides sont obligatoires.");
      }
      const productId = "CT-" + randomUUID().slice(0, 8).toUpperCase();
      const rate = Number(process.env.USD_TO_CDF_RATE || 2800);
      const priceCdf = Math.round(priceUsd * rate / 100) * 100;
      const specs = Array.isArray(body.specs) ? body.specs.map((v) => clean(v, 180)).filter(Boolean).slice(0, 20) : [];
      await sql`
        INSERT INTO storefront.catalog_products
          (product_id, slug, name, brand, category, category_slug, description, image_url, badge, specifications, featured, is_active)
        VALUES
          (${productId}, ${slug}, ${name}, ${brand}, ${category}, ${categorySlug},
           ${clean(body.description, 2000)}, ${image}, ${clean(body.badge, 80) || null},
           ${JSON.stringify(specs)}::jsonb, ${body.featured === true}, ${body.isActive !== false})
      `;
      await sql`
        INSERT INTO storefront.catalog_prices (product_id, price_usd, price_cdf, exchange_rate, price_confirmed)
        VALUES (${productId}, ${priceUsd}, ${priceCdf}, ${rate}, false)
      `;
      await audit(sql, actor, "product.created", "product", productId, { name, priceUsd });
      return res.status(201).json({ productId });
    }

    if (req.method === "PATCH" && resource === "products") {
      const id = clean(body.id, 80);
      if (!id) return fail(res, 400, "Identifiant produit manquant.");
      const name = clean(body.name, 160);
      const brand = clean(body.brand, 100);
      const category = clean(body.category, 100);
      const categorySlug = clean(body.categorySlug || slugify(category), 100);
      const slug = clean(body.slug || slugify(name), 180);
      const image = clean(body.image, 2000);
      const priceUsd = Number(body.priceUsd);
      if (!name || !brand || !category || !slug || !/^https?:\/\//i.test(image) || !Number.isFinite(priceUsd) || priceUsd <= 0) {
        return fail(res, 400, "Les informations et le prix du produit sont invalides.");
      }
      const rate = Number(process.env.USD_TO_CDF_RATE || 2800);
      const priceCdf = Math.round(priceUsd * rate / 100) * 100;
      const specs = Array.isArray(body.specs) ? body.specs.map((v) => clean(v, 180)).filter(Boolean).slice(0, 20) : [];
      await sql`
        UPDATE storefront.catalog_products SET slug = ${slug}, name = ${name}, brand = ${brand},
          category = ${category}, category_slug = ${categorySlug}, description = ${clean(body.description, 2000)},
          image_url = ${image}, badge = ${clean(body.badge, 80) || null},
          specifications = ${JSON.stringify(specs)}::jsonb, featured = ${body.featured === true},
          is_active = ${body.isActive !== false}, updated_at = now()
        WHERE product_id = ${id}
      `;
      await sql`
        INSERT INTO storefront.catalog_prices (product_id, price_usd, price_cdf, exchange_rate, price_confirmed)
        VALUES (${id}, ${priceUsd}, ${priceCdf}, ${rate}, false)
        ON CONFLICT (product_id) DO UPDATE SET price_usd = EXCLUDED.price_usd,
          price_cdf = EXCLUDED.price_cdf, exchange_rate = EXCLUDED.exchange_rate,
          price_confirmed = false, updated_at = now()
      `;
      await audit(sql, actor, "product.updated", "product", id, { name, priceUsd });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE" && resource === "products") {
      const id = clean(queryValue(req.query.id) || body.id, 80);
      if (!id) return fail(res, 400, "Identifiant produit manquant.");
      await sql`UPDATE storefront.catalog_products SET is_active = false, updated_at = now() WHERE product_id = ${id}`;
      await audit(sql, actor, "product.archived", "product", id);
      return res.status(200).json({ ok: true });
    }

    if (req.method === "POST" && resource === "categories") {
      const name = clean(body.name, 100);
      const slug = clean(body.slug || slugify(name), 100);
      if (!name || !slug) return fail(res, 400, "Nom et identifiant de catégorie obligatoires.");
      await sql`
        INSERT INTO storefront.catalog_categories (slug, name, description, image_url, sort_order, is_active)
        VALUES (${slug}, ${name}, ${clean(body.description, 1000)}, ${clean(body.image, 2000) || null}, ${Number(body.sortOrder) || 0}, true)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
          image_url = EXCLUDED.image_url, sort_order = EXCLUDED.sort_order, is_active = true, updated_at = now()
      `;
      await audit(sql, actor, "category.saved", "category", slug, { name });
      return res.status(201).json({ ok: true });
    }

    if (req.method === "POST" && resource === "brands") {
      const name = clean(body.name, 100);
      const slug = clean(body.slug || slugify(name), 100);
      if (!name || !slug) return fail(res, 400, "Nom et identifiant de marque obligatoires.");
      await sql`
        INSERT INTO public.brands (name, slug, description, is_active, created_at, updated_at)
        VALUES (${name}, ${slug}, ${clean(body.description, 1000)}, true, now(), now())
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
          is_active = true, updated_at = now()
      `;
      await audit(sql, actor, "brand.saved", "brand", slug, { name });
      return res.status(201).json({ ok: true });
    }

    if (req.method === "PATCH" && resource === "orders") {
      const id = Number(body.id);
      const status = clean(body.status, 60);
      const paymentStatus = clean(body.paymentStatus, 40);
      const allowedStatus = ["pending_confirmation", "confirmed", "preparing", "ready_for_delivery", "delivered", "cancelled"];
      const allowedPayment = ["unpaid", "paid", "refunded"];
      if (!Number.isInteger(id) || id < 1 || !allowedStatus.includes(status) || !allowedPayment.includes(paymentStatus)) {
        return fail(res, 400, "Statut de commande invalide.");
      }
      await sql`UPDATE storefront.orders SET status = ${status}, payment_status = ${paymentStatus}, updated_at = now() WHERE id = ${id}`;
      await audit(sql, actor, "order.updated", "order", String(id), { status, paymentStatus });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "PATCH" && resource === "customers") {
      const id = clean(body.id, 80);
      const banned = body.banned === true;
      const reason = banned ? clean(body.reason || "Suspendu par l'administration", 500) : null;
      if (!id || id === actor.id) return fail(res, 400, "Action impossible sur ce compte.");
      await sql`
        UPDATE neon_auth."user" SET banned = ${banned}, "banReason" = ${reason},
          "banExpires" = NULL, "updatedAt" = now()
        WHERE id = ${id}::uuid AND role IS DISTINCT FROM 'admin'
      `;
      await audit(sql, actor, banned ? "customer.suspended" : "customer.restored", "customer", id);
      return res.status(200).json({ ok: true });
    }

    return fail(res, 404, "Action inconnue.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Une erreur est survenue.";
    if (message === "AUTH_REQUIRED" || message === "INVALID_SESSION") return fail(res, 401, "Connectez-vous pour continuer.");
    if (message === "ADMIN_REQUIRED") return fail(res, 403, "Ce compte ne dispose pas des droits administrateur.");
    if (message === "AUTH_NOT_CONFIGURED" || message === "ADMIN_DATABASE_NOT_CONFIGURED") return fail(res, 503, "L'administration n'est pas encore configurée.");
    console.error("CTRL-TECH admin API:", error);
    return fail(res, 500, "Impossible de traiter cette action.");
  }
}
