"use client";
import React, { useState, useEffect, useRef } from "react";
import "../styles/modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showConfetti?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  showConfetti = false,
}) => {
  const [confettiPieces, setConfettiPieces] = useState<number[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // 🔹 Cerrar modal al hacer clic fuera y bloquear scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // 🔹 Generar confetti temporal al abrir el modal
  useEffect(() => {
    if (isOpen && showConfetti) {
      const pieces = Array.from({ length: 80 }, (_, i) => i); // 🔹 cantidad ajustable
      setConfettiPieces(pieces);

      const timer = setTimeout(() => setConfettiPieces([]), 1800);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showConfetti]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        {/* 🎊 Confetti animado */}
        {showConfetti && confettiPieces.length > 0 && (
          <div className="confetti-container">
            {confettiPieces.map((i) => {
              const size = Math.random() * 8 + 4; // entre 4 y 12px
              const left = Math.random() * 100; // posición horizontal aleatoria
              const duration = Math.random() * 1 + 1; // duración aleatoria 1–2s
              const delay = Math.random() * 0.5; // retardo leve
              const colors = ["#56dbc4", "#ffcc00", "#ff6699", "#66ccff", "#ffffff"];
              const color = colors[Math.floor(Math.random() * colors.length)];

              return (
                <span
                  key={i}
                  className="confetti"
                  style={{
                    left: `${left}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Header con título centrado y botón a la derecha */}
        <div className="modal-header">
          <div style={{ flex: 1 }} />
          {title && <h2 className="modal-title">{title}</h2>}
          <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
            &times;
          </button>
        </div>

        {/* Cuerpo del modal */}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
