"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, CheckCircle2, Plus, ReceiptText, Trash2, Wallet, X } from "lucide-react";
import AppShell from "../components/AppShell";
import { CashClosure, CashMovement, KEYS, load, money, save } from "../lib/storage";

const expenseCategories = ["Alquiler", "Mercadería", "Servicios", "Comisiones", "Insumos", "Impuestos", "Otros"];
const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function CajaPage() {
  const [open, setOpen] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [closures, setClosures] = useState<CashClosure[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [type, setType] = useState<"Ingreso" | "Egreso">("Ingreso");
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Efectivo");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Otros");
  const [period, setPeriod] = useState("Hoy");
  const now = new Date();
  const [reportMonth, setReportMonth] = useState(now.getMonth());
  const [reportYear, setReportYear] = useState(now.getFullYear());

  useEffect(() => {
    setMovements(load<CashMovement[]>(KEYS.cash, []));
    setClosures(load<CashClosure[]>(KEYS.cashClosures, []));
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) save(KEYS.cash, movements); }, [movements, hydrated]);
  useEffect(() => { if (hydrated) save(KEYS.cashClosures, closures); }, [closures, hydrated]);

  const totals = useMemo(() => {
    const income = movements.filter(m => m.type === "Ingreso").reduce((sum, m) => sum + m.amount, 0);
    const expenses = movements.filter(m => m.type === "Egreso").reduce((sum, m) => sum + m.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [movements]);

  const filtered = useMemo(() => {
    const current = new Date();
    return movements.filter(m => {
      const d = new Date(m.createdAt);
      if (period === "Hoy") return d.toDateString() === current.toDateString();
      if (period === "Esta semana") return current.getTime() - d.getTime() <= 7 * 86400000;
      return d.getMonth() === current.getMonth() && d.getFullYear() === current.getFullYear();
    });
  }, [movements, period]);

  const monthlyMovements = useMemo(() => movements.filter(m => {
    const d = new Date(m.createdAt);
    return d.getMonth() === reportMonth && d.getFullYear() === reportYear;
  }), [movements, reportMonth, reportYear]);

  const monthlyReport = useMemo(() => {
    const income = monthlyMovements.filter(m => m.type === "Ingreso").reduce((s,m)=>s+m.amount,0);
    const expenses = monthlyMovements.filter(m => m.type === "Egreso").reduce((s,m)=>s+m.amount,0);
    const breakdown:Record<string,number> = {};
    monthlyMovements.filter(m => m.type === "Egreso").forEach(m => {
      const key = m.category || "Otros";
      breakdown[key] = (breakdown[key] || 0) + m.amount;
    });
    return { income, expenses, balance: income - expenses, breakdown };
  }, [monthlyMovements]);

  const existingClosure = closures.find(c => c.month === monthNames[reportMonth] && c.year === reportYear);

  function resetForm() { setType("Ingreso"); setConcept(""); setAmount(""); setMethod("Efectivo"); setNote(""); setCategory("Otros"); }

  function saveMovement(event: FormEvent) {
    event.preventDefault();
    const numericAmount = Number(amount.replace(",", "."));
    if (!concept.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) return;
    setMovements(current => [{ id:Date.now(), type, concept:concept.trim(), amount:numericAmount, method, note:note.trim(), createdAt:new Date().toISOString(), source:"manual", category:type === "Egreso" ? category : undefined }, ...current]);
    resetForm(); setOpen(false);
  }

  function removeMovement(id:number) { setMovements(v => v.filter(m => m.id !== id)); }

  function closeMonth() {
    if (existingClosure) return;
    const closure:CashClosure = {
      id: Date.now(),
      month: monthNames[reportMonth],
      year: reportYear,
      income: monthlyReport.income,
      expenses: monthlyReport.expenses,
      balance: monthlyReport.balance,
      movementCount: monthlyMovements.length,
      expenseBreakdown: monthlyReport.breakdown,
      closedAt: new Date().toISOString(),
    };
    setClosures(v => [closure, ...v]);
    setShowClose(false);
  }

  return <AppShell
    title="Caja"
    subtitle="Controla ingresos, egresos, gastos y cierres mensuales."
    active="Caja"
    titleAction={<button className="outline-action" onClick={() => setShowClose(true)}><CheckCircle2 size={17}/> Cerrar mes</button>}
  >
    <section className="kpis page-kpis">
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><Wallet size={19}/></span></div><div className="kpi-label">Saldo actual</div><div className="kpi-value">{money.format(totals.balance)}</div><div className="kpi-foot">{movements.length ? `${movements.length} movimientos registrados` : "Caja sin movimientos"}</div></div>
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><ArrowDownLeft size={19}/></span></div><div className="kpi-label">Ingresos</div><div className="kpi-value">{money.format(totals.income)}</div><div className="kpi-foot">{movements.filter(m => m.type === "Ingreso").length} movimientos</div></div>
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><ArrowUpRight size={19}/></span></div><div className="kpi-label">Egresos</div><div className="kpi-value">{money.format(totals.expenses)}</div><div className="kpi-foot">{movements.filter(m => m.type === "Egreso").length} movimientos</div></div>
    </section>

    {open && <section className="card workspace-card section-gap">
      <div className="card-heading"><div><h2>Nuevo movimiento</h2><p>Registra un ingreso o egreso manual de caja.</p></div><button className="ghost-button" type="button" onClick={() => setOpen(false)}><X size={17}/> Cerrar</button></div>
      <form className="form-grid" onSubmit={saveMovement}>
        <label className="field-label">Tipo<select value={type} onChange={e => setType(e.target.value as "Ingreso" | "Egreso")}><option>Ingreso</option><option>Egreso</option></select></label>
        <label className="field-label">Concepto<input value={concept} onChange={e => setConcept(e.target.value)} placeholder="Ej. Alquiler, compra de insumos, retiro" required /></label>
        <label className="field-label">Monto<input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" placeholder="0" required /></label>
        <label className="field-label">Método de pago<select value={method} onChange={e => setMethod(e.target.value)}><option>Efectivo</option><option>Débito</option><option>Crédito</option><option>Transferencia</option><option>Mercado Pago</option></select></label>
        {type === "Egreso" && <label className="field-label">Categoría de gasto<select value={category} onChange={e => setCategory(e.target.value)}>{expenseCategories.map(c => <option key={c}>{c}</option>)}</select></label>}
        <label className="field-label" style={{gridColumn:"1 / -1"}}>Observación <small>Opcional</small><input value={note} onChange={e => setNote(e.target.value)} placeholder="Detalle adicional" /></label>
        <button className="primary-button" type="submit">Guardar movimiento</button>
      </form>
    </section>}

    <section className="card workspace-card section-gap">
      <div className="card-heading">
        <div><h2>Movimientos de caja</h2><p>Ingresos y egresos registrados.</p></div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <button className="primary-button" onClick={() => setOpen(true)}><Plus size={18}/> Nuevo movimiento</button>
          <select className="period-select" value={period} onChange={e => setPeriod(e.target.value)}><option>Hoy</option><option>Esta semana</option><option>Este mes</option></select>
        </div>
      </div>
      {!hydrated ? <div className="empty-state"><b>Cargando movimientos...</b></div> : filtered.length === 0 ? <div className="empty-state"><Wallet size={34}/><b>Todavía no hay movimientos</b><span>Los cobros en efectivo y movimientos manuales aparecerán aquí.</span></div> : <div className="sales-table">
        <div className="table-head"><span>Fecha</span><span>Concepto</span><span>Tipo</span><span>Método</span><span>Monto</span></div>
        {filtered.map(m => <div className="table-row" key={m.id}><div><b>{new Date(m.createdAt).toLocaleDateString("es-AR")}</b><small>{new Date(m.createdAt).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})} · {m.note || "Sin observación"}</small></div><span>{m.concept}{m.type === "Egreso" && m.category ? <small style={{display:"block"}}>{m.category}</small> : null}</span><span className="method">{m.type}</span><span>{m.method}</span><strong>{m.type === "Egreso" ? "-" : "+"}{money.format(m.amount)}</strong>{m.source !== "sale" && <button className="ghost-button" onClick={() => removeMovement(m.id)} title="Eliminar"><Trash2 size={14}/></button>}</div>)}
      </div>}
    </section>

    {closures.length > 0 && <section className="card workspace-card section-gap"><div className="card-heading"><div><h2>Historial de cierres</h2><p>Los reportes cerrados también aparecen automáticamente en Meses y reportes.</p></div><CalendarDays size={20}/></div><div className="sales-table">{closures.map(c=><div className="table-row" key={c.id}><div><b>{c.month} {c.year}</b><small>Cerrado {new Date(c.closedAt).toLocaleDateString("es-AR")}</small></div><span>{c.movementCount} movimientos</span><span>Gastos {money.format(c.expenses)}</span><span>Ingresos {money.format(c.income)}</span><strong>{money.format(c.balance)}</strong></div>)}</div></section>}

    {showClose && <div style={{position:"fixed",inset:0,zIndex:80,background:"rgba(10,18,13,.42)",display:"grid",placeItems:"center",padding:18}} onClick={()=>setShowClose(false)}>
      <section className="card workspace-card" style={{width:"min(820px,100%)",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.25)"}} onClick={e=>e.stopPropagation()}>
        <div className="card-heading"><div><h2>Reporte mensual de caja</h2><p>Este reporte se genera únicamente al cerrar el mes y quedará guardado en Meses y reportes.</p></div><button className="ghost-button" onClick={()=>setShowClose(false)}><X size={17}/> Cerrar</button></div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14}}><select className="period-select" value={reportMonth} onChange={e=>setReportMonth(Number(e.target.value))}>{monthNames.map((m,i)=><option key={m} value={i}>{m}</option>)}</select><select className="period-select" value={reportYear} onChange={e=>setReportYear(Number(e.target.value))}>{[now.getFullYear()-1,now.getFullYear(),now.getFullYear()+1].map(y=><option key={y}>{y}</option>)}</select></div>
        <section className="kpis page-kpis" style={{marginTop:14}}>
          <div className="card kpi-card"><div className="kpi-label">Ingresos del mes</div><div className="kpi-value">{money.format(monthlyReport.income)}</div></div>
          <div className="card kpi-card"><div className="kpi-label">Gastos del mes</div><div className="kpi-value">{money.format(monthlyReport.expenses)}</div></div>
          <div className="card kpi-card"><div className="kpi-label">Resultado del mes</div><div className="kpi-value">{money.format(monthlyReport.balance)}</div></div>
        </section>
        <div className="card-heading" style={{marginTop:18}}><div><h2>Gastos por categoría</h2><p>Detalle incluido en el cierre mensual.</p></div><ReceiptText size={20}/></div>
        {Object.keys(monthlyReport.breakdown).length === 0 ? <div className="empty-state compact"><ReceiptText size={30}/><b>Sin gastos registrados</b><span>No hay egresos categorizados para este mes.</span></div> : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginTop:12}}>{Object.entries(monthlyReport.breakdown).sort((a,b)=>b[1]-a[1]).map(([name,total])=><div key={name} style={{border:"1px solid var(--border)",borderRadius:14,padding:14,background:"#fff"}}><small style={{fontWeight:800,color:"var(--muted)"}}>{name}</small><div style={{fontSize:20,fontWeight:900,marginTop:5}}>{money.format(total)}</div></div>)}</div>}
        <div style={{marginTop:14,fontSize:11,color:"var(--muted)"}}>{monthlyMovements.length} movimientos incluidos en este cierre.</div>
        {existingClosure ? <div style={{marginTop:16,padding:"12px 14px",border:"1px solid var(--border)",borderRadius:14,background:"var(--green-soft)"}}><b>Este mes ya fue cerrado</b><div style={{fontSize:11,marginTop:4}}>Cerrado el {new Date(existingClosure.closedAt).toLocaleDateString("es-AR")} con un resultado de {money.format(existingClosure.balance)}.</div></div> : <button className="primary-button full-button" style={{marginTop:16}} onClick={closeMonth}><CheckCircle2 size={17}/> Confirmar cierre mensual</button>}
      </section>
    </div>}
  </AppShell>;
}
