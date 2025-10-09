"use client";
import React from "react";
import styles from "../app/auth/AuthPage.module.css";

interface AuthMessageProps {
  message: string;
  type: "success" | "error" | null;
}

export const AuthMessage: React.FC<AuthMessageProps> = ({ message, type }) => {
  if (!message || !type) return null;
  return <div className={`${styles.message} ${styles[type]}`}>{message}</div>;
};