"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./HomePage.module.css";

interface Card {
  title: string;
  text: string;
}

interface CarruselProps {
  cards: Card[];
  interval?: number; // tiempo de auto-rotación (ms)
}

const Carrusel: React.FC<CarruselProps> = ({ cards, interval = 5000 }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = derecha, -1 = izquierda
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 👉 funciones memoizadas
  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  }, [cards.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  }, [cards.length]);

  // 🔁 autoplay
  useEffect(() => {
    if (interval > 0) {
      timeoutRef.current = setTimeout(() => {
        nextSlide();
      }, interval);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, interval, nextSlide]); // ✅ se agrega nextSlide

  // 👉 Swipe táctil
  const startX = useRef(0);
  const endX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    endX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const delta = startX.current - endX.current;
    if (delta > 50) nextSlide();
    else if (delta < -50) prevSlide();
  };

  // 🎬 Variantes para animación slide
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div
      className={styles.carouselContainer}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.carouselWrapper}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            className={styles.card}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", duration: 0.5, ease: "easeInOut" },
              opacity: { duration: 0.4 },
            }}
          >
            <h3>{cards[current].title}</h3>
            <p>{cards[current].text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicadores */}
      <div className={styles["carousel-indicators"]}>
        {cards.map((_, index) => (
          <span
            key={index}
            className={`${styles.indicator} ${
              index === current ? styles.active : ""
            }`}
            onClick={() => {
              setDirection(index > current ? 1 : -1);
              setCurrent(index);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Carrusel;
