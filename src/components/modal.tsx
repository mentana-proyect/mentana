"use client";
import React, { useState, useEffect, useRef } from "react";
import "../styles/modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string; // 🔹 nuevo
  showConfetti?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  showConfetti = false 
}) => {
  const [confettiPieces, setConfettiPieces] = useState<number[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "hidden";
    }
    if (!isOpen) {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (showConfetti && isOpen) {
      setConfettiPieces(Array.from({ length: 100 }, (_, i) => i));
      const timer = setTimeout(() => setConfettiPieces([]), 1500);
      return () => clearTimeout(timer);
    }
  }, [showConfetti, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        
        {/* 🔹 Header con título y botón cerrar */}
        <div className="modal-header">
          {title && <h2 className="modal-title">{title}</h2>}
          <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
            &times;
          </button>
        </div>

        {/* 🔹 Contenido */}
        <div className="modal-body">{children}</div>

        {confettiPieces.length > 0 && (
          <div className="confetti-container">
            {confettiPieces.map((i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 0.5 + 1}s`,
                  width: `${Math.random() * 5 + 5}px`,
                  height: `${Math.random() * 5 + 5}px`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
