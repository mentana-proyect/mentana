"use client";

import Head from "next/head";
import Link from "next/link";
import styles from "./HomePage.module.css";
import Carrusel from "./script_index";

export default function HomePage() {
  const cards = [
    {
      title: "Descubre tu Perfil Emocional Preliminar",
      text: "7 de cada 10 personas en Chile declaran haber tenido alguna enfermedad o problema psicológico.",
    },
    {
      title: "Descubre tu Perfil Emocional Preliminar",
      text: "El 47% de las personas que necesitó ver a un profesional del área no lo hizo por falta de financiamiento.",
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

      <div className={styles["contenedor-principal-adaptado"]}>
        <div className={styles["tarjeta-contenido-principal"]}>
          <img src="logo.jpg" alt="Logo Mentana" className={styles.logo} />
          <Carrusel cards={cards} />
        </div>

        <p>
          Estamos construyendo el futuro del bienestar emocional.
          <br />
          <br />
          <strong>Únete al viaje.</strong>
        </p>

        <div className={styles["botones-accion"]}>
          <Link href="/registro" className={`${styles.btn} ${styles["btn-primary"]}`}>
            <b>Regístrate</b>
          </Link>
          <Link href="/auth" className={`${styles.btn} ${styles["btn-secondary"]}`}>
            <b>Inicia Sesión</b>
          </Link>
        </div>

        <footer>
          <strong>&copy; 2025 Mentana 🧠</strong>
        </footer>
      </div>
    </div>
  );
}
