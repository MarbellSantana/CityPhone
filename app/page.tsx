import { BarChart3, Box, Calculator, ClipboardList, CreditCard, LayoutDashboard, Receipt, Wrench } from "lucide-react";

const nav = [
  [LayoutDashboard, "Dashboard"], [Receipt, "Ventas"], [CreditCard, "Caja"], [Box, "Inventario"],
  [Wrench, "Servicio técnico"], [Calculator, "Cotizaciones"], [BarChart3, "Meses y reportes"],
];

export default function Home() {
  return (
    <div className="city-shell">
      <aside className="sidebar">
        <div className="brand">City<span>Phone</span></div>
        <nav className="nav">
          {nav.map(([Icon, label], index) => (
            <a className={`nav-item ${index === 0 ? "active" : ""}`} href="#" key={label as string}>
              <Icon size={18} /> <span>{label as string}</span>
            </a>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <div><h1>¡Hola, City Phone! 👋</h1><p>Resumen de tu local</p></div>
          <div className="avatar">CP</div>
        </header>

        <section className="kpis">
          <div className="card"><div className="kpi-label">Ventas de hoy</div><div className="kpi-value">$0</div></div>
          <div className="card"><div className="kpi-label">Caja</div><div className="kpi-value">$0</div></div>
          <div className="card"><div className="kpi-label">Servicios pendientes</div><div className="kpi-value">0</div></div>
          <div className="card"><div className="kpi-label">Stock bajo</div><div className="kpi-value">0</div></div>
        </section>

        <section className="grid">
          <div className="card"><div className="card-title">Ventas recientes <span className="badge">Conectando a Supabase</span></div><p style={{color:"var(--muted)"}}>Aquí aparecerán las ventas registradas.</p></div>
          <div className="card"><div className="card-title">Servicios técnicos</div><p style={{color:"var(--muted)"}}>No hay servicios pendientes.</p></div>
        </section>
      </main>

      <nav className="mobile-nav">
        <a className="active" href="#"><LayoutDashboard size={18} /><br/>Inicio</a>
        <a href="#"><Receipt size={18} /><br/>Ventas</a>
        <a href="#"><Box size={18} /><br/>Stock</a>
        <a href="#"><Wrench size={18} /><br/>Técnico</a>
      </nav>
    </div>
  );
}
