import {useEffect,useMemo,useState,type ReactNode} from "react";
import {BrowserRouter,Routes,Route,Navigate,useLocation} from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import ProductPage from "./pages/ProductPage";
import {CategoriesPage,CategoryPage,BrandsPage,BrandPage} from "./pages/CategoryBrandPages";
import {CartPage,ComparePage} from "./pages/CartComparePages";
import {AboutPage,ContactPage,ShippingPage,PrivacyPage,TermsPage} from "./pages/InfoPages";
import AccountPage from "./pages/AccountPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage from "./pages/AdminPage";
import {useAuthSession} from "./lib/useAuthSession";
import {type Product,products,replaceCatalogData} from "./catalog";

function RequireAuth({children}:{children:ReactNode}){
 const {session,isPending}=useAuthSession();
 const location=useLocation();
 if(isPending)return <div className="account-loading">Vérification de votre session…</div>;
 if(!session?.user)return <Navigate to={"/compte?redirect="+encodeURIComponent(location.pathname)} replace/>;
 return <>{children}</>;
}

function Store(){
 const [cart,setCart]=useState<Product[]>(()=>{
  try{
   const saved=JSON.parse(localStorage.getItem("ctrltech-cart")||"[]");
   return Array.isArray(saved)?saved.map((item:{id?:string})=>products.find(p=>p.id===item.id)).filter((p):p is Product=>Boolean(p)):[];
  }catch{return []}
 });
 const [compare,setCompare]=useState<string[]>(()=>{try{return JSON.parse(localStorage.getItem("ctrltech-compare")||"[]")}catch{return []}});
 const [catalogVersion,setCatalogVersion]=useState(0);
 useEffect(()=>{
  let active=true;
  void fetch("/api/storefront").then(async response=>{
   if(!response.ok)return;
   const data=await response.json();
   if(!active||!Array.isArray(data.products)||!data.products.length)return;
   replaceCatalogData(data.products as Product[],Array.isArray(data.categories)?data.categories:[],Array.isArray(data.brands)?data.brands:[]);
   setCart(current=>current.map(item=>products.find(product=>product.id===item.id)||item));
   setCatalogVersion(version=>version+1);
  }).catch(()=>{});
  return()=>{active=false};
 },[]);
 useEffect(()=>{localStorage.setItem("ctrltech-cart",JSON.stringify(cart))},[cart]);
 useEffect(()=>{localStorage.setItem("ctrltech-compare",JSON.stringify(compare))},[compare]);
 const add=(p:Product)=>setCart(a=>[...a,p]);
 const remove=(id:string)=>setCart(a=>{const i=a.findIndex(p=>p.id===id);return i<0?a:a.filter((_,n)=>n!==i)});
 const clear=()=>setCart([]);
 const toggleCompare=(p:Product)=>setCompare(a=>a.includes(p.id)?a.filter(x=>x!==p.id):a.length>=3?a:[...a,p.id]);
 const compared=useMemo(()=>compare.map(id=>products.find(p=>p.id===id)).filter((p):p is Product=>!!p),[compare,catalogVersion]);
 return <div data-catalog-version={catalogVersion}><SiteLayout cartCount={cart.length}><Routes>
  <Route path="/" element={<HomePage onAdd={add} onCompare={toggleCompare} compared={compare}/>}/>
  <Route path="/catalogue" element={<CatalogPage onAdd={add} onCompare={toggleCompare} compared={compare}/>}/>
  <Route path="/categories" element={<CategoriesPage/>}/>
  <Route path="/categories/:slug" element={<CategoryPage onAdd={add} onCompare={toggleCompare} compared={compare}/>}/>
  <Route path="/marques" element={<BrandsPage/>}/>
  <Route path="/marques/:slug" element={<BrandPage onAdd={add} onCompare={toggleCompare} compared={compare}/>}/>
  <Route path="/produit/:slug" element={<ProductPage onAdd={add} onCompare={toggleCompare} compared={compare}/>}/>
  <Route path="/panier" element={<CartPage cart={cart} onAdd={add} onRemove={remove} onClear={clear}/>}/>
  <Route path="/commande" element={<RequireAuth><CheckoutPage cart={cart} onClear={clear}/></RequireAuth>}/>
  <Route path="/compte" element={<AccountPage/>}/>
  <Route path="/comparer" element={<ComparePage compared={compared} onAdd={add} onRemove={(id)=>setCompare(a=>a.filter(x=>x!==id))}/>}/>
  <Route path="/a-propos" element={<AboutPage/>}/>
  <Route path="/contact" element={<ContactPage/>}/>
  <Route path="/livraison-retours" element={<ShippingPage/>}/>
  <Route path="/confidentialite" element={<PrivacyPage/>}/>
  <Route path="/conditions-generales" element={<TermsPage/>}/>
  <Route path="*" element={<section className="empty-state"><h1>Page introuvable</h1><p>La page demandée n'existe pas.</p><a href="/catalogue">Retour au catalogue</a></section>}/>
 </Routes></SiteLayout></div>;
}
function AppRouter(){
 const isAdminHost=window.location.hostname==="ctrl-tech-admin.vercel.app";
 if(isAdminHost)return <AdminPage/>;
 return <Routes>
  <Route path="/admin/*" element={<AdminPage/>}/>
  <Route path="*" element={<Store/>}/>
 </Routes>;
}
export default function App(){return <BrowserRouter><AppRouter/></BrowserRouter>}
