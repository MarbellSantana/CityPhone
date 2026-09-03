"use client";

import { useState } from "react";
import { Activity, ArrowUpRight, BarChart3, Box, Calculator, ChevronDown, CreditCard, DollarSign, LayoutDashboard, Package, Plus, Receipt, ShoppingBag, Wrench } from "lucide-react";

const nav = [
  [LayoutDashboard, "Dashboard"], [Receipt, "Ventas"], [CreditCard, "Caja"], [Box, "Inventario"],
  [Wrench, "Servicio técnico"], [Calculator, "Cotizaciones"], [BarChart3, "Meses y reportes"],
] as const;

const recentSales: { id: string; product: string; customer: string; amount: string; method: string; time: string }[] = [];
const lowStock: { name: string; stock: number }[] = [];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="city-shell">
      <main className="main">
        <header className="header">
          <div className="brand-block">
            <div className="brand"><span className="brand-city">City</span> <span>Phone</span></div>
            <p>Gestión del local · Av. Corrientes 640</p>
          </div>
          <div className="header-actions">
            <div className="status-pill"><span className="status-dot" /> Sistema activo</div>
            <div className="menu-wrap">
              <button className={`menu-button ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Abrir menú">
                <span>Menú</span><ChevronDown size={18} />
              </button>
              {menuOpen && <>
                <button className="menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" />
                <nav className="dropdown-menu">{nav.map(([Icon, label], index) => <a className={`nav-item ${index === 0 ? "active" : ""}`} href="#" key={label} onClick={() => setMenuOpen(false)}><Icon size={18}/><span>{label}</span></a>)}</nav>
              </>}
            </div>
          </div>
        </header>

        <section className="welcome dashboard-intro">
          <div><span className="eyebrow">HOY · RESUMEN DEL LOCAL</span><h1>¡Hola, City Phone! 👋</h1><p>Todo lo importante de tu negocio, en un solo lugar.</p></div>
          <button className="primary-button"><Plus size={18}/> Nueva venta</button>
        </section>

        <section className="kpis">
          <div className="card kpi-card accent-card"><div className="kpi-top"><span className="icon-box"><DollarSign size={19}/></span><span className="trend positive"><ArrowUpRight size={14}/> 0%</span></div><div className="kpi-label">Ventas de hoy</div><div className="kpi-value">$0</div><div className="kpi-foot">Sin ventas registradas hoy</div></div>
          <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><CreditCard size={19}/></span><span className="neutral-label">Caja</span></div><div className="kpi-label">Dinero en caja</div><div className="kpi-value">$0</div><div className="kpi-foot">Sin movimientos registrados</div></div>
          <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><Wrench size={19}/></span><span className="count-badge">0 pendientes</span></div><div className="kpi-label">Servicio técnico</div><div className="kpi-value">0</div><div className="kpi-foot">Sin equipos pendientes</div></div>
          <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><Package size={19}/></span><span className="neutral-label">Stock</span></div><div className="kpi-label">Stock bajo</div><div className="kpi-value">0</div><div className="kpi-foot">Sin alertas de stock</div></div>
        </section>

        <section className="dashboard-grid">
          <div className="card sales-chart-card">
            <div className="card-heading"><div><h2>Ventas</h2><p>Rendimiento de los últimos 7 días</p></div><select className="period-select" defaultValue="7"><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option></select></div>
            <div className="chart-summary"><div><span>Total</span><strong>$0</strong></div><div className="chart-growth">0%</div></div>
            <div className="fake-chart" aria-label="Gráfico de ventas de los últimos siete días">
              <div className="chart-lines"><span/><span/><span/><span/></div>
              <div className="bars"><i style={{height:"2%"}}/><i style={{height:"2%"}}/><i style={{height:"2%"}}/><i style={{height:"2%"}}/><i style={{height:"2%"}}/><i style={{height:"2%"}}/><i className="today-bar" style={{height:"2%"}}/></div>
              <div className="chart-labels"><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Hoy</span></div>
            </div>
          </div>

          <div className="card quick-card">
            <div className="card-heading"><div><h2>Accesos rápidos</h2><p>Lo que más usas en el local</p></div></div>
            <div className="quick-grid"><button><span><ShoppingBag size={19}/></span><b>Nueva venta</b><small>Registrar venta</small></button><button><span><Box size={19}/></span><b>Inventario</b><small>Ver productos</small></button><button><span><Wrench size={19}/></span><b>Servicio</b><small>Nuevo equipo</small></button><button><span><Receipt size={19}/></span><b>Caja</b><small>Ver movimientos</small></button></div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="card table-card"><div className="card-heading"><div><h2>Ventas recientes</h2><p>Últimas operaciones registradas</p></div><button className="text-button">Ver todas <ArrowUpRight size={15}/></button></div><div className="sales-table">{recentSales.length === 0 ? <div className="empty-state">Todavía no hay ventas registradas.</div> : <><div className="table-head"><span>Venta</span><span>Producto</span><span>Pago</span><span>Total</span><span>Hora</span></div>{recentSales.map(s => <div className="table-row" key={s.id}><div><b>{s.id}</b><small>{s.customer}</small></div><span>{s.product}</span><span className="method">{s.method}</span><strong>{s.amount}</strong><small>{s.time}</small></div>)}</>}</div></div>

          <div className="card stock-card"><div className="card-heading"><div><h2>Stock bajo</h2><p>Requiere reposición</p></div><span className="warning-circle"><Activity size={17}/></span></div>{lowStock.length === 0 ? <div className="empty-state">No hay productos con stock bajo.</div> : <div className="stock-list">{lowStock.map(item => <div className="stock-item" key={item.name}><span className="product-mini"><Box size={17}/></span><div><b>{item.name}</b><small>Stock mínimo: 5</small></div><strong className="stock-number">{item.stock}</strong></div>)}</div>}<button className="outline-button">Revisar inventario</button></div>
        </section>
      </main>
    </div>
  );
}
