import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Search } from "lucide-react";
import { useCatalog } from "../lib/catalog-context";
import ProductCard from "../components/ProductCard";
export default function CatalogPage({ onAdd, onCompare, compared }: { onAdd: any; onCompare: any; compared: string[] }) {
  const { categories, products, brands } = useCatalog();
  const [params, setParams] = useSearchParams();
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState("featured");
  const [q, setQ] = useState(params.get("q") || "");
  const cat = params.get("categorie") || "";
  const filtered = useMemo(() => {
    let list = products.filter((product) => (!cat || product.categorySlug === cat) && (!brand || product.brand === brand) && (product.name + " " + product.brand + " " + product.description).toLowerCase().includes(q.toLowerCase()));
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "brand") list = [...list].sort((a, b) => a.brand.localeCompare(b.brand));
    if (sort === "featured") list = [...list].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return list;
  }, [cat, brand, q, sort, products]);
  return <><section className="page-hero"><div className="eyebrow dark">BOUTIQUE / CATALOGUE</div><h1>Le catalogue<br/><em>CTRL-TECH.</em></h1><p>Parcourez les références, filtrez par univers et consultez les fiches détaillées.</p></section><div className="catalog-layout"><aside className="catalog-sidebar"><h3><SlidersHorizontal size={17}/> Filtrer</h3><div className="filter-group"><b>Catégories</b><button className={!cat ? "filter-active" : ""} onClick={() => setParams({})}>Tous les produits <span>{products.length}</span></button>{categories.map((category) => <button key={category.slug} className={cat === category.slug ? "filter-active" : ""} onClick={() => setParams({ categorie: category.slug })}>{category.name}<span>{products.filter((product) => product.categorySlug === category.slug).length}</span></button>)}</div><div className="filter-group"><b>Marques</b><select value={brand} onChange={(event) => setBrand(event.target.value)}><option value="">Toutes les marques</option>{brands.map((item) => <option key={item}>{item}</option>)}</select></div></aside><section className="catalog-results"><div className="catalog-toolbar"><label><Search size={16}/><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Rechercher dans le catalogue"/></label><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Notre sélection</option><option value="name">Nom A à Z</option><option value="brand">Marque</option></select><span>{filtered.length} références</span></div><div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} onCompare={onCompare} compared={compared.includes(product.id)}/>)}</div>{!filtered.length && <div className="empty-state">Aucun produit ne correspond à ces critères.</div>}</section></div></>;
}