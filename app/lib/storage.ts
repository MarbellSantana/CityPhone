export type Product = { id:number; name:string; category:string; cost:number; price:number; stock:number; minStock:number; code?:string; restockOmitted?:boolean };
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
  deposited?:boolean;
  invoiceRequested?:boolean;
  invoiceStatus?:"No facturada"|"Pendiente"|"Facturada"|"Error";
  invoiceType?:string;
  invoiceNumber?:string;
  invoicePointOfSale?:number;
  cae?:string;
  caeDueDate?:string;
  invoicePdfUrl?:string;
  customerPhone?:string;
  customerEmail?:string;
  customerDocType?:string;
  customerDocNumber?:string;
  customerIvaConditionId?:number;
};
export type CashMovement = { id:number; type:"Ingreso"|"Egreso"; concept:string; amount:number; method:string; note:string; createdAt:string; source?:string; category?:string };
export type CashClosure = { id:number; month:string; year:number; income:number; expenses:number; balance:number; movementCount:number; expenseBreakdown:Record<string,number>; closedAt:string; netSales?:number; cashOnHand?:number };
export type Repair = { id:number; nombre:string; apellido:string; telefono:string; email:string; equipo:string; motivo:string; precio:number; estado:string; createdAt:string; diagnostico?:string; reparacionRecomendada?:string; diagnosticadoAt?:string };
export type Quote = { id:number; cliente:string; telefono:string; equipo:string; reparacion:string; costo:number; precio:number; estado:string; createdAt:string };
export type Part = { id:number; name:string; model:string; cost:number; price:number; stock:number; minStock:number };
export type LocalLoan = { id:number; product:string; date:string; store:string; createdAt:string };

export const KEYS = {
  products:"cityphone_products_v1",
  sales:"cityphone_sales_v1",
  cash:"cityphone_cash_v1",
  cashClosures:"cityphone_cash_closures_v1",
  repairs:"cityphone_repairs_v1",
  quotes:"cityphone_quotes_v1",
  parts:"cityphone_parts_v1",
  localLoans:"cityphone_local_loans_v1",
};

export const CLOUD_ENDPOINT = "https://yftaloxtylijudnoewrm.supabase.co/functions/v1/cityphone-sync";
export const CLOUD_DIRTY_KEY = "cityphone_cloud_dirty_v1";
export const CLOUD_LAST_SYNC_KEY = "cityphone_cloud_last_sync_v1";

const cloudKeys = new Set<string>(Object.values(KEYS));
const pushQueues = new Map<string, Promise<void>>();

export function load<T>(key:string, fallback:T):T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}

function readDirty():Record<string,number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(CLOUD_DIRTY_KEY) || "{}") as Record<string,number>; } catch { return {}; }
}

function writeDirty(value:Record<string,number>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLOUD_DIRTY_KEY, JSON.stringify(value));
}

export function getDirtyKeys():string[] {
  return Object.keys(readDirty());
}

export function clearDirtyKeys(keys:string[]) {
  const dirty = readDirty();
  let changed = false;
  for (const key of keys) {
    if (key in dirty) { delete dirty[key]; changed = true; }
  }
  if (changed) writeDirty(dirty);
}

function markDirty(key:string) {
  const dirty = readDirty();
  dirty[key] = Date.now();
  writeDirty(dirty);
}

async function requestCloud(body:unknown) {
  const response = await fetch(CLOUD_ENDPOINT, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body),
    cache:"no-store",
  });
  if (!response.ok) throw new Error(`Cloud sync failed: ${response.status}`);
  return response.json();
}

async function pushCloud(key:string, value:unknown) {
  if (!cloudKeys.has(key)) return;
  try {
    await requestCloud({action:"push", key, value});
    const dirty = readDirty();
    if (key in dirty) { delete dirty[key]; writeDirty(dirty); }
    if (typeof window !== "undefined") localStorage.setItem(CLOUD_LAST_SYNC_KEY, new Date().toISOString());
  } catch {
    markDirty(key);
  }
}

function queueCloudPush(key:string, value:unknown) {
  const previous = pushQueues.get(key) || Promise.resolve();
  const next = previous.catch(() => undefined).then(() => pushCloud(key, value));
  pushQueues.set(key, next);
  void next.finally(() => { if (pushQueues.get(key) === next) pushQueues.delete(key); });
}

export function save<T>(key:string, value:T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  if (cloudKeys.has(key)) {
    markDirty(key);
    queueCloudPush(key, value);
  }
}

export async function cloudPull():Promise<Record<string,unknown>> {
  const result = await requestCloud({action:"pull"});
  return (result?.state || {}) as Record<string,unknown>;
}

export async function cloudBootstrap(localState:Record<string,unknown>, dirtyKeys:string[] = []):Promise<Record<string,unknown>> {
  const result = await requestCloud({action:"bootstrap", state:localState, dirtyKeys});
  return (result?.state || {}) as Record<string,unknown>;
}

export const money = new Intl.NumberFormat("es-AR", { style:"currency", currency:"ARS", maximumFractionDigits:0 });