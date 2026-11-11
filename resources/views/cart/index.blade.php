@extends('layouts.app')
@section('title','Votre panier — CTRL-Tech')
@section('content')
<section class="page-intro"><div class="container"><p class="eyebrow">VOTRE SÉLECTION</p><h1>Votre panier</h1></div></section>
<section class="container cart-layout">@if($cart['items']===[])<div class="empty-state wide"><h2>Votre panier est vide.</h2><p>Explorez notre catalogue pour trouver votre prochain équipement.</p><a class="btn btn-primary" href="{{ route('products.index') }}">Voir le catalogue</a></div>@else
<div class="cart-lines">@foreach($cart['items'] as $line)@php($image=$line['product']->image_path)<article class="cart-line"><div class="cart-thumb">@if($image)<img src="{{ \Illuminate\Support\Str::startsWith($image,['http://','https://'])?$image:asset('storage/'.$image) }}" alt="">@else<span>CT</span>@endif</div><div class="cart-product"><h3>{{ $line['product']->name }}</h3><p>{{ $line['product']->sku }}</p><strong>{{ number_format((float)$line['product']->price_usd,2) }} USD</strong></div>
<form action="{{ route('cart.update',$line['product']) }}" method="POST" class="quantity-form">@csrf @method('PATCH')<input type="number" name="quantity" min="1" max="{{ min(10,$line['product']->stock_quantity) }}" value="{{ $line['quantity'] }}"><button class="text-link">Actualiser</button></form>
<form action="{{ route('cart.destroy',$line['product']) }}" method="POST">@csrf @method('DELETE')<button class="remove-link">Retirer</button></form><strong>{{ number_format($line['line_total'],2) }} USD</strong></article>@endforeach</div>
<aside class="cart-summary"><h2>Récapitulatif</h2><div><span>Sous-total (USD)</span><strong>{{ number_format($cart['subtotal'],2) }} USD</strong></div><p>Les frais de livraison seront confirmés lors du traitement de la commande.</p><a class="btn btn-primary full" href="{{ route('checkout.create') }}">Continuer la commande</a><a class="text-link" href="{{ route('products.index') }}">Continuer mes achats</a></aside>@endif</section>
@endsection
