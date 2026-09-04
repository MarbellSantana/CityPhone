"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Box, CalendarDays, Minus, Plus, Search, Trash2 } from "lucide-react";
import AppShell from "../components/AppShell";
import { KEYS, LocalLoan, Product, load, money, save } from "../lib/storage";

const categories = ["Fundas", "Vidrios", "Cargadores", "Auriculares", "Accesorios"];
type Tab = "productos" | "reposicion" | "prestamos";

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loans, setLoans] = useState<LocalLoan[]>([]);
  const [loanOpen, setLoanOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("productos");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas las categorías");

  useEffect(() => {
    setProducts(load<Product[]>(KEYS.products, []));
    setLoans(load<LocalLoan[]>(KEYS.localLoans, []));
  }, []);
  useEffect(() => save(KEYS.products, products), [products]);
  useEffect(() => save(KEYS.localLoans, loans), [loans]);

  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase().trim();
    const matchesText = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.code || "").toLowerCase().includes(q);
    const matchesCategory = category === "Todas las categorías" || p.category === category;
    return matchesText && matchesCategory;
  }), [products, search, category]);

  const restock = useMemo(() => products.filter(p => p.stock <= p.minStock), [products]);
  const restockUnits = useMemo(() => restock.reduce((sum,p) => sum + Math.max(1, p.minStock - p.stock), 0), [restock]);

  function addProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const product: Product = {
      id: Date.now(),
      name: String(f.get("name") || "").trim(),
      code: String(f.get("code") || "").trim(),
      category: String(f.get("category") || "Accesorios"),
      cost: Number(f.get("cost") || 0),
      price: Number(f.get("price") || 0),
      stock: Number(f.get("stock") || 0),
      minStock: Number(f.get("minStock") || 0),
    };
    if (!product.name || product.price < 0 || product.stock < 0) return;
    setProducts(v => [product, ...v]);
    e.currentTarget.reset();
  }

  function addLoan(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const loan: LocalLoan = {
      id: Date.now(),
      product: String(f.get("product") || "").trim(),
      date: String(f.get("date") || ""),
      store: String(f.get("store") || "").trim(),
      createdAt: new Date().toISOString(),
    };
    if (!loan.product || !loan.date || !loan.store) return;
    setLoans(v => [loan, ...v]);
    e.currentTarget.reset();
    setLoanOpen(false);
  }

  function adjustStock(id:number, delta:number) {
    setProducts(v => v.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  }

  function removeProduct(id:number) { setProducts(v => v.filter(p => p.id !== id)); }
  function removeLoan(id:number) { setLoans(v => v.filter(l => l.id !== id)); }

  return <AppShell title="Inventario" subtitle="Administra productos, reposición y préstamos entre locales." active="Inventario">
    <div className="subnav-tabs">
      <button className={tab === "productos" ? "active" : ""} onClick={() => setTab("productos")}><Box size={16}/> Productos</button>
      <button className={tab === "reposicion" ? "active" : ""} onClick={() => setTab("reposicion")}><AlertTriangle size={16}/> Reposición {restock.length > 0 && <span className="count-badge">{restock.length}</span>}</button>
      <button className={tab === "prestamos" ? "active" : ""} onClick={() => setTab("prestamos")}><CalendarDays size={16}/> Préstamos locales</button>
    </div>

    {tab === "productos" && <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.65fr) minmax(300px,.75fr)",gap:16,alignItems:"start"}}>
      <section className="card workspace-card" style={{minWidth:0}}>
        <div className="card-heading"><div><h2>Productos cargados</h2><p>Consulta y administra todo el inventario desde aquí.</p></div></div>
        <div className="toolbar-row">
          <div className="search-field grow"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." /></div>
          <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}><option>Todas las categorías</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
        </div>

        {filtered.length === 0 ? <div className="empty-state compact"><Box size={34}/><b>{products.length ? "Sin resultados" : "Inventario vacío"}</b><span>{products.length ? "Prueba con otra búsqueda o categoría." : "Los productos que cargues aparecerán aquí automáticamente."}</span></div> :
        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:10,marginTop:16}}>
          {filtered.map(p => <article key={p.id} style={{border:"1px solid var(--border)",borderRadius:14,padding:14,background:"#fff",display:"grid",gridTemplateColumns:"minmax(0,1.6fr) repeat(4,minmax(84px,.65fr)) auto",gap:12,alignItems:"center"}}>
            <div style={{minWidth:0}}>
              <h3 style={{margin:0,fontSize:14,fontWeight:900,overflowWrap:"anywhere"}}>{p.name}</h3>
              <small style={{display:"block",marginTop:3,color:"var(--muted)",fontWeight:700}}>{p.category}{p.code ? ` · ${p.code}` : ""}</small>
              {p.stock <= p.minStock && <small style={{display:"flex",alignItems:"center",gap:4,marginTop:5,color:"var(--danger)",fontWeight:900}}><AlertTriangle size={12}/> Necesita reposición</small>}
            </div>
            <div><small style={{display:"block",color:"var(--muted)",fontWeight:800}}>Costo</small><strong>{money.format(p.cost)}</strong></div>
            <div><small style={{display:"block",color:"var(--muted)",fontWeight:800}}>Precio</small><strong>{money.format(p.price)}</strong></div>
            <div><small style={{display:"block",color:"var(--muted)",fontWeight:800}}>Stock</small><strong style={{color:p.stock <= p.minStock ? "var(--danger)" : "var(--black)"}}>{p.stock}</strong></div>
            <div><small style={{display:"block",color:"var(--muted)",fontWeight:800}}>Mínimo</small><strong>{p.minStock}</strong></div>
            <div style={{display:"flex",gap:5}}>
              <button className="outline-action" onClick={() => adjustStock(p.id,-1)} title="Restar stock"><Minus size={14}/></button>
              <button className="outline-action" onClick={() => adjustStock(p.id,1)} title="Sumar stock"><Plus size={14}/></button>
              <button className="ghost-button" onClick={() => removeProduct(p.id)} title="Eliminar"><Trash2 size={14}/></button>
            </div>
          </article>)}
        </div>}
      </section>

      <section className="card workspace-card" style={{position:"sticky",top:18}}>
        <div className="card-heading"><div><h2>Nuevo producto</h2><p>Carga un artículo y aparecerá inmediatamente en la lista de al lado.</p></div></div>
        <form onSubmit={addProduct}>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:11}}>
            <label className="field-label">Producto<input name="name" required placeholder="Ej. Funda silicona iPhone 13" /></label>
            <label className="field-label">Código <small>Opcional</small><input name="code" placeholder="SKU o código interno" /></label>
            <label className="field-label">Categoría<select name="category" defaultValue="Fundas">{categories.map(c => <option key={c}>{c}</option>)}</select></label>
            <label className="field-label">Costo<input name="cost" type="number" min="0" step="1" defaultValue="0" /></label>
            <label className="field-label">Precio de venta<input name="price" type="number" min="0" step="1" required defaultValue="0" /></label>
            <label className="field-label">Stock inicial<input name="stock" type="number" min="0" step="1" required defaultValue="0" /></label>
            <label className="field-label">Stock mínimo<input name="minStock" type="number" min="0" step="1" defaultValue="0" /></label>
          </div>
          <button className="primary-button" type="submit" style={{width:"100%",justifyContent:"center",marginTop:12}}><Plus size={16}/> Guardar producto</button>
        </form>
      </section>
    </div>}

    {tab === "reposicion" && <section className="card workspace-card">
      <div className="card-heading">
        <div><h2>Lista de reposición</h2><p>Se arma automáticamente con todo lo que está en stock mínimo o por debajo.</p></div>
        {restock.length > 0 && <div style={{textAlign:"right"}}><strong style={{display:"block",fontSize:18}}>{restock.length}</strong><small style={{color:"var(--muted)",fontWeight:800}}>productos · {restockUnits} unidades</small></div>}
      </div>
      {restock.length === 0 ? <div className="empty-state compact"><AlertTriangle size={32}/><b>No hay productos para reponer</b><span>Cuando un producto llegue al stock mínimo o quede por debajo, aparecerá aquí automáticamente.</span></div> :
      <div style={{display:"grid",gap:10,marginTop:16}}>{restock.map((p,index) => { const needed = Math.max(1,p.minStock-p.stock); return <div key={p.id} style={{display:"grid",gridTemplateColumns:"36px minmax(0,1.8fr) minmax(90px,.7fr) minmax(90px,.7fr) minmax(110px,.8fr) auto",gap:12,alignItems:"center",padding:"12px 14px",border:"1px solid var(--border)",borderRadius:14,background:"#fff"}}><div style={{width:30,height:30,borderRadius:10,display:"grid",placeItems:"center",background:"var(--green-soft)",fontWeight:900,color:"var(--green-dark)"}}>{index+1}</div><div style={{minWidth:0}}><b style={{display:"block",overflowWrap:"anywhere"}}>{p.name}</b><small style={{color:"var(--muted)"}}>{p.category}{p.code ? ` · ${p.code}` : ""}</small></div><div><small style={{display:"block",color:"var(--muted)",fontWeight:800}}>Stock actual</small><strong style={{color:"var(--danger)",fontSize:16}}>{p.stock}</strong></div><div><small style={{display:"block",color:"var(--muted)",fontWeight:800}}>Mínimo</small><strong>{p.minStock}</strong></div><div style={{padding:"8px 10px",borderRadius:10,background:"var(--green-soft)"}}><small style={{display:"block",color:"var(--green-dark)",fontWeight:900}}>Reponer</small><strong style={{fontSize:17}}>{needed} {needed===1?"unidad":"unidades"}</strong></div><button className="outline-action" onClick={()=>adjustStock(p.id,1)}><Plus size={14}/> Sumar stock</button></div>; })}</div>}
    </section>}

    {tab === "prestamos" && <section className="card workspace-card">
      <div className="card-heading"><div><h2>Préstamos locales</h2><p>Registra productos prestados por otros locales.</p></div><button className="outline-action" onClick={() => setLoanOpen(v => !v)}><Plus size={16}/> Nuevo préstamo</button></div>
      {loanOpen && <form onSubmit={addLoan} className="section-gap"><div className="form-grid"><label className="field-label">Producto<input name="product" required placeholder="Ej. Vidrio Samsung A15" /></label><label className="field-label">Fecha<input name="date" type="date" required /></label><label className="field-label">Local que lo prestó<input name="store" required placeholder="Nombre o número del local" /></label></div><div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button className="primary-button" type="submit">Guardar préstamo</button><button className="outline-action" type="button" onClick={()=>setLoanOpen(false)}>Cancelar</button></div></form>}
      <div className="inventory-table"><div className="inventory-head" style={{gridTemplateColumns:"1.5fr 1fr 1.3fr .6fr"}}><span>Producto</span><span>Fecha</span><span>Local</span><span>Acción</span></div>{loans.length===0?<div className="empty-state compact"><CalendarDays size={32}/><b>Sin préstamos registrados</b><span>Los préstamos que cargues aparecerán en esta lista.</span></div>:loans.map(l=><div className="inventory-head" key={l.id} style={{gridTemplateColumns:"1.5fr 1fr 1.3fr .6fr",textTransform:"none",fontSize:11,borderTop:"1px solid #eef2ef",color:"var(--black)",alignItems:"center"}}><span><b>{l.product}</b></span><span>{new Date(`${l.date}T00:00:00`).toLocaleDateString("es-AR")}</span><span>{l.store}</span><span><button className="outline-action" onClick={()=>removeLoan(l.id)} title="Eliminar"><Trash2 size={14}/></button></span></div>)}</div>
    </section>}
  </AppShell>;
}
