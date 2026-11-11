@extends('layouts.app')
@section('title','Finaliser la commande — CTRL-Tech')
@section('content')
<section class="page-intro"><div class="container"><p class="eyebrow">DERNIÈRE ÉTAPE</p><h1>Finaliser votre commande</h1></div></section>
<section class="container checkout-layout">
<form class="checkout-form" action="{{ route('checkout.store') }}" method="POST">@csrf<h2>Vos coordonnées</h2><div class="form-grid">
<label>Nom complet<input name="customer_name" required value="{{ old('customer_name',auth()->user()?->name) }}"></label>
<label>Adresse e-mail<input type="email" name="customer_email" required value="{{ old('customer_email',auth()->user()?->email) }}"></label>
<label>Téléphone<input name="customer_phone" required value="{{ old('customer_phone',auth()->user()?->phone) }}"></label>
<label>Commune / quartier<input name="delivery_area" required value="{{ old('delivery_area') }}"></label>
<label class="span-2">Adresse de livraison<textarea name="delivery_address" required rows="3">{{ old('delivery_address',auth()->user()?->address) }}</textarea></label>
<label>Devise<select name="currency"><option value="USD" @selected(old('currency','USD')==='USD')>Dollar américain (USD)</option><option value="CDF" @selected(old('currency')==='CDF')>Franc congolais (CDF)</option></select></label>
<label>Mode de réception<select name="delivery_method"><option value="local_delivery">Livraison locale (à confirmer)</option><option value="pickup">Retrait (à confirmer)</option></select></label>
<label>Code promotionnel<input name="promotion_code" value="{{ old('promotion_code') }}" placeholder="CODE"></label>
<label class="span-2">Informations complémentaires<textarea name="notes" rows="3">{{ old('notes') }}</textarea></label></div>
<div class="notice">La commande est enregistrée après vérification serveur du prix et du stock. Le paiement et les frais de livraison sont confirmés séparément par CTRL-Tech.</div>
<button class="btn btn-primary" type="submit">Confirmer ma commande</button></form>
<aside class="cart-summary"><h2>Votre commande</h2>@foreach($cart['items'] as $line)<div class="summary-item"><span>{{ $line['product']->name }} × {{ $line['quantity'] }}</span><strong>{{ number_format($line['line_total'],2) }} USD</strong></div>@endforeach<div class="summary-total"><span>Sous-total (USD)</span><strong>{{ number_format($cart['subtotal'],2) }}</strong></div><p>Le montant final en CDF est calculé selon le taux configuré au moment de la commande.</p></aside></section>
@endsection