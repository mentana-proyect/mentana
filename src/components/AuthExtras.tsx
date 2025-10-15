"use client";
import React from "react";
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
  return (
    <div className={styles.extrasRow}>
  {!isLogin && (
    <label className={styles.switch}>
      <input
        type="checkbox"
        checked={termsAccepted}
        onChange={(e) => setTermsAccepted(e.target.checked)}
      />
      <span className={styles.slider}></span>
      <span className={styles.switchText}>
        Acepto los <a href="/terminos">términos y condiciones</a>
      </span>
    </label>
  )}

  {isLogin && (
    <a href="#" className={styles.extraLinkRow}>
      ¿Olvidaste tu contraseña?
    </a>
  )}
</div>

  );
};
