"use client";

import { useEffect } from "react";
import { INITIAL_PRODUCTS } from "../lib/initial-products";
import { KEYS } from "../lib/storage";

const CATALOG_VERSION = "cityphone_catalog_20260904_v1";

export default function ProductCatalogSeed() {
  useEffect(() => {
    if (localStorage.getItem(CATALOG_VERSION)) return;
    localStorage.setItem(KEYS.products, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(CATALOG_VERSION, "loaded");
    window.dispatchEvent(new Event("cityphone-products-seeded"));
  }, []);
  return null;
}
