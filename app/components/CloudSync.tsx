"use client";

import { useEffect } from "react";
import { INITIAL_PRODUCTS } from "../lib/initial-products";
import {
  CLOUD_LAST_SYNC_KEY,
  KEYS,
  clearDirtyKeys,
  cloudBootstrap,
  cloudPull,
  getDirtyKeys,
} from "../lib/storage";

const SESSION_HYDRATED = "cityphone_cloud_hydrated_v4";
const ALL_KEYS = Object.values(KEYS);

function readLocalState() {
  const state:Record<string,unknown> = {};
  for (const key of ALL_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try { state[key] = JSON.parse(raw); } catch { /* ignore malformed local value */ }
  }
  return state;
}

function isNonEmptyArray(value:unknown):value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

function ensureLocalInventory(localState:Record<string,unknown>) {
  const localProducts = localState[KEYS.products];
  if (isNonEmptyArray(localProducts)) return localProducts;
  localStorage.setItem(KEYS.products, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

function applyRemote(state:Record<string,unknown>, skipKeys:Set<string> = new Set()) {
  let changed = false;
  for (const key of ALL_KEYS) {
    if (!(key in state) || skipKeys.has(key)) continue;

    const remoteValue = state[key];
    if (key === KEYS.products && Array.isArray(remoteValue) && remoteValue.length === 0) {
      const localProducts = (() => {
        try { return JSON.parse(localStorage.getItem(KEYS.products) || "[]"); } catch { return []; }
      })();
      if (Array.isArray(localProducts) && localProducts.length > 0) continue;
    }

    const next = JSON.stringify(remoteValue);
    if (localStorage.getItem(key) !== next) {
      localStorage.setItem(key, next);
      changed = true;
    }
  }
  localStorage.setItem(CLOUD_LAST_SYNC_KEY, new Date().toISOString());
  return changed;
}

export default function CloudSync() {
  useEffect(() => {
    let disposed = false;
    let syncing = false;

    async function bootstrap() {
      if (syncing || disposed) return;
      syncing = true;
      try {
        const localState = readLocalState();
        const protectedProducts = ensureLocalInventory(localState);
        localState[KEYS.products] = protectedProducts;

        const dirtyKeys = getDirtyKeys();
        const remote = await cloudBootstrap(localState, dirtyKeys);
        if (disposed) return;

        const remoteProducts = remote.state?.[KEYS.products];
        if (Array.isArray(remoteProducts) && remoteProducts.length === 0 && isNonEmptyArray(protectedProducts)) {
          const repaired = await cloudBootstrap({ [KEYS.products]: protectedProducts }, [KEYS.products]);
          if (disposed) return;
          remote.state = { ...(remote.state || {}), ...(repaired.state || {}) };
        }

        clearDirtyKeys(dirtyKeys);
        const changed = applyRemote(remote.state || {});
        if (changed && !sessionStorage.getItem(SESSION_HYDRATED)) {
          sessionStorage.setItem(SESSION_HYDRATED, "1");
          window.location.reload();
          return;
        }
        sessionStorage.setItem(SESSION_HYDRATED, "1");
      } catch (error) {
        console.error("CityPhone cloud bootstrap failed", error);
      } finally {
        syncing = false;
      }
    }

    async function pullLatest() {
      if (syncing || disposed) return;
      syncing = true;
      try {
        const dirtyKeys = new Set(getDirtyKeys());
        if (dirtyKeys.size) {
          syncing = false;
          await bootstrap();
          return;
        }
        const remote = await cloudPull();
        if (disposed) return;

        const remoteProducts = remote.state?.[KEYS.products];
        if (Array.isArray(remoteProducts) && remoteProducts.length === 0) {
          syncing = false;
          await bootstrap();
          return;
        }

        const changed = applyRemote(remote.state || {});
        if (changed) window.location.reload();
      } catch (error) {
        console.error("CityPhone cloud pull failed", error);
      } finally {
        syncing = false;
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") void pullLatest();
    };
    const onOnline = () => void bootstrap();

    void bootstrap();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return null;
}
