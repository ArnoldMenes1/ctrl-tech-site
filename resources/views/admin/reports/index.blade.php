@extends('admin.layout')
@section('title','Rapports — CTRL-Tech')
@section('content')
<div class="admin-title"><div><p class="eyebrow">PILOTAGE</p><h1>Rapports & indicateurs</h1><p>Les revenus sont calculés uniquement sur les commandes marquées comme payées.</p></div></div>
<div class="admin-stats"><article><span>Commandes enregistrées</span><strong>{{ $ordersCount }}</strong></article><article><span>Commandes payées</span><strong>{{ $paidCount }}</strong></article><article><span>Revenus confirmés</span><strong>{{ number_format((float)$revenue,2) }}</strong><small>Devise des commandes agrégées</small></article></div>
<div class="admin-panel"><h2>Performance mensuelle</h2><div class="table-wrap"><table><thead><tr><th>Mois</th><th>Commandes payées</th><th>Revenus confirmés</th></tr></thead><tbody>@forelse($monthly as $month=>$data)<tr><td>{{ $month }}</td><td>{{ $data['orders'] }}</td><td>{{ number_format((float)$data['revenue'],2) }}</td></tr>@empty<tr><td colspan="3">Aucune vente payée à analyser.</td></tr>@endforelse</tbody></table></div></div>
<div class="admin-panel"><h2>Meilleures ventes</h2><div class="table-wrap"><table><thead><tr><th>Produit</th><th>Quantité vendue</th></tr></thead><tbody>@forelse($topProducts as $name=>$quantity)<tr><td>{{ $name }}</td><td>{{ $quantity }}</td></tr>@empty<tr><td colspan="2">Aucune vente payée.</td></tr>@endforelse</tbody></table></div></div>
@endsection
