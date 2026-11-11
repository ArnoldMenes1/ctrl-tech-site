@extends('layouts.app')
@section('title','Créer un compte — CTRL-Tech')
@section('content')
<section class="page-intro"><div class="container"><p class="eyebrow">ESPACE CLIENT</p><h1>Créer votre compte</h1><p>Un espace simple pour retrouver vos commandes.</p></div></section>
<section class="container section"><form class="checkout-form auth-form" method="POST" action="{{ route('customer.register.submit') }}">@csrf
<label>Nom complet<input name="name" required maxlength="160" value="{{ old('name') }}"></label>
<label>Adresse e-mail<input type="email" name="email" required value="{{ old('email') }}"></label>
<label>Téléphone<input name="phone" required value="{{ old('phone') }}"></label>
<label>Mot de passe<input type="password" name="password" required minlength="10" autocomplete="new-password"></label>
<label>Confirmer le mot de passe<input type="password" name="password_confirmation" required minlength="10" autocomplete="new-password"></label>
<button class="btn btn-primary full" type="submit">Créer mon compte</button><p class="auth-switch">Déjà inscrit ? <a href="{{ route('customer.login') }}">Se connecter</a></p></form></section>
@endsection
