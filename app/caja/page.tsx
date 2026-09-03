"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Plus, Trash2, Wallet, X } from "lucide-react";
import AppShell from "../components/AppShell";
import { CashMovement, KEYS, load, money, save } from "../lib/storage";

export default function CajaPage() {
  const [open, setOpen] = useState(false);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [type, setType] = useState<"Ingreso" | "Egreso">("Ingreso");
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Efectivo");
  const [note, setNote] = useState("");
  const [period, setPeriod] = useState("Hoy");

  useEffect(() => setMovements(load<CashMovement[]>(KEYS.cash, [])), []);
  useEffect(() => save(KEYS.cash, movements), [movements]);

  const totals = useMemo(() => {
    const income = movements.filter(m => m.type === "Ingreso").reduce((sum, m) => sum + m.amount, 0);
    const expenses = movements.filter(m => m.type === "Egreso").reduce((sum, m) => sum + m.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [movements]);

  const filtered = useMemo(() => {
    const now = new Date();
    return movements.filter(m => {
      const d = new Date(m.createdAt);
      if (period === "Hoy") return d.toDateString() === now.toDateString();
      if (period === "Esta semana") return now.getTime() - d.getTime() <= 7 * 86400000;
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [movements, period]);

  function resetForm() { setType("Ingreso"); setConcept(""); setAmount(""); setMethod("Efectivo"); setNote(""); }

  function saveMovement(event: FormEvent) {
    event.preventDefault();
    const numericAmount = Number(amount.replace(",", "."));
    if (!concept.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) return;
    setMovements(current => [{ id:Date.now(), type, concept:concept.trim(), amount:numericAmount, method, note:note.trim(), createdAt:new Date().toISOString(), source:"manual" }, ...current]);
    resetForm(); setOpen(false);
  }

  function removeMovement(id:number) { setMovements(v => v.filter(m => m.id !== id)); }

  return <AppShell title="Caja" subtitle="Controla apertura, ingresos, egresos y saldo del día." active="Caja" action={<button className="primary-button" onClick={() => setOpen(true)}><Plus size={18}/> Nuevo movimiento</button>}>
    <section className="kpis page-kpis">
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><Wallet size={19}/></span></div><div className="kpi-label">Saldo actual</div><div className="kpi-value">{money.format(totals.balance)}</div><div className="kpi-foot">{movements.length ? `${movements.length} movimientos registrados` : "Caja sin movimientos"}</div></div>
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><ArrowDownLeft size={19}/></span></div><div className="kpi-label">Ingresos</div><div className="kpi-value">{money.format(totals.income)}</div><div className="kpi-foot">{movements.filter(m => m.type === "Ingreso").length} movimientos</div></div>
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><ArrowUpRight size={19}/></span></div><div className="kpi-label">Egresos</div><div className="kpi-value">{money.format(totals.expenses)}</div><div className="kpi-foot">{movements.filter(m => m.type === "Egreso").length} movimientos</div></div>
    </section>

    {open && <section className="card workspace-card section-gap">
      <div className="card-heading"><div><h2>Nuevo movimiento</h2><p>Registra un ingreso o egreso manual de caja.</p></div><button className="ghost-button" type="button" onClick={() => setOpen(false)}><X size={17}/> Cerrar</button></div>
      <form className="form-grid" onSubmit={saveMovement}>
        <label className="field-label">Tipo<select value={type} onChange={e => setType(e.target.value as "Ingreso" | "Egreso")}><option>Ingreso</option><option>Egreso</option></select></label>
        <label className="field-label">Concepto<input value={concept} onChange={e => setConcept(e.target.value)} placeholder="Ej. Apertura de caja, compra de insumos" required /></label>
        <label className="field-label">Monto<input value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" placeholder="0" required /></label>
        <label className="field-label">Método de pago<select value={method} onChange={e => setMethod(e.target.value)}><option>Efectivo</option><option>Débito</option><option>Crédito</option><option>Transferencia</option><option>Mercado Pago</option></select></label>
        <label className="field-label" style={{gridColumn:"1 / -1"}}>Observación <small>Opcional</small><input value={note} onChange={e => setNote(e.target.value)} placeholder="Detalle adicional" /></label>
        <button className="primary-button" type="submit">Guardar movimiento</button>
      </form>
    </section>}

    <section className="card workspace-card section-gap">
      <div className="card-heading"><div><h2>Movimientos de caja</h2><p>Ingresos y egresos registrados.</p></div><select className="period-select" value={period} onChange={e => setPeriod(e.target.value)}><option>Hoy</option><option>Esta semana</option><option>Este mes</option></select></div>
      {filtered.length === 0 ? <div className="empty-state"><Wallet size={34}/><b>Todavía no hay movimientos</b><span>Los cobros en efectivo y movimientos manuales aparecerán aquí.</span></div> : <div className="sales-table">
        <div className="table-head"><span>Fecha</span><span>Concepto</span><span>Tipo</span><span>Método</span><span>Monto</span></div>
        {filtered.map(m => <div className="table-row" key={m.id}><div><b>{new Date(m.createdAt).toLocaleDateString("es-AR")}</b><small>{new Date(m.createdAt).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})} · {m.note || "Sin observación"}</small></div><span>{m.concept}</span><span className="method">{m.type}</span><span>{m.method}</span><strong>{m.type === "Egreso" ? "-" : "+"}{money.format(m.amount)}</strong>{m.source !== "sale" && <button className="ghost-button" onClick={() => removeMovement(m.id)} title="Eliminar"><Trash2 size={14}/></button>}</div>)}
      </div>}
    </section>
  </AppShell>;
}
