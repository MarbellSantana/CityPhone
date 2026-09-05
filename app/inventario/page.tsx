"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Box, CalendarDays, Minus, Plus, Search, Trash2, X, RefreshCw } from "lucide-react";
import AppShell from "../components/AppShell";
import { KEYS, LocalLoan, Product, load, money, save } from "../lib/storage";

const categories = ["Fundas", "Vidrios", "Cargadores", "Auriculares", "Accesorios"];
type Tab = "productos" | "reposicion" | "prestamos";

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loans, setLoans] = useState<LocalLoan[]>([]);
  const [loanOpen, setLoanOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateSearch, setUpdateSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [updateQty, setUpdateQty] = useState(1);
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

  const updateResults = useMemo(() => {
    const q = updateSearch.toLowerCase().trim();
    if (!q) return products.slice(0, 8);
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.code || "").toLowerCase().includes(q)
    ).slice(0, 12);
  }, [products, updateSearch]);

  const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId) || null, [products, selectedProductId]);
  const restock = useMemo(() => products.filter(p => p.minStock > 0 && p.stock < p.minStock), [products]);
  const restockUnits = useMemo(() => restock.reduce((sum,p) => sum + (p.minStock - p.stock), 0), [restock]);

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
    setProductOpen(false);
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

  function applyStockUpdate() {
    if (!selectedProduct || updateQty <= 0) return;
    setProducts(v => v.map(p => p.id === selectedProduct.id ? { ...p, stock: p.stock + updateQty } : p));
    setUpdateOpen(false);
    setUpdateSearch("");
    setSelectedProductId(null);
    setUpdateQty(1);
  }

  function closeUpdateModal() {
    setUpdateOpen(false);
    setUpdateSearch("");
    setSelectedProductId(null);
    setUpdateQty(1);
  }

  function removeProduct(id:number) { setProducts(v => v.filter(p => p.id !== id)); }
  function removeLoan(id:number) { setLoans(v => v.filter(l => l.id !== id)); }

  return <AppShell
    title="Inventario"
    subtitle="Administra productos, reposición y préstamos entre locales."
    active="Inventario"
    action={<div className="inventory-header-actions">
      <button className="outline-action inventory-update-button" onClick={() => setUpdateOpen(true)}><RefreshCw size={16}/> Actualización</button>
      <button className="primary-button inventory-add-button" onClick={() => setProductOpen(true)}><Plus size={16}/> Cargar producto</button>
    </div>}
  >
    <div className="subnav-tabs">
      <button className={tab === "productos" ? "active" : ""} onClick={() => setTab("productos")}><Box size={16}/> Productos</button>
      <button className={tab === "reposicion" ? "active" : ""} onClick={() => setTab("reposicion")}><AlertTriangle size={16}/> Reposición {restock.length > 0 && <span className="count-badge">{restock.length}</span>}</button>
      <button className={tab === "prestamos" ? "active" : ""} onClick={() => setTab("prestamos")}><CalendarDays size={16}/> Préstamos locales</button>
    </div>

    {tab === "productos" && <section className="card workspace-card inventory-products-card">
      <div className="card-heading inventory-card-heading">
        <div><h2>Productos cargados</h2><p>Consulta y administra todo el inventario desde aquí.</p></div>
        <span className="count-badge">{products.length} productos</span>
      </div>
      <div className="toolbar-row inventory-toolbar" style={{marginTop:16}}>
        <div className="search-field grow"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." /></div>
        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}><option>Todas las categorías</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
      </div>

      {filtered.length === 0 ? <div className="empty-state compact"><Box size={34}/><b>{products.length ? "Sin resultados" : "Inventario vacío"}</b><span>{products.length ? "Prueba con otra búsqueda o categoría." : "Los productos que cargues aparecerán aquí automáticamente."}</span></div> :
      <div className="inventory-product-list">
        {filtered.map(p => <article key={p.id} className="inventory-product-row">
          <div className="inventory-product-main">
            <h3>{p.name}</h3>
            <small>{p.category}{p.code ? ` · ${p.code}` : ""}</small>
            {p.minStock > 0 && p.stock < p.minStock && <small className="inventory-reorder"><AlertTriangle size={11}/> Reponer</small>}
          </div>
          <div className="inventory-metric"><small>Costo</small><strong>{money.format(p.cost)}</strong></div>
          <div className="inventory-metric"><small>Precio</small><strong>{money.format(p.price)}</strong></div>
          <div className="inventory-metric"><small>Stock</small><strong className={p.minStock > 0 && p.stock < p.minStock ? "low-stock" : ""}>{p.stock}</strong></div>
          <div className="inventory-metric"><small>Mín.</small><strong>{p.minStock}</strong></div>
          <div className="inventory-row-actions">
            <button className="outline-action" onClick={() => adjustStock(p.id,-1)} title="Restar stock"><Minus size={13}/></button>
            <button className="outline-action" onClick={() => adjustStock(p.id,1)} title="Sumar stock"><Plus size={13}/></button>
            <button className="ghost-button" onClick={() => removeProduct(p.id)} title="Eliminar"><Trash2 size={13}/></button>
          </div>
        </article>)}
      </div>}
    </section>}

    {tab === "reposicion" && <section className="card workspace-card">
      <div className="card-heading inventory-card-heading">
        <div><h2>Lista de reposición</h2><p>Se arma automáticamente con productos que estén por debajo del stock mínimo.</p></div>
        {restock.length > 0 && <div className="inventory-restock-summary"><strong>{restock.length}</strong><small>productos · {restockUnits} unidades</small></div>}
      </div>
      {restock.length === 0 ? <div className="empty-state compact"><AlertTriangle size={32}/><b>No hay productos para reponer</b><span>Cuando un producto quede por debajo del stock mínimo, aparecerá aquí automáticamente.</span></div> :
      <div className="inventory-restock-list">{restock.map((p,index) => { const needed = p.minStock-p.stock; return <div key={p.id} className="inventory-restock-row"><div className="inventory-restock-index">{index+1}</div><div className="inventory-restock-product"><b>{p.name}</b><small>{p.category}{p.code ? ` · ${p.code}` : ""}</small></div><div className="inventory-metric"><small>Stock actual</small><strong className="low-stock">{p.stock}</strong></div><div className="inventory-metric"><small>Mínimo</small><strong>{p.minStock}</strong></div><div className="inventory-needed"><small>Reponer</small><strong>{needed} {needed===1?"unidad":"unidades"}</strong></div><button className="outline-action inventory-restock-action" onClick={()=>adjustStock(p.id,1)}><Plus size={14}/> Sumar stock</button></div>; })}</div>}
    </section>}

    {tab === "prestamos" && <section className="card workspace-card">
      <div className="card-heading inventory-card-heading"><div><h2>Préstamos locales</h2><p>Registra productos prestados por otros locales.</p></div><button className="outline-action" onClick={() => setLoanOpen(v => !v)}><Plus size={16}/> Nuevo préstamo</button></div>
      {loanOpen && <form onSubmit={addLoan} className="section-gap"><div className="form-grid"><label className="field-label">Producto<input name="product" required placeholder="Ej. Vidrio Samsung A15" /></label><label className="field-label">Fecha<input name="date" type="date" required /></label><label className="field-label">Local que lo prestó<input name="store" required placeholder="Nombre o número del local" /></label></div><div className="inventory-form-actions"><button className="primary-button" type="submit">Guardar préstamo</button><button className="outline-action" type="button" onClick={()=>setLoanOpen(false)}>Cancelar</button></div></form>}
      <div className="inventory-table"><div className="inventory-head" style={{gridTemplateColumns:"1.5fr 1fr 1.3fr .6fr"}}><span>Producto</span><span>Fecha</span><span>Local</span><span>Acción</span></div>{loans.length===0?<div className="empty-state compact"><CalendarDays size={32}/><b>Sin préstamos registrados</b><span>Los préstamos que cargues aparecerán en esta lista.</span></div>:loans.map(l=><div className="inventory-loan-row" key={l.id}><span><b>{l.product}</b></span><span><small>Fecha</small>{new Date(`${l.date}T00:00:00`).toLocaleDateString("es-AR")}</span><span><small>Local</small>{l.store}</span><span><button className="outline-action" onClick={()=>removeLoan(l.id)} title="Eliminar"><Trash2 size={14}/></button></span></div>)}</div>
    </section>}

    {productOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setProductOpen(false)}>
      <section className="inventory-product-modal" role="dialog" aria-modal="true" aria-labelledby="new-product-title" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-heading">
          <div><span className="eyebrow">INVENTARIO</span><h2 id="new-product-title">Cargar producto</h2><p>Completa los datos del nuevo artículo.</p></div>
          <button className="modal-close" onClick={() => setProductOpen(false)} aria-label="Cerrar"><X size={19}/></button>
        </div>
        <form onSubmit={addProduct}>
          <div className="inventory-product-form-grid">
            <label className="field-label modal-wide">Producto<input name="name" required autoFocus placeholder="Ej. Funda silicona iPhone 13" /></label>
            <label className="field-label">Código <small>Opcional</small><input name="code" placeholder="SKU o código interno" /></label>
            <label className="field-label">Categoría<select name="category" defaultValue="Fundas">{categories.map(c => <option key={c}>{c}</option>)}</select></label>
            <label className="field-label">Costo<input name="cost" type="number" min="0" step="1" defaultValue="0" /></label>
            <label className="field-label">Precio de venta<input name="price" type="number" min="0" step="1" required defaultValue="0" /></label>
            <label className="field-label">Stock inicial<input name="stock" type="number" min="0" step="1" required defaultValue="0" /></label>
            <label className="field-label">Stock mínimo<input name="minStock" type="number" min="0" step="1" defaultValue="0" /></label>
          </div>
          <div className="modal-actions"><button className="outline-action" type="button" onClick={() => setProductOpen(false)}>Cancelar</button><button className="primary-button" type="submit"><Plus size={16}/> Guardar producto</button></div>
        </form>
      </section>
    </div>}

    {updateOpen && <div className="modal-backdrop" role="presentation" onMouseDown={closeUpdateModal}>
      <section className="inventory-product-modal inventory-update-modal" role="dialog" aria-modal="true" aria-labelledby="update-product-title" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-heading">
          <div><span className="eyebrow">INVENTARIO</span><h2 id="update-product-title">Actualización de stock</h2><p>Busca un producto existente y agrega las unidades que ingresaron.</p></div>
          <button className="modal-close" onClick={closeUpdateModal} aria-label="Cerrar"><X size={19}/></button>
        </div>

        <div className="search-field inventory-update-search">
          <Search size={18}/>
          <input value={updateSearch} onChange={e => { setUpdateSearch(e.target.value); setSelectedProductId(null); }} autoFocus placeholder="Buscar por nombre, categoría o código..." />
        </div>

        {!selectedProduct && <div className="inventory-update-results">
          {updateResults.length === 0 ? <div className="empty-state compact"><Search size={30}/><b>No encontramos ese producto</b><span>Prueba escribiendo parte del nombre o el código.</span></div> : updateResults.map(p => <button key={p.id} type="button" className="inventory-update-result" onClick={() => setSelectedProductId(p.id)}>
            <span><b>{p.name}</b><small>{p.category}{p.code ? ` · ${p.code}` : ""}</small></span>
            <span><small>Stock actual</small><strong>{p.stock}</strong></span>
          </button>)}
        </div>}

        {selectedProduct && <div className="inventory-update-selected">
          <button type="button" className="text-button" onClick={() => setSelectedProductId(null)}>← Cambiar producto</button>
          <div className="inventory-update-product-card">
            <div><small>Producto seleccionado</small><h3>{selectedProduct.name}</h3><span>{selectedProduct.category}{selectedProduct.code ? ` · ${selectedProduct.code}` : ""}</span></div>
            <div><small>Stock actual</small><strong>{selectedProduct.stock}</strong></div>
          </div>
          <label className="field-label">Unidades que ingresaron<input type="number" min="1" step="1" value={updateQty} onChange={e => setUpdateQty(Math.max(1, Number(e.target.value) || 1))} /></label>
          <div className="inventory-update-preview"><span>Nuevo stock</span><strong>{selectedProduct.stock + updateQty}</strong></div>
        </div>}

        <div className="modal-actions">
          <button className="outline-action" type="button" onClick={closeUpdateModal}>Cancelar</button>
          <button className="primary-button" type="button" disabled={!selectedProduct || updateQty <= 0} onClick={applyStockUpdate}><Plus size={16}/> Agregar al stock</button>
        </div>
      </section>
    </div>}
  </AppShell>;
}
