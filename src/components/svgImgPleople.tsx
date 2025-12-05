import Image from "next/image";
import styles from "../app/HomePage.module.css";

export default function SvgImgPeople() {
  return (
    <Image
      src="/Gente.svg"
      alt="Imagen motivacional"
      className={styles.svgResponsive}
      width={500}       // Ajusta según tu necesidad real
      height={500}      // Ajusta según tu necesidad real
      priority          // Opcional: mejora LCP si aparece en pantalla al inicio
    />
  );
}
