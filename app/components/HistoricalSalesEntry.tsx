"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { CashMovement, KEYS, Sale, load, money, save } from "../lib/storage";

const ALLOWED_DATES = ["2026-09-01", "2026-09-02", "2026-09-03"];

function dateToIso(date:string){
  const [y,m,d]=date.split("-").map(Number);
  return new Date(y,m-1,d,12,0,0).toISOString();
}

export default function HistoricalSalesEntry(){
  const [host,setHost]=useState<HTMLElement|null>(null);
  const [date,setDate]=useState("");
  const [amount,setAmount]=useState("");
  const [notice,setNotice]=useState("");
  const parsedAmount=useMemo(()=>Number(amount.replace(",",".")),[amount]);
  const enabled=ALLOWED_DATES.includes(date);
  const valid=enabled&&Number.isFinite(parsedAmount)&&parsedAmount>0;

  useEffect(()=>{
    const dateInput=document.querySelector('input[type="date"]') as HTMLInputElement|null;
    if(!dateInput)return;
    const row=dateInput.parentElement?.parentElement as HTMLElement|null;
    if(!row)return;

    const portalHost=document.createElement("div");
    portalHost.setAttribute("data-historical-sales-entry","true");
    portalHost.style.display="contents";
    row.appendChild(portalHost);
    setHost(portalHost);
    setDate(dateInput.value);

    const syncDate=()=>{
      setDate(dateInput.value);
      setAmount("");
      setNotice("");
    };
    dateInput.addEventListener("change",syncDate);
    dateInput.addEventListener("input",syncDate);

    return()=>{
      dateInput.removeEventListener("change",syncDate);
      dateInput.removeEventListener("input",syncDate);
      portalHost.remove();
    };
  },[]);

  function submit(e:FormEvent){
    e.preventDefault();
    if(!valid)return;
    const id=Date.now();
    const createdAt=dateToIso(date);
    const sale:Sale={
      id,
      items:[{productId:0,name:"Venta histórica · monto total sin detalle",qty:1,price:parsedAmount}],
      customer:"",
      total:parsedAmount,
      method:"Efectivo",
      cashAmount:parsedAmount,
      otherAmount:0,
      createdAt,
      commission:0,
      netTotal:parsedAmount,
      deposited:true,
      invoiceRequested:false,
      invoiceStatus:"No facturada",
    };
    const movement:CashMovement={
      id,
      type:"Ingreso",
      concept:`Venta histórica · ${new Date(createdAt).toLocaleDateString("es-AR")}`,
      amount:parsedAmount,
      method:"Efectivo",
      note:"Venta histórica en efectivo",
      createdAt,
      source:"sale",
    };
    save(KEYS.sales,[sale,...load<Sale[]>(KEYS.sales,[])]);
    save(KEYS.cash,[movement,...load<CashMovement[]>(KEYS.cash,[])]);
    setAmount("");
    setNotice(`Guardado: ${money.format(parsedAmount)} en efectivo del ${new Date(sale.createdAt).toLocaleDateString("es-AR")}. No se descontó inventario.`);
  }

  if(!host||!enabled)return null;
  return createPortal(<>
    <form onSubmit={submit} style={{display:"flex",gap:8,alignItems:"end",flexWrap:"wrap"}}>
      <label className="field-label" style={{width:230,marginBottom:0}}>Monto vendido en efectivo ese día<input value={amount} onChange={e=>setAmount(e.target.value)} inputMode="decimal" placeholder="Ej. 42000" required/></label>
      <button className="primary-button" type="submit" disabled={!valid} style={{height:42}}><Plus size={16}/> Guardar monto</button>
    </form>
    {notice&&<small style={{display:"block",width:"100%",fontWeight:800,color:"var(--green-dark)"}}>{notice}</small>}
  </>,host);
}
