"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import AppShell from "../components/AppShell";
import { CashMovement, KEYS, Product, Sale, SaleItem, load, money, save } from "../lib/storage";

type CartItem = SaleItem & { stock:number };

export default function VentasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("");
  const [method, setMethod] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [otherAmount, setOtherAmount] = useState("");

  useEffect(() => setProducts(load<Product[]>(KEYS.products, [])), []);

  const subtotal = useMemo(() => cart.reduce((s,i) => s + i.price * i.qty, 0), [cart]);
  const results = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.code || "").toLowerCase().includes(q));
  }, [products, search]);

  function addProduct(p:Product) {
    if (p.stock <= 0) return;
    setCart(v => {
      const found = v.find(i => i.productId === p.id);
      if (found) return v.map(i => i.productId === p.id ? { ...i, qty: Math.min(i.qty + 1, p.stock) } : i);
      return [...v, { productId:p.id, name:p.name, qty:1, price:p.price, stock:p.stock }];
    });
  }

  function changeQty(id:number, delta:number) {
    setCart(v => v.map(i => i.productId === id ? { ...i, qty: Math.max(1, Math.min(i.stock, i.qty + delta)) } : i));
  }
  function removeItem(id:number) { setCart(v => v.filter(i => i.productId !== id)); }
  function resetSale() { setCart([]); setCustomer(""); setMethod(""); setCashAmount(""); setOtherAmount(""); setSearch(""); }

  const mixedValid = method !== "Pago mixto" || (Number(cashAmount || 0) + Number(otherAmount || 0) === subtotal && Number(cashAmount || 0) >= 0 && Number(otherAmount || 0) >= 0);
  const canConfirm = cart.length > 0 && !!method && subtotal > 0 && mixedValid;

  function confirmSale() {
    if (!canConfirm) return;
    const now = new Date().toISOString();
    const sale:Sale = {
      id: Date.now(),
      items: cart.map(({stock,...i}) => i),
      customer: customer.trim(),
      total: subtotal,
      method,
      cashAmount: method === "Efectivo" ? subtotal : method === "Pago mixto" ? Number(cashAmount || 0) : 0,
      otherAmount: method === "Pago mixto" ? Number(otherAmount || 0) : method === "Efectivo" ? 0 : subtotal,
      createdAt: now,
    };
    const sales = load<Sale[]>(KEYS.sales, []);
    save(KEYS.sales, [sale, ...sales]);

    const updatedProducts = products.map(p => {
      const item = cart.find(i => i.productId === p.id);
      return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
    });
    setProducts(updatedProducts);
    save(KEYS.products, updatedProducts);

    const cashPart = sale.cashAmount;
    if (cashPart > 0) {
      const cash = load<CashMovement[]>(KEYS.cash, []);
      const movement:CashMovement = { id:sale.id, type:"Ingreso", concept:`Venta #${sale.id.toString().slice(-6)}`, amount:cashPart, method:"Efectivo", note: customer.trim() || "Venta", createdAt:now, source:"sale" };
      save(KEYS.cash, [movement, ...cash]);
    }
    resetSale();
  }

  return <AppShell title="Ventas" subtitle="Registra cada venta y el método de pago utilizado." active="Ventas" action={<button className="primary-button" onClick={resetSale}><Plus size={18}/> Nueva venta</button>}>
    <section className="workspace-grid sales-workspace">
      <div className="card workspace-card">
        <div className="card-heading"><div><h2>Agregar productos</h2><p>Busca por nombre, categoría o código.</p></div></div>
        <div className="search-field"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." /></div>
        {products.length === 0 ? <div className="empty-state compact"><ShoppingCart size={30}/><b>No hay productos en inventario</b><span>Primero agrega productos desde Inventario.</span></div> : <div style={{display:"grid", gap:8, marginTop:14}}>{results.map(p => <button key={p.id} onClick={() => addProduct(p)} disabled={p.stock <= 0} className="outline-action" style={{justifyContent:"space-between", width:"100%"}}><span>{p.name} · {p.category}</span><span>{money.format(p.price)} · Stock {p.stock}</span></button>)}</div>}

        <div style={{marginTop:18}}>
          <div className="card-heading"><div><h2>Carrito</h2><p>{cart.length ? `${cart.length} producto(s) agregado(s)` : "Todavía no agregaste productos."}</p></div></div>
          {cart.length === 0 ? <div className="empty-state compact"><ShoppingCart size={30}/><b>No hay productos agregados</b><span>Selecciona un producto para comenzar la venta.</span></div> : <div className="sales-table">{cart.map(i => <div className="table-row" key={i.productId}><div><b>{i.name}</b><small>{money.format(i.price)} c/u</small></div><span style={{display:"flex",gap:6,alignItems:"center"}}><button className="outline-action" onClick={() => changeQty(i.productId,-1)}><Minus size={14}/></button><b>{i.qty}</b><button className="outline-action" onClick={() => changeQty(i.productId,1)}><Plus size={14}/></button></span><span className="method">Stock {i.stock}</span><strong>{money.format(i.price*i.qty)}</strong><button className="ghost-button" onClick={() => removeItem(i.productId)}><Trash2 size={15}/></button></div>)}</div>}
        </div>
      </div>
      <div className="card workspace-card sticky-summary">
        <div className="card-heading"><div><h2>Resumen de venta</h2><p>El total se calcula automáticamente.</p></div></div>
        <div className="summary-line"><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>
        <div className="summary-line total-line"><span>Total</span><strong>{money.format(subtotal)}</strong></div>
        <label className="field-label">Cliente <small>(opcional)</small><input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Nombre del cliente" /></label>
        <label className="field-label">Método de pago<select value={method} onChange={e => setMethod(e.target.value)}><option value="" disabled>Seleccionar</option><option>Efectivo</option><option>Débito</option><option>Crédito</option><option>Transferencia</option><option>Pago mixto</option></select></label>
        {method === "Pago mixto" && <><label className="field-label">Monto en efectivo<input type="number" min="0" value={cashAmount} onChange={e => setCashAmount(e.target.value)} placeholder="0" /></label><label className="field-label">Monto restante<input type="number" min="0" value={otherAmount} onChange={e => setOtherAmount(e.target.value)} placeholder="0" /></label><small style={{color:mixedValid?"var(--muted)":"var(--danger)"}}>La suma debe ser exactamente {money.format(subtotal)}.</small></>}
        <button className="primary-button full-button" disabled={!canConfirm} onClick={confirmSale}>Confirmar venta</button>
        <button className="ghost-button full-button" onClick={resetSale}><Trash2 size={16}/> Limpiar venta</button>
      </div>
    </section>
  </AppShell>;
}
