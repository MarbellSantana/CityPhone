"use client";

import { useState } from "react";
import { Box, Calculator, Plus, Search, Wrench } from "lucide-react";
import AppShell from "../components/AppShell";

export default function ServicioTecnicoPage() {
  const [tab, setTab] = useState<"ordenes" | "cotizaciones" | "repuestos">("ordenes");

  return <AppShell title="Servicio técnico" subtitle="Gestiona equipos, reparaciones, cotizaciones y repuestos." active="Servicio técnico" action={<button className="primary-button"><Plus size={18}/> Ingreso al taller</button>}>
    <div className="subnav-tabs">
      <button className={tab === "ordenes" ? "active" : ""} onClick={() => setTab("ordenes")}><Wrench size={16}/> Órdenes de reparación</button>
      <button className={tab === "cotizaciones" ? "active" : ""} onClick={() => setTab("cotizaciones")}><Calculator size={16}/> Cotizaciones</button>
      <button className={tab === "repuestos" ? "active" : ""} onClick={() => setTab("repuestos")}><Box size={16}/> Inventario de repuestos</button>
    </div>

    {tab === "ordenes" && <section className="card workspace-card">
      <div className="toolbar-row"><div className="search-field grow"><Search size={18}/><input placeholder="Buscar por cliente, teléfono o equipo..." /></div><select className="filter-select"><option>Todos los estados</option><option>Ingresado</option><option>En reparación</option><option>Listo para entregar</option><option>Entregado</option></select></div>
      <div className="empty-state"><Wrench size={34}/><b>No hay equipos ingresados</b><span>Cuando recibas un equipo, registra el cliente, contacto, falla, precio y estado.</span></div>
    </section>}

    {tab === "cotizaciones" && <section className="workspace-grid">
      <div className="card workspace-card">
        <div className="card-heading"><div><h2>Nueva cotización</h2><p>Calcula el precio de una reparación antes de aprobarla.</p></div></div>
        <div className="form-grid">
          <label className="field-label">Cliente<input placeholder="Nombre y apellido" /></label>
          <label className="field-label">Teléfono<input placeholder="Número de WhatsApp" /></label>
          <label className="field-label">Equipo<input placeholder="Ej. iPhone 13" /></label>
          <label className="field-label">Reparación<input placeholder="Ej. Cambio de pantalla" /></label>
          <label className="field-label">Costo del repuesto<input type="number" placeholder="0" /></label>
          <label className="field-label">Precio al cliente<input type="number" placeholder="0" /></label>
        </div>
        <button className="primary-button">Guardar cotización</button>
      </div>
      <div className="card workspace-card"><div className="card-heading"><div><h2>Cotizaciones guardadas</h2><p>Pendientes de aprobación o confirmadas.</p></div></div><div className="empty-state compact"><Calculator size={30}/><b>Sin cotizaciones</b><span>Las cotizaciones creadas aparecerán aquí.</span></div></div>
    </section>}

    {tab === "repuestos" && <section className="card workspace-card">
      <div className="card-heading"><div><h2>Inventario de repuestos</h2><p>Stock destinado exclusivamente a reparaciones.</p></div><button className="outline-action"><Plus size={16}/> Agregar repuesto</button></div>
      <div className="inventory-table"><div className="inventory-head"><span>Repuesto</span><span>Modelo</span><span>Costo</span><span>Precio sugerido</span><span>Stock</span><span>Stock mín.</span></div><div className="empty-state"><Box size={34}/><b>No hay repuestos cargados</b><span>Agrega pantallas, baterías, flex, conectores y otros repuestos del taller.</span></div></div>
    </section>}
  </AppShell>;
}
