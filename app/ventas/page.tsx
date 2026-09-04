"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import AppShell from "../components/AppShell";
import { CashMovement, KEYS, Product, Sale, SaleItem, load, money, save } from "../lib/storage";

type CartItem = SaleItem & { stock:number };
type PayMethod = "" | "Efectivo" | "Débito" | "Crédito" | "QR" | "PIX" | "Transferencia" | "Pago mixto";
type ProcessorMethod = "Débito" | "Crédito" | "QR" | "PIX";
type FeePlan = { id:string; label:string; rate:number; settlement:string };

const IVA = 0.21;

const PLANS: Record<string, Partial<Record<ProcessorMethod, FeePlan[]>>> = {
  "TotalCoin": {
    "Débito": [
      { id:"tc-deb-instant", label:"2,5% + IVA · acreditación inmediata", rate:2.5, settlement:"En el momento" },
      { id:"tc-deb-2d", label:"1,99% + IVA · 2 días hábiles", rate:1.99, settlement:"2 días hábiles" },
    ],
    "Crédito": [
      { id:"tc-cre-5d", label:"2,5% + IVA · 5 días hábiles", rate:2.5, settlement:"5 días hábiles" },
    ],
    "QR": [{ id:"tc-qr", label:"0,8% + IVA · acreditación inmediata", rate:0.8, settlement:"En el momento" }],
    "PIX": [{ id:"tc-pix", label:"0% + IVA · promoción informada", rate:0, settlement:"En el momento" }],
  },
  "BBVA": {
    "Débito": [{ id:"bbva-deb", label:"2,99% + IVA · 1 día", rate:2.99, settlement:"1 día" }],
    "Crédito": [
      { id:"bbva-cre-10d", label:"2,99% + IVA · 10 días", rate:2.99, settlement:"10 días" },
    ],
    "QR": [
      { id:"bbva-qr", label:"0,8% + IVA · acreditación inmediata", rate:0.8, settlement:"En el momento" },
      { id:"bbva-qr-promo", label:"0% + IVA · promo primeros 90 días", rate:0, settlement:"En el momento" },
    ],
  },
};

function isProcessorMethod(method:string): method is ProcessorMethod {
  return method === "Débito" || method === "Crédito" || method === "QR" || method === "PIX";
}

