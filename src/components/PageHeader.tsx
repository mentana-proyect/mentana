import styles from "../app/HomePage.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <img src="/logo.jpg" alt="Logo Mentana" className={styles.logo} />
      <h1 className={styles.tituloPrincipal}>Descubre tu Perfil Emocional Preliminar</h1>
    </header>
  );
}
