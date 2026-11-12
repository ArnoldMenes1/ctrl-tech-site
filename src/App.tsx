import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductPage from "./pages/ProductPage";
import { CategoriesPage, CategoryPage, BrandsPage, BrandPage } from "./pages/CategoryBrandPages";
import { CartPage, ComparePage } from "./pages/CartComparePages";
import { AboutPage, ContactPage, ShippingPage, PrivacyPage, TermsPage } from "./pages/InfoPages";
import AccountPage from "./pages/AccountPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage from "./pages/AdminPage";
import { useAuthSession } from "./lib/useAuthSession";
import { CatalogProvider, useCatalog } from "./lib/catalog-context";
import type { Product } from "./catalog";

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, isPending } = useAuthSession();
  const location = useLocation();
  if (isPending) return <div className="account-loading">Vérification de votre session…</div>;
  if (!session?.user) return <Navigate to={"/compte?redirect=" + encodeURIComponent(location.pathname)} replace />;
  return <>{children}</>;
}

function Store() {
  const { products, loading: catalogLoading } = useCatalog();
  const [cart, setCart] = useState<Product[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ctrltech-cart") || "[]");
      return Array.isArray(saved) ? saved.map((item: { id?: string }) => products.find((p) => p.id === item.id)).filter((p): p is Product => Boolean(p)) : [];
    } catch { return []; }
  });
  const [compare, setCompare] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("ctrltech-compare") || "[]"); } catch { return []; }
  });
  useEffect(() => {
    if (catalogLoading) return;
    try {
      const saved = JSON.parse(localStorage.getItem("ctrltech-cart") || "[]");
      if (Array.isArray(saved)) setCart(saved.map((item: { id?: string }) => products.find((p) => p.id === item.id)).filter((p): p is Product => Boolean(p)));
    } catch { setCart([]); }
  }, [catalogLoading, products]);
  useEffect(() => { if (!catalogLoading) localStorage.setItem("ctrltech-cart", JSON.stringify(cart)); }, [cart, catalogLoading]);
  useEffect(() => { localStorage.setItem("ctrltech-compare", JSON.stringify(compare)); }, [compare]);
  const add = (product: Product) => setCart((items) => [...items, product]);
  const remove = (id: string) => setCart((items) => { const index = items.findIndex((product) => product.id === id); return index < 0 ? items : items.filter((_, i) => i !== index); });
  const clear = () => setCart([]);
  const toggleCompare = (product: Product) => setCompare((items) => items.includes(product.id) ? items.filter((id) => id !== product.id) : items.length >= 3 ? items : [...items, product.id]);
  const compared = useMemo(() => compare.map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)), [compare, products]);
  return <SiteLayout cartCount={cart.length}><Routes>
    <Route path="/" element={<HomePage onAdd={add} onCompare={toggleCompare} compared={compare} />} />
    <Route path="/catalogue" element={<CatalogPage onAdd={add} onCompare={toggleCompare} compared={compare} />} />
    <Route path="/categories" element={<CategoriesPage />} />
    <Route path="/categories/:slug" element={<CategoryPage onAdd={add} onCompare={toggleCompare} compared={compare} />} />
    <Route path="/marques" element={<BrandsPage />} />
    <Route path="/marques/:slug" element={<BrandPage onAdd={add} onCompare={toggleCompare} compared={compare} />} />
    <Route path="/produit/:slug" element={<ProductPage onAdd={add} onCompare={toggleCompare} compared={compare} />} />
    <Route path="/panier" element={<CartPage cart={cart} onAdd={add} onRemove={remove} onClear={clear} />} />
    <Route path="/commande" element={<RequireAuth><CheckoutPage cart={cart} onClear={clear} /></RequireAuth>} />
    <Route path="/compte" element={<AccountPage />} />
    <Route path="/comparer" element={<ComparePage compared={compared} onAdd={add} onRemove={(id) => setCompare((items) => items.filter((x) => x !== id))} />} />
    <Route path="/a-propos" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/livraison-retours" element={<ShippingPage />} />
    <Route path="/confidentialite" element={<PrivacyPage />} />
    <Route path="/conditions-generales" element={<TermsPage />} />
    <Route path="*" element={<section className="empty-state"><h1>Page introuvable</h1><p>La page demandée n'existe pas.</p><a href="/catalogue">Retour au catalogue</a></section>} />
  </Routes></SiteLayout>;
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (window.location.hostname === "ctrl-tech-admin.vercel.app" && location.pathname === "/") {
      navigate("/admin", { replace: true });
    }
  }, [location.pathname, navigate]);
  return <Routes><Route path="/admin/*" element={<AdminPage />} /><Route path="*" element={<Store />} /></Routes>;
}

export default function App() {
  return <CatalogProvider><BrowserRouter><AppRoutes /></BrowserRouter></CatalogProvider>;
}
