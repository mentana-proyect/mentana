"use client";
import { useState, useEffect } from "react";
import styles from "../app/HomePage.module.css";

interface CarruselTextoProps {
  textos: string[];
  interval?: number;
}

export default function CarruselTexto({ textos, interval = 4000 }: CarruselTextoProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % textos.length);
    }, interval);
    return () => clearInterval(timer);
  }, [textos, interval]);

  const handleIndicatorClick = (i: number) => {
    setIndex(i);
  };

  return (
    <section className={styles.carruselSection}>
      <p className={styles.carruselTexto}>{textos[index]}</p>
      <div className={styles.carruselIndicators}>
        {textos.map((_, i) => (
          <span
            key={i}
            className={`${styles.indicator} ${i === index ? styles.active : ""}`}
            onClick={() => handleIndicatorClick(i)}
          />
        ))}
      </div>
    </section>
  );
}
