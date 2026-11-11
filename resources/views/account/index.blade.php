@extends('layouts.app')
@section('title','Mon compte — CTRL-Tech')
@section('content')
<section class="page-intro"><div class="container"><p class="eyebrow">ESPACE CLIENT</p><h1>Bonjour, {{ auth()->user()->name }}.</h1><p>Consultez l’historique et l’état de vos commandes.</p></div></section>
<section class="container section"><div class="account-heading"><div><h2>Mes commandes</h2><p>{{ $orders->total() }} commande(s) enregistrée(s)</p></div><form method="POST" action="{{ route('customer.logout') }}">@csrf<button class="text-link">Se déconnecter</button></form></div>
<div class="admin-panel"><div class="table-wrap"><table><thead><tr><th>Référence</th><th>Date</th><th>Montant</th><th>État</th><th>Paiement</th></tr></thead><tbody>@forelse($orders as $order)<tr><td>{{ $order->reference }}</td><td>{{ $order->created_at->format('d/m/Y') }}</td><td>{{ number_format((float)$order->total,2) }} {{ $order->currency }}</td><td><span class="status-pill">{{ $order->status }}</span></td><td>{{ $order->payment_status }}</td></tr>@empty<tr><td colspan="5">Vous n’avez pas encore passé de commande.</td></tr>@endforelse</tbody></table></div>{{ $orders->links() }}</div></section>
@endsection
