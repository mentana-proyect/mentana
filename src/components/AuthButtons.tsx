"use client";

import styles from "../app/auth/AuthPage.module.css";

interface AuthButtonsProps {
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
  loading: boolean;
}

export const AuthButtons = ({ isLogin, setIsLogin, loading }: AuthButtonsProps) => {
  return (
    <div className={styles.buttonsWrapper}>
      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? "Cargando..." : isLogin ? "Ingresar" : "Registrarme"}
      </button>

      <button
        type="button"
        className={styles.switchButton}
        onClick={() => setIsLogin(!isLogin)}
        disabled={loading}
      >
        {isLogin ? "Crear cuenta" : "Ya tengo cuenta"}
      </button>
    </div>
  );
};
