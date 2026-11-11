@extends('layouts.app')
@section('title','Initialiser l’administration — CTRL-Tech')
@section('content')
<section class="container section"><form class="checkout-form auth-form" method="POST" action="{{ route('admin.setup.store') }}">@csrf
<p class="eyebrow">INITIALISATION SÉCURISÉE</p><h1>Créer le premier administrateur</h1>
<p>Cette page ne fonctionne qu'une seule fois, avant la création du premier compte administrateur.</p>
<input type="hidden" name="token" value="{{ $token }}">
<label>Nom complet<input name="name" required maxlength="160" autocomplete="name"></label>
<label>Adresse e-mail<input type="email" name="email" required autocomplete="email"></label>
<label>Mot de passe (12 caractères minimum)<input type="password" name="password" required minlength="12" autocomplete="new-password"></label>
<label>Confirmer le mot de passe<input type="password" name="password_confirmation" required minlength="12" autocomplete="new-password"></label>
<button class="btn btn-primary full">Créer mon compte administrateur</button>
</form></section>
@endsection
