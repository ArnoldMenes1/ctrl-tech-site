import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Méthode non autorisée." });
  }
  try {
    if (!process.env.DB_URL) throw new Error("Database connection is not configured.");
    const sql = neon(process.env.DB_URL);
    const [products, categories] = await Promise.all([
      sql`
        SELECT p.product_id AS id, p.slug, p.name, p.brand, p.category,
          p.category_slug AS "categorySlug", p.description, p.image_url AS image,
          p.badge, p.specifications AS specs, p.featured,
          COALESCE(pr.price_usd, 0)::numeric AS "priceUsd"
        FROM storefront.catalog_products p
        JOIN storefront.catalog_prices pr ON pr.product_id = p.product_id
        WHERE p.is_active = true
        ORDER BY p.featured DESC, p.name ASC
      `,
      sql`
        SELECT name, slug, description, image_url AS image
        FROM storefront.catalog_categories
        WHERE is_active = true
        ORDER BY sort_order ASC, name ASC
      `
    ]);
    const brands = [...new Set(products.map((product) => String(product.brand)).filter(Boolean))].sort();
    return res.status(200).json({
      products: products.map((product) => ({
        ...product,
        priceUsd: Number(product.priceUsd),
        specs: Array.isArray(product.specs) ? product.specs : [],
        featured: Boolean(product.featured),
      })),
      categories,
      brands,
    });
  } catch (error) {
    console.error("CTRL-TECH storefront API:", error);
    return res.status(503).json({ error: "Le catalogue est momentanément indisponible." });
  }
}
