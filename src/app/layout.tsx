import type { Metadata } from "next";
import "./globals.css"; // ✅ Estilos globales
import ClarityScript from "@/components/ClarityScript"; // 👈 Agregamos el script de Clarity

export const metadata: Metadata = {
  title: "Mentana",
  description: "Evaluaciones emocionales y bienestar psicológico",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <ClarityScript /> {/* 👈 Se carga en todas las páginas */}
      </body>
    </html>
  );
}
