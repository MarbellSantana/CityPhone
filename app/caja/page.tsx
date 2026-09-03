"use client";

import { ArrowDownLeft, ArrowUpRight, Plus, Wallet } from "lucide-react";
import AppShell from "../components/AppShell";

export default function CajaPage() {
  return <AppShell title="Caja" subtitle="Controla apertura, ingresos, egresos y saldo del día." active="Caja" action={<button className="primary-button"><Plus size={18}/> Nuevo movimiento</button>}>
    <section className="kpis page-kpis">
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><Wallet size={19}/></span></div><div className="kpi-label">Saldo actual</div><div className="kpi-value">$0</div><div className="kpi-foot">Caja sin movimientos</div></div>
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><ArrowDownLeft size={19}/></span></div><div className="kpi-label">Ingresos de hoy</div><div className="kpi-value">$0</div><div className="kpi-foot">0 movimientos</div></div>
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><ArrowUpRight size={19}/></span></div><div className="kpi-label">Egresos de hoy</div><div className="kpi-value">$0</div><div className="kpi-foot">0 movimientos</div></div>
    </section>
    <section className="card workspace-card section-gap">
      <div className="card-heading"><div><h2>Movimientos de caja</h2><p>Ingresos y egresos registrados hoy.</p></div><select className="period-select"><option>Hoy</option><option>Esta semana</option><option>Este mes</option></select></div>
      <div className="empty-state"><Wallet size={34}/><b>Todavía no hay movimientos</b><span>Los cobros en efectivo y movimientos manuales aparecerán aquí.</span></div>
    </section>
  </AppShell>;
}
