"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Box, CalendarDays, Minus, Plus, Search, Trash2, X } from "lucide-react";
import AppShell from "../components/AppShell";
import { KEYS, LocalLoan, Product, load, money, save } from "../lib/storage";

const categories = ["Fundas", "Vidrios", "Cargadores", "Auriculares", "Accesorios"];
type Tab = "productos" | "reposicion" | "prestamos";

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loans, setLoans] = useState<LocalLoan[]>([]);
  const [open, setOpen] = useState(false);
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
    setOpen(false);
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

    {tab === "productos" && <>
      <section className="card workspace-card">
        <div className="toolbar-row">
          <div className="search-field grow"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." /></div>
          <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}><option>Todas las categorías</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="inventory-table">
          <div className="inventory-head"><span>Producto</span><span>Categoría</span><span>Costo</span><span>Precio venta</span><span>Stock</span><span>Acciones</span></div>
          {filtered.length === 0 ? <div className="empty-state compact"><Box size={34}/><b>{products.length ? "Sin resultados" : "Inventario vacío"}</b><span>{products.length ? "Prueba con otra búsqueda o categoría." : "Los productos que cargues aparecerán aquí automáticamente."}</span></div> : filtered.map(p => <div className="inventory-head" key={p.id} style={{textTransform:"none", fontSize:11, borderTop:"1px solid #eef2ef", color:"var(--black)", alignItems:"center"}}>
            <span><b>{p.name}</b>{p.code && <small style={{display:"block", color:"var(--muted)"}}>{p.code}</small>}</span>
            <span>{p.category}</span><span>{money.format(p.cost)}</span><span>{money.format(p.price)}</span>
            <span><b style={{color:p.stock <= p.minStock ? "var(--danger)" : "inherit"}}>{p.stock}</b> <small style={{color:"var(--muted)"}}>mín. {p.minStock}</small></span>
            <span style={{display:"flex", gap:6, flexWrap:"wrap"}}><button className="outline-action" onClick={() => adjustStock(p.id,-1)} title="Restar stock"><Minus size={14}/></button><button className="outline-action" onClick={() => adjustStock(p.id,1)} title="Sumar stock"><Plus size={14}/></button><button className="outline-action" onClick={() => removeProduct(p.id)} title="Eliminar"><Trash2 size={14}/></button></span>
          </div>)}
        </div>
      </section>

      {open && <section className="card workspace-card section-gap">
        <div className="card-heading"><div><h2>Nuevo producto</h2><p>Carga un artículo para venderlo y controlar su stock.</p></div><button className="ghost-button" onClick={() => setOpen(false)}><X size={17}/> Cerrar</button></div>
        <form onSubmit={addProduct}>
          <div className="form-grid">
            <label className="field-label">Producto<input name="name" required placeholder="Ej. Funda silicona iPhone 13" /></label>
            <label className="field-label">Código <small>Opcional</small><input name="code" placeholder="SKU o código interno" /></label>
            <label className="field-label">Categoría<select name="category" defaultValue="Fundas">{categories.map(c => <option key={c}>{c}</option>)}</select></label>
            <label className="field-label">Costo<input name="cost" type="number" min="0" step="1" defaultValue="0" /></label>
            <label className="field-label">Precio de venta<input name="price" type="number" min="0" step="1" required defaultValue="0" /></label>
            <label className="field-label">Stock inicial<input name="stock" type="number" min="0" step="1" required defaultValue="0" /></label>
            <label className="field-label">Stock mínimo<input name="minStock" type="number" min="0" step="1" defaultValue="0" /></label>
          </div>
          <button className="primary-button" type="submit">Guardar producto</button>
        </form>
      </section>}

      {!open && <section className="card workspace-card section-gap" style={{textAlign:"center"}}>
        <div style={{maxWidth:520, margin:"0 auto", padding:"20px 10px"}}><h2 style={{margin:"0 0 6px"}}>Nuevo producto</h2><p style={{margin:"0 0 16px", color:"var(--muted)", fontSize:12}}>Agrega un producto al inventario de City Phone.</p><button className="primary-button" onClick={() => setOpen(true)}><Plus size={18}/> Nuevo producto</button></div>
      </section>}
    </>}

    {tab === "reposicion" && <section className="card workspace-card">
      <div className="card-heading"><div><h2>Reposición</h2><p>Se actualiza automáticamente según el stock real del inventario.</p></div></div>
      <div className="inventory-table">
        <div className="inventory-head"><span>Producto</span><span>Categoría</span><span>Stock actual</span><span>Stock mínimo</span><span>Faltante</span><span>Acción</span></div>
        {restock.length === 0 ? <div className="empty-state compact"><AlertTriangle size={32}/><b>No hay productos para reponer</b><span>Cuando una venta deje un producto en su stock mínimo o por debajo, aparecerá aquí automáticamente.</span></div> : restock.map(p => <div className="inventory-head" key={p.id} style={{textTransform:"none", fontSize:11, borderTop:"1px solid #eef2ef", color:"var(--black)", alignItems:"center"}}>
          <span><b>{p.name}</b></span><span>{p.category}</span><span style={{color:"var(--danger)", fontWeight:900}}>{p.stock}</span><span>{p.minStock}</span><span>{Math.max(0, p.minStock - p.stock)}</span><span><button className="outline-action" onClick={() => adjustStock(p.id,1)}><Plus size={14}/> Sumar stock</button></span>
        </div>)}
      </div>
    </section>}

    {tab === "prestamos" && <>
      <section className="card workspace-card">
        <div className="card-heading"><div><h2>Préstamos locales</h2><p>Registra productos prestados por otros locales.</p></div><button className="outline-action" onClick={() => setLoanOpen(v => !v)}><Plus size={16}/> Nuevo préstamo</button></div>
        {loanOpen && <form onSubmit={addLoan} className="section-gap">
          <div className="form-grid">
            <label className="field-label">Producto<input name="product" required placeholder="Ej. Vidrio Samsung A15" /></label>
            <label className="field-label">Fecha<input name="date" type="date" required /></label>
            <label className="field-label">Local que lo prestó<input name="store" required placeholder="Nombre o número del local" /></label>
          </div>
          <div style={{display:"flex", gap:10, flexWrap:"wrap"}}><button className="primary-button" type="submit">Guardar préstamo</button><button className="outline-action" type="button" onClick={() => setLoanOpen(false)}>Cancelar</button></div>
        </form>}
        <div className="inventory-table">
          <div className="inventory-head" style={{gridTemplateColumns:"1.5fr 1fr 1.3fr .6fr"}}><span>Producto</span><span>Fecha</span><span>Local</span><span>Acción</span></div>
          {loans.length === 0 ? <div className="empty-state compact"><CalendarDays size={32}/><b>Sin préstamos registrados</b><span>Los préstamos que cargues aparecerán en esta lista.</span></div> : loans.map(l => <div className="inventory-head" key={l.id} style={{gridTemplateColumns:"1.5fr 1fr 1.3fr .6fr", textTransform:"none", fontSize:11, borderTop:"1px solid #eef2ef", color:"var(--black)", alignItems:"center"}}><span><b>{l.product}</b></span><span>{new Date(`${l.date}T00:00:00`).toLocaleDateString("es-AR")}</span><span>{l.store}</span><span><button className="outline-action" onClick={() => removeLoan(l.id)} title="Eliminar"><Trash2 size={14}/></button></span></div>)}
        </div>
      </section>
    </>}
  </AppShell>;
}
