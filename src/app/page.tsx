"use client";

import Head from "next/head";
import Link from "next/link";
import "./globals.css"; // Estilos globales
import Carrusel from "./script_index";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const cards = [
    {
      title: "Descubre tu Perfil Emocional Preliminar",
      text: "7 de cada 10 personas en Chile declaran haber tenido alguna enfermedad o problema psicológico.",
    },
    {
      title: "Descubre tu Perfil Emocional Preliminar",
      text: "El 47% de quienes necesitaron ver a un profesional no lo hicieron por falta de financiamiento.",
    },
    {
      title: "Descubre tu Perfil Emocional Preliminar",
      text: "El 17.5% de las mujeres ha sufrido algún trastorno de ansiedad en su vida, frente al 9.5% de los hombres.",
    },
  ];

  return (
    <div className={styles.page}>
      <Head>
        <title>Mentana</title>
        <meta
          name="description"
          content="Mentana - Evaluaciones emocionales y bienestar psicológico."
        />
      </Head>

      <main className={styles.contenedorPrincipal}>
        {/* Header / Logo */}
        <header className={styles.header}>
          <img
            src="/logo.jpg"
            alt="Logo Mentana"
            className={styles.logo}
          />
        </header>

        {/* Carrusel */}
        <section className={styles.carruselSection}>
          <Carrusel cards={cards} />
        </section>

        {/* Texto motivacional */}
        <section className={styles.textoMotivacional}>
          <p>
            Estamos construyendo el futuro del <strong>bienestar emocional</strong>.
          </p>
          <p>
            <strong>Únete al viaje.</strong>
          </p>
        </section>

        {/* Botones de acción */}
        <section className={styles.botonesAccion}>
          <Link href="/auth" className={`${styles.btn} ${styles.btnPrimary}`}>
            Regístrate
          </Link>
          <Link href="/auth" className={`${styles.btn} ${styles.btnSecondary}`}>
            Inicia Sesión
          </Link>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <strong>&copy; 2025 Mentana 🧠</strong>
        </footer>
      </main>
    </div>
  );
}
