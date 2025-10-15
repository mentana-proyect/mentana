import Link from "next/link";
import styles from "../app/HomePage.module.css";

export default function BotonesAccion() {
  return (
    <section className={styles.botonesAccion}>
      <Link href="/auth" className={`${styles.btn} ${styles.btnPrimary}`}>
        Regístrate
      </Link>
      <Link href="/auth" className={`${styles.btn} ${styles.btnSecondary}`}>
        Inicia Sesión
      </Link>
    </section>
  );
}
