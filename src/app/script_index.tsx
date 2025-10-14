"use client";
import React, { useState, useEffect } from "react";

interface Card {
  title: string;
  text: string;
}

interface CarruselProps {
  cards: Card[];
  interval?: number; // opcional: autoplay en ms
}

const Carrusel: React.FC<CarruselProps> = ({ cards, interval = 5000 }) => {
  const [current, setCurrent] = useState(0);

  // ⏳ autoplay opcional
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
    }, interval);
    return () => clearInterval(timer);
  }, [cards.length, interval]);

  return (
    <div className="carousel-container">
      {/* Tarjetas */}
      <div className="carousel-cards">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`card ${index === current ? "active" : ""}`}
            style={{ display: index === current ? "block" : "none" }}
          >
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </div>
        ))}
      </div>

      {/* Indicadores (circulitos) */}
      <div className="carousel-indicators">
        {cards.map((_, index) => (
          <span
            key={index}
            className={`indicator ${index === current ? "active" : ""}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carrusel;
