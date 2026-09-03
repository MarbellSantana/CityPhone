"use client";

import { useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, Box, Calculator, ChevronDown, CreditCard, DollarSign, LayoutDashboard, Package, Plus, Receipt, ShoppingBag, Wrench } from "lucide-react";

const nav = [
  [LayoutDashboard, "Dashboard"], [Receipt, "Ventas"], [CreditCard, "Caja"], [Box, "Inventario"],
  [Wrench, "Servicio técnico"], [Calculator, "Cotizaciones"], [BarChart3, "Meses y reportes"],
] as const;

const recentSales = [
  { id: "#CP-1048", product: "Funda MagSafe", customer: "Venta mostrador", amount: "$24.000", method: "Débito", time: "Hoy, 16:42" },
  { id: "#CP-1047", product: "Vidrio templado", customer: "Venta mostrador", amount: "$8.500", method: "Efectivo", time: "Hoy, 15:18" },
  { id: "#CP-1046", product: "Cargador 20W", customer: "Venta mostrador", amount: "$19.900", method: "Transferencia", time: "Hoy, 13:51" },
  { id: "#CP-1045", product: "Funda silicona", customer: "Venta mostrador", amount: "$18.000", method: "Crédito", time: "Hoy, 12:26" },
];

const lowStock = [
  { name: "Vidrio iPhone 13", stock: 2 },
  { name: "Cable USB-C 1m", stock: 3 },
  { name: "Funda S24 Ultra", stock: 1 },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="city-shell">
      <main className="main">
        <header className="header">
          <div className="brand-block">
            <div className="brand">City <span>Phone</span></div>
            <p>Panel de gestión</p>
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
          <div className="card kpi-card accent-card"><div className="kpi-top"><span className="icon-box"><DollarSign size={19}/></span><span className="trend positive"><ArrowUpRight size={14}/> 12,4%</span></div><div className="kpi-label">Ventas de hoy</div><div className="kpi-value">$70.400</div><div className="kpi-foot">vs. $62.600 ayer</div></div>
          <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><CreditCard size={19}/></span><span className="neutral-label">Caja</span></div><div className="kpi-label">Dinero en caja</div><div className="kpi-value">$186.250</div><div className="kpi-foot">Última actualización hace 2 min</div></div>
          <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><Wrench size={19}/></span><span className="count-badge">4 pendientes</span></div><div className="kpi-label">Servicio técnico</div><div className="kpi-value">4</div><div className="kpi-foot">2 listos para entregar</div></div>
          <div className="card kpi-card"><div className="kpi-top"><span className="icon-box"><Package size={19}/></span><span className="warning-label">Atención</span></div><div className="kpi-label">Stock bajo</div><div className="kpi-value">3</div><div className="kpi-foot">Productos necesitan reposición</div></div>
        </section>

        <section className="dashboard-grid">
          <div className="card sales-chart-card">
            <div className="card-heading"><div><h2>Ventas</h2><p>Rendimiento de los últimos 7 días</p></div><select className="period-select" defaultValue="7"><option value="7">Últimos 7 días</option><option value="30">Últimos 30 días</option></select></div>
            <div className="chart-summary"><div><span>Total</span><strong>$486.200</strong></div><div className="chart-growth"><ArrowUpRight size={16}/> 18,6%</div></div>
            <div className="fake-chart" aria-label="Gráfico de ventas de los últimos siete días">
              <div className="chart-lines"><span/><span/><span/><span/></div>
              <div className="bars"><i style={{height:"42%"}}/><i style={{height:"58%"}}/><i style={{height:"51%"}}/><i style={{height:"76%"}}/><i style={{height:"63%"}}/><i style={{height:"88%"}}/><i className="today-bar" style={{height:"100%"}}/></div>
              <div className="chart-labels"><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Hoy</span></div>
            </div>
          </div>

          <div className="card quick-card">
            <div className="card-heading"><div><h2>Accesos rápidos</h2><p>Lo que más usas en el local</p></div></div>
            <div className="quick-grid"><button><span><ShoppingBag size={19}/></span><b>Nueva venta</b><small>Registrar venta</small></button><button><span><Box size={19}/></span><b>Inventario</b><small>Ver productos</small></button><button><span><Wrench size={19}/></span><b>Servicio</b><small>Nuevo equipo</small></button><button><span><Receipt size={19}/></span><b>Caja</b><small>Ver movimientos</small></button></div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="card table-card"><div className="card-heading"><div><h2>Ventas recientes</h2><p>Últimas operaciones registradas</p></div><button className="text-button">Ver todas <ArrowUpRight size={15}/></button></div><div className="sales-table"><div className="table-head"><span>Venta</span><span>Producto</span><span>Pago</span><span>Total</span><span>Hora</span></div>{recentSales.map(s => <div className="table-row" key={s.id}><div><b>{s.id}</b><small>{s.customer}</small></div><span>{s.product}</span><span className="method">{s.method}</span><strong>{s.amount}</strong><small>{s.time}</small></div>)}</div></div>

          <div className="card stock-card"><div className="card-heading"><div><h2>Stock bajo</h2><p>Requiere reposición</p></div><span className="warning-circle"><Activity size={17}/></span></div><div className="stock-list">{lowStock.map(item => <div className="stock-item" key={item.name}><span className="product-mini"><Box size={17}/></span><div><b>{item.name}</b><small>Stock mínimo: 5</small></div><strong className="stock-number">{item.stock}</strong></div>)}</div><button className="outline-button">Revisar inventario</button></div>
        </section>
      </main>
    </div>
  );
}
