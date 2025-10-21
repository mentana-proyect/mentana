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

  // 🔹 Confetti temporal
  useEffect(() => {
    if (isOpen && showConfetti) {
      const pieces = Array.from({ length: 100 }, (_, i) => i);
      setConfettiPieces(pieces);

      const timer = setTimeout(() => setConfettiPieces([]), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showConfetti]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        {/* Header con título centrado y botón a la derecha */}
        <div className="modal-header">
          <div style={{ flex: 1 }} /> {/* espacio a la izquierda */}
          {title && <h2 className="modal-title">{title}</h2>}
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
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