"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, DollarSign, ReceiptText, TrendingUp } from "lucide-react";
import AppShell from "../components/AppShell";
import { CashClosure, KEYS, Sale, load, money } from "../lib/storage";

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const weekDays = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const REPORT_YEAR = 2027;

export default function ReportesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [closures, setClosures] = useState<CashClosure[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    setSales(load<Sale[]>(KEYS.sales, []));
    setClosures(load<CashClosure[]>(KEYS.cashClosures, []));
  }, []);

  const valores = useMemo(() => meses.map((mes, index) => {
    const monthSales = sales.filter(s => {
      const d = new Date(s.createdAt);
      return d.getFullYear() === REPORT_YEAR && d.getMonth() === index;
    });
    return {
      mes,
      total: monthSales.reduce((a,s) => a + s.total, 0),
      cantidad: monthSales.length,
    };
  }), [sales]);

  const max = Math.max(...valores.map(item => item.total), 1);
  const totalAnual = valores.reduce((acc,item) => acc + item.total, 0);
  const promedio = totalAnual / 12;
  const activeMonths = valores.filter(v => v.cantidad > 0).length;

  const selectedMonthSales = useMemo(() => sales.filter(s => {
    const d = new Date(s.createdAt);
    return d.getFullYear() === REPORT_YEAR && d.getMonth() === selectedMonth;
  }), [sales, selectedMonth]);

  const daysInMonth = new Date(REPORT_YEAR, selectedMonth + 1, 0).getDate();
  const firstWeekday = (new Date(REPORT_YEAR, selectedMonth, 1).getDay() + 6) % 7;
  const selectedClosure = closures.find(c => c.year === REPORT_YEAR && c.month === meses[selectedMonth]);

  const selectedDaySales = useMemo(() => selectedDay === null ? [] : selectedMonthSales.filter(s => new Date(s.createdAt).getDate() === selectedDay), [selectedDay, selectedMonthSales]);

  function selectMonth(index:number) {
    setSelectedMonth(index);
    setSelectedDay(null);
  }

  return <AppShell title="Meses y reportes · 2027" subtitle="Selecciona un mes para ver su calendario, ventas diarias y cierre mensual de caja." active="Meses y reportes" action={<span className="period-select" style={{display:"inline-flex",alignItems:"center",fontWeight:900}}>2027</span>}>
    <section className="kpis page-kpis">
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><DollarSign size={19}/></span></div><div className="kpi-label">Ventas de 2027</div><div className="kpi-value">{money.format(totalAnual)}</div><div className="kpi-foot">Total acumulado enero–diciembre</div></div>
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><TrendingUp size={19}/></span></div><div className="kpi-label">Promedio mensual</div><div className="kpi-value">{money.format(promedio)}</div><div className="kpi-foot">Promedio sobre los 12 meses de 2027</div></div>
      <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><CalendarDays size={19}/></span></div><div className="kpi-label">Meses con ventas</div><div className="kpi-value">{activeMonths}</div><div className="kpi-foot">De 12 meses de 2027</div></div>
    </section>

    <section className="card section-gap"><div className="card-heading"><div><h2>Comparativa mensual 2027</h2><p>Enero a diciembre en un solo gráfico para comparar la facturación de todo el año.</p></div><span className="warning-circle" style={{background:"var(--green-soft)",color:"var(--green-dark)"}}><BarChart3 size={17}/></span></div><div style={{marginTop:26,overflowX:"auto"}}><div style={{minWidth:760,height:290,display:"flex",alignItems:"flex-end",gap:14,borderBottom:"1px solid var(--border)",padding:"10px 4px 28px"}}>{valores.map((item,index)=>{const height=item.total===0?4:Math.max(8,(item.total/max)*210);return <button key={item.mes} type="button" onClick={()=>selectMonth(index)} style={{flex:1,minWidth:42,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%",gap:8,border:0,background:"transparent",cursor:"pointer",padding:0}}><span style={{fontSize:10,fontWeight:800,color:"var(--muted)"}}>{money.format(item.total)}</span><div style={{width:"70%",maxWidth:42,height,borderRadius:"9px 9px 3px 3px",background:item.total===0?"#dcefe0":"var(--green-dark)",minHeight:4}}/><span style={{fontSize:10,fontWeight:800,color:index===selectedMonth?"var(--green-dark)":"#6e7872",whiteSpace:"nowrap"}}>{item.mes.slice(0,3)}</span></button>})}</div></div></section>

    <section className="card section-gap">
      <div className="card-heading"><div><h2>Todo el año 2027</h2><p>Selecciona un mes para abrir su calendario y revisar las ventas día por día.</p></div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(170px, 1fr))",gap:12,marginTop:18}}>{valores.map((item,index)=><button type="button" key={item.mes} onClick={()=>selectMonth(index)} style={{textAlign:"left",border:index===selectedMonth?"2px solid var(--green-dark)":"1px solid var(--border)",borderRadius:14,padding:14,background:index===selectedMonth?"var(--green-soft)":"#fff",cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><div style={{fontSize:11,fontWeight:900,color:"var(--muted)"}}>{item.mes}</div><span style={{fontSize:9,fontWeight:900,color:"var(--green-dark)"}}>{String(index+1).padStart(2,"0")}/2027</span></div><div style={{marginTop:5,fontSize:20,fontWeight:900}}>{money.format(item.total)}</div><div style={{marginTop:4,fontSize:9,color:"#8b958f"}}>{item.cantidad ? `${item.cantidad} venta(s)` : "Sin ventas registradas"}</div></button>)}</div>
    </section>

    <section className="card section-gap">
      <div className="card-heading"><div><h2>{meses[selectedMonth]} 2027</h2><p>Haz clic en un día para ver todas las ventas registradas en esa fecha.</p></div><CalendarDays size={20}/></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(72px,1fr))",gap:8,marginTop:18,overflowX:"auto"}}>
        {weekDays.map(d=><div key={d} style={{fontSize:10,fontWeight:900,color:"var(--muted)",textAlign:"center",padding:6}}>{d}</div>)}
        {Array.from({length:firstWeekday}).map((_,i)=><div key={`empty-${i}`}/>)}
        {Array.from({length:daysInMonth},(_,i)=>i+1).map(day=>{
          const daySales=selectedMonthSales.filter(s=>new Date(s.createdAt).getDate()===day);
          const dayTotal=daySales.reduce((sum,s)=>sum+s.total,0);
          const active=selectedDay===day;
          return <button key={day} type="button" onClick={()=>setSelectedDay(day)} style={{minHeight:82,border:active?"2px solid var(--green-dark)":"1px solid var(--border)",borderRadius:12,background:active?"var(--green-soft)":"#fff",padding:9,textAlign:"left",cursor:"pointer"}}><div style={{fontSize:12,fontWeight:900}}>{day}</div><div style={{fontSize:9,color:"var(--muted)",marginTop:8}}>{daySales.length?`${daySales.length} venta(s)`:"Sin ventas"}</div>{daySales.length>0&&<div style={{fontSize:10,fontWeight:900,color:"var(--green-dark)",marginTop:3}}>{money.format(dayTotal)}</div>}</button>
        })}
      </div>
    </section>

    {selectedDay!==null&&<section className="card section-gap">
      <div className="card-heading"><div><h2>Ventas del {selectedDay} de {meses[selectedMonth]}</h2><p>Detalle de las operaciones registradas ese día.</p></div></div>
      {selectedDaySales.length===0?<div className="empty-state compact"><CalendarDays size={30}/><b>No hubo ventas este día</b><span>Cuando haya ventas aparecerán aquí automáticamente.</span></div>:<div className="sales-table"><div className="table-head"><span>Hora</span><span>Cliente</span><span>Pago</span><span>Factura</span><span>Total</span></div>{selectedDaySales.map(s=><div className="table-row" key={s.id}><div><b>{new Date(s.createdAt).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}</b><small>Venta #{String(s.id).slice(-6)}</small></div><span>{s.customer||"Consumidor final"}</span><span>{s.method}</span><span>{s.invoiceStatus==="Facturada"?`${s.invoiceType||"Factura C"} ${s.invoiceNumber||""}`:s.invoiceStatus||"Sin factura"}</span><strong>{money.format(s.total)}</strong></div>)}</div>}
    </section>}

    <section className="card section-gap">
      <div className="card-heading"><div><h2>Cierre de caja · {meses[selectedMonth]}</h2><p>Se completa automáticamente cuando cierras el mes desde Caja.</p></div><ReceiptText size={20}/></div>
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
  </AppShell>;
}
