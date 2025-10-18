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
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    const timeout = setTimeout(() => {
      const middle = document.body.scrollHeight / 2;
      window.scrollTo({ top: middle, behavior: "smooth" });
    }, 400); // espera 0.4s para asegurar que todo se haya cargado

    return () => clearTimeout(timeout);
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
