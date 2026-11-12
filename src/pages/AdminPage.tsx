import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Boxes, Check, ChevronDown, CircleDollarSign, ClipboardList, LayoutDashboard, LogOut, Package, Plus, RefreshCw, ShieldCheck, ShoppingBag, Users, X } from "lucide-react";
import { authClient, getAuthToken } from "../lib/auth";
import { useAuthSession } from "../lib/useAuthSession";

type ProductRow = {
  id: string; slug: string; name: string; brand: string; category: string;
  categorySlug: string; description: string; image: string; badge: string | null;
  specs: string[]; featured: boolean; active: boolean; price_usd: string | number;
  price_cdf: string | number; price_confirmed: boolean;
};
type OrderRow = {
  id: number; reference: string; customer_name: string; customer_email: string;
  customer_phone: string; delivery_address: string; delivery_area: string;
  total_usd: string | number; total_cdf: string | number; status: string;
  payment_status: string; created_at: string; items: { product_name: string; quantity: number }[];
};
type CustomerRow = {
  id: string; name: string; email: string; role: string; banned: boolean;
  created_at: string; order_count: number; total_spent_usd: string | number;
};
type CategoryRow = { slug: string; name: string; description: string; image: string | null; active: boolean };
type ProductForm = {
  name: string; slug: string; brand: string; category: string; description: string;
  image: string; priceUsd: string; badge: string; specs: string; featured: boolean; active: boolean;
};
const emptyProduct: ProductForm = {
  name: "", slug: "", brand: "", category: "Smartphones", description: "",
  image: "", priceUsd: "", badge: "", specs: "", featured: false, active: true,
};
const statusLabels: Record<string, string> = {
  pending_confirmation: "À confirmer", confirmed: "Confirmée", processing: "En préparation",
  ready_for_pickup: "Prête à remettre", completed: "Terminée", cancelled: "Annulée",
};
const paymentLabels: Record<string, string> = { unpaid: "Non payée", paid: "Payée", refunded: "Remboursée" };
const money = (value: string | number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(Number(value || 0));

async function adminRequest(resource: string, method = "GET", body?: unknown) {
  const token = await getAuthToken();
  if (!token) throw new Error("Votre session a expiré. Reconnectez-vous.");
  const response = await fetch("/api/admin?resource=" + encodeURIComponent(resource), {
    method,
    headers: { Authorization: "Bearer " + token, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "La requête a échoué.");
  return data;
}

export default function AdminPage() {
  const { session, isPending, refresh } = useAuthSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState<any>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [dash, productData, orderData, customerData, categoryData] = await Promise.all([
        adminRequest("dashboard"), adminRequest("products"), adminRequest("orders"),
        adminRequest("customers"), adminRequest("categories"),
      ]);
      setDashboard(dash.dashboard);
      setProducts(productData.products || []);
      setOrders(orderData.orders || []);
      setCustomers(customerData.customers || []);
      setCategories(categoryData.categories || []);
      setAccessDenied(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de charger l'administration.";
      setError(message);
      if (message.includes("droits administrateur") || message.includes("suspendu")) setAccessDenied(true);
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (!session?.user?.id) return;
    void loadAll();
  }, [session?.user?.id]);

  async function authenticate(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const result = mode === "signup"
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) throw new Error(result.error.message || "Vérifiez vos identifiants.");
      await refresh();
      setNotice(mode === "signup"
        ? "Compte créé. Les nouveaux comptes sont clients par défaut ; les droits administrateur sont attribués séparément."
        : "Connexion réussie. Vérification des droits…");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally { setBusy(false); }
  }

  async function signOut() {
    await authClient.signOut();
    setDashboard(null); setProducts([]); setOrders([]); setCustomers([]);
  }

  function startEdit(product: ProductRow) {
    setEditingId(product.id);
    setForm({
      name: product.name, slug: product.slug, brand: product.brand, category: product.category,
      description: product.description || "", image: product.image || "", priceUsd: String(product.price_usd),
      badge: product.badge || "", specs: (product.specs || []).join("\n"),
      featured: product.featured, active: product.active,
    });
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetProductForm() { setEditingId(null); setForm(emptyProduct); }

  async function saveProduct(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const payload = {
        ...form, priceUsd: Number(form.priceUsd),
        specs: form.specs.split("\n").map(item => item.trim()).filter(Boolean),
      };
      if (editingId) await adminRequest("products", "PATCH", { ...payload, productId: editingId });
      else await adminRequest("products", "POST", payload);
      resetProductForm();
      setNotice(editingId ? "Produit mis à jour." : "Produit ajouté au catalogue.");
      await loadAll();
    } catch (err) { setError(err instanceof Error ? err.message : "Impossible d'enregistrer le produit."); }
    finally { setBusy(false); }
  }

  async function toggleProduct(product: ProductRow) {
    try {
      await adminRequest("products", "PATCH", { action: "toggle", productId: product.id, active: !product.active });
      setNotice(product.active ? "Produit retiré de la boutique." : "Produit publié dans la boutique.");
      await loadAll();
    } catch (err) { setError(err instanceof Error ? err.message : "Action impossible."); }
  }

  async function saveOrder(order: OrderRow, status: string, paymentStatus: string) {
    try {
      await adminRequest("orders", "PATCH", { orderId: order.id, status, paymentStatus });
      setNotice("Commande " + order.reference + " mise à jour.");
      await loadAll();
    } catch (err) { setError(err instanceof Error ? err.message : "Mise à jour impossible."); }
  }

  async function toggleCustomer(customer: CustomerRow) {
    const banned = !customer.banned;
    if (banned && !window.confirm("Suspendre le compte de " + customer.name + " ?")) return;
    try {
      await adminRequest("customers", "PATCH", { userId: customer.id, banned });
      setNotice(banned ? "Compte suspendu." : "Compte réactivé.");
      await loadAll();
    } catch (err) { setError(err instanceof Error ? err.message : "Action impossible."); }
  }

  async function createCategory(event: FormEvent) {
    event.preventDefault();
    try {
      await adminRequest("categories", "POST", { name: categoryName, description: categoryDescription, image: categoryImage });
      setCategoryName(""); setCategoryDescription(""); setCategoryImage("");
      setNotice("Catégorie créée."); await loadAll();
    } catch (err) { setError(err instanceof Error ? err.message : "Création impossible."); }
  }

  async function toggleCategory(category: CategoryRow) {
    try {
      await adminRequest("categories", "PATCH", { action: "toggle", slug: category.slug, active: !category.active });
      setNotice("Catégorie mise à jour."); await loadAll();
    } catch (err) { setError(err instanceof Error ? err.message : "Action impossible."); }
  }

  if (isPending) return <div className="admin-loading">Vérification de votre session…</div>;

  if (!session?.user) return (
    <main className="admin-auth-shell">
      <div className="admin-auth-brand"><span className="admin-mark">CT</span><div><b>CTRL-TECH</b><small>ADMINISTRATION</small></div></div>
      <section className="admin-auth-card">
        <span className="admin-kicker">ESPACE SÉCURISÉ</span>
        <h1>{mode === "signin" ? "Connexion" : "Créer un compte"}<br/><em>administration.</em></h1>
        <p>Connectez-vous avec votre compte CTRL-TECH. Les droits administrateur sont attribués séparément et ne peuvent pas être choisis lors de l'inscription.</p>
        <div className="admin-auth-tabs">
          <button className={mode === "signin" ? "selected" : ""} onClick={() => setMode("signin")}>Connexion</button>
          <button className={mode === "signup" ? "selected" : ""} onClick={() => setMode("signup")}>Créer un compte</button>
        </div>
        <form onSubmit={authenticate} className="admin-auth-form">
          {mode === "signup" && <label>Nom complet<input value={name} onChange={e => setName(e.target.value)} required autoComplete="name"/></label>}
          <label>Adresse e-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email"/></label>
          <label>Mot de passe<input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"}/></label>
          {error && <p className="admin-alert error">{error}</p>}
          {notice && <p className="admin-alert success">{notice}</p>}
          <button className="admin-primary" disabled={busy}>{busy ? "Patientez…" : mode === "signin" ? "Se connecter" : "Créer mon compte"} <ArrowRight size={16}/></button>
        </form>
        <a className="admin-back" href="https://ctrl-tech-site.vercel.app"><ArrowLeft size={15}/> Retour à la boutique</a>
      </section>
      <p className="admin-auth-foot"><ShieldCheck size={14}/> Connexion sécurisée par Neon Auth · Accès administrateur contrôlé côté serveur</p>
    </main>
  );

  if (accessDenied) return (
    <main className="admin-auth-shell">
      <section className="admin-auth-card admin-denied">
        <ShieldCheck size={34}/>
        <span className="admin-kicker">ACCÈS RESTREINT</span>
        <h1>Compte client<br/><em>détecté.</em></h1>
        <p>Votre compte est bien connecté, mais il ne possède pas les droits administrateur. L'inscription crée toujours un compte client ; seul l'administrateur principal peut attribuer ce rôle.</p>
        <button className="admin-primary" onClick={signOut}>Se déconnecter <LogOut size={16}/></button>
        <a className="admin-back" href="https://ctrl-tech-site.vercel.app">Retour à la boutique</a>
      </section>
    </main>
  );

  const nav = [
    { id: "dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "products", label: "Produits", icon: Package },
    { id: "orders", label: "Commandes", icon: ClipboardList },
    { id: "customers", label: "Clients", icon: Users },
    { id: "categories", label: "Catégories", icon: Boxes },
  ];

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/admin"><span className="admin-mark">CT</span><span><b>CTRL-TECH</b><small>ADMIN CONSOLE</small></span></a>
        <div className="admin-nav-label">ESPACE DE GESTION</div>
        <nav>{nav.map(item => {
          const Icon = item.icon;
          return <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => { setTab(item.id); setError(""); setNotice(""); }}>
            <Icon size={17}/><span>{item.label}</span>
            {item.id === "orders" && Number(dashboard?.pending_orders) > 0 && <i>{dashboard.pending_orders}</i>}
          </button>;
        })}</nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-user-mini"><span>{(session.user.name || session.user.email).slice(0, 1).toUpperCase()}</span><div><b>{session.user.name || "Administrateur"}</b><small>{session.user.email}</small></div></div>
          <button className="admin-logout" onClick={signOut}><LogOut size={16}/> Déconnexion</button>
          <a href="https://ctrl-tech-site.vercel.app" className="admin-store-link"><ShoppingBag size={15}/> Voir la boutique <ArrowRight size={14}/></a>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div><span className="admin-kicker">CTRL-TECH / ADMINISTRATION</span><h1>{nav.find(item => item.id === tab)?.label || "Administration"}</h1></div>
          <button className="admin-refresh" onClick={() => void loadAll()} disabled={loading}><RefreshCw size={15} className={loading ? "spin" : ""}/> Actualiser</button>
        </header>
        {error && <div className="admin-alert error">{error}<button onClick={() => setError("")}><X size={14}/></button></div>}
        {notice && <div className="admin-alert success"><Check size={15}/>{notice}<button onClick={() => setNotice("")}><X size={14}/></button></div>}

        {tab === "dashboard" && <div className="admin-content">
          <div className="admin-welcome"><div><span>TABLEAU DE BORD</span><h2>Bonjour, {session.user.name?.split(" ")[0] || "administrateur"}.</h2><p>Voici l'activité de votre boutique CTRL-TECH.</p></div><div className="admin-live"><i/> SYSTÈME CONNECTÉ</div></div>
          <div className="admin-stat-grid">
            <article><span>PRODUITS ACTIFS</span><Package size={18}/><b>{dashboard?.active_products ?? "—"}</b><small>Références publiées</small></article>
            <article><span>COMPTES CLIENTS</span><Users size={18}/><b>{dashboard?.accounts ?? "—"}</b><small>Comptes enregistrés</small></article>
            <article><span>COMMANDES</span><ClipboardList size={18}/><b>{dashboard?.orders ?? "—"}</b><small>Commandes reçues</small></article>
            <article><span>À CONFIRMER</span><CircleDollarSign size={18}/><b>{dashboard?.pending_orders ?? "—"}</b><small>En attente de traitement</small></article>
          </div>
          <div className="admin-dashboard-grid">
            <section className="admin-panel"><div className="admin-panel-head"><div><span>À TRAITER</span><h3>Commandes récentes</h3></div><button onClick={() => setTab("orders")}>Tout voir <ArrowRight size={14}/></button></div>
              {orders.slice(0, 5).length ? orders.slice(0, 5).map(order => <div className="admin-recent-order" key={order.id}><div><b>{order.reference}</b><small>{order.customer_name} · {new Date(order.created_at).toLocaleDateString("fr-FR")}</small></div><strong>{money(order.total_usd)}</strong><span>{statusLabels[order.status] || order.status}</span></div>) : <div className="admin-empty"><ClipboardList size={25}/><b>Aucune commande reçue</b><span>Les nouvelles commandes apparaîtront ici.</span></div>}
            </section>
            <section className="admin-panel admin-shortcuts"><span>ACCÈS RAPIDE</span><h3>Gérer la boutique</h3>
              <button onClick={() => { resetProductForm(); setTab("products"); }}><Plus size={17}/><span><b>Ajouter un produit</b><small>Créer une nouvelle référence</small></span><ArrowRight size={15}/></button>
              <button onClick={() => setTab("orders")}><ClipboardList size={17}/><span><b>Traiter les commandes</b><small>Confirmer et suivre les remises</small></span><ArrowRight size={15}/></button>
              <button onClick={() => setTab("customers")}><Users size={17}/><span><b>Gérer les clients</b><small>Consulter les comptes enregistrés</small></span><ArrowRight size={15}/></button>
            </section>
          </div>
        </div>}

        {tab === "products" && <div className="admin-content">
          <div className="admin-section-intro"><div><span>CATALOGUE</span><h2>{editingId ? "Modifier un produit" : "Ajouter un produit"}</h2><p>Les changements sont enregistrés dans Neon et répercutés sur la boutique.</p></div><span className="admin-count">{products.length} produits</span></div>
          <form className="admin-product-form" onSubmit={saveProduct}>
            <div className="admin-form-head"><b>{editingId ? "ÉDITION " + editingId : "NOUVELLE RÉFÉRENCE"}</b>{editingId && <button type="button" onClick={resetProductForm}><X size={14}/> Annuler</button>}</div>
            <div className="admin-form-grid">
              <label>Nom du produit<input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required placeholder="Ex. Galaxy S25 Ultra"/></label>
              <label>Marque<input value={form.brand} onChange={e => setForm({...form,brand:e.target.value})} required placeholder="Samsung, Apple…"/></label>
              <label>Catégorie<select value={form.category} onChange={e => setForm({...form,category:e.target.value})}>{categories.filter(c=>c.active).map(c=><option key={c.slug} value={c.name}>{c.name}</option>)}{!categories.some(c=>c.name===form.category)&&<option value={form.category}>{form.category}</option>}</select></label>
              <label>Prix (USD)<input type="number" min="0.01" step="0.01" value={form.priceUsd} onChange={e => setForm({...form,priceUsd:e.target.value})} required placeholder="0.00"/></label>
              <label className="wide">Adresse de l'image (URL)<input type="url" value={form.image} onChange={e => setForm({...form,image:e.target.value})} required placeholder="https://…"/></label>
              {form.image && <div className="admin-image-preview"><img src={form.image} alt="Aperçu du produit" onError={e => { e.currentTarget.style.opacity = "0.25"; }}/><span>Aperçu image</span></div>}
              <label>Badge (facultatif)<input value={form.badge} onChange={e => setForm({...form,badge:e.target.value})} placeholder="Nouveau, Promotion…"/></label>
              <label>Slug URL (facultatif)<input value={form.slug} onChange={e => setForm({...form,slug:e.target.value})} placeholder="genere-automatiquement"/></label>
              <label className="wide">Description<textarea rows={3} value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Présentez le produit…"/></label>
              <label className="wide">Caractéristiques (une par ligne)<textarea rows={4} value={form.specs} onChange={e => setForm({...form,specs:e.target.value})} placeholder={"Écran AMOLED\n256 Go de stockage\n5G"}/></label>
            </div>
            <div className="admin-form-options"><label><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Produit mis en avant</label><label><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Publier dans la boutique</label></div>
            <button className="admin-primary" disabled={busy}>{busy ? "Enregistrement…" : editingId ? "Enregistrer les modifications" : "Ajouter le produit"} <ArrowRight size={16}/></button>
          </form>
          <section className="admin-panel admin-table-panel"><div className="admin-panel-head"><div><span>INVENTAIRE CATALOGUE</span><h3>Produits enregistrés</h3></div></div>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Produit</th><th>Catégorie</th><th>Prix USD</th><th>État</th><th>Actions</th></tr></thead><tbody>
              {products.map(product=><tr key={product.id}><td><div className="admin-product-cell"><img src={product.image} alt=""/><div><b>{product.name}</b><small>{product.brand} · {product.id}</small></div></div></td><td>{product.category}</td><td>{money(product.price_usd)}</td><td><span className={product.active?"admin-state active":"admin-state"}>{product.active?"Publié":"Masqué"}</span></td><td><div className="admin-actions"><button onClick={()=>startEdit(product)}>Modifier</button><button onClick={()=>void toggleProduct(product)}>{product.active?"Masquer":"Publier"}</button></div></td></tr>)}
            </tbody></table></div>
          </section>
        </div>}

        {tab === "orders" && <div className="admin-content">
          <div className="admin-section-intro"><div><span>VENTES</span><h2>Gestion des commandes</h2><p>Confirmez les demandes, suivez la préparation et enregistrez le paiement lors de la remise.</p></div><span className="admin-count">{orders.length} commandes</span></div>
          {orders.length === 0 ? <div className="admin-panel admin-empty"><ClipboardList size={30}/><b>Aucune commande pour le moment</b><span>Les commandes validées depuis la boutique apparaîtront ici.</span></div> : orders.map(order=><article className="admin-order-card" key={order.id}>
            <div className="admin-order-head"><div><span>RÉFÉRENCE</span><b>{order.reference}</b><small>{new Date(order.created_at).toLocaleString("fr-FR")}</small></div><strong>{money(order.total_usd)} <small>· {new Intl.NumberFormat("fr-FR").format(Number(order.total_cdf))} CDF</small></strong></div>
            <div className="admin-order-details"><div><span>CLIENT</span><b>{order.customer_name}</b><small>{order.customer_email} · {order.customer_phone}</small></div><div><span>REMISE</span><b>{order.delivery_area}</b><small>{order.delivery_address}</small></div></div>
            <div className="admin-order-items">{(order.items||[]).map((item,i)=><span key={i}>{item.quantity} × {item.product_name}</span>)}</div>
            <div className="admin-order-controls"><label>État de la commande<select value={order.status} onChange={e=>void saveOrder(order,e.target.value,order.payment_status)}>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Paiement<select value={order.payment_status} onChange={e=>void saveOrder(order,order.status,e.target.value)}>{Object.entries(paymentLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>
          </article>)}
        </div>}

        {tab === "customers" && <div className="admin-content">
          <div className="admin-section-intro"><div><span>COMPTES</span><h2>Gestion des clients</h2><p>Consultez les comptes inscrits et suspendez ou réactivez un accès si nécessaire.</p></div><span className="admin-count">{customers.length} comptes</span></div>
          <section className="admin-panel admin-table-panel"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Client</th><th>Inscription</th><th>Commandes</th><th>Total achats</th><th>État</th><th>Action</th></tr></thead><tbody>
            {customers.map(customer=><tr key={customer.id}><td><div className="admin-customer-cell"><span>{(customer.name||customer.email).slice(0,1).toUpperCase()}</span><div><b>{customer.name}</b><small>{customer.email}</small></div></div></td><td>{new Date(customer.created_at).toLocaleDateString("fr-FR")}</td><td>{customer.order_count}</td><td>{money(customer.total_spent_usd)}</td><td><span className={customer.banned?"admin-state":"admin-state active"}>{customer.banned?"Suspendu":"Actif"}</span></td><td><button className="admin-text-action" onClick={()=>void toggleCustomer(customer)}>{customer.banned?"Réactiver":"Suspendre"}</button></td></tr>)}
          </tbody></table></div></section>
        </div>}

        {tab === "categories" && <div className="admin-content">
          <div className="admin-section-intro"><div><span>ORGANISATION</span><h2>Catégories</h2><p>Organisez les produits par univers et contrôlez leur visibilité.</p></div><span className="admin-count">{categories.length} catégories</span></div>
          <div className="admin-dashboard-grid">
            <form className="admin-panel admin-category-form" onSubmit={createCategory}><span>NOUVELLE CATÉGORIE</span><h3>Ajouter un univers</h3><label>Nom<input value={categoryName} onChange={e=>setCategoryName(e.target.value)} required placeholder="Ex. Impression"/></label><label>Description<textarea rows={3} value={categoryDescription} onChange={e=>setCategoryDescription(e.target.value)}/></label><label>Image (URL)<input type="url" value={categoryImage} onChange={e=>setCategoryImage(e.target.value)} placeholder="https://…"/></label><button className="admin-primary">Créer la catégorie <Plus size={15}/></button></form>
            <section className="admin-panel"><span>CATÉGORIES EXISTANTES</span><h3>Univers de la boutique</h3>{categories.map(category=><div className="admin-category-row" key={category.slug}><div>{category.image&&<img src={category.image} alt=""/>}<span><b>{category.name}</b><small>{category.slug}</small></span></div><button className={category.active?"admin-state active":"admin-state"} onClick={()=>void toggleCategory(category)}>{category.active?"Active":"Masquée"} <ChevronDown size={12}/></button></div>)}</section>
          </div>
        </div>}
        <footer className="admin-footer"><span>CTRL-TECH · ADMIN CONSOLE</span><span>Accès privé · Neon Auth · Neon Database</span></footer>
      </section>
    </main>
  );
}
