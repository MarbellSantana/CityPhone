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

const SESSION_HYDRATED = "cityphone_cloud_hydrated_v1";
const ALL_KEYS = Object.values(KEYS);

function readLocalState() {
  const state:Record<string,unknown> = {};
  for (const key of ALL_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try { state[key] = JSON.parse(raw); } catch { /* ignore malformed local value */ }
  }

  if (!(KEYS.products in state)) {
    state[KEYS.products] = INITIAL_PRODUCTS;
    localStorage.setItem(KEYS.products, JSON.stringify(INITIAL_PRODUCTS));
  }

  return state;
}

function applyRemote(state:Record<string,unknown>, skipKeys:Set<string> = new Set()) {
  let changed = false;
  for (const key of ALL_KEYS) {
    if (!(key in state) || skipKeys.has(key)) continue;
    const next = JSON.stringify(state[key]);
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
        const dirtyKeys = getDirtyKeys();
        const remote = await cloudBootstrap(localState, dirtyKeys);
        if (disposed) return;
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
