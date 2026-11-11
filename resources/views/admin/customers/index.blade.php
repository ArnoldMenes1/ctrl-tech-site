@extends('admin.layout')
@section('title','Clients — CTRL-Tech')
@section('content')
<div class="admin-title"><div><p class="eyebrow">RELATION CLIENT</p><h1>Clients</h1><p>Comptes clients, historique et accès.</p></div></div>
<section class="admin-panel"><div class="table-wrap"><table><thead><tr><th>Client</th><th>Contact</th><th>Commandes</th><th>Inscription</th><th>Accès</th><th></th></tr></thead><tbody>@forelse($customers as $customer)<tr><td><strong>{{ $customer->name }}</strong></td><td>{{ $customer->email }}<br><small>{{ $customer->phone }}</small></td><td>{{ $customer->orders_count }}</td><td>{{ $customer->created_at->format('d/m/Y') }}</td><td>{{ $customer->is_active?'Actif':'Désactivé' }}</td><td><form method="POST" action="{{ route('admin.customers.toggle',$customer) }}">@csrf @method('PATCH')<button class="text-link">{{ $customer->is_active?'Désactiver':'Réactiver' }}</button></form></td></tr>@empty<tr><td colspan="6">Aucun compte client.</td></tr>@endforelse</tbody></table></div>{{ $customers->links() }}</section>
@endsection
