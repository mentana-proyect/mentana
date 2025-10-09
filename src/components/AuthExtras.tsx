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
    <div className={styles.extrasContainer}>
      {!isLogin && (
        <label className={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          Acepto términos y condiciones
        </label>
      )}
      <div className={styles.extraLinks}>
        {isLogin ? <a href="#">¿Olvidaste tu contraseña?</a> : null}
      </div>
    </div>
  );
};
