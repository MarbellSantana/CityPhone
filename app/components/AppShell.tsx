"use client";

import Link from "next/link";
import { useState } from "react";
import { BarChart3, Box, ChevronDown, CreditCard, LayoutDashboard, Receipt, Wrench } from "lucide-react";

const nav = [
  [LayoutDashboard, "Dashboard", "/"],
  [Receipt, "Ventas", "/ventas"],
  [CreditCard, "Caja", "/caja"],
  [Box, "Inventario", "/inventario"],
  [Wrench, "Servicio técnico", "/servicio-tecnico"],
  [BarChart3, "Meses y reportes", "/reportes"],
] as const;

export default function AppShell({ title, subtitle, active, children, action }: { title: string; subtitle: string; active: string; children: React.ReactNode; action?: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="city-shell">
      <main className="main">
        <header className="header">
          <div className="brand-block">
            <Link href="/" className="brand brand-link"><span className="brand-city">City</span> <span>Phone</span></Link>
            <p>Gestión del local · Av. Corrientes 640</p>
          </div>
          <div className="header-actions">
            <div className="status-pill"><span className="status-dot" /> Sistema activo</div>
            <div className="menu-wrap">
              <button className={`menu-button ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}><span>Menú</span><ChevronDown size={18}/></button>
              {menuOpen && <>
                <button className="menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" />
                <nav className="dropdown-menu">{nav.map(([Icon,label,href]) => <Link key={label} href={href} onClick={() => setMenuOpen(false)} className={`nav-item ${active === label ? "active" : ""}`}><Icon size={18}/><span>{label}</span></Link>)}</nav>
              </>}
            </div>
          </div>
        </header>

        <section className="page-title-row">
          <div><span className="eyebrow">CITY PHONE · GESTIÓN</span><h1>{title}</h1><p>{subtitle}</p></div>
          {action}
        </section>
        {children}
      </main>
    </div>
  );
}
