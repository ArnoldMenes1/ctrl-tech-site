@extends('layouts.app')
@section('title','Suivi de commande — CTRL-Tech')
@section('content')
<section class="page-intro"><div class="container"><p class="eyebrow">SUIVI</p><h1>Où en est votre commande ?</h1><p>Renseignez la référence et l’adresse e-mail utilisée lors de la commande.</p></div></section>
<section class="container section"><form class="checkout-form auth-form tracking-form" method="GET" action="{{ route('tracking.index') }}"><label>Référence de commande<input name="reference" required placeholder="CT-XXXXXXXX" value="{{ request('reference') }}"></label><label>Adresse e-mail<input type="email" name="email" required value="{{ request('email') }}"></label><button class="btn btn-primary full">Rechercher la commande</button>
@if(request()->filled('reference') && request()->filled('email'))@if($order)<div class="tracking-result"><p class="eyebrow">COMMANDE {{ $order->reference }}</p><h2>{{ $order->status }}</h2><p>Dernière mise à jour : {{ $order->updated_at->format('d/m/Y à H:i') }}</p><div class="summary-total"><span>Montant</span><strong>{{ number_format((float)$order->total,2) }} {{ $order->currency }}</strong></div><p>État du paiement : {{ $order->payment_status }}</p><ul>@foreach($order->items as $item)<li>{{ $item->product_name }} × {{ $item->quantity }}</li>@endforeach</ul></div>@else<div class="notice">Aucune commande ne correspond à ces informations. Vérifiez la référence et l’adresse e-mail.</div>@endif @endif
</form></section>
@endsection
