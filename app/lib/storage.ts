export type Product = { id:number; name:string; category:string; cost:number; price:number; stock:number; minStock:number; code?:string };
export type SaleItem = { productId:number; name:string; qty:number; price:number };
export type Sale = {
  id:number;
  items:SaleItem[];
  customer:string;
  total:number;
  method:string;
  cashAmount:number;
  otherAmount:number;
  createdAt:string;
  provider?:string;
  feeRate?:number;
  feeBase?:number;
  feeVat?:number;
  commission?:number;
  netTotal?:number;
  settlement?:string;
  secondaryMethod?:string;
};
export type CashMovement = { id:number; type:"Ingreso"|"Egreso"; concept:string; amount:number; method:string; note:string; createdAt:string; source?:string };
export type Repair = { id:number; nombre:string; apellido:string; telefono:string; email:string; equipo:string; motivo:string; precio:number; estado:string; createdAt:string };
export type Quote = { id:number; cliente:string; telefono:string; equipo:string; reparacion:string; costo:number; precio:number; estado:string; createdAt:string };
export type Part = { id:number; name:string; model:string; cost:number; price:number; stock:number; minStock:number };
export type LocalLoan = { id:number; product:string; date:string; store:string; createdAt:string };

export const KEYS = {
  products:"cityphone_products_v1",
  sales:"cityphone_sales_v1",
  cash:"cityphone_cash_v1",
  repairs:"cityphone_repairs_v1",
  quotes:"cityphone_quotes_v1",
  parts:"cityphone_parts_v1",
  localLoans:"cityphone_local_loans_v1",
};

export function load<T>(key:string, fallback:T):T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
export function save<T>(key:string, value:T) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}
export const money = new Intl.NumberFormat("es-AR", { style:"currency", currency:"ARS", maximumFractionDigits:0 });
