"use client";

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