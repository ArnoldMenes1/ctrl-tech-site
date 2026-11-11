import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LogOut, PackageCheck, UserRound } from "lucide-react";
import { authClient } from "../lib/auth";
import { formatCdf, formatUsd } from "../lib/pricing";

type Order = {
  id: number;
  reference: string;
  status: string;
  payment_status: string;
  total_usd: string | number;
  total_cdf: string | number;
  created_at: string;
  items: { product_name: string; quantity: number }[];
};

export default function AccountPage() {
  const { data: session, isPending } = authClient.useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/compte";
  const orderReference = params.get("commande");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    if (!session?.user?.id) {
      setOrders([]);
      return;
    }
    let active = true;
    setOrdersLoading(true);
    setOrdersError("");
    void (async () => {
      try {
        const token = await authClient.getJWTToken();
        if (!token) throw new Error("Session introuvable. Reconnectez-vous.");
        const response = await fetch("/api/orders", {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Impossible de charger les commandes.");
        if (active) setOrders(data.orders || []);
      } catch (err) {
        if (active) setOrdersError(err instanceof Error ? err.message : "Erreur de chargement.");
      } finally {
        if (active) setOrdersLoading(false);
      }
    })();
    return () => { active = false; };
  }, [session?.user?.id]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = mode === "signup"
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        setError(result.error.message || "Vérifiez vos informations puis réessayez.");
        return;
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await authClient.signOut();
    navigate("/", { replace: true });
  }

  if (isPending) return <div className="account-loading">Chargement de votre espace…</div>;

  if (session?.user) {
    return <>
      <section className="page-hero compact-hero">
        <span className="eyebrow dark">ESPACE CLIENT</span>
        <h1>Mon <em>compte.</em></h1>
        <p>Consultez vos informations et retrouvez l'historique de vos commandes.</p>
      </section>
      <section className="account-layout">
        <aside className="account-profile">
          <div className="account-avatar"><UserRound size={25}/></div>
          <span className="eyebrow dark">CLIENT CTRL-TECH</span>
          <h2>{session.user.name || "Client"}</h2>
          <p>{session.user.email}</p>
          <button className="btn btn-outline account-logout" onClick={signOut}><LogOut size={16}/> Déconnexion</button>
        </aside>
        <div className="account-orders">
          {orderReference && <div className="order-success"><PackageCheck size={22}/><div><b>Commande enregistrée</b><span>Référence : {orderReference}. Notre équipe vous contactera pour confirmer la disponibilité et les modalités de remise.</span></div></div>}
          <div className="account-section-heading"><div><span className="eyebrow dark">VOTRE ACTIVITÉ</span><h2>Mes commandes</h2></div><span>{orders.length} commande(s)</span></div>
          {ordersLoading && <p className="account-muted">Chargement des commandes…</p>}
          {ordersError && <p className="account-error">{ordersError}</p>}
          {!ordersLoading && !ordersError && orders.length === 0 && <div className="account-empty"><PackageCheck size={28}/><h3>Aucune commande pour le moment</h3><p>Vos prochaines commandes validées apparaîtront ici.</p><Link className="btn btn-orange" to="/catalogue">Explorer le catalogue <ArrowRight size={16}/></Link></div>}
          {orders.map(order => <article className="order-card" key={order.id}>
            <div className="order-card-top"><div><span>RÉFÉRENCE</span><b>{order.reference}</b></div><span className="order-status">{order.status === "pending_confirmation" ? "À confirmer" : order.status}</span></div>
            <p>{new Date(order.created_at).toLocaleDateString("fr-FR")} · {(order.items || []).reduce((sum, item) => sum + Number(item.quantity), 0)} article(s)</p>
            <div className="order-items-preview">{(order.items || []).map((item, index) => <span key={index}>{item.quantity} × {item.product_name}</span>)}</div>
            <div className="order-card-bottom"><b>{formatUsd(Number(order.total_usd))}</b><span>{new Intl.NumberFormat("fr-FR").format(Number(order.total_cdf))} CDF</span><small>Paiement en main propre · Non payé</small></div>
          </article>)}
        </div>
      </section>
    </>;
  }

  return <>
    <section className="page-hero compact-hero">
      <span className="eyebrow dark">ESPACE CLIENT CTRL-TECH</span>
      <h1>{mode === "signin" ? "Bon retour." : "Créer un compte."}<br/><em>Votre espace.</em></h1>
      <p>Connectez-vous pour suivre vos commandes ou créez votre compte en quelques instants.</p>
    </section>
    <section className="auth-layout">
      <div className="auth-card">
        <div className="auth-tabs">
          <button className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setError(""); }}>Connexion</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>Créer un compte</button>
        </div>
        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && <label>Nom complet<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required placeholder="Votre nom"/></label>}
          <label>Adresse e-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required placeholder="nom@exemple.com"/></label>
          <label>Mot de passe<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} required placeholder="8 caractères minimum"/></label>
          {error && <p className="account-error">{error}</p>}
          <button className="btn btn-orange" type="submit" disabled={busy}>{busy ? "Veuillez patienter…" : mode === "signin" ? "Se connecter" : "Créer mon compte"} <ArrowRight size={16}/></button>
        </form>
        <p className="auth-footnote">Votre compte est géré de manière sécurisée par Neon Auth. CTRL-TECH ne stocke pas votre mot de passe.</p>
      </div>
      <div className="auth-aside"><span className="eyebrow dark">VOTRE ESPACE PERSONNEL</span><h2>Une expérience<br/><em>plus simple.</em></h2><ul><li>Retrouvez vos commandes.</li><li>Gardez une trace de vos achats.</li><li>Validez vos commandes avec un compte client.</li></ul></div>
    </section>
  </>;
}
