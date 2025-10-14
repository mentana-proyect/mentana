import type { Metadata } from "next";
import "./globals.css"; // ✅ Importa los estilos globales

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
      <body>{children}</body>
    </html>
  );
}
