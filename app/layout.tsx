import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "City Phone | Gestión del local",
  description: "Sistema de gestión para City Phone",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
