import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { categories as fallbackCategories, products as fallbackProducts, type Product } from "../catalog";

type Category = { name: string; slug: string; description: string; image: string };
type CatalogValue = { products: Product[]; categories: Category[]; brands: string[]; loading: boolean };
const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetch("/api/catalog")
      .then(async (response) => {
        if (!response.ok) throw new Error("Catalogue indisponible");
        return response.json();
      })
      .then((data: { products?: Product[]; categories?: Category[] }) => {
        if (!active) return;
        if (Array.isArray(data.products) && data.products.length) setProducts(data.products);
        if (Array.isArray(data.categories) && data.categories.length) setCategories(data.categories);
      })
      .catch(() => {
        // The curated local catalogue remains available as a resilient fallback.
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const brands = useMemo(() => [...new Set(products.map((product) => product.brand))].sort(), [products]);
  const value = useMemo(() => ({ products, categories, brands, loading }), [products, categories, brands, loading]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("useCatalog must be used inside CatalogProvider");
  return value;
}
