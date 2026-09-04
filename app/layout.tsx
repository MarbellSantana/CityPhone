import type { Metadata } from "next";
import "./globals.css";
import PWARegister from "./pwa-register";
import ProductCatalogSeed from "./components/ProductCatalogSeed";

export const metadata: Metadata = {
  title: "City Phone | Gestión del local",
  description: "Sistema de gestión para City Phone",
  applicationName: "City Phone",
  manifest: "/Cityphone/manifest.webmanifest",
  themeColor: "#b8e6c1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "City Phone",
  },
  icons: {
    icon: "/Cityphone/icon.svg",
    apple: "/Cityphone/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <PWARegister />
        <ProductCatalogSeed />
        {children}
      </body>
    </html>
  );
}
