@extends('layouts.app')
@section('title','Contact — CTRL-Tech')
@section('content')
<section class="page-intro"><div class="container"><p class="eyebrow">PARLONS DE VOTRE BESOIN</p><h1>Contactez CTRL-Tech</h1><p>Une question sur un produit, une disponibilité ou une commande ? Notre équipe est à votre écoute.</p></div></section><section class="container content-page contact-panel"><div><h2>Nos coordonnées</h2><p>{{ config('storefront.address') }}</p><p>{{ config('storefront.contact_phone') ?: 'Téléphone à renseigner' }}</p><p>{{ config('storefront.contact_email') ?: 'E-mail à renseigner' }}</p></div><div><h2>Un conseil ?</h2><p>Préparez la référence du produit ou votre numéro de commande pour faciliter le traitement de votre demande.</p></div></section>
@endsection