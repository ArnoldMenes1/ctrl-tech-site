@extends('admin.layout')
@section('title','Catégories — CTRL-Tech')
@section('content')
<div class="admin-title"><div><p class="eyebrow">CATALOGUE</p><h1>Catégories</h1></div><a class="btn btn-primary" href="{{ route('admin.categories.create') }}">Ajouter une catégorie +</a></div>
<section class="admin-panel"><div class="table-wrap"><table><thead><tr><th>Nom</th><th>URL</th><th>Produits</th><th>État</th><th></th></tr></thead><tbody>@forelse($categories as $category)<tr><td>{{ $category->name }}</td><td>{{ $category->slug }}</td><td>{{ $category->products_count }}</td><td>{{ $category->is_active?'Active':'Masquée' }}</td><td><a class="text-link" href="{{ route('admin.categories.edit',$category) }}">Modifier</a></td></tr>@empty<tr><td colspan="5">Aucune catégorie.</td></tr>@endforelse</tbody></table></div><div class="pagination">{{ $categories->links() }}</div></section>
@endsection