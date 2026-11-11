@extends('layouts.app')
@section('title','Catalogue — CTRL-Tech')
@section('content')
<section class="page-intro"><div class="container"><p class="eyebrow">BOUTIQUE TECHNOLOGIQUE · LUBUMBASHI</p><h1>Le bon équipement pour vos projets.</h1><p>Smartphones, ordinateurs et accessoires. Les références sont sélectionnées à partir de catalogues accessibles à Lubumbashi ; prix final et disponibilité confirmés par notre équipe.</p></div></section>
<section class="container catalog-layout">
 <aside class="filters">
  <h2>Affiner le catalogue</h2>
  <a class="{{ !request('categorie')?'active':'' }}" href="{{ route('products.index') }}">Toutes les catégories</a>
  @foreach($categories as $category)<a class="{{ request('categorie')===$category->slug?'active':'' }}" href="{{ route('products.index',['categorie'=>$category->slug]) }}">{{ $category->name }}</a>@endforeach
  <form method="GET" class="filter-form">
   <input type="hidden" name="q" value="{{ request('q') }}"><input type="hidden" name="categorie" value="{{ request('categorie') }}">
   <label>Marque<select name="marque"><option value="">Toutes</option>@foreach($brands as $brand)<option value="{{ $brand }}" @selected(request('marque')===$brand)>{{ $brand }}</option>@endforeach</select></label>
   <label>Prix min. (USD)<input type="number" min="0" name="prix_min" value="{{ request('prix_min') }}"></label>
   <label>Prix max. (USD)<input type="number" min="0" name="prix_max" value="{{ request('prix_max') }}"></label>
   <label class="filter-check"><input type="checkbox" name="disponible" value="1" @checked(request()->boolean('disponible'))> En stock confirmé</label>
   <button class="btn btn-primary full" type="submit">Appliquer</button>
  </form>
 </aside>
 <div><div class="catalog-toolbar"><span>{{ $products->total() }} référence(s)</span><form method="GET"><input type="hidden" name="q" value="{{ request('q') }}"><input type="hidden" name="categorie" value="{{ request('categorie') }}"><input type="hidden" name="marque" value="{{ request('marque') }}"><select name="tri" onchange="this.form.submit()"><option value="">Plus récents</option><option value="prix-croissant" @selected(request('tri')==='prix-croissant')>Prix croissant</option><option value="prix-decroissant" @selected(request('tri')==='prix-decroissant')>Prix décroissant</option></select></form></div>
  <div class="product-grid">@forelse($products as $product)@include('partials.product-card',['product'=>$product])@empty<div class="empty-state wide"><h3>Aucun produit correspondant</h3><p>Essayez une autre recherche ou consultez nos références disponibles sur demande.</p></div>@endforelse</div>
  <div class="pagination">{{ $products->links() }}</div>
 </div>
</section>
@endsection
