import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import "../admin.css";
import { Activity, ArrowLeft, ArrowUpRight, Boxes, ChartNoAxesCombined, CircleUserRound, ClipboardList, LayoutDashboard, LogOut, Package, Plus, RefreshCw, Save, ShieldCheck, Tags, Users, X } from "lucide-react";
import { authClient, getAuthToken } from "../lib/auth";
import { useAuthSession } from "../lib/useAuthSession";
import { formatUsd } from "../lib/pricing";

type Tab = "dashboard" | "products" | "orders" | "customers" | "categories" | "brands" | "activity";
type Product = { id: string; name: string; slug: string; brand: string; category: string; categorySlug: string; description: string; image: string; priceUsd: number; badge?: string | null; specs: string[]; featured: boolean; isActive: boolean };
type Order = { id: number; reference: string; customer_name: string; customer_email: string; customer_phone: string; delivery_address: string; delivery_area: string; notes?: string; total_usd: number | string; total_cdf: number | string; status: string; payment_status: string; created_at: string; items: { product_name: string; quantity: number }[] };
type Customer = { id: string; name: string; email: string; created_at: string; role?: string | null; banned: boolean; ban_reason?: string | null };
type Category = { slug: string; name: string; description?: string; image?: string; sort_order: number; isActive: boolean };
type Brand = { id: number; name: string; slug: string; description?: string; isActive: boolean };
type Metrics = { orders: number; customers: number; products: number; revenue: number };
type ProductForm = { name: string; slug: string; brand: string; category: string; categorySlug: string; description: string; image: string; priceUsd: string; badge: string; specs: string; featured: boolean; isActive: boolean };
const blankProduct: ProductForm = { name: "", slug: "", brand: "", category: "Smartphones", categorySlug: "smartphones", description: "", image: "", priceUsd: "", badge: "", specs: "", featured: false, isActive: true };
const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "products", label: "Produits", icon: Package },
  { id: "orders", label: "Commandes", icon: ClipboardList },
  { id: "customers", label: "Clients", icon: Users },
  { id: "categories", label: "Catégories", icon: Boxes },
  { id: "brands", label: "Marques", icon: Tags },
  { id: "activity", label: "Journal d'activité", icon: Activity },
];
const statusLabels: Record<string, string> = { pending_confirmation: "À confirmer", confirmed: "Confirmée", preparing: "En préparation", ready_for_delivery: "Prête à remettre", delivered: "Remise", cancelled: "Annulée" };

