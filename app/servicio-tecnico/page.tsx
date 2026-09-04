"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Box, Calculator, MessageCircle, Plus, Search, Trash2, Wrench, X } from "lucide-react";
import AppShell from "../components/AppShell";
import { KEYS, Part, Quote, Repair, load, money, save } from "../lib/storage";

export default function ServicioTecnicoPage() {
  const [tab, setTab] = useState<"ordenes" | "cotizaciones" | "repuestos">("ordenes");
  const [showIngreso, setShowIngreso] = useState(false);
  const [showPart, setShowPart] = useState(false);
  const [diagnosingId, setDiagnosingId] = useState<number|null>(null);
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
    const text = `${r.nombre} ${r.apellido} ${r.telefono} ${r.equipo} ${r.motivo} ${r.diagnostico||""}`.toLowerCase();
    return (!q || text.includes(q)) && (status === "Todos los estados" || r.estado === status);
  }), [repairs, search, status]);

  function orderNumber(id:number) { return `ST-${String(id).slice(-6).padStart(6,"0")}`; }
  function fichaIngreso(r:Repair) {
    return `🟢 *CITY PHONE · SERVICIO TÉCNICO*\n*Ficha de ingreso para revisión*\n\n🧾 *Orden:* ${orderNumber(r.id)}\n👤 *Cliente:* ${r.nombre}${r.apellido ? ` ${r.apellido}` : ""}\n📱 *Equipo:* ${r.equipo}\n🔎 *Motivo de ingreso:* ${r.motivo}\n📌 *Estado:* Recibido para revisión\n📅 *Fecha:* ${new Date(r.createdAt).toLocaleDateString("es-AR")}\n\nEl equipo fue recibido para *revisión y diagnóstico*. Una vez revisado, te enviaremos el diagnóstico y el presupuesto antes de realizar cualquier reparación.\n\n📍 Av. Corrientes 640 · Local 8\nGalería Central\n\nGracias por confiar en *City Phone* 💚`;
  }
  function fichaDiagnostico(r:Repair) {
    return `🟢 *CITY PHONE · SERVICIO TÉCNICO*\n*Diagnóstico y presupuesto*\n\n🧾 *Orden:* ${orderNumber(r.id)}\n👤 *Cliente:* ${r.nombre}${r.apellido ? ` ${r.apellido}` : ""}\n📱 *Equipo:* ${r.equipo}\n🔎 *Diagnóstico:* ${r.diagnostico||"—"}\n🛠️ *Reparación recomendada:* ${r.reparacionRecomendada||"—"}\n💰 *Presupuesto:* ${money.format(r.precio)}\n📌 *Estado:* Esperando aprobación\n\nPor favor indicanos por este medio si *aprobás la reparación*. No realizaremos la reparación hasta recibir tu confirmación.\n\n📍 Av. Corrientes 640 · Local 8\nGalería Central\n\n*City Phone* 💚`;
  }

  function guardarIngreso(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const enviarWhatsapp = submitter?.value === "whatsapp";
    const f = new FormData(event.currentTarget);
    const r:Repair = { id:Date.now(), nombre:String(f.get("nombre")||"").trim(), apellido:String(f.get("apellido")||"").trim(), telefono:String(f.get("telefono")||"").trim(), email:String(f.get("email")||"").trim(), equipo:String(f.get("equipo")||"").trim(), motivo:String(f.get("motivo")||"").trim(), precio:0, estado:"Recibido para revisión", createdAt:new Date().toISOString() };
    if (!r.nombre || !r.telefono || !r.equipo || !r.motivo) return;
    setRepairs(v => [r,...v]);
    if (enviarWhatsapp) whatsapp(r.telefono, fichaIngreso(r));
    event.currentTarget.reset(); setShowIngreso(false); setTab("ordenes");
  }
  function guardarDiagnostico(event:FormEvent<HTMLFormElement>, r:Repair) {
    event.preventDefault(); const f = new FormData(event.currentTarget);
    const updated:Repair = {...r, diagnostico:String(f.get("diagnostico")||"").trim(), reparacionRecomendada:String(f.get("reparacion")||"").trim(), precio:Number(f.get("precio")||0), estado:"Esperando aprobación", diagnosticadoAt:new Date().toISOString()};
    if (!updated.diagnostico || !updated.reparacionRecomendada) return;
    setRepairs(v=>v.map(x=>x.id===r.id?updated:x)); setDiagnosingId(null);
    whatsapp(updated.telefono,fichaDiagnostico(updated));
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
  function whatsapp(phone:string, text:string) {
    const digits = phone.replace(/\D/g,""); if (!digits) return;
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return <AppShell title="Servicio técnico" subtitle="Gestiona equipos, diagnósticos, reparaciones y repuestos." active="Servicio técnico">
    {showIngreso && <section className="card workspace-card" style={{marginBottom:16}}><div className="card-heading"><div><h2>Ingreso para revisión</h2><p>Recibe el equipo. El diagnóstico y el precio se cargan después de revisarlo.</p></div><button className="ghost-button" onClick={()=>setShowIngreso(false)}><X size={17}/> Cerrar</button></div><form onSubmit={guardarIngreso}><div className="form-grid"><label className="field-label">Nombre<input name="nombre" required /></label><label className="field-label">Apellido<input name="apellido" /></label><label className="field-label">Teléfono<input name="telefono" required placeholder="Ej. 54911..." /></label><label className="field-label">Correo electrónico<input name="email" type="email" /></label><label className="field-label">Equipo<input name="equipo" required placeholder="Ej. iPhone 13" /></label></div><label className="field-label">Motivo de ingreso / falla informada<input name="motivo" required /></label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="primary-button" type="submit">Guardar ingreso</button><button className="outline-action" type="submit" value="whatsapp"><MessageCircle size={16}/> Guardar y enviar ficha</button></div></form></section>}

    <div className="subnav-tabs"><button className={tab==="ordenes"?"active":""} onClick={()=>setTab("ordenes")}><Wrench size={16}/> Órdenes de reparación</button><button className={tab==="cotizaciones"?"active":""} onClick={()=>setTab("cotizaciones")}><Calculator size={16}/> Cotizaciones</button><button className={tab==="repuestos"?"active":""} onClick={()=>setTab("repuestos")}><Box size={16}/> Inventario de repuestos</button></div>

    {tab==="ordenes" && <section className="card workspace-card"><div className="toolbar-row"><div className="search-field grow"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por cliente, teléfono, equipo o diagnóstico..." /></div><select className="filter-select" value={status} onChange={e=>setStatus(e.target.value)}><option>Todos los estados</option><option>Recibido para revisión</option><option>Esperando aprobación</option><option>Aprobado</option><option>No aprobado</option><option>En reparación</option><option>Listo para entregar</option><option>Entregado</option></select></div>{filteredRepairs.length===0?<div className="empty-state"><Wrench size={34}/><b>No hay teléfonos ingresados</b><span>Los ingresos para revisión aparecerán aquí.</span><button className="primary-button" onClick={()=>setShowIngreso(true)}><Plus size={16}/> Ingreso al taller</button></div>:<div style={{display:"grid",gap:12,marginTop:14}}>{filteredRepairs.map(r=><div key={r.id} style={{border:"1px solid var(--border)",borderRadius:14,padding:14,background:"#fff"}}><div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><b>{r.nombre} {r.apellido} · {r.equipo}</b><small style={{display:"block",color:"var(--muted)",marginTop:3}}>{orderNumber(r.id)} · {new Date(r.createdAt).toLocaleDateString("es-AR")} · {r.motivo}</small></div><span style={{fontWeight:800,color:"var(--green-dark)"}}>{r.estado}</span></div>{r.diagnostico&&<div style={{marginTop:10,padding:10,borderRadius:10,background:"var(--green-soft)"}}><b>Diagnóstico:</b> {r.diagnostico}<br/><b>Reparación:</b> {r.reparacionRecomendada}<br/><b>Presupuesto:</b> {money.format(r.precio)}</div>}{diagnosingId===r.id?<form onSubmit={e=>guardarDiagnostico(e,r)} style={{marginTop:12}}><div className="form-grid"><label className="field-label">Diagnóstico<input name="diagnostico" required defaultValue={r.diagnostico||""}/></label><label className="field-label">Reparación recomendada<input name="reparacion" required defaultValue={r.reparacionRecomendada||""}/></label><label className="field-label">Precio / presupuesto<input name="precio" type="number" min="0" required defaultValue={r.precio||0}/></label></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="primary-button" type="submit"><MessageCircle size={15}/> Guardar y enviar diagnóstico</button><button className="ghost-button" type="button" onClick={()=>setDiagnosingId(null)}>Cancelar</button></div></form>:<div style={{display:"flex",gap:7,marginTop:12,flexWrap:"wrap"}}>{!r.diagnostico&&<button className="primary-button" onClick={()=>setDiagnosingId(r.id)}>Cargar diagnóstico</button>}<button className="outline-action" onClick={()=>whatsapp(r.telefono,r.diagnostico?fichaDiagnostico(r):fichaIngreso(r))}><MessageCircle size={14}/> {r.diagnostico?"Enviar diagnóstico":"Enviar ficha"}</button>{r.estado==="Esperando aprobación"&&<><button className="outline-action" onClick={()=>setRepairs(v=>v.map(x=>x.id===r.id?{...x,estado:"Aprobado"}:x))}>Marcar aprobado</button><button className="ghost-button" onClick={()=>setRepairs(v=>v.map(x=>x.id===r.id?{...x,estado:"No aprobado"}:x))}>No aprobado</button></>}<select className="period-select" value={r.estado} onChange={e=>setRepairs(v=>v.map(x=>x.id===r.id?{...x,estado:e.target.value}:x))}><option>Recibido para revisión</option><option>Esperando aprobación</option><option>Aprobado</option><option>No aprobado</option><option>En reparación</option><option>Listo para entregar</option><option>Entregado</option></select><button className="ghost-button" onClick={()=>setRepairs(v=>v.filter(x=>x.id!==r.id))}><Trash2 size={14}/></button></div>}</div>)}</div>}</section>}

    {tab==="cotizaciones" && <section className="workspace-grid"><div className="card workspace-card"><div className="card-heading"><div><h2>Nueva cotización</h2><p>Cotizaciones independientes del flujo de equipos ingresados.</p></div></div><form onSubmit={guardarCotizacion}><div className="form-grid"><label className="field-label">Cliente<input name="cliente" required /></label><label className="field-label">Teléfono<input name="telefono" required /></label><label className="field-label">Equipo<input name="equipo" required /></label><label className="field-label">Reparación<input name="reparacion" required /></label><label className="field-label">Costo del repuesto<input name="costo" type="number" min="0" defaultValue="0" /></label><label className="field-label">Precio al cliente<input name="precio" type="number" min="0" defaultValue="0" /></label></div><button className="primary-button" type="submit">Guardar cotización</button></form></div><div className="card workspace-card"><h2>Cotizaciones guardadas</h2>{quotes.length===0?<div className="empty-state compact"><Calculator size={30}/><b>Sin cotizaciones</b></div>:<div style={{display:"grid",gap:10,marginTop:14}}>{quotes.map(q=><div key={q.id} style={{border:"1px solid var(--border)",borderRadius:12,padding:12}}><b>{q.cliente} · {q.equipo}</b><small style={{display:"block",color:"var(--muted)"}}>{q.reparacion} · {money.format(q.precio)}</small><div style={{display:"flex",gap:6,marginTop:9}}><button className="outline-action" onClick={()=>whatsapp(q.telefono,`Hola ${q.cliente}, tu cotización de City Phone para ${q.equipo} (${q.reparacion}) es de ${money.format(q.precio)}.`)}><MessageCircle size={14}/> WhatsApp</button><button className="ghost-button" onClick={()=>setQuotes(v=>v.filter(x=>x.id!==q.id))}><Trash2 size={14}/></button></div></div>)}</div>}</div></section>}

    {tab==="repuestos" && <section className="card workspace-card"><div className="card-heading"><div><h2>Inventario de repuestos</h2><p>Stock destinado exclusivamente a reparaciones.</p></div><button className="outline-action" onClick={()=>setShowPart(v=>!v)}><Plus size={16}/> Agregar repuesto</button></div>{showPart&&<form onSubmit={guardarRepuesto} style={{marginTop:12}}><div className="form-grid"><label className="field-label">Repuesto<input name="name" required /></label><label className="field-label">Modelo<input name="model" /></label><label className="field-label">Costo<input name="cost" type="number" min="0" defaultValue="0" /></label><label className="field-label">Precio sugerido<input name="price" type="number" min="0" defaultValue="0" /></label><label className="field-label">Stock<input name="stock" type="number" min="0" defaultValue="0" /></label><label className="field-label">Stock mínimo<input name="minStock" type="number" min="0" defaultValue="0" /></label></div><button className="primary-button" type="submit">Guardar repuesto</button></form>}<div className="inventory-table"><div className="inventory-head"><span>Repuesto</span><span>Modelo</span><span>Costo</span><span>Precio sugerido</span><span>Stock</span><span>Acciones</span></div>{parts.length===0?<div className="empty-state"><Box size={34}/><b>No hay repuestos cargados</b></div>:parts.map(p=><div className="inventory-head" key={p.id} style={{textTransform:"none",fontSize:11,borderTop:"1px solid #eef2ef",color:"var(--black)",alignItems:"center"}}><span><b>{p.name}</b></span><span>{p.model||"—"}</span><span>{money.format(p.cost)}</span><span>{money.format(p.price)}</span><span>{p.stock} · mín {p.minStock}</span><span style={{display:"flex",gap:5}}><button className="outline-action" onClick={()=>setParts(v=>v.map(x=>x.id===p.id?{...x,stock:Math.max(0,x.stock-1)}:x))}>-</button><button className="outline-action" onClick={()=>setParts(v=>v.map(x=>x.id===p.id?{...x,stock:x.stock+1}:x))}>+</button><button className="ghost-button" onClick={()=>setParts(v=>v.filter(x=>x.id!==p.id))}><Trash2 size={14}/></button></span></div>)}</div></section>}
  </AppShell>;
}
