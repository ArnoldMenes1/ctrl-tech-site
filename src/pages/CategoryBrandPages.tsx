import { Link, useParams } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useCatalog } from "../lib/catalog-context";
import ProductCard from "../components/ProductCard";
export function CategoriesPage() {
  const { categories } = useCatalog();
  return <><section className="page-hero"><span className="eyebrow dark">NAVIGUER PAR UNIVERS</span><h1>Nos catégories<br/><em>de produits.</em></h1><p>Des familles distinctes pour retrouver rapidement l'équipement adapté à votre besoin.</p></section><section className="section-block"><div className="category-grid category-grid-large">{categories.map((category, index) => <Link className="category-tile" to={"/categories/" + category.slug} key={category.slug}><img src={category.image} alt=""/><div><span>CATÉGORIE / 0{index + 1}</span><h3>{category.name}</h3><p>{category.description}</p><b>Voir les produits <ArrowUpRight size={15}/></b></div></Link>)}</div></section></>;
}
export function CategoryPage({ onAdd, onCompare, compared }: { onAdd: any; onCompare: any; compared: string[] }) {
  const { slug = "" } = useParams();
  const { categories, products } = useCatalog();
  const category = categories.find((item) => item.slug === slug);
  const list = products.filter((product) => product.categorySlug === slug);
  if (!category) return <section className="empty-state">Catégorie introuvable. <Link to="/categories">Retour aux catégories</Link></section>;
  return <><section className="category-hero"><img src={category.image} alt=""/><div><span className="eyebrow light">UNIVERS CTRL-TECH</span><h1>{category.name}</h1><p>{category.description}</p><span>{list.length} références présentées</span></div></section><section className="section-block"><div className="section-heading"><div><span className="eyebrow dark">CATALOGUE / {category.name.toUpperCase()}</span><h2>Les produits<br/><em>de cet univers.</em></h2></div></div><div className="product-grid">{list.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} onCompare={onCompare} compared={compared.includes(product.id)}/>)}</div></section></>;
}
export function BrandsPage() {
  const { brands, products } = useCatalog();
  return <><section className="page-hero"><span className="eyebrow dark">NOS PARTENAIRES TECHNOLOGIQUES</span><h1>Les marques<br/><em>à découvrir.</em></h1><p>Retrouvez les références par constructeur et fabricant.</p></section><section className="section-block"><div className="brand-grid">{brands.map((brand) => <Link to={"/marques/" + encodeURIComponent(brand.toLowerCase())} key={brand}><span>MARQUE</span><strong>{brand}</strong><small>{products.filter((product) => product.brand === brand).length} référence(s)</small><ArrowUpRight/></Link>)}</div></section></>;
}
export function BrandPage({ onAdd, onCompare, compared }: { onAdd: any; onCompare: any; compared: string[] }) {
  const { slug = "" } = useParams();
  const { brands, products } = useCatalog();
  const name = brands.find((brand) => brand.toLowerCase() === decodeURIComponent(slug));
  const list = products.filter((product) => product.brand.toLowerCase() === name?.toLowerCase());
  if (!name) return <section className="empty-state">Marque introuvable. <Link to="/marques">Retour aux marques</Link></section>;
  return <><section className="page-hero"><span className="eyebrow dark">MARQUES / CTRL-TECH</span><h1>{name}<br/><em>Collection.</em></h1><p>Découvrez les références {name} présentées dans notre catalogue.</p></section><section className="section-block"><div className="product-grid">{list.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} onCompare={onCompare} compared={compared.includes(product.id)}/>)}</div></section></>;
}