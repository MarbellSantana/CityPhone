"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Plus, X } from "lucide-react";
import { KEYS, Sale, load, money, save } from "../lib/storage";

const ALLOWED_DATES = ["2026-09-01", "2026-09-02", "2026-09-03"];

function dateToIso(date:string){
  const [y,m,d]=date.split("-").map(Number);
  return new Date(y,m-1,d,12,0,0).toISOString();
}

export default function HistoricalSalesEntry(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [open,setOpen]=useState(false);
  const [date,setDate]=useState("2026-09-01");
  const [amount,setAmount]=useState("");
  const [notice,setNotice]=useState("");
  const parsedAmount=useMemo(()=>Number(amount.replace(",",".")),[amount]);
  const valid=ALLOWED_DATES.includes(date)&&Number.isFinite(parsedAmount)&&parsedAmount>0;

  useEffect(()=>{
    const card=document.querySelector(".workspace-card") as HTMLElement|null;
    if(!card)return;
    const portalHost=document.createElement("div");
    portalHost.setAttribute("data-historical-sales-entry","true");
    portalHost.style.marginTop="12px";
    const heading=card.querySelector(".card-heading");
    if(heading?.nextSibling)card.insertBefore(portalHost,heading.nextSibling);
    else card.appendChild(portalHost);
    setHost(portalHost);
    return()=>portalHost.remove();
  },[]);

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

  if(!host)return null;
  return createPortal(<div style={{padding:"12px 0",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
    <button className="outline-action" style={{width:"100%",justifyContent:"center"}} onClick={()=>{setOpen(v=>!v);setNotice("")}}><CalendarDays size={16}/> Cargar ventas del 1–3 de septiembre</button>
    {open&&<section style={{marginTop:12,padding:14,border:"1px solid var(--border)",borderRadius:14,background:"var(--green-soft)"}}>
      <div className="card-heading"><div><h2 style={{fontSize:15}}>Venta anterior sin detalle</h2><p>Elige el día y escribe solamente el monto total vendido. No descuenta productos del inventario.</p></div><button className="ghost-button" onClick={()=>setOpen(false)}><X size={16}/> Cerrar</button></div>
      <form className="form-grid" onSubmit={submit} style={{marginTop:12}}>
        <label className="field-label">Día<select value={date} onChange={e=>setDate(e.target.value)}><option value="2026-09-01">1 de septiembre</option><option value="2026-09-02">2 de septiembre</option><option value="2026-09-03">3 de septiembre</option></select></label>
        <label className="field-label">Monto total vendido<input value={amount} onChange={e=>setAmount(e.target.value)} inputMode="decimal" placeholder="Ej. 185000" required/></label>
        <div style={{gridColumn:"1 / -1",padding:10,border:"1px solid var(--border)",borderRadius:10,background:"#fff",fontSize:11,fontWeight:800}}>Se suma a ventas y reportes de ese día, sin tocar el stock actual.</div>
        <button className="primary-button" type="submit" disabled={!valid}><Plus size={16}/> Guardar monto del día</button>
      </form>
      {notice&&<small style={{display:"block",marginTop:10,fontWeight:800}}>{notice}</small>}
    </section>}
  </div>,host);
}
