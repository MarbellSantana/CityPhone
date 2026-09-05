"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Plus, X } from "lucide-react";
import { KEYS, Sale, load, money, save } from "../lib/storage";

const ALLOWED_DATES = ["2026-09-01", "2026-09-02", "2026-09-03"];

function dateToIso(date:string){
  const [y,m,d]=date.split("-").map(Number);
  return new Date(y,m-1,d,12,0,0).toISOString();
}

export default function HistoricalSalesEntry(){
  const [open,setOpen]=useState(false);
  const [date,setDate]=useState("2026-09-01");
  const [amount,setAmount]=useState("");
  const [notice,setNotice]=useState("");
  const parsedAmount=useMemo(()=>Number(amount.replace(",",".")),[amount]);
  const valid=ALLOWED_DATES.includes(date)&&Number.isFinite(parsedAmount)&&parsedAmount>0;

  function submit(e:FormEvent){
    e.preventDefault();
    if(!valid)return;
    const id=Date.now();
    const sale:Sale={
      id,
      items:[{productId:0,name:"Venta histórica · monto total sin detalle",qty:1,price:parsedAmount}],
      customer:"",
      total:parsedAmount,
      method:"Carga histórica",
      cashAmount:0,
      otherAmount:0,
      createdAt:dateToIso(date),
      commission:0,
      netTotal:parsedAmount,
      deposited:false,
      invoiceRequested:false,
      invoiceStatus:"No facturada",
    };
    const next=[sale,...load<Sale[]>(KEYS.sales,[])];
    save(KEYS.sales,next);
    setAmount("");
    setNotice(`Se cargaron ${money.format(parsedAmount)} para el ${new Date(sale.createdAt).toLocaleDateString("es-AR")}. No se modificó el inventario.`);
    window.dispatchEvent(new Event("storage"));
  }

  return <>
    <button className="outline-action" onClick={()=>{setOpen(v=>!v);setNotice("")}}><CalendarDays size={16}/> Cargar 1–3 de septiembre</button>
    {open&&<section className="card workspace-card" style={{marginBottom:16,padding:16,border:"1px solid var(--border)"}}>
      <div className="card-heading"><div><h2 style={{fontSize:15}}>Carga rápida de ventas anteriores</h2><p>Para el 1, 2 y 3 de septiembre: registra solamente el total vendido del día. No descuenta productos del inventario actual.</p></div><button className="ghost-button" onClick={()=>setOpen(false)}><X size={16}/> Cerrar</button></div>
      <form className="form-grid" onSubmit={submit} style={{marginTop:12}}>
        <label className="field-label">Día<select value={date} onChange={e=>setDate(e.target.value)}><option value="2026-09-01">1 de septiembre</option><option value="2026-09-02">2 de septiembre</option><option value="2026-09-03">3 de septiembre</option></select></label>
        <label className="field-label">Monto total vendido<input value={amount} onChange={e=>setAmount(e.target.value)} inputMode="decimal" placeholder="Ej. 185000" required/></label>
        <div style={{gridColumn:"1 / -1",padding:12,border:"1px solid var(--border)",borderRadius:12,background:"var(--green-soft)",fontSize:11,fontWeight:800}}>Esta carga se suma a ventas y reportes de ese día, pero no toca stock ni inventario.</div>
        <button className="primary-button" type="submit" disabled={!valid}><Plus size={16}/> Guardar monto del día</button>
      </form>
      {notice&&<small style={{display:"block",marginTop:10,fontWeight:800}}>{notice}</small>}
    </section>}
  </>;
}
