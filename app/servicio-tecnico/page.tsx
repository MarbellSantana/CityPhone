"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Box, Calculator, MessageCircle, Plus, Search, Trash2, Wrench, X } from "lucide-react";
import AppShell from "../components/AppShell";
import { KEYS, Part, Quote, Repair, load, money, save } from "../lib/storage";

export default function ServicioTecnicoPage() {
  const [tab, setTab] = useState<"ordenes" | "cotizaciones" | "repuestos">("ordenes");
  const [showIngreso, setShowIngreso] = useState(false);
  const [showPart, setShowPart] = useState(false);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos los estados");

  useEffect(() => { setRepairs(load<Repair[]>(KEYS.repairs, [])); setQuotes(load<Quote[]>(KEYS.quotes, [])); setParts(load<Part[]>(KEYS.parts, [])); }, []);
  useEffect(() => save(KEYS.repairs, repairs), [repairs]);
  useEffect(() => save(KEYS.quotes, quotes), [quotes]);
  useEffect(() => save(KEYS.parts, parts), [parts]);

  const filteredRepairs = useMemo(() => repairs.filter(r => {
    const q = search.toLowerCase().trim();
    const text = `${r.nombre} ${r.apellido} ${r.telefono} ${r.equipo} ${r.motivo}`.toLowerCase();
    return (!q || text.includes(q)) && (status === "Todos los estados" || r.estado === status);
  }), [repairs, search, status]);

  function guardarIngreso(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const f = new FormData(event.currentTarget);
    const r:Repair = { id:Date.now(), nombre:String(f.get("nombre")||"").trim(), apellido:String(f.get("apellido")||"").trim(), telefono:String(f.get("telefono")||"").trim(), email:String(f.get("email")||"").trim(), equipo:String(f.get("equipo")||"").trim(), motivo:String(f.get("motivo")||"").trim(), precio:Number(f.get("precio")||0), estado:"Ingresado", createdAt:new Date().toISOString() };
    if (!r.nombre || !r.telefono || !r.equipo || !r.motivo) return;
    setRepairs(v => [r,...v]); event.currentTarget.reset(); setShowIngreso(false); setTab("ordenes");
  }
  function guardarCotizacion(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); const f = new FormData(event.currentTarget);
    const q:Quote = { id:Date.now(), cliente:String(f.get("cliente")||"").trim(), telefono:String(f.get("telefono")||"").trim(), equipo:String(f.get("equipo")||"").trim(), reparacion:String(f.get("reparacion")||"").trim(), costo:Number(f.get("costo")||0), precio:Number(f.get("precio")||0), estado:"Pendiente", createdAt:new Date().toISOString() };
    if (!q.cliente || !q.telefono || !q.equipo || !q.reparacion) return;
    setQuotes(v => [q,...v]); event.currentTarget.reset();
  }
  function guardarRepuesto(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); const f = new FormData(event.currentTarget);
    const p:Part = { id:Date.now(), name:String(f.get("name")||"").trim(), model:String(f.get("model")||"").trim(), cost:Number(f.get("cost")||0), price:Number(f.get("price")||0), stock:Number(f.get("stock")||0), minStock:Number(f.get("minStock")||0) };
    if (!p.name) return; setParts(v => [p,...v]); event.currentTarget.reset(); setShowPart(false);
  }
  function whatsapp(phone:string, text:string) { const digits = phone.replace(/\D/g,""); window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer"); }

  return <AppShell title="Servicio técnico" subtitle="Gestiona equipos, reparaciones, cotizaciones y repuestos." active="Servicio técnico" action={<button className="primary-button" onClick={() => setShowIngreso(v => !v)}><Plus size={18}/> Ingreso al taller</button>}>
    {showIngreso && <section className="card workspace-card" style={{marginBottom:16}}><div className="card-heading"><div><h2>Ingreso al taller</h2><p>Registra los datos del cliente y del equipo recibido.</p></div><button className="ghost-button" onClick={() => setShowIngreso(false)}><X size={17}/> Cerrar</button></div><form onSubmit={guardarIngreso}><div className="form-grid"><label className="field-label">Nombre<input name="nombre" required /></label><label className="field-label">Apellido<input name="apellido" /></label><label className="field-label">Teléfono<input name="telefono" required /></label><label className="field-label">Correo electrónico<input name="email" type="email" /></label><label className="field-label">Equipo<input name="equipo" required placeholder="Ej. iPhone 13" /></label><label className="field-label">Precio de reparación<input name="precio" type="number" min="0" defaultValue="0" /></label></div><label className="field-label">Motivo / reparación<input name="motivo" required /></label><button className="primary-button" type="submit">Guardar ingreso</button></form></section>}

    <div className="subnav-tabs"><button className={tab === "ordenes" ? "active" : ""} onClick={() => setTab("ordenes")}><Wrench size={16}/> Órdenes de reparación</button><button className={tab === "cotizaciones" ? "active" : ""} onClick={() => setTab("cotizaciones")}><Calculator size={16}/> Cotizaciones</button><button className={tab === "repuestos" ? "active" : ""} onClick={() => setTab("repuestos")}><Box size={16}/> Inventario de repuestos</button></div>

    {tab === "ordenes" && <section className="card workspace-card"><div className="toolbar-row"><div className="search-field grow"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por cliente, teléfono o equipo..." /></div><select className="filter-select" value={status} onChange={e=>setStatus(e.target.value)}><option>Todos los estados</option><option>Ingresado</option><option>En reparación</option><option>Listo para entregar</option><option>Entregado</option></select></div>{filteredRepairs.length === 0 ? <div className="empty-state"><Wrench size={34}/><b>No hay teléfonos ingresados</b><span>Los ingresos del taller aparecerán aquí.</span><button className="primary-button" type="button" onClick={()=>setShowIngreso(true)}><Plus size={16}/> Ingreso al taller</button></div> : <div className="sales-table"><div className="table-head"><span>Cliente</span><span>Equipo / reparación</span><span>Estado</span><span>Precio</span><span>Contacto</span></div>{filteredRepairs.map(r => <div className="table-row" key={r.id}><div><b>{r.nombre} {r.apellido}</b><small>{new Date(r.createdAt).toLocaleDateString("es-AR")}</small></div><div><b>{r.equipo}</b><small>{r.motivo}</small></div><select className="period-select" value={r.estado} onChange={e=>setRepairs(v=>v.map(x=>x.id===r.id?{...x,estado:e.target.value}:x))}><option>Ingresado</option><option>En reparación</option><option>Listo para entregar</option><option>Entregado</option></select><strong>{money.format(r.precio)}</strong><span style={{display:"flex",gap:6}}><button className="outline-action" onClick={()=>whatsapp(r.telefono,`Hola ${r.nombre}, te escribimos de City Phone por tu ${r.equipo}. Estado: ${r.estado}.`)}><MessageCircle size={14}/></button><button className="ghost-button" onClick={()=>setRepairs(v=>v.filter(x=>x.id!==r.id))}><Trash2 size={14}/></button></span></div>)}</div>}</section>}

    {tab === "cotizaciones" && <section className="workspace-grid"><div className="card workspace-card"><div className="card-heading"><div><h2>Nueva cotización</h2><p>Calcula y guarda el precio antes de aprobar la reparación.</p></div></div><form onSubmit={guardarCotizacion}><div className="form-grid"><label className="field-label">Cliente<input name="cliente" required /></label><label className="field-label">Teléfono<input name="telefono" required /></label><label className="field-label">Equipo<input name="equipo" required /></label><label className="field-label">Reparación<input name="reparacion" required /></label><label className="field-label">Costo del repuesto<input name="costo" type="number" min="0" defaultValue="0" /></label><label className="field-label">Precio al cliente<input name="precio" type="number" min="0" defaultValue="0" /></label></div><button className="primary-button" type="submit">Guardar cotización</button></form></div><div className="card workspace-card"><div className="card-heading"><div><h2>Cotizaciones guardadas</h2><p>Pendientes, aprobadas o rechazadas.</p></div></div>{quotes.length===0?<div className="empty-state compact"><Calculator size={30}/><b>Sin cotizaciones</b></div>:<div style={{display:"grid",gap:10,marginTop:14}}>{quotes.map(q=><div key={q.id} style={{border:"1px solid var(--border)",borderRadius:12,padding:12}}><b>{q.cliente} · {q.equipo}</b><small style={{display:"block",color:"var(--muted)",marginTop:3}}>{q.reparacion} · {money.format(q.precio)}</small><div style={{display:"flex",gap:6,marginTop:9,flexWrap:"wrap"}}><select className="period-select" value={q.estado} onChange={e=>setQuotes(v=>v.map(x=>x.id===q.id?{...x,estado:e.target.value}:x))}><option>Pendiente</option><option>Aprobada</option><option>Rechazada</option></select><button className="outline-action" onClick={()=>whatsapp(q.telefono,`Hola ${q.cliente}, tu cotización de City Phone para ${q.equipo} (${q.reparacion}) es de ${money.format(q.precio)}.`)}><MessageCircle size={14}/> WhatsApp</button><button className="ghost-button" onClick={()=>setQuotes(v=>v.filter(x=>x.id!==q.id))}><Trash2 size={14}/></button></div></div>)}</div>}</div></section>}

    {tab === "repuestos" && <><section className="card workspace-card"><div className="card-heading"><div><h2>Inventario de repuestos</h2><p>Stock destinado exclusivamente a reparaciones.</p></div><button className="outline-action" onClick={()=>setShowPart(v=>!v)}><Plus size={16}/> Agregar repuesto</button></div>{showPart&&<form onSubmit={guardarRepuesto} style={{marginTop:12}}><div className="form-grid"><label className="field-label">Repuesto<input name="name" required /></label><label className="field-label">Modelo<input name="model" /></label><label className="field-label">Costo<input name="cost" type="number" min="0" defaultValue="0" /></label><label className="field-label">Precio sugerido<input name="price" type="number" min="0" defaultValue="0" /></label><label className="field-label">Stock<input name="stock" type="number" min="0" defaultValue="0" /></label><label className="field-label">Stock mínimo<input name="minStock" type="number" min="0" defaultValue="0" /></label></div><button className="primary-button" type="submit">Guardar repuesto</button></form>}<div className="inventory-table"><div className="inventory-head"><span>Repuesto</span><span>Modelo</span><span>Costo</span><span>Precio sugerido</span><span>Stock</span><span>Acciones</span></div>{parts.length===0?<div className="empty-state"><Box size={34}/><b>No hay repuestos cargados</b></div>:parts.map(p=><div className="inventory-head" key={p.id} style={{textTransform:"none",fontSize:11,borderTop:"1px solid #eef2ef",color:"var(--black)",alignItems:"center"}}><span><b>{p.name}</b></span><span>{p.model||"—"}</span><span>{money.format(p.cost)}</span><span>{money.format(p.price)}</span><span style={{color:p.stock<=p.minStock?"var(--danger)":"inherit"}}>{p.stock} · mín {p.minStock}</span><span style={{display:"flex",gap:5}}><button className="outline-action" onClick={()=>setParts(v=>v.map(x=>x.id===p.id?{...x,stock:Math.max(0,x.stock-1)}:x))}>-</button><button className="outline-action" onClick={()=>setParts(v=>v.map(x=>x.id===p.id?{...x,stock:x.stock+1}:x))}>+</button><button className="ghost-button" onClick={()=>setParts(v=>v.filter(x=>x.id!==p.id))}><Trash2 size={14}/></button></span></div>)}</div></section></>}
  </AppShell>;
}
