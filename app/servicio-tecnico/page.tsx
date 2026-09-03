"use client";

import { FormEvent, useState } from "react";
import { Box, Calculator, Plus, Search, Wrench } from "lucide-react";
import AppShell from "../components/AppShell";

type Orden = {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  equipo: string;
  motivo: string;
  precio: number;
  estado: string;
};

export default function ServicioTecnicoPage() {
  const [tab, setTab] = useState<"ordenes" | "cotizaciones" | "repuestos">("ordenes");
  const [showIngreso, setShowIngreso] = useState(false);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);

  function guardarIngreso(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const orden: Orden = {
      id: Date.now(),
      nombre: String(form.get("nombre") || ""),
      apellido: String(form.get("apellido") || ""),
      telefono: String(form.get("telefono") || ""),
      email: String(form.get("email") || ""),
      equipo: String(form.get("equipo") || ""),
      motivo: String(form.get("motivo") || ""),
      precio: Number(form.get("precio") || 0),
      estado: "Ingresado",
    };
    setOrdenes((actuales) => [orden, ...actuales]);
    event.currentTarget.reset();
    setShowIngreso(false);
    setTab("ordenes");
  }

  return <AppShell title="Servicio técnico" subtitle="Gestiona equipos, reparaciones, cotizaciones y repuestos." active="Servicio técnico" action={<button className="primary-button" onClick={() => setShowIngreso((v) => !v)}><Plus size={18}/> Ingreso al taller</button>}>
    {showIngreso && <section className="card workspace-card" style={{ marginBottom: 16 }}>
      <div className="card-heading"><div><h2>Ingreso al taller</h2><p>Registra los datos del cliente y del equipo recibido.</p></div></div>
      <form onSubmit={guardarIngreso}>
        <div className="form-grid">
          <label className="field-label">Nombre<input name="nombre" required placeholder="Nombre" /></label>
          <label className="field-label">Apellido<input name="apellido" required placeholder="Apellido" /></label>
          <label className="field-label">Teléfono<input name="telefono" required placeholder="WhatsApp / teléfono" /></label>
          <label className="field-label">Correo electrónico<input name="email" type="email" placeholder="correo@ejemplo.com" /></label>
          <label className="field-label">Equipo<input name="equipo" required placeholder="Ej. iPhone 13" /></label>
          <label className="field-label">Precio de reparación<input name="precio" type="number" min="0" step="1" placeholder="0" /></label>
        </div>
        <label className="field-label">Motivo / reparación<input name="motivo" required placeholder="Ej. Pantalla rota, no carga, cambio de batería..." /></label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="primary-button" type="submit">Guardar ingreso</button>
          <button className="outline-action" type="button" onClick={() => setShowIngreso(false)}>Cancelar</button>
        </div>
      </form>
    </section>}

    <div className="subnav-tabs">
      <button className={tab === "ordenes" ? "active" : ""} onClick={() => setTab("ordenes")}><Wrench size={16}/> Órdenes de reparación</button>
      <button className={tab === "cotizaciones" ? "active" : ""} onClick={() => setTab("cotizaciones")}><Calculator size={16}/> Cotizaciones</button>
      <button className={tab === "repuestos" ? "active" : ""} onClick={() => setTab("repuestos")}><Box size={16}/> Inventario de repuestos</button>
    </div>

    {tab === "ordenes" && <section className="card workspace-card">
      <div className="toolbar-row"><div className="search-field grow"><Search size={18}/><input placeholder="Buscar por cliente, teléfono o equipo..." /></div><select className="filter-select"><option>Todos los estados</option><option>Ingresado</option><option>En reparación</option><option>Listo para entregar</option><option>Entregado</option></select></div>
      {ordenes.length === 0 ? <div className="empty-state"><Wrench size={34}/><b>No hay equipos ingresados</b><span>Cuando recibas un equipo, registra el cliente, contacto, falla, precio y estado.</span></div> : <div className="sales-table">
        <div className="table-head"><span>Cliente</span><span>Equipo / reparación</span><span>Estado</span><span>Precio</span><span>Contacto</span></div>
        {ordenes.map((orden) => <div className="table-row" key={orden.id}>
          <div><b>{orden.nombre} {orden.apellido}</b><small>{orden.email || "Sin email"}</small></div>
          <div><b>{orden.equipo}</b><small>{orden.motivo}</small></div>
          <span className="method">{orden.estado}</span>
          <strong>${orden.precio.toLocaleString("es-AR")}</strong>
          <small>{orden.telefono}</small>
        </div>)}
      </div>}
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
