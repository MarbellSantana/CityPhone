"use client";

import { Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import AppShell from "../components/AppShell";

export default function VentasPage() {
  return <AppShell title="Ventas" subtitle="Registra cada venta y el método de pago utilizado." active="Ventas" action={<button className="primary-button"><Plus size={18}/> Nueva venta</button>}>
    <section className="workspace-grid sales-workspace">
      <div className="card workspace-card">
        <div className="card-heading"><div><h2>Agregar productos</h2><p>Busca por nombre, categoría o código.</p></div></div>
        <div className="search-field"><Search size={18}/><input placeholder="Buscar producto..." /></div>
        <div className="empty-state compact"><ShoppingCart size={30}/><b>No hay productos agregados</b><span>Busca un producto para comenzar la venta.</span></div>
      </div>
      <div className="card workspace-card sticky-summary">
        <div className="card-heading"><div><h2>Resumen de venta</h2><p>El total se calculará automáticamente.</p></div></div>
        <div className="summary-line"><span>Subtotal</span><strong>$0</strong></div>
        <div className="summary-line total-line"><span>Total</span><strong>$0</strong></div>
        <label className="field-label">Cliente <small>(opcional)</small><input placeholder="Nombre del cliente" /></label>
        <label className="field-label">Método de pago<select defaultValue=""><option value="" disabled>Seleccionar</option><option>Efectivo</option><option>Débito</option><option>Crédito</option><option>Transferencia</option><option>Pago mixto</option></select></label>
        <button className="primary-button full-button" disabled>Confirmar venta</button>
        <button className="ghost-button full-button"><Trash2 size={16}/> Limpiar venta</button>
      </div>
    </section>
  </AppShell>;
}
