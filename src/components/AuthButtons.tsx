"use client";
import React from "react";
import styles from "../app/auth/AuthPage.module.css";

interface AuthButtonsProps {
  isLogin: boolean;
  setIsLogin: (val: boolean) => void;
  loading: boolean;
  onRegisterClick?: () => void; // ✅ Nueva prop opcional
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({
  isLogin,
  setIsLogin,
  loading,
  onRegisterClick,
}) => {
  const handleClick = () => {
    // Si el usuario cambia de Login a Registro, llama a onRegisterClick (si existe)
    if (isLogin && onRegisterClick) {
      onRegisterClick();
    }
    setIsLogin(!isLogin);
  };

  return (
    <div className={styles.buttonsContainer}>
      <button
        type="submit"
        className={`${styles.button} ${
          isLogin ? styles.primary : styles.secondary
        }`}
        disabled={loading}
      >
        {isLogin ? "Iniciar Sesión" : "Registrarse"}
      </button>

      <button
        type="button"
        className={`${styles.button} ${
          isLogin ? styles.secondary : styles.primary
        }`}
        onClick={handleClick}
        disabled={loading}
      >
        {isLogin ? "Registrarse" : "Iniciar Sesión"}
      </button>
    </div>
  );
};
