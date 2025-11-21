"use client";

import "./globals.css";
import styles from "./HomePage.module.css";
import Header from "../components/PageHeader";
import SvgTextInit from "../components/svgTextInit";
import SvGImgPleople from "../components/svgImgPleople";
import SvgTextPost from "../components/svgTextPost";
import BotonesAccion from "../components/PageBotonesAccion";
import Footer from "../components/Footer";


export default function HomePage() {
  return (
    <div className={styles.page}>
      <main className={styles.contenedorPrincipal}>
        <Header />
        <SvgTextInit />
        <SvGImgPleople />
        <SvgTextPost />
        <section className={styles.textoMotivacional}>

          <p><svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="8 12 16 20 24 12" />
          </svg>
          </p>


        </section>
        <BotonesAccion />
        <Footer />
      </main>
    </div>
  );
}