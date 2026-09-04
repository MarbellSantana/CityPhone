"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let reloading = false;

    const handleControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    navigator.serviceWorker
      .register("/Cityphone/sw.js", { updateViaCache: "none" })
      .then(async (registration) => {
        await registration.update();
        if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
      })
      .catch(() => undefined);

    return () => navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
  }, []);

  return null;
}
