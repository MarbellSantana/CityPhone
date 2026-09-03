"use client";

import { Box, Plus, Search } from "lucide-react";
import AppShell from "../components/AppShell";

export default function InventarioPage() {
  return <AppShell title="Inventario" subtitle="Administra productos, costos, precios y stock." active="Inventario" action={<button className="primary-button"><Plus size={18}/> Nuevo producto</button>}>
    <section className="card workspace-card">
      <div className="toolbar-row">
        <div className="search-field grow"><Search size={18}/><input placeholder="Buscar producto..." /></div>
        <select className="filter-select"><option>Todas las categorías</option><option>Fundas</option><option>Vidrios</option><option>Cargadores</option><option>Auriculares</option><option>Accesorios</option></select>
      </div>
      <div className="inventory-table">
        <div className="inventory-head"><span>Producto</span><span>Categoría</span><span>Costo</span><span>Precio venta</span><span>Stock</span><span>Stock mín.</span></div>
        <div className="empty-state"><Box size={34}/><b>Inventario vacío</b><span>Agrega tu primer producto para comenzar a controlar el stock.</span></div>
      </div>
    </section>
  </AppShell>;
}
