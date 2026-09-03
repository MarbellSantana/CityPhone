"use client";

import { useState } from "react";
import { BarChart3, Box, Calculator, ChevronDown, CreditCard, LayoutDashboard, Receipt, Wrench } from "lucide-react";

const nav = [
  [LayoutDashboard, "Dashboard"], [Receipt, "Ventas"], [CreditCard, "Caja"], [Box, "Inventario"],
  [Wrench, "Servicio técnico"], [Calculator, "Cotizaciones"], [BarChart3, "Meses y reportes"],
] as const;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="city-shell">
      <main className="main">
        <header className="header">
          <div>
            <div className="brand">City <span>Phone</span></div>
            <p>Gestión de tu local</p>
          </div>

          <div className="menu-wrap">
            <button
              className={`menu-button ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Abrir menú"
            >
              <span>Menú</span>
              <ChevronDown size={18} />
            </button>

            {menuOpen && (
              <>
                <button className="menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" />
                <nav className="dropdown-menu">
                  {nav.map(([Icon, label], index) => (
                    <a
                      className={`nav-item ${index === 0 ? "active" : ""}`}
                      href="#"
                      key={label}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                    </a>
                  ))}
                </nav>
              </>
            )}
          </div>
        </header>

        <section className="welcome">
          <h1>¡Hola, City Phone! 👋</h1>
          <p>Resumen de tu local</p>
        </section>

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
    </div>
  );
}
