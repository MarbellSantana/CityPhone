"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Banknote, Landmark, Wallet, X } from "lucide-react";
import { CashMovement, KEYS, Sale, load, money } from "../lib/storage";

type View="cash"|"bank"|"total";
type Detail={id:string;createdAt:string;concept:string;account:string;type:"Ingreso"|"Egreso";amount:number;note?:string};
const bankMethods=new Set(["Cuenta bancaria","Transferencia","Débito","Crédito","QR","PIX"]);

export default function CashBalanceDetails(){
 const[view,setView]=useState<View|null>(null),[movements,setMovements]=useState<CashMovement[]>([]),[sales,setSales]=useState<Sale[]>([]);
 useEffect(()=>{
  const reload=()=>{setMovements(load<CashMovement[]>(KEYS.cash,[]));setSales(load<Sale[]>(KEYS.sales,[]))};reload();
  window.addEventListener("storage",reload);
  const cards=Array.from(document.querySelectorAll(".page-kpis .kpi-card")).slice(0,3) as HTMLElement[];
  const handlers=[()=>{reload();setView("cash")},()=>{reload();setView("bank")},()=>{reload();setView("total")}];
  cards.forEach((card,i)=>{card.style.cursor="pointer";card.setAttribute("role","button");card.setAttribute("tabindex","0");card.setAttribute("aria-label",`Ver movimientos de ${i===0?"efectivo en caja":i===1?"cuenta bancaria":"total disponible"}`);card.addEventListener("click",handlers[i]);card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();handlers[i]()}})});
  return()=>{window.removeEventListener("storage",reload);cards.forEach((card,i)=>card.removeEventListener("click",handlers[i]))};
 },[]);
 const cash=useMemo<Detail[]>(()=>movements.filter(m=>m.method==="Efectivo").map(m=>({id:`m-${m.id}`,createdAt:m.createdAt,concept:m.concept,account:"Efectivo",type:m.type,amount:m.amount,note:m.note})),[movements]);
 const bankMovements=useMemo<Detail[]>(()=>movements.filter(m=>bankMethods.has(m.method)).map(m=>({id:`m-${m.id}`,createdAt:m.createdAt,concept:m.concept,account:m.method,type:m.type,amount:m.amount,note:m.note})),[movements]);
 const bankSales=useMemo<Detail[]>(()=>sales.filter(s=>s.method!=="Efectivo"&&s.deposited===true).map(s=>{const commission=s.commission||0;const amount=s.method==="Pago mixto"?Math.max(0,(s.otherAmount||0)-commission):(typeof s.netTotal==="number"?s.netTotal:Math.max(0,s.total-commission));return{id:`s-${s.id}`,createdAt:s.createdAt,concept:`Venta #${String(s.id).slice(-6)}`,account:s.method==="Pago mixto"?(s.secondaryMethod||"Cuenta bancaria"):s.method,type:"Ingreso" as const,amount,note:commission>0?`Neto después de comisión ${money.format(commission)}`:"Venta acreditada"}}),[sales]);
 const bank=useMemo(()=>[...bankMovements,...bankSales],[bankMovements,bankSales]);
 const details=useMemo(()=>[...(view==="cash"||view==="total"?cash:[]),...(view==="bank"||view==="total"?bank:[])].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()),[view,cash,bank]);
 const balance=details.reduce((s,d)=>s+(d.type==="Ingreso"?d.amount:-d.amount),0);
 const title=view==="cash"?"Movimientos de efectivo":view==="bank"?"Movimientos de cuenta bancaria":"Movimientos del total disponible";
 const Icon=view==="cash"?Banknote:view==="bank"?Landmark:Wallet;
 if(!view||typeof document==="undefined")return null;
 return createPortal(<div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(10,18,13,.46)",display:"grid",placeItems:"center",padding:16}} onClick={()=>setView(null)}><section className="card workspace-card" style={{width:"min(900px,100%)",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}><div className="card-heading"><div style={{display:"flex",gap:10,alignItems:"center"}}><span className="icon-box"><Icon size={19}/></span><div><h2>{title}</h2><p>Detalle de los movimientos que forman este saldo.</p></div></div><button className="ghost-button" onClick={()=>setView(null)}><X size={17}/> Cerrar</button></div><div style={{marginTop:14,padding:"12px 14px",border:"1px solid var(--border)",borderRadius:14,background:"var(--green-soft)",display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><b>Saldo calculado</b><strong style={{fontSize:20}}>{money.format(balance)}</strong></div>{details.length===0?<div className="empty-state compact" style={{marginTop:14}}><Wallet size={30}/><b>No hay movimientos</b></div>:<div style={{display:"grid",gap:8,marginTop:14}}>{details.map(d=><article key={d.id} style={{display:"grid",gridTemplateColumns:"minmax(110px,.7fr) minmax(180px,1.5fr) minmax(100px,.8fr) minmax(100px,.7fr)",gap:10,alignItems:"center",padding:"11px 12px",border:"1px solid var(--border)",borderRadius:12,background:"#fff"}}><div><b style={{fontSize:11}}>{new Date(d.createdAt).toLocaleDateString("es-AR")}</b><small style={{display:"block"}}>{new Date(d.createdAt).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}</small></div><div><b style={{fontSize:11}}>{d.concept}</b><small style={{display:"block"}}>{d.note||d.account}</small></div><span className="method">{d.account}</span><strong style={{textAlign:"right"}}>{d.type==="Egreso"?"-":"+"}{money.format(d.amount)}</strong></article>)}</div>}</section></div>,document.body);
}
