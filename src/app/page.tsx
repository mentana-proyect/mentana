"use client";

import { useEffect } from "react";
import Head from "next/head";
import "./globals.css";
import styles from "./HomePage.module.css";
import Header from "../components/PageHeader";
import CarruselTexto from "../components/PageCarruselTexto";
import TextoMotivacional from "../components/PageTextoMotivacional";
import BotonesAccion from "../components/PageBotonesAccion";
import Footer from "../components/Footer";
import { carruselTextos } from "../app/data/carruselTextos";

export default function HomePage() {
  useEffect(() => {
    // Detectar dispositivo móvil
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Esperar a que el contenido se haya renderizado
      setTimeout(() => {
        const middle = document.body.scrollHeight / 2;
        window.scrollTo({
          top: middle,
          behavior: "smooth", // desplazamiento suave
        });
      }, 400); // pequeño delay para asegurar render
    }
  }, []);

  return (
    <div className={styles.page}>
      <Head>
        <title>Mentana</title>
      </Head>

      <main className={styles.contenedorPrincipal}>
        <Header />
        <CarruselTexto textos={carruselTextos} />
        <TextoMotivacional />
        <BotonesAccion />
        <Footer />
      </main>
    </div>
  );
}
