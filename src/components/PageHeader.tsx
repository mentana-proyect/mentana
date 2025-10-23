import Image from "next/image";
import styles from "../app/HomePage.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <Image
        src="/logo.png"
        alt="Logo Mentana"
        className={styles.logo}
        width={150} // ✅ ajusta según tu diseño
        height={150}
        priority // ✅ mejora LCP al cargar primero el logo
      />
      <h1 className={styles.tituloPrincipal}>
        Descubre tu Perfil Emocional Preliminar
      </h1>
    </header>
  );
}
