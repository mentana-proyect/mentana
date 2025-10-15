import styles from "../app/HomePage.module.css";

export default function TextoMotivacional() {
  return (
    <section className={styles.textoMotivacional}>
      <p>
        Estamos construyendo el futuro del <strong>bienestar emocional</strong>.
      </p>
      <p>
        <strong>Únete al viaje.</strong>
      </p>

      <svg
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
    </section>
  );
}
