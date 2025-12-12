"use client";

import "./globals.css";
import styles from "./HomePage.module.css";
import Header from "../components/PageHeader";
import SvgTextInit from "../components/svgTextInit";
import SvgImgPleople from "../components/svgImgPleople";
import SvgTextPost from "../components/svgTextPost";
import BotonesAccion from "../components/PageBotonesAccion";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <main className={styles.contenedorPrincipal}>
        <Header />
        <SvgTextInit />
        <SvgImgPleople />
        <SvgTextPost />
        <BotonesAccion />
        <Footer />
      </main>
    </div>
  );
}
