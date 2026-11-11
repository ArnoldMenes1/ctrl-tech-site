@extends('layouts.app')
@section('title','Connexion — CTRL-Tech')
@section('content')
<section class="page-intro"><div class="container"><p class="eyebrow">ESPACE CLIENT</p><h1>Connexion</h1><p>Retrouvez vos commandes et vos informations.</p></div></section>
<section class="container section"><form class="checkout-form auth-form" method="POST" action="{{ route('customer.login.submit') }}">@csrf
<label>Adresse e-mail<input type="email" name="email" required autocomplete="email" value="{{ old('email') }}"></label>
<label>Mot de passe<input type="password" name="password" required autocomplete="current-password"></label>
<button class="btn btn-primary full" type="submit">Se connecter</button><p class="auth-switch">Pas encore de compte ? <a href="{{ route('customer.register') }}">Créer un compte</a></p></form></section>
@endsection
