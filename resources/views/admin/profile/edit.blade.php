@extends('admin.layout')
@section('title','Mon profil — CTRL-Tech')
@section('content')
<div class="admin-title"><div><p class="eyebrow">SÉCURITÉ DU COMPTE</p><h1>Mon profil</h1><p>Modifiez vos identifiants administrateur.</p></div></div>
<form class="checkout-form admin-form" method="POST" action="{{ route('admin.profile.update') }}">@csrf @method('PATCH')
<label>Nom<input name="name" required value="{{ old('name',$user->name) }}"></label>
<label>Adresse e-mail<input type="email" name="email" required value="{{ old('email',$user->email) }}"></label>
<hr><h2>Changer le mot de passe</h2><label>Mot de passe actuel<input type="password" name="current_password" required autocomplete="current-password"></label>
<label>Nouveau mot de passe (12 caractères minimum)<input type="password" name="password" minlength="12" autocomplete="new-password"></label>
<label>Confirmer le nouveau mot de passe<input type="password" name="password_confirmation" minlength="12" autocomplete="new-password"></label>
<button class="btn btn-primary">Enregistrer les modifications</button></form>
@endsection
