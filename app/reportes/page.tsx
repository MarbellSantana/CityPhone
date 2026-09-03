"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, DollarSign, TrendingUp } from "lucide-react";
import AppShell from "../components/AppShell";
import { KEYS, Sale, load, money } from "../lib/storage";

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function ReportesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  useEffect(() => setSales(load<Sale[]>(KEYS.sales, [])), []);

  const years = useMemo(() => {
    const found = Array.from(new Set(sales.map(s => new Date(s.createdAt).getFullYear()))).sort((a,b)=>b-a);
    return found.length ? found : [new Date().getFullYear()];
  }, [sales]);

  const valores = useMemo(() => meses.map((mes, index) => ({
    mes,
    total: sales.filter(s => { const d=new Date(s.createdAt); return d.getFullYear()===year && d.getMonth()===index; }).reduce((a,s)=>a+s.total,0),
    cantidad: sales.filter(s => { const d=new Date(s.createdAt); return d.getFullYear()===year && d.getMonth()===index; }).length,
  })), [sales, year]);

  const max = Math.max(...valores.map(item => item.total), 1);
  const totalAnual = valores.reduce((acc,item)=>acc+item.total,0);
  const promedio = totalAnual / 12;
  const activeMonths = valores.filter(v=>v.cantidad>0).length;

  return <AppShell title="Meses y reportes" subtitle="Compara el rendimiento del local mes a mes durante el año." active="Meses y reportes" action={<select className="period-select" value={year} onChange={e=>setYear(Number(e.target.value))}>{years.map(y=><option key={y}>{y}</option>)}</select>}>
    <section className="kpis page-kpis">
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><DollarSign size={19}/></span></div><div className="kpi-label">Ventas del año</div><div className="kpi-value">{money.format(totalAnual)}</div><div className="kpi-foot">Total acumulado de {year}</div></div>
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><TrendingUp size={19}/></span></div><div className="kpi-label">Promedio mensual</div><div className="kpi-value">{money.format(promedio)}</div><div className="kpi-foot">Promedio sobre 12 meses</div></div>
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><CalendarDays size={19}/></span></div><div className="kpi-label">Meses con ventas</div><div className="kpi-value">{activeMonths}</div><div className="kpi-foot">De 12 meses del año</div></div>
    </section>

    <section className="card section-gap"><div className="card-heading"><div><h2>Comparativa mensual</h2><p>Visualiza cómo evoluciona la facturación a lo largo del año.</p></div><span className="warning-circle" style={{background:"var(--green-soft)",color:"var(--green-dark)"}}><BarChart3 size={17}/></span></div><div style={{marginTop:26,overflowX:"auto"}}><div style={{minWidth:760,height:290,display:"flex",alignItems:"flex-end",gap:14,borderBottom:"1px solid var(--border)",padding:"10px 4px 28px"}}>{valores.map(item=>{const height=item.total===0?4:Math.max(8,(item.total/max)*210);return <div key={item.mes} style={{flex:1,minWidth:42,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%",gap:8}}><span style={{fontSize:10,fontWeight:800,color:"var(--muted)"}}>{money.format(item.total)}</span><div style={{width:"70%",maxWidth:42,height,borderRadius:"9px 9px 3px 3px",background:item.total===0?"#dcefe0":"var(--green-dark)",minHeight:4}}/><span style={{fontSize:10,fontWeight:800,color:"#6e7872",whiteSpace:"nowrap"}}>{item.mes.slice(0,3)}</span></div>})}</div></div></section>

    <section className="card section-gap"><div className="card-heading"><div><h2>Resumen por mes</h2><p>Ventas registradas en cada mes del año.</p></div></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))",gap:12,marginTop:18}}>{valores.map(item=><div key={item.mes} style={{border:"1px solid var(--border)",borderRadius:14,padding:14,background:"#fff"}}><div style={{fontSize:11,fontWeight:900,color:"var(--muted)"}}>{item.mes}</div><div style={{marginTop:5,fontSize:20,fontWeight:900}}>{money.format(item.total)}</div><div style={{marginTop:4,fontSize:9,color:"#8b958f"}}>{item.cantidad ? `${item.cantidad} venta(s)` : "Sin ventas registradas"}</div></div>)}</div></section>
  </AppShell>;
}
