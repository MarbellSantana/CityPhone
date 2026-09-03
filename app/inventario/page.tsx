"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Box, Minus, Plus, Search, Trash2, X } from "lucide-react";
import AppShell from "../components/AppShell";
import { KEYS, Product, load, money, save } from "../lib/storage";

const categories = ["Fundas", "Vidrios", "Cargadores", "Auriculares", "Accesorios"];

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas las categorías");

  useEffect(() => setProducts(load<Product[]>(KEYS.products, [])), []);
  useEffect(() => save(KEYS.products, products), [products]);

  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase().trim();
    const matchesText = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.code || "").toLowerCase().includes(q);
    const matchesCategory = category === "Todas las categorías" || p.category === category;
    return matchesText && matchesCategory;
  }), [products, search, category]);

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

  function adjustStock(id:number, delta:number) {
    setProducts(v => v.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
  }

  function removeProduct(id:number) { setProducts(v => v.filter(p => p.id !== id)); }

  return <AppShell title="Inventario" subtitle="Administra productos, costos, precios y stock." active="Inventario" action={<button className="primary-button" onClick={() => setOpen(v => !v)}><Plus size={18}/> Nuevo producto</button>}>
    {open && <section className="card workspace-card" style={{marginBottom:16}}>
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

    <section className="card workspace-card">
      <div className="toolbar-row">
        <div className="search-field grow"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." /></div>
        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}><option>Todas las categorías</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
      </div>
      <div className="inventory-table">
        <div className="inventory-head"><span>Producto</span><span>Categoría</span><span>Costo</span><span>Precio venta</span><span>Stock</span><span>Acciones</span></div>
        {filtered.length === 0 ? <div className="empty-state"><Box size={34}/><b>{products.length ? "Sin resultados" : "Inventario vacío"}</b><span>{products.length ? "Prueba con otra búsqueda o categoría." : "Agrega tu primer producto para comenzar a controlar el stock."}</span></div> : filtered.map(p => <div className="inventory-head" key={p.id} style={{textTransform:"none", fontSize:11, borderTop:"1px solid #eef2ef", color:"var(--black)", alignItems:"center"}}>
          <span><b>{p.name}</b>{p.code && <small style={{display:"block", color:"var(--muted)"}}>{p.code}</small>}</span><span>{p.category}</span><span>{money.format(p.cost)}</span><span>{money.format(p.price)}</span><span><b style={{color:p.stock <= p.minStock ? "var(--danger)" : "inherit"}}>{p.stock}</b> <small style={{color:"var(--muted)"}}>mín. {p.minStock}</small></span><span style={{display:"flex", gap:6}}><button className="outline-action" onClick={() => adjustStock(p.id,-1)} title="Restar stock"><Minus size={14}/></button><button className="outline-action" onClick={() => adjustStock(p.id,1)} title="Sumar stock"><Plus size={14}/></button><button className="outline-action" onClick={() => removeProduct(p.id)} title="Eliminar"><Trash2 size={14}/></button></span>
        </div>)}
      </div>
    </section>
  </AppShell>;
}
