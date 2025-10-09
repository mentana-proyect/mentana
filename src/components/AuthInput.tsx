"use client";
import React from "react";
import styles from "../app/auth/AuthPage.module.css";

interface AuthInputProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  loading: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
}) => {
  return (
    <div className={styles.inputGroup}>
    
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        placeholder="Email"
        required
      />

      <div className={styles.passwordWrapper}>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder="Contraseña"
          required
        />
        <button
          type="button"
          className={styles.showPasswordToggle}
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1} // evita que el botón reciba focus
        >
          {showPassword ? (
            // Ojo abierto
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className={styles.eyeIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          ) : (
            // Ojo cerrado
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className={styles.eyeIcon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18M10.477 10.477a3 3 0 014.046 4.046M9.879 9.879l4.243 4.243M12 5c4.477 0 8.268 2.943 9.542 7-1.032 3.287-3.88 5.846-7.052 6.607M2.458 12C3.732 7.943 7.523 5 12 5c.843 0 1.667.1 2.462.293"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
