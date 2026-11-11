@extends('layouts.app')
@section('title',$product->name.' — CTRL-Tech')
@section('content')
<section class="container product-detail">
 <div class="detail-image">
  @php($image=$product->image_path)
  @if($image)<img src="{{ \Illuminate\Support\Str::startsWith($image,['http://','https://'])?$image:asset('storage/'.$image) }}" alt="{{ $product->name }}">
  @else<span class="image-placeholder large">{{ $product->brand }}<span>CTRL-TECH</span></span>@endif
 </div>
 <div class="detail-copy">
  <p class="eyebrow">{{ $product->category?->name ?? 'CTRL-Tech' }}</p><h1>{{ $product->name }}</h1>
  <p class="detail-brand">{{ $product->brand }} @if($product->sku) · Réf. {{ $product->sku }} @endif</p>
  <p class="detail-description">{{ $product->short_description ?: $product->description }}</p>
  @if($product->price_confirmed && $product->price_usd)<div class="detail-price">{{ number_format((float)$product->price_usd,2) }} USD</div>
  @elseif($product->price_usd)<div class="detail-price">{{ number_format((float)$product->price_usd,2) }} USD <small>prix repère local</small></div><p class="notice">Ce tarif est une référence relevée auprès d’un vendeur local indépendant. Le prix CTRL-Tech et la disponibilité doivent être confirmés avant toute commande.</p>
  @else<div class="detail-price">Prix sur demande</div>@endif
  <p class="availability">{{ $product->stock_quantity>0 && $product->availability_status==='in_stock'?'En stock':'Disponibilité à confirmer' }}</p>
  @if($product->price_confirmed && $product->stock_quantity>0)
   <form action="{{ route('cart.store',$product) }}" method="POST" class="add-cart">@csrf<input type="number" name="quantity" value="1" min="1" max="{{ min(10,$product->stock_quantity) }}"><button class="btn btn-primary" type="submit">Ajouter au panier</button></form>
  @else<a class="btn btn-primary" href="{{ route('contact') }}?produit={{ urlencode($product->name) }}">Demander le prix et le stock</a>@endif
  <p class="detail-footnote">La disponibilité, la garantie et les modalités de livraison à Lubumbashi sont confirmées par notre équipe avant validation.</p>
  @if($product->source_url)<p class="source-note">Référence consultée : <a href="{{ $product->source_url }}" target="_blank" rel="noopener noreferrer">{{ $product->source_name ?: 'catalogue local' }}</a></p>@endif
 </div>
</section>
<section class="container description-section">
 <h2>Description & caractéristiques</h2><p>{{ $product->description ?: $product->short_description }}</p>
 @if($product->specifications)<dl class="spec-list">@foreach($product->specifications as $key=>$value)<div><dt>{{ $key }}</dt><dd>{{ $value }}</dd></div>@endforeach</dl>@endif
</section>
@if($relatedProducts->isNotEmpty())<section class="section section-soft"><div class="container"><div class="section-heading"><h2>Produits associés</h2></div><div class="product-grid">@foreach($relatedProducts as $product)@include('partials.product-card',['product'=>$product])@endforeach</div></div></section>@endif
@endsection
