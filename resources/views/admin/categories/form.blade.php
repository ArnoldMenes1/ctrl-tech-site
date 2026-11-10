@extends('admin.layout')
@section('title','Catégorie — CTRL-Tech')
@section('content')
<div class="admin-title"><div><p class="eyebrow">CATALOGUE</p><h1>{{ $category->exists?'Modifier la catégorie':'Ajouter une catégorie' }}</h1></div><a class="text-link" href="{{ route('admin.categories.index') }}">← Retour</a></div>
<form class="checkout-form admin-form" method="POST" action="{{ $category->exists?route('admin.categories.update',$category):route('admin.categories.store') }}">@csrf @if($category->exists)@method('PUT')@endif
<div class="form-grid"><label>Nom<input name="name" required value="{{ old('name',$category->name) }}"></label><label>Description<input name="description" value="{{ old('description',$category->description) }}"></label><label>Ordre d'affichage<input type="number" min="0" name="sort_order" value="{{ old('sort_order',$category->sort_order ?? 0) }}"></label></div><div class="admin-checks"><label><input type="checkbox" name="is_active" value="1" @checked(old('is_active',$category->is_active))> Catégorie active</label></div><button class="btn btn-primary">Enregistrer</button></form>
@endsection