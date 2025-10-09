"use client";
import React from "react";
import styles from "../app/auth/AuthPage.module.css";

interface AuthButtonsProps {
  isLogin: boolean;
  setIsLogin: (val: boolean) => void;
  loading: boolean;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({
  isLogin,
  setIsLogin,
  loading,
}) => {
  return (
    <div className={styles.buttonsContainer}>
      <button
        type="submit"
        className={`${styles.button} ${styles.primary}`}
        disabled={loading}
      >
        {isLogin ? "Iniciar Sesión" : "Registrarse"}
      </button>

      <button
        type="button"
        className={`${styles.button} ${styles.secondary}`}
        onClick={() => setIsLogin(!isLogin)}
        disabled={loading}
      >
        {isLogin ? "Crear cuenta" : "Ya tengo cuenta"}
      </button>
    </div>
  );
};

