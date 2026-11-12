import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Banknote, ShieldCheck } from "lucide-react";
import type { Product } from "../catalog";
import { getAuthToken } from "../lib/auth";
import { useAuthSession } from "../lib/useAuthSession";
import { formatCdf, formatUsd } from "../lib/pricing";

export default function CheckoutPage({ cart, onClear }: { cart: Product[]; onClear: () => void }) {
  const { session, isPending } = useAuthSession();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("Lubumbashi");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user?.name) setCustomerName(session.user.name);
  }, [session?.user?.name]);

  const items = useMemo(() => {
    const grouped = new Map<string, { product: Product; quantity: number }>();
    cart.forEach(product => {
      const current = grouped.get(product.id);
      if (current) current.quantity += 1;
      else grouped.set(product.id, { product, quantity: 1 });
    });
    return [...grouped.values()];
  }, [cart]);
  const subtotal = items.reduce((sum, item) => sum + item.product.priceUsd * item.quantity, 0);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!session?.user) {
      navigate("/compte?redirect=%2Fcommande");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Votre session a expiré. Reconnectez-vous.");
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          customerName,
          customerPhone,
          deliveryAddress,
          deliveryArea,
          notes,
          items: items.map(item => ({ productId: item.product.id, quantity: item.quantity })),
        }),
      });
      const responseText = await response.text();
      let data: { error?: string; order?: { reference?: string } } = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          response.ok
            ? "Le serveur a renvoyé une réponse invalide."
            : `Le serveur rencontre une erreur (HTTP ${response.status}). Réessayez dans quelques instants.`
        );
      }
      if (!response.ok) throw new Error(data.error || "Impossible d'enregistrer la commande.");
      onClear();
      navigate("/compte?commande=" + encodeURIComponent(data.order.reference), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  if (isPending) return <div className="account-loading">Vérification de votre session…</div>;
  if (!session?.user) return <div className="account-loading">Redirection vers la connexion…</div>;
  if (cart.length === 0) return <section className="empty-state">Votre panier est vide. <Link to="/catalogue">Retour au catalogue</Link></section>;

  return <>
    <section className="page-hero compact-hero"><span className="eyebrow dark">FINALISER VOTRE SÉLECTION</span><h1>Votre <em>commande.</em></h1><p>Vérifiez les informations et choisissez le paiement en main propre.</p></section>
    <section className="checkout-layout">
      <form className="checkout-form" onSubmit={submit}>
        <div className="checkout-step"><span>01</span><div><h2>Coordonnées du client</h2><p>Ces informations seront associées à votre commande.</p></div></div>
        <label>Nom complet<input value={customerName} onChange={e => setCustomerName(e.target.value)} required autoComplete="name"/></label>
        <label>Adresse e-mail<input value={session.user.email} readOnly/></label>
        <label>Téléphone<input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required minLength={7} autoComplete="tel" placeholder="+243…"/></label>
        <div className="checkout-step"><span>02</span><div><h2>Remise de la commande</h2><p>Indiquez où vous souhaitez recevoir ou récupérer vos articles.</p></div></div>
        <label>Zone / Commune<input value={deliveryArea} onChange={e => setDeliveryArea(e.target.value)} required placeholder="Ex. Lubumbashi, Kenya…"/></label>
        <label>Adresse ou point de rendez-vous<textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} required rows={3} placeholder="Adresse précise ou point de rendez-vous"/></label>
        <label>Note complémentaire <span>(facultatif)</span><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Précisions sur la commande…"/></label>
        <div className="payment-choice"><Banknote size={22}/><div><b>Paiement en main propre</b><span>Vous réglez directement lors de la remise de la commande. Aucun paiement mobile ou en ligne n'est demandé.</span></div><ShieldCheck size={18}/></div>
        {error && <p className="account-error">{error}</p>}
        <button className="btn btn-orange checkout-submit" type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Confirmer la commande"} <ArrowRight size={17}/></button>
        <Link className="back-link" to="/panier"><ArrowLeft size={15}/> Retour au panier</Link>
      </form>
      <aside className="checkout-summary">
        <span className="eyebrow light">RÉCAPITULATIF</span><h2>{cart.length} article(s)</h2>
        {items.map(({ product, quantity }) => <div className="checkout-item" key={product.id}><img src={product.image} alt=""/><div><b>{product.name}</b><span>Qté : {quantity}</span></div><strong>{formatUsd(product.priceUsd * quantity)}</strong></div>)}
        <div className="checkout-total"><span>Total indicatif</span><b>{formatUsd(subtotal)}</b><small>≈ {formatCdf(subtotal)}</small></div>
        <p>Les prix affichés sont indicatifs. Notre équipe confirme la disponibilité et le montant final avant la remise des articles.</p>
      </aside>
    </section>
  </>;
}
