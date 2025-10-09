"use client";
import React from "react";
import styles from "../app/auth/AuthPage.module.css";

interface AuthLoadingProps {
  isLogin: boolean;
}

export const AuthLoading: React.FC<AuthLoadingProps> = ({ isLogin }) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <span style={{ marginLeft: "10px" }}>
        {isLogin ? "Iniciando sesión..." : "Registrando..."}
      </span>
    </div>
  );
};