export default function AdminPage() {
  const { session, isPending } = useAuthSession();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [metrics, setMetrics] = useState<Metrics>({ orders: 0, customers: 0, products: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activity, setActivity] = useState<Record<string, unknown>[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [productForm, setProductForm] = useState<ProductForm>(blankProduct);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", description: "", image: "" });
  const [brandForm, setBrandForm] = useState({ name: "", slug: "", description: "" });

  const api = useCallback(async (resource: string, method = "GET", body?: unknown, id?: string) => {
    const token = await getAuthToken();
    if (!token) throw new Error("Votre session a expiré. Reconnectez-vous.");
    const url = new URL("/api/admin", window.location.origin);
    url.searchParams.set("resource", resource);
    if (id) url.searchParams.set("id", id);
    const response = await fetch(url.toString(), {
      method,
      headers: { Authorization: "Bearer " + token, ...(body ? { "Content-Type": "application/json" } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "La requête n'a pas abouti.");
    return data;
  }, []);

  const load = useCallback(async (selected: Tab = tab) => {
    setLoading(true);
    setError("");
    try {
      if (selected === "dashboard") {
        const data = await api("dashboard");
        setMetrics(data.metrics);
        setRecentOrders(data.recentOrders || []);
      } else if (selected === "products") {
        const data = await api("products"); setProducts(data.products || []);
      } else if (selected === "orders") {
        const data = await api("orders"); setOrders(data.orders || []);
      } else if (selected === "customers") {
        const data = await api("customers"); setCustomers(data.customers || []);
      } else if (selected === "categories") {
        const data = await api("categories"); setCategories(data.categories || []);
      } else if (selected === "brands") {
        const data = await api("brands"); setBrands(data.brands || []);
      } else if (selected === "activity") {
        const data = await api("activity"); setActivity(data.activity || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les données.");
    } finally { setLoading(false); }
  }, [api, tab]);

  useEffect(() => { if (session?.user?.id) void load(tab); }, [session?.user?.id, tab, load]);

  function openNewProduct() { setEditingId(""); setProductForm(blankProduct); setFormOpen(true); }
  function openEditProduct(product: Product) {
    setEditingId(product.id);
    setProductForm({ name: product.name, slug: product.slug, brand: product.brand, category: product.category,
      categorySlug: product.categorySlug, description: product.description, image: product.image,
      priceUsd: String(product.priceUsd), badge: product.badge || "", specs: (product.specs || []).join("\n"),
      featured: product.featured, isActive: product.isActive });
    setFormOpen(true);
  }
  async function saveProduct(event: FormEvent) {
    event.preventDefault(); setNotice(""); setError("");
    const payload = { ...productForm, priceUsd: Number(productForm.priceUsd), specs: productForm.specs.split("\n").map((x) => x.trim()).filter(Boolean), ...(editingId ? { id: editingId } : {}) };
    try {
      await api("products", editingId ? "PATCH" : "POST", payload);
      setNotice(editingId ? "Produit mis à jour." : "Produit ajouté au catalogue.");
      setFormOpen(false); await load("products");
    } catch (err) { setError(err instanceof Error ? err.message : "Enregistrement impossible."); }
  }
  async function archiveProduct(id: string) {
    if (!window.confirm("Retirer ce produit du catalogue public ?")) return;
    try { await api("products", "DELETE", {}, id); setNotice("Produit archivé."); await load("products"); }
    catch (err) { setError(err instanceof Error ? err.message : "Action impossible."); }
  }
  async function saveOrder(order: Order, status: string, paymentStatus: string) {
    try { await api("orders", "PATCH", { id: order.id, status, paymentStatus }); setNotice("Commande mise à jour."); await load(tab); }
    catch (err) { setError(err instanceof Error ? err.message : "Mise à jour impossible."); }
  }
  async function toggleCustomer(customer: Customer) {
    const banned = !customer.banned;
    try { await api("customers", "PATCH", { id: customer.id, banned, reason: "Suspension depuis l'administration CTRL-TECH" }); setNotice(banned ? "Compte client suspendu." : "Compte client réactivé."); await load("customers"); }
    catch (err) { setError(err instanceof Error ? err.message : "Action impossible."); }
  }
  async function saveCategory(event: FormEvent) {
    event.preventDefault();
    try { await api("categories", "POST", categoryForm); setCategoryForm({ name: "", slug: "", description: "", image: "" }); setNotice("Catégorie enregistrée."); await load("categories"); }
    catch (err) { setError(err instanceof Error ? err.message : "Enregistrement impossible."); }
  }
  async function saveBrand(event: FormEvent) {
    event.preventDefault();
    try { await api("brands", "POST", brandForm); setBrandForm({ name: "", slug: "", description: "" }); setNotice("Marque enregistrée."); await load("brands"); }
    catch (err) { setError(err instanceof Error ? err.message : "Enregistrement impossible."); }
  }

  if (isPending) return <div className="admin-loading">Chargement de la session…</div>;
  if (!session?.user) return <main className="admin-auth-screen"><div className="admin-auth-card"><div className="admin-mark">CT<span>.</span></div><span className="admin-kicker">CTRL-TECH / ADMINISTRATION</span><h1>Accès à la<br/><em>plateforme.</em></h1><p>Créez d'abord votre compte CTRL-TECH ou connectez-vous. L'accès administrateur est ensuite attribué séparément et de manière sécurisée.</p><Link className="admin-primary" to="/compte?redirect=%2Fadmin">Créer un compte / Se connecter <ArrowUpRight size={17}/></Link><Link className="admin-back" to="/">Retour à la boutique <ArrowLeft size={15}/></Link></div></main>;

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <Link to="/" className="admin-brand"><span className="admin-mark">CT<span>.</span></span><span>CTRL-TECH<small>CONTROL CENTER</small></span></Link>
      <div className="admin-side-label">ESPACE DE GESTION</div>
      <nav>{tabs.map((item) => { const Icon = item.icon; return <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => { setTab(item.id); setNotice(""); setError(""); }}><Icon size={17}/>{item.label}{tab === item.id && <span/>}</button>; })}</nav>
      <div className="admin-sidebar-bottom"><div className="admin-user"><CircleUserRound size={18}/><div><b>{session.user.name || "Administrateur"}</b><small>{session.user.email}</small></div></div><button className="admin-logout" onClick={() => void authClient.signOut()}><LogOut size={16}/> Déconnexion</button><Link to="/" className="admin-back"><ArrowLeft size={14}/> Voir la boutique</Link></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><div><span className="admin-kicker">CTRL-TECH / OPERATIONS</span><h1>{tabs.find((item) => item.id === tab)?.label}</h1></div><button className="admin-refresh" onClick={() => void load(tab)} disabled={loading}><RefreshCw size={15}/> Actualiser</button></header>
      {error && <div className="admin-alert error">{error}</div>}{notice && <div className="admin-alert success">{notice}</div>}
      {loading && <div className="admin-loading-inline">Synchronisation des données…</div>}
      {tab === "dashboard" && <section className="admin-content"><div className="admin-metrics">
        <article><span><ClipboardList size={17}/> COMMANDES</span><b>{metrics.orders}</b><small>Total enregistré</small></article>
        <article><span><Users size={17}/> CLIENTS</span><b>{metrics.customers}</b><small>Comptes actifs</small></article>
        <article><span><Package size={17}/> PRODUITS</span><b>{metrics.products}</b><small>Références publiées</small></article>
        <article><span><ChartNoAxesCombined size={17}/> ENCAISSÉ</span><b>{formatUsd(metrics.revenue)}</b><small>Commandes payées</small></article>
      </div><div className="admin-panel"><div className="admin-panel-head"><div><span className="admin-kicker">DERNIÈRES ACTIVITÉS</span><h2>Commandes récentes</h2></div><button onClick={() => setTab("orders")}>Toutes les commandes <ArrowUpRight size={15}/></button></div><div className="admin-table-wrap"><table><thead><tr><th>Référence</th><th>Client</th><th>Montant</th><th>Statut</th><th>Date</th></tr></thead><tbody>{recentOrders.map((order) => <tr key={order.id}><td><b>{order.reference}</b></td><td>{order.customer_name}<small>{order.customer_email}</small></td><td>{formatUsd(Number(order.total_usd))}</td><td><span className="admin-status">{statusLabels[order.status] || order.status}</span></td><td>{new Date(order.created_at).toLocaleDateString("fr-FR")}</td></tr>)}{recentOrders.length === 0 && <tr><td colSpan={5} className="admin-empty">Aucune commande pour le moment.</td></tr>}</tbody></table></div></div></section>}
      {tab === "products" && <section className="admin-content"><div className="admin-section-actions"><p>Gérez les références, les images, les prix et la visibilité dans la boutique.</p><button className="admin-primary" onClick={openNewProduct}><Plus size={16}/> Ajouter un produit</button></div><div className="admin-panel"><div className="admin-table-wrap"><table><thead><tr><th>Produit</th><th>Marque / Catégorie</th><th>Prix</th><th>Visibilité</th><th>Actions</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="admin-product-cell"><img src={product.image} alt=""/><div><b>{product.name}</b><small>{product.id}</small></div></div></td><td>{product.brand}<small>{product.category}</small></td><td>{formatUsd(Number(product.priceUsd))}</td><td><span className={product.isActive ? "admin-pill on" : "admin-pill off"}>{product.isActive ? "Publié" : "Masqué"}</span></td><td><div className="admin-row-actions"><button onClick={() => openEditProduct(product)}>Modifier</button><button className="danger" onClick={() => void archiveProduct(product.id)}>Archiver</button></div></td></tr>)}</tbody></table></div></div></section>}
      {tab === "orders" && <section className="admin-content"><div className="admin-panel"><div className="admin-table-wrap"><table><thead><tr><th>Commande</th><th>Client / remise</th><th>Total</th><th>État</th><th>Paiement</th><th>Mise à jour</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><b>{order.reference}</b><small>{new Date(order.created_at).toLocaleString("fr-FR")}</small><small>{(order.items || []).map((item) => item.quantity + " × " + item.product_name).join(", ")}</small></td><td>{order.customer_name}<small>{order.customer_phone} · {order.customer_email}</small><small>{order.delivery_area} — {order.delivery_address}</small></td><td>{formatUsd(Number(order.total_usd))}<small>{Number(order.total_cdf).toLocaleString("fr-FR")} CDF</small></td><td><select value={order.status} onChange={(e) => void saveOrder(order, e.target.value, order.payment_status)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td><td><select value={order.payment_status} onChange={(e) => void saveOrder(order, order.status, e.target.value)}><option value="unpaid">Non payé</option><option value="paid">Payé</option><option value="refunded">Remboursé</option></select></td><td><span className="admin-status">{order.payment_status === "paid" ? "Réglée" : "À encaisser"}</span></td></tr>)}{orders.length === 0 && <tr><td colSpan={6} className="admin-empty">Aucune commande enregistrée.</td></tr>}</tbody></table></div></div></section>}
      {tab === "customers" && <section className="admin-content"><div className="admin-panel"><div className="admin-table-wrap"><table><thead><tr><th>Client</th><th>Inscription</th><th>Rôle</th><th>Compte</th><th>Action</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><td><b>{customer.name}</b><small>{customer.email}</small></td><td>{new Date(customer.created_at).toLocaleDateString("fr-FR")}</td><td>{customer.role || "Client"}</td><td><span className={customer.banned ? "admin-pill off" : "admin-pill on"}>{customer.banned ? "Suspendu" : "Actif"}</span></td><td><button className={customer.banned ? "admin-action" : "admin-action danger"} onClick={() => void toggleCustomer(customer)}>{customer.banned ? "Réactiver" : "Suspendre"}</button></td></tr>)}</tbody></table></div></div></section>}
      {tab === "categories" && <section className="admin-content admin-two-col"><form className="admin-panel admin-form" onSubmit={saveCategory}><span className="admin-kicker">CATALOGUE</span><h2>Ajouter une catégorie</h2><label>Nom<input required value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}/></label><label>Slug<input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} placeholder="généré si vide"/></label><label>Description<textarea rows={3} value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}/></label><label>Image (URL)<input type="url" value={categoryForm.image} onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}/></label><button className="admin-primary"><Save size={15}/> Enregistrer</button></form><div className="admin-panel"><h2>Catégories existantes</h2>{categories.map((category) => <div className="admin-list-row" key={category.slug}><div><b>{category.name}</b><small>/{category.slug}</small></div><span>{category.isActive ? "Active" : "Masquée"}</span></div>)}</div></section>}
      {tab === "brands" && <section className="admin-content admin-two-col"><form className="admin-panel admin-form" onSubmit={saveBrand}><span className="admin-kicker">CATALOGUE</span><h2>Ajouter une marque</h2><label>Nom<input required value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}/></label><label>Slug<input value={brandForm.slug} onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value })} placeholder="généré si vide"/></label><label>Description<textarea rows={3} value={brandForm.description} onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}/></label><button className="admin-primary"><Save size={15}/> Enregistrer</button></form><div className="admin-panel"><h2>Marques existantes</h2>{brands.map((brand) => <div className="admin-list-row" key={brand.id}><div><b>{brand.name}</b><small>/{brand.slug}</small></div><span>{brand.isActive ? "Active" : "Masquée"}</span></div>)}</div></section>}
      {tab === "activity" && <section className="admin-content"><div className="admin-panel"><div className="admin-panel-head"><div><span className="admin-kicker">TRAÇABILITÉ</span><h2>Historique des actions</h2></div><ShieldCheck size={20}/></div>{activity.map((item, index) => <div className="admin-list-row" key={String(item.id || index)}><div><b>{String(item.action || "Action")}</b><small>{String(item.actor_name || "Administrateur")} · {String(item.entity_type || "")} {String(item.entity_id || "")}</small></div><span>{item.created_at ? new Date(String(item.created_at)).toLocaleString("fr-FR") : ""}</span></div>)}{activity.length === 0 && <p className="admin-empty">Aucune action enregistrée.</p>}</div></section>}
    </main>
    {formOpen && <div className="admin-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}><form className="admin-modal" onSubmit={saveProduct}><div className="admin-modal-head"><div><span className="admin-kicker">GESTION DU CATALOGUE</span><h2>{editingId ? "Modifier le produit" : "Nouveau produit"}</h2></div><button type="button" onClick={() => setFormOpen(false)} aria-label="Fermer"><X size={19}/></button></div><div className="admin-form-grid">
      <label>Nom du produit<input required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}/></label><label>Slug<input value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} placeholder="généré si vide"/></label>
      <label>Marque<input required value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}/></label><label>Catégorie<input required value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value, categorySlug: productForm.categorySlug || productForm.category.toLowerCase() })}/></label>
      <label>Slug catégorie<input required value={productForm.categorySlug} onChange={(e) => setProductForm({ ...productForm, categorySlug: e.target.value })}/></label><label>Prix USD<input type="number" min="0.01" step="0.01" required value={productForm.priceUsd} onChange={(e) => setProductForm({ ...productForm, priceUsd: e.target.value })}/></label>
      <label className="wide">Image du produit (URL)<input type="url" required value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} placeholder="https://…"/></label>
      <label className="wide">Description<textarea rows={3} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}/></label>
      <label>Badge<input value={productForm.badge} onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}/></label><label>Caractéristiques (une par ligne)<textarea rows={3} value={productForm.specs} onChange={(e) => setProductForm({ ...productForm, specs: e.target.value })}/></label>
      <div className="admin-checks"><label><input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}/> Produit mis en avant</label><label><input type="checkbox" checked={productForm.isActive} onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}/> Visible dans la boutique</label></div>
    </div><div className="admin-modal-actions"><button type="button" className="admin-secondary" onClick={() => setFormOpen(false)}>Annuler</button><button className="admin-primary"><Save size={15}/> {editingId ? "Enregistrer les modifications" : "Créer le produit"}</button></div></form></div>}
  </div>;
}
