import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  if (_req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Méthode non autorisée." });
  }
  if (!process.env.DB_URL) {
    return res.status(503).json({ error: "Catalogue temporairement indisponible." });
  }
  try {
    const sql = neon(process.env.DB_URL);
    const [products, categories] = await Promise.all([
      sql`
        SELECT
          p.product_id AS id, p.slug, p.name, p.brand, p.category,
          p.category_slug AS "categorySlug", p.description,
          p.image_url AS image, pr.price_usd AS "priceUsd",
          p.badge, p.specifications AS specs, p.featured
        FROM storefront.catalog_products p
        INNER JOIN storefront.catalog_prices pr ON pr.product_id = p.product_id
        WHERE p.is_active = true AND pr.price_usd > 0
        ORDER BY p.featured DESC, p.name ASC
      `,
      sql`
        SELECT name, slug, description, image_url AS image
        FROM storefront.catalog_categories
        WHERE is_active = true
        ORDER BY sort_order ASC, name ASC
      `,
    ]);
    const normalized = products.map((product) => ({
      ...product,
      priceUsd: Number(product.priceUsd),
      specs: Array.isArray(product.specs) ? product.specs : [],
      featured: Boolean(product.featured),
    }));
    return res.status(200).setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300").json({
      products: normalized,
      categories,
      brands: [...new Set(normalized.map((product) => String(product.brand)))].sort(),
    });
  } catch (error) {
    console.error("CTRL-TECH catalog API:", error);
    return res.status(500).json({ error: "Impossible de charger le catalogue." });
  }
}
