"use client";
import React, { useState } from "react";
import styles from "../app/auth/AuthPage.module.css";

interface AuthExtrasProps {
  isLogin: boolean;
  termsAccepted: boolean;
  setTermsAccepted: (val: boolean) => void;
}

export const AuthExtras: React.FC<AuthExtrasProps> = ({
  isLogin,
  termsAccepted,
  setTermsAccepted,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleAccept = () => {
    setTermsAccepted(true);
    setModalOpen(false);
  };

  const handleDecline = () => {
    setTermsAccepted(false);
    setModalOpen(false);
  };

  return (
    <>
      <div className={styles.extrasRow}>
        {!isLogin && (
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={termsAccepted}
              readOnly
              onClick={() => setModalOpen(true)} // Abrir modal al hacer clic
            />
            <span className={styles.slider}></span>
            <span className={styles.switchText}>
              Acepto los{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalOpen(true);
                }}
              >
                términos y condiciones
              </a>
            </span>
          </label>
        )}

        {isLogin && (
          <span className={styles.switchText}>
            <a href="/auth/recovery">¿Olvidaste tu contraseña?</a>
          </span>
        )}
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Términos y Condiciones</h2>
            <p>
              {/* Aquí puedes agregar tus términos y condiciones reales */}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            </p>
            <div className={styles.modalButtons}>
              <button className={styles.acceptBtn} onClick={handleAccept}>
                Aceptar
              </button>
              <button className={styles.declineBtn} onClick={handleDecline}>
                No aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
