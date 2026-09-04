"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, DollarSign, ReceiptText, TrendingUp, X } from "lucide-react";
import AppShell from "../components/AppShell";
import { CashClosure, KEYS, Sale, load, money } from "../lib/storage";

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const weekDays = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const REPORT_YEARS = [2026, 2027];

export default function ReportesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [closures, setClosures] = useState<CashClosure[]>([]);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);

  useEffect(() => {
    setSales(load<Sale[]>(KEYS.sales, []));
    setClosures(load<CashClosure[]>(KEYS.cashClosures, []));
  }, []);

  const valores = useMemo(() => meses.map((mes, index) => {
    const monthSales = sales.filter(s => {
      const d = new Date(s.createdAt);
      return d.getFullYear() === selectedYear && d.getMonth() === index;
    });
    return {
      mes,
      total: monthSales.reduce((a,s) => a + s.total, 0),
      cantidad: monthSales.length,
    };
  }), [sales, selectedYear]);

  const max = Math.max(...valores.map(item => item.total), 1);
  const totalAnual = valores.reduce((acc,item) => acc + item.total, 0);
  const promedio = totalAnual / 12;
  const activeMonths = valores.filter(v => v.cantidad > 0).length;

  const selectedMonthSales = useMemo(() => sales.filter(s => {
    const d = new Date(s.createdAt);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  }), [sales, selectedYear, selectedMonth]);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstWeekday = (new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7;
  const selectedClosure = closures.find(c => c.year === selectedYear && c.month === meses[selectedMonth]);

  const selectedDaySales = useMemo(() => selectedDay === null ? [] : selectedMonthSales.filter(s => new Date(s.createdAt).getDate() === selectedDay), [selectedDay, selectedMonthSales]);
  const selectedDayTotal = selectedDaySales.reduce((sum,s)=>sum+s.total,0);
  const selectedDayNet = selectedDaySales.reduce((sum,s)=>sum+(typeof s.netTotal === "number" ? s.netTotal : s.total-(s.commission||0)),0);

  function selectMonth(index:number) {
    setSelectedMonth(index);
    setSelectedDay(null);
    setDayModalOpen(false);
  }

  function openDay(day:number) {
    setSelectedDay(day);
    setDayModalOpen(true);
  }

  function changeYear(year:number) {
    setSelectedYear(year);
    setSelectedMonth(0);
    setSelectedDay(null);
    setDayModalOpen(false);
  }

  const yearSelector = <div style={{display:"inline-flex",gap:6,padding:4,border:"1px solid var(--border)",borderRadius:12,background:"#fff"}}>
    {REPORT_YEARS.map(year => <button key={year} type="button" onClick={() => changeYear(year)} style={{border:0,borderRadius:9,padding:"7px 12px",fontWeight:900,cursor:"pointer",background:selectedYear===year?"var(--green-soft)":"transparent",color:selectedYear===year?"var(--green-dark)":"var(--muted)"}}>{year}</button>)}
  </div>;

  return <AppShell title={`Meses y reportes · ${selectedYear}`} subtitle="Selecciona un año y un mes para ver su calendario, ventas diarias y cierre mensual de caja." active="Meses y reportes" action={yearSelector}>
    <section className="kpis page-kpis">
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><DollarSign size={19}/></span></div><div className="kpi-label">Ventas de {selectedYear}</div><div className="kpi-value">{money.format(totalAnual)}</div><div className="kpi-foot">Total acumulado enero–diciembre</div></div>
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><TrendingUp size={19}/></span></div><div className="kpi-label">Promedio mensual</div><div className="kpi-value">{money.format(promedio)}</div><div className="kpi-foot">Promedio sobre los 12 meses de {selectedYear}</div></div>
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><CalendarDays size={19}/></span></div><div className="kpi-label">Meses con ventas</div><div className="kpi-value">{activeMonths}</div><div className="kpi-foot">De 12 meses de {selectedYear}</div></div>
    </section>

    <section className="card section-gap" style={{padding:"18px 20px"}}>
      <div className="card-heading"><div><h2>Comparativa mensual {selectedYear}</h2><p>Vista rápida de la facturación mensual.</p></div><span className="warning-circle" style={{background:"var(--green-soft)",color:"var(--green-dark)"}}><BarChart3 size={17}/></span></div>
      <div style={{marginTop:16,overflowX:"auto"}}><div style={{minWidth:660,height:190,display:"flex",alignItems:"flex-end",gap:10,borderBottom:"1px solid var(--border)",padding:"6px 2px 24px"}}>{valores.map((item,index)=>{const height=item.total===0?4:Math.max(8,(item.total/max)*125);return <button key={item.mes} type="button" onClick={()=>selectMonth(index)} title={`${item.mes}: ${money.format(item.total)}`} style={{flex:1,minWidth:36,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%",gap:6,border:0,background:"transparent",cursor:"pointer",padding:0}}><div style={{width:"62%",maxWidth:32,height,borderRadius:"7px 7px 3px 3px",background:index===selectedMonth?"var(--green-dark)":item.total===0?"#dcefe0":"#8ab99a",minHeight:4}}/><span style={{fontSize:9,fontWeight:900,color:index===selectedMonth?"var(--green-dark)":"#77827c",whiteSpace:"nowrap"}}>{item.mes.slice(0,3)}</span></button>})}</div></div>
      <div style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",marginTop:12,paddingTop:10,borderTop:"1px solid var(--border)"}}><div><small style={{fontWeight:800,color:"var(--muted)"}}>Mes seleccionado</small><div style={{fontWeight:900,marginTop:2}}>{meses[selectedMonth]}</div></div><div style={{textAlign:"right"}}><small style={{fontWeight:800,color:"var(--muted)"}}>{valores[selectedMonth].cantidad} venta(s)</small><div style={{fontSize:18,fontWeight:900,color:"var(--green-dark)",marginTop:2}}>{money.format(valores[selectedMonth].total)}</div></div></div>
    </section>

    <section className="card section-gap">
      <div className="card-heading"><div><h2>Todo el año {selectedYear}</h2><p>Selecciona un mes para abrir su calendario y revisar las ventas día por día.</p></div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))",gap:12,marginTop:18}}>{valores.map((item,index)=><button type="button" key={item.mes} onClick={()=>selectMonth(index)} style={{textAlign:"left",border:index===selectedMonth?"2px solid var(--green-dark)":"1px solid var(--border)",borderRadius:14,padding:14,background:index===selectedMonth?"var(--green-soft)":"#fff",cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><div style={{fontSize:11,fontWeight:900,color:"var(--muted)"}}>{item.mes}</div><span style={{fontSize:9,fontWeight:900,color:"var(--green-dark)"}}>{String(index+1).padStart(2,"0")}/{selectedYear}</span></div><div style={{marginTop:5,fontSize:20,fontWeight:900}}>{money.format(item.total)}</div><div style={{marginTop:4,fontSize:9,color:"#8b958f"}}>{item.cantidad ? `${item.cantidad} venta(s)` : "Sin ventas registradas"}</div></button>)}</div>
    </section>

    <section className="card section-gap">
      <div className="card-heading"><div><h2>{meses[selectedMonth]} {selectedYear}</h2><p>Haz clic en un día para abrir el detalle completo de sus ventas.</p></div><CalendarDays size={20}/></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(72px,1fr))",gap:8,marginTop:18,overflowX:"auto"}}>
        {weekDays.map(d=><div key={d} style={{fontSize:10,fontWeight:900,color:"var(--muted)",textAlign:"center",padding:6}}>{d}</div>)}
        {Array.from({length:firstWeekday}).map((_,i)=><div key={`empty-${i}`}/>)}
        {Array.from({length:daysInMonth},(_,i)=>i+1).map(day=>{
          const daySales=selectedMonthSales.filter(s=>new Date(s.createdAt).getDate()===day);
          const dayTotal=daySales.reduce((sum,s)=>sum+s.total,0);
          const active=selectedDay===day;
          return <button key={day} type="button" onClick={()=>openDay(day)} style={{minHeight:82,border:active?"2px solid var(--green-dark)":"1px solid var(--border)",borderRadius:12,background:active?"var(--green-soft)":"#fff",padding:9,textAlign:"left",cursor:"pointer"}}><div style={{fontSize:12,fontWeight:900}}>{day}</div><div style={{fontSize:9,color:"var(--muted)",marginTop:8}}>{daySales.length?`${daySales.length} venta(s)`:"Sin ventas"}</div>{daySales.length>0&&<div style={{fontSize:10,fontWeight:900,color:"var(--green-dark)",marginTop:3}}>{money.format(dayTotal)}</div>}</button>
        })}
      </div>
    </section>

    <section className="card section-gap">
      <div className="card-heading"><div><h2>Cierre de caja · {meses[selectedMonth]} {selectedYear}</h2><p>Se completa automáticamente cuando cierras el mes desde Caja.</p></div><ReceiptText size={20}/></div>
      {!selectedClosure?<div className="empty-state compact"><ReceiptText size={30}/><b>Mes todavía abierto</b><span>Cuando cierres {meses[selectedMonth]} desde Caja, el reporte mensual aparecerá aquí.</span></div>:<>
        <section className="kpis page-kpis" style={{marginTop:14}}>
          <div className="card kpi-card"><div className="kpi-label">Ingresos</div><div className="kpi-value">{money.format(selectedClosure.income)}</div></div>
          <div className="card kpi-card"><div className="kpi-label">Gastos</div><div className="kpi-value">{money.format(selectedClosure.expenses)}</div></div>
          <div className="card kpi-card"><div className="kpi-label">Resultado</div><div className="kpi-value">{money.format(selectedClosure.balance)}</div></div>
        </section>
        <div style={{fontSize:11,color:"var(--muted)",marginTop:12}}>{selectedClosure.movementCount} movimientos · cerrado el {new Date(selectedClosure.closedAt).toLocaleDateString("es-AR")}</div>
        {Object.keys(selectedClosure.expenseBreakdown||{}).length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10,marginTop:14}}>{Object.entries(selectedClosure.expenseBreakdown).sort((a,b)=>b[1]-a[1]).map(([name,total])=><div key={name} style={{border:"1px solid var(--border)",borderRadius:12,padding:12}}><small style={{fontWeight:800,color:"var(--muted)"}}>{name}</small><div style={{fontWeight:900,fontSize:17,marginTop:4}}>{money.format(total)}</div></div>)}</div>}
      </>}
    </section>

    {dayModalOpen&&selectedDay!==null&&<div role="dialog" aria-modal="true" aria-label={`Ventas del ${selectedDay} de ${meses[selectedMonth]}`} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(18,27,22,.42)",display:"flex",alignItems:"center",justifyContent:"center",padding:18}} onMouseDown={e=>{if(e.target===e.currentTarget)setDayModalOpen(false)}}>
      <div style={{width:"min(860px,96vw)",maxHeight:"84vh",overflowY:"auto",background:"#fff",borderRadius:20,border:"1px solid var(--border)",boxShadow:"0 24px 70px rgba(0,0,0,.18)",padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,borderBottom:"1px solid var(--border)",paddingBottom:14}}><div><small style={{fontWeight:900,color:"var(--green-dark)"}}>{meses[selectedMonth]} {selectedYear}</small><h2 style={{margin:"4px 0 0"}}>Ventas del día {selectedDay}</h2><p style={{margin:"5px 0 0",color:"var(--muted)",fontSize:11}}>{selectedDaySales.length ? `${selectedDaySales.length} operación(es) registradas` : "No hubo ventas registradas"}</p></div><button type="button" className="ghost-button" onClick={()=>setDayModalOpen(false)} aria-label="Cerrar detalle"><X size={18}/></button></div>
        {selectedDaySales.length===0?<div className="empty-state compact" style={{marginTop:18}}><CalendarDays size={30}/><b>No hubo ventas este día</b></div>:<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:10,marginTop:16}}><div style={{border:"1px solid var(--border)",borderRadius:14,padding:12}}><small style={{fontWeight:800,color:"var(--muted)"}}>Venta bruta</small><div style={{fontSize:20,fontWeight:900,marginTop:4}}>{money.format(selectedDayTotal)}</div></div><div style={{border:"1px solid var(--border)",borderRadius:14,padding:12}}><small style={{fontWeight:800,color:"var(--muted)"}}>Venta neta</small><div style={{fontSize:20,fontWeight:900,marginTop:4,color:"var(--green-dark)"}}>{money.format(selectedDayNet)}</div></div><div style={{border:"1px solid var(--border)",borderRadius:14,padding:12}}><small style={{fontWeight:800,color:"var(--muted)"}}>Operaciones</small><div style={{fontSize:20,fontWeight:900,marginTop:4}}>{selectedDaySales.length}</div></div></div>
          <div style={{display:"grid",gap:10,marginTop:16}}>{selectedDaySales.map(s=><article key={s.id} style={{border:"1px solid var(--border)",borderRadius:15,padding:14}}><div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}><div><b style={{fontSize:12}}>Venta #{String(s.id).slice(-6)}</b><small style={{display:"block",marginTop:3,color:"var(--muted)"}}>{new Date(s.createdAt).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}</small></div><strong style={{fontSize:16}}>{money.format(s.total)}</strong></div><div style={{display:"grid",gridTemplateColumns:"1.4fr .9fr .9fr",gap:12,marginTop:12,paddingTop:11,borderTop:"1px solid var(--border)"}}><div><small style={{fontWeight:800,color:"var(--muted)"}}>Productos</small><div style={{marginTop:4,fontSize:11,fontWeight:800}}>{s.items.map(i=>`${i.qty}× ${i.name} · ${money.format(i.price)}`).join(" / ")}</div></div><div><small style={{fontWeight:800,color:"var(--muted)"}}>Pago</small><div style={{marginTop:4,fontSize:11,fontWeight:900}}>{s.method}{s.secondaryMethod?` + ${s.secondaryMethod}`:""}</div>{s.provider&&<small style={{display:"block",marginTop:3}}>{s.provider}{s.feeRate?` · ${s.feeRate}% + IVA`:""}</small>}</div><div><small style={{fontWeight:800,color:"var(--muted)"}}>Neto</small><div style={{marginTop:4,fontSize:11,fontWeight:900,color:"var(--green-dark)"}}>{money.format(typeof s.netTotal === "number" ? s.netTotal : s.total-(s.commission||0))}</div>{(s.commission||0)>0&&<small style={{display:"block",marginTop:3}}>Comisión: {money.format(s.commission||0)}</small>}</div></div></article>)}</div>
        </>}
      </div>
    </div>}
  </AppShell>;
}