export default function VentasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("");
  const [method, setMethod] = useState<PayMethod>("");
  const [cashAmount, setCashAmount] = useState("");
  const [otherAmount, setOtherAmount] = useState("");
  const [secondaryMethod, setSecondaryMethod] = useState<PayMethod>("");
  const [provider, setProvider] = useState("");
  const [planId, setPlanId] = useState("");
  const [santanderRate, setSantanderRate] = useState("");

  useEffect(() => setProducts(load<Product[]>(KEYS.products, [])), []);

  const subtotal = useMemo(() => cart.reduce((s,i) => s + i.price * i.qty, 0), [cart]);
  const results = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return [];
    return products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.code || "").toLowerCase().includes(q)).slice(0, 8);
  }, [products, search]);

  const feeMethod = method === "Pago mixto" ? secondaryMethod : method;
  const feeBaseAmount = method === "Pago mixto" ? Number(otherAmount || 0) : subtotal;
  const providers = feeMethod === "PIX" ? ["TotalCoin"] : isProcessorMethod(feeMethod) ? ["Santander", "TotalCoin", "BBVA"] : [];
  const availablePlans = provider && isProcessorMethod(feeMethod) ? (PLANS[provider]?.[feeMethod] || []) : [];
  const selectedPlan = availablePlans.find(p => p.id === planId);
  const feeRate = provider === "Santander" ? Number(santanderRate || 0) : selectedPlan?.rate || 0;
  const feeBase = isProcessorMethod(feeMethod) ? feeBaseAmount * (feeRate / 100) : 0;
  const feeVat = feeBase * IVA;
  const commission = feeBase + feeVat;
  const netReceived = subtotal - commission;

  function addProduct(p:Product) {
    if (p.stock <= 0) return;
    setCart(v => {
      const found = v.find(i => i.productId === p.id);
      if (found) return v.map(i => i.productId === p.id ? { ...i, qty: Math.min(i.qty + 1, p.stock) } : i);
      return [...v, { productId:p.id, name:p.name, qty:1, price:p.price, stock:p.stock }];
    });
    setSearch("");
  }

  function changeQty(id:number, delta:number) {
    setCart(v => v.map(i => i.productId === id ? { ...i, qty: Math.max(1, Math.min(i.stock, i.qty + delta)) } : i));
  }

  function removeItem(id:number) { setCart(v => v.filter(i => i.productId !== id)); }

  function clearProcessor() {
    setProvider("");
    setPlanId("");
    setSantanderRate("");
  }

  function resetSale() {
    setCart([]);
    setCustomer("");
    setMethod("");
    setCashAmount("");
    setOtherAmount("");
    setSecondaryMethod("");
    setSearch("");
    clearProcessor();
  }

  function changeMethod(value:PayMethod) {
    setMethod(value);
    setCashAmount("");
    setOtherAmount("");
    setSecondaryMethod("");
    clearProcessor();
  }

  function changeSecondaryMethod(value:PayMethod) {
    setSecondaryMethod(value);
    clearProcessor();
  }

  function changeProvider(value:string) {
    setProvider(value);
    setPlanId("");
    setSantanderRate("");
    if (value === "TotalCoin" && feeMethod === "PIX") setPlanId("tc-pix");
  }

  const mixedValid = method !== "Pago mixto" || (
    Number(cashAmount || 0) >= 0 &&
    Number(otherAmount || 0) >= 0 &&
    Number(cashAmount || 0) + Number(otherAmount || 0) === subtotal &&
    !!secondaryMethod && secondaryMethod !== "Efectivo" && secondaryMethod !== "Pago mixto"
  );

  const processorValid = !isProcessorMethod(feeMethod) || (
    !!provider &&
    (provider === "Santander" ? Number(santanderRate) >= 0 && santanderRate !== "" : !!selectedPlan)
  );

  const canConfirm = cart.length > 0 && !!method && subtotal > 0 && mixedValid && processorValid;

  function confirmSale() {
    if (!canConfirm) return;
    const now = new Date().toISOString();
    const settlement = provider === "Santander" ? "Según condiciones Santander" : selectedPlan?.settlement || "";
    const sale:Sale = {
      id: Date.now(), items: cart.map(({stock,...i}) => i), customer: customer.trim(), total: subtotal, method,
      cashAmount: method === "Efectivo" ? subtotal : method === "Pago mixto" ? Number(cashAmount || 0) : 0,
      otherAmount: method === "Pago mixto" ? Number(otherAmount || 0) : method === "Efectivo" ? 0 : subtotal,
      createdAt: now, provider: provider || undefined, feeRate: isProcessorMethod(feeMethod) ? feeRate : 0,
      feeBase, feeVat, commission, netTotal: netReceived, settlement: settlement || undefined,
      secondaryMethod: method === "Pago mixto" ? secondaryMethod : undefined,
    };
    save(KEYS.sales, [sale, ...load<Sale[]>(KEYS.sales, [])]);
    const updatedProducts = products.map(p => {
      const item = cart.find(i => i.productId === p.id);
      return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
    });
    setProducts(updatedProducts); save(KEYS.products, updatedProducts);
    if (sale.cashAmount > 0) {
      const movement:CashMovement = { id:sale.id, type:"Ingreso", concept:`Venta #${sale.id.toString().slice(-6)}`, amount:sale.cashAmount, method:"Efectivo", note:customer.trim() || "Venta", createdAt:now, source:"sale" };
      save(KEYS.cash, [movement, ...load<CashMovement[]>(KEYS.cash, [])]);
    }
    resetSale();
  }

  return <AppShell title="Ventas" subtitle="Registra cada venta y calcula automáticamente las comisiones del medio de pago." active="Ventas">
    <section className="workspace-grid sales-workspace">
      <div className="card workspace-card">
        <div className="card-heading"><div><h2>Agregar productos</h2><p>Escribe el nombre, categoría o código. El inventario no se muestra completo en esta pantalla.</p></div></div>
        <div className="search-field"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." /></div>
        {search.trim() && <div style={{display:"grid",gap:8,marginTop:14}}>{results.length === 0 ? <div className="empty-state compact"><Search size={28}/><b>Sin resultados</b><span>No encontramos un producto con esa búsqueda.</span></div> : results.map(p => <button key={p.id} onClick={() => addProduct(p)} disabled={p.stock <= 0} className="outline-action" style={{justifyContent:"space-between",width:"100%"}}><span>{p.name}</span><span>{money.format(p.price)} · Stock {p.stock}</span></button>)}</div>}
        <div style={{marginTop:18}}><div className="card-heading"><div><h2>Carrito</h2><p>{cart.length ? `${cart.length} producto(s) agregado(s)` : "Todavía no agregaste productos."}</p></div></div>
          {cart.length === 0 ? <div className="empty-state compact"><ShoppingCart size={30}/><b>No hay productos agregados</b><span>Busca un producto para comenzar la venta.</span></div> : <div className="sales-table">{cart.map(i => <div className="table-row" key={i.productId}><div><b>{i.name}</b><small>{money.format(i.price)} c/u</small></div><span style={{display:"flex",gap:6,alignItems:"center"}}><button className="outline-action" onClick={() => changeQty(i.productId,-1)}><Minus size={14}/></button><b>{i.qty}</b><button className="outline-action" onClick={() => changeQty(i.productId,1)}><Plus size={14}/></button></span><span className="method">Stock {i.stock}</span><strong>{money.format(i.price*i.qty)}</strong><button className="ghost-button" onClick={() => removeItem(i.productId)}><Trash2 size={15}/></button></div>)}</div>}
          <button className="primary-button full-button" style={{marginTop:16}} onClick={resetSale}><Plus size={18}/> Nueva venta</button>
        </div>
      </div>
      <div className="card workspace-card sticky-summary">
        <div className="card-heading"><div><h2>Resumen de venta</h2><p>El sistema calcula la comisión y el neto que realmente recibes.</p></div></div>
        <div className="summary-line"><span>Venta bruta</span><strong>{money.format(subtotal)}</strong></div>
        {commission > 0 && <><div className="summary-line"><span>Comisión ({feeRate.toLocaleString("es-AR")}%)</span><strong>-{money.format(feeBase)}</strong></div><div className="summary-line"><span>IVA sobre comisión (21%)</span><strong>-{money.format(feeVat)}</strong></div><div className="summary-line"><span>Descuento total</span><strong>-{money.format(commission)}</strong></div></>}
        <div className="summary-line total-line"><span>Neto recibido</span><strong>{money.format(netReceived)}</strong></div>
        <label className="field-label">Cliente <small>(opcional)</small><input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Nombre del cliente" /></label>
        <label className="field-label">Método de pago<select value={method} onChange={e => changeMethod(e.target.value as PayMethod)}><option value="" disabled>Seleccionar</option><option>Efectivo</option><option>Débito</option><option>Crédito</option><option>QR</option><option>PIX</option><option>Transferencia</option><option>Pago mixto</option></select></label>
        {method === "Pago mixto" && <><label className="field-label">Monto en efectivo<input type="number" min="0" value={cashAmount} onChange={e => setCashAmount(e.target.value)} /></label><label className="field-label">Monto restante<input type="number" min="0" value={otherAmount} onChange={e => setOtherAmount(e.target.value)} /></label><label className="field-label">Medio del monto restante<select value={secondaryMethod} onChange={e => changeSecondaryMethod(e.target.value as PayMethod)}><option value="" disabled>Seleccionar</option><option>Débito</option><option>Crédito</option><option>QR</option><option>PIX</option><option>Transferencia</option></select></label></>}
        {isProcessorMethod(feeMethod) && <><label className="field-label">Procesador / banco<select value={provider} onChange={e => changeProvider(e.target.value)}><option value="" disabled>Seleccionar</option>{providers.map(p => <option key={p} value={p}>{p === "BBVA" ? "BBVA (Francés)" : p}</option>)}</select></label>
          {provider === "Santander" && <label className="field-label">Comisión Santander (%)<input type="number" min="0" step="0.01" value={santanderRate} onChange={e => setSantanderRate(e.target.value)} placeholder="Cargar porcentaje cuando lo confirmes" /></label>}
          {provider && provider !== "Santander" && <label className="field-label">Plan de acreditación<select value={planId} onChange={e => setPlanId(e.target.value)}><option value="" disabled>Seleccionar</option>{availablePlans.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label>}
        </>}
        {isProcessorMethod(feeMethod) && processorValid && <div style={{padding:"12px 14px",border:"1px solid var(--border)",borderRadius:14,background:"var(--green-soft)",marginTop:8}}><div style={{fontWeight:900,fontSize:12}}>Comisión aplicada al cobrar</div><div style={{fontSize:11,marginTop:5}}>Base: {feeRate.toLocaleString("es-AR")}% + IVA 21% sobre la comisión.</div><div style={{fontSize:11,marginTop:4}}>Total descontado: <b>{money.format(commission)}</b> · Neto: <b>{money.format(netReceived)}</b></div></div>}
        <button className="primary-button full-button" disabled={!canConfirm} onClick={confirmSale}>Confirmar venta</button><button className="ghost-button full-button" onClick={resetSale}><Trash2 size={16}/> Limpiar venta</button>
      </div>
    </section>
  </AppShell>;
}
