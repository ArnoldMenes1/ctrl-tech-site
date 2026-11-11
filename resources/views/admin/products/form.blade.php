@extends('admin.layout')
@section('title',$product->exists?'Modifier un produit':'Ajouter un produit')
@section('content')
<div class="admin-title"><div><p class="eyebrow">CATALOGUE</p><h1>{{ $product->exists?'Modifier le produit':'Ajouter un produit' }}</h1></div><a class="text-link" href="{{ route('admin.products.index') }}">← Retour aux produits</a></div>
<form class="checkout-form admin-form" method="POST" enctype="multipart/form-data" action="{{ $product->exists?route('admin.products.update',$product):route('admin.products.store') }}">@csrf @if($product->exists)@method('PUT')@endif
<div class="form-grid">
<label>Nom du produit<input name="name" required value="{{ old('name',$product->name) }}"></label>
<label>SKU / Référence<input name="sku" value="{{ old('sku',$product->sku) }}"></label>
<label>Marque<input name="brand" value="{{ old('brand',$product->brand) }}"></label>
<label>Famille de comparaison<input name="family" value="{{ old('family',$product->family) }}" placeholder="galaxy-a-series, iphone…"></label>
<label>Catégorie<select name="category_id"><option value="">Sans catégorie</option>@foreach($categories as $category)<option value="{{ $category->id }}" @selected(old('category_id',$product->category_id)==$category->id)>{{ $category->name }}</option>@endforeach</select></label>
<label>Prix de vente USD<input type="number" step="0.01" min="0" name="price_usd" value="{{ old('price_usd',$product->price_usd) }}"></label>
<label>Prix CDF<input type="number" step="0.01" min="0" name="price_cdf" value="{{ old('price_cdf',$product->price_cdf) }}"></label>
<label>Stock actuel<input type="number" min="0" name="stock_quantity" required value="{{ old('stock_quantity',$product->stock_quantity??0) }}"></label>
<label>Seuil de stock bas<input type="number" min="0" name="low_stock_threshold" required value="{{ old('low_stock_threshold',$product->low_stock_threshold??2) }}"></label>
<label>Disponibilité<select name="availability_status"><option value="to_confirm" @selected(old('availability_status',$product->availability_status)==='to_confirm')>À confirmer</option><option value="in_stock" @selected(old('availability_status',$product->availability_status)==='in_stock')>En stock</option><option value="out_of_stock" @selected(old('availability_status',$product->availability_status)==='out_of_stock')>Rupture</option><option value="preorder" @selected(old('availability_status',$product->availability_status)==='preorder')>Précommande</option></select></label>
<label>Source de la référence<input name="source_name" value="{{ old('source_name',$product->source_name) }}"></label>
<label class="span-2">URL de la source<input type="url" name="source_url" value="{{ old('source_url',$product->source_url) }}"></label>
<label class="span-2">Image du produit<input type="file" name="image" accept="image/*"><small>JPG, PNG ou WebP · 5 Mo maximum. Vous pouvez conserver l'image distante existante.</small></label>
<label class="span-2">URL d'image externe (facultatif)<input name="image_path" value="{{ old('image_path',$product->image_path) }}"></label>
<label class="span-2">Description courte<input name="short_description" value="{{ old('short_description',$product->short_description) }}"></label>
<label class="span-2">Description<textarea name="description" rows="5">{{ old('description',$product->description) }}</textarea></label>
</div>
<div class="admin-checks"><label><input type="checkbox" name="is_active" value="1" @checked(old('is_active',$product->is_active))> Publier le produit</label><label><input type="checkbox" name="is_featured" value="1" @checked(old('is_featured',$product->is_featured))> Mettre en avant</label><label><input type="checkbox" name="price_confirmed" value="1" @checked(old('price_confirmed',$product->price_confirmed))> Prix CTRL-Tech confirmé</label></div>
<div class="notice">Un prix repère provenant d’un autre vendeur ne doit pas être validé comme prix CTRL-Tech. Cochez « Prix CTRL-Tech confirmé » uniquement après vérification. Le produit ne sera achetable en ligne que si le prix et le stock sont confirmés.</div>
<button class="btn btn-primary">Enregistrer le produit</button></form>
@endsection
