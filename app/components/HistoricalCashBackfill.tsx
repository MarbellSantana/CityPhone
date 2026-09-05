"use client";

import { useEffect } from "react";
import { CashMovement, KEYS, Sale, load, save } from "../lib/storage";

export default function HistoricalCashBackfill({ active }: { active: string }) {
  useEffect(() => {
    const sales = load<Sale[]>(KEYS.sales, []);
    const cash = load<CashMovement[]>(KEYS.cash, []);
    const existingSaleMovementIds = new Set(cash.filter(m => m.source === "sale").map(m => m.id));

    const missing = sales
      .filter(s => s.method === "Carga histórica" && s.total > 0 && !existingSaleMovementIds.has(s.id))
      .map<CashMovement>(s => ({
        id: s.id,
        type: "Ingreso",
        concept: `Venta histórica · ${new Date(s.createdAt).toLocaleDateString("es-AR")}`,
        amount: s.total,
        method: "Efectivo",
        note: "Venta histórica en efectivo",
        createdAt: s.createdAt,
        source: "sale",
      }));

    if (missing.length === 0) return;

    save(KEYS.cash, [...missing, ...cash]);

    // Caja carga sus movimientos al montar. Si la migración ocurre estando
    // en Caja, recargamos una sola vez para que lea el saldo ya corregido.
    if (active === "Caja") window.location.reload();
  }, [active]);

  return null;
}
