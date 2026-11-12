import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { randomUUID } from "node:crypto";
import { products } from "../src/catalog";

type AuthPayload = { sub: string; email: string; name?: string };

function getSql() {
  if (!process.env.DB_URL) throw new Error("Database connection is not configured.");
  return neon(process.env.DB_URL);
}

async function requireUser(req: VercelRequest): Promise<AuthPayload> {
  const header = req.headers.authorization;
  const authorization = Array.isArray(header) ? header[0] : header;
  if (!authorization?.startsWith("Bearer ")) throw new Error("AUTH_REQUIRED");
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
  if (!jwksUrl) throw new Error("AUTH_NOT_CONFIGURED");
  const jwks = createRemoteJWKSet(new URL(jwksUrl));
  const { payload } = await jwtVerify(authorization.slice(7), jwks);
  if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
    throw new Error("INVALID_SESSION");
  }
  return {
    sub: payload.sub,
    email: payload.email,
    name: typeof payload.name === "string" ? payload.name : undefined,
  };
}

function sendError(res: VercelResponse, status: number, message: string) {
  return res.status(status).json({ error: message });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return sendError(res, 405, "Méthode non autorisée.");
  }

  try {
    const user = await requireUser(req);
    const sql = getSql();

    if (req.method === "GET") {
      const orders = await sql`
        SELECT
          o.id, o.reference, o.status, o.payment_status, o.payment_method,
          o.subtotal_usd, o.total_usd, o.total_cdf, o.created_at,
          COALESCE(
            json_agg(json_build_object(
              'product_id', i.product_id,
              'product_name', i.product_name,
              'brand', i.brand,
              'quantity', i.quantity,
              'unit_price_usd', i.unit_price_usd,
              'line_total_usd', i.line_total_usd
            )) FILTER (WHERE i.id IS NOT NULL),
            '[]'::json
          ) AS items
        FROM storefront.orders o
        LEFT JOIN storefront.order_items i ON i.order_id = o.id
        WHERE o.auth_user_id = ${user.sub}
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 30
      `;
      return res.status(200).json({ orders });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const phone = String(body?.customerPhone || "").trim();
    const address = String(body?.deliveryAddress || "").trim();
    const area = String(body?.deliveryArea || "").trim();
    const customerName = String(body?.customerName || user.name || "").trim();
    const notes = String(body?.notes || "").trim().slice(0, 1000);

    if (!phone || phone.length < 7 || !address || !area || !customerName) {
      return sendError(res, 400, "Complétez le nom, le téléphone et les informations de livraison.");
    }
    if (!Array.isArray(body?.items) || body.items.length === 0 || body.items.length > 71) {
      return sendError(res, 400, "Le panier est vide ou invalide.");
    }

    const quantities = new Map<string, number>();
    for (const item of body.items) {
      const productId = String(item?.productId || "");
      const quantity = Number(item?.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return sendError(res, 400, "Une quantité de produit est invalide.");
      }
      quantities.set(productId, (quantities.get(productId) || 0) + quantity);
    }

    const requestedIds = [...quantities.keys()].map((product_id) => ({ product_id }));
    const priceRows = await sql`
      SELECT product_id, price_usd
      FROM storefront.catalog_prices
      WHERE product_id IN (
        SELECT item.product_id
        FROM jsonb_to_recordset(${JSON.stringify(requestedIds)}::jsonb) AS item(product_id text)
      )
    `;
    const databasePrices = new Map(
      priceRows.map((row) => [String(row.product_id), Number(row.price_usd)])
    );

    const pricedItems = [];
    for (const [productId, quantity] of quantities) {
      const product = products.find((entry) => entry.id === productId);
      const unitPrice = databasePrices.get(productId);
      if (!product || !Number.isFinite(unitPrice) || quantity > 20) {
        return sendError(res, 400, "Une référence du panier n'est plus disponible.");
      }
      pricedItems.push({
        product_id: product.id,
        product_slug: product.slug,
        product_name: product.name,
        brand: product.brand,
        quantity,
        unit_price_usd: unitPrice,
        line_total_usd: Number((unitPrice * quantity).toFixed(2)),
      });
    }

    const subtotal = Number(pricedItems.reduce((sum, item) => sum + item.line_total_usd, 0).toFixed(2));
    const exchangeRate = Number(process.env.USD_TO_CDF_RATE || 2800);
    const totalCdf = Math.round((subtotal * exchangeRate) / 100) * 100;
    const reference = "CT-" + Date.now().toString(36).toUpperCase() + "-" + randomUUID().slice(0, 6).toUpperCase();

    const created = await sql`
      WITH new_order AS (
        INSERT INTO storefront.orders (
          reference, auth_user_id, customer_name, customer_email,
          customer_phone, delivery_address, delivery_area, notes,
          currency, exchange_rate, subtotal_usd, total_usd, total_cdf,
          status, payment_method, payment_status
        )
        VALUES (
          ${reference}, ${user.sub}, ${customerName}, ${user.email},
          ${phone}, ${address}, ${area}, ${notes || null},
          'USD', ${exchangeRate}, ${subtotal}, ${subtotal}, ${totalCdf},
          'pending_confirmation', 'cash_in_person', 'unpaid'
        )
        RETURNING id, reference
      ),
      inserted_items AS (
        INSERT INTO storefront.order_items (
          order_id, product_id, product_slug, product_name, brand,
          quantity, unit_price_usd, line_total_usd
        )
        SELECT
          new_order.id, item.product_id, item.product_slug, item.product_name,
          item.brand, item.quantity, item.unit_price_usd, item.line_total_usd
        FROM new_order
        CROSS JOIN jsonb_to_recordset(${JSON.stringify(pricedItems)}::jsonb) AS item(
          product_id text, product_slug text, product_name text, brand text,
          quantity integer, unit_price_usd numeric, line_total_usd numeric
        )
        RETURNING id
      )
      SELECT id, reference FROM new_order
    `;

    return res.status(201).json({
      order: {
        id: created[0]?.id,
        reference,
        status: "pending_confirmation",
        paymentMethod: "cash_in_person",
        paymentStatus: "unpaid",
        totalUsd: subtotal,
        totalCdf,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Une erreur est survenue.";
    if (message === "AUTH_REQUIRED" || message === "INVALID_SESSION") {
      return sendError(res, 401, "Connectez-vous pour consulter ou valider une commande.");
    }
    if (message === "AUTH_NOT_CONFIGURED" || message.includes("Database connection")) {
      return sendError(res, 503, "Le service de commande n'est pas encore configuré.");
    }
    console.error("CTRL-TECH orders API:", error);
    return sendError(res, 500, "Impossible de traiter la commande pour le moment.");
  }
}
