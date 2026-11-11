@php($image=$product->image_path)
<article class="product-card">
 <a class="product-image" href="{{ route('products.show',$product) }}">
  @if($image)<img src="{{ \Illuminate\Support\Str::startsWith($image,['http://','https://'])?$image:asset('storage/'.$image) }}" alt="{{ $product->name }}" loading="lazy">
  @else<span class="image-placeholder">{{ strtoupper(substr($product->brand?:'CTRL',0,5)) }}<span>TECH</span></span>@endif
  @if($product->is_featured)<span class="product-tag">Sélection</span>@endif
 </a>
 <div class="product-info">
  <p class="eyebrow">{{ $product->brand ?: ($product->category?->name ?? 'CTRL-Tech') }}</p>
  <h3><a href="{{ route('products.show',$product) }}">{{ $product->name }}</a></h3>
  @if($product->price_confirmed && $product->price_usd)<p class="price">{{ number_format((float)$product->price_usd,2) }} USD</p>
  @elseif($product->price_usd)<p class="price price-muted">Prix repère : {{ number_format((float)$product->price_usd,2) }} USD <small>· à confirmer</small></p>
  @else<p class="price price-muted">Prix sur demande</p>@endif
  <div class="product-card-actions"><a class="text-link" href="{{ route('products.show',$product) }}">Détails →</a>
   <form action="{{ route('compare.add',$product) }}" method="POST">@csrf<button class="compare-mini" type="submit" aria-label="Comparer {{ $product->name }}">Comparer +</button></form>
  </div>
 </div>
</article>
