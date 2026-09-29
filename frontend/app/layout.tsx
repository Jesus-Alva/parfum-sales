import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scentia | Perfumes de Alta Gama",
  description: "Descubre fragancias exclusivas. Registra tu compra en segundos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-scentia-bg text-scentia-text antialiased">
        {children}
      </body>
    </html>
  );
}