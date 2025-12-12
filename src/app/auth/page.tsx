"use client";
import { useEffect } from "react";
import Head from "next/head";
import "../globals.css";
import styles from "./AuthPage.module.css";

import { useAuthForm } from "../../hooks/useAuthForm";

import { AuthLogo } from "./components/AuthLogo";
import { AuthForm } from "./components/AuthForm";
import Footer from "../../components/Footer";

export default function AuthPage() {
  const form = useAuthForm();

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, []);

  return (
    <>
      <Head>
        <title>{form.isLogin ? "Iniciar Sesión" : "Registrarse"}</title>
      </Head>

      <div className={styles.page}>
        {!form.redirecting && (
          <div className={styles.container}>
            <AuthLogo />
            <AuthForm {...form} />
            <Footer />
          </div>
        )}
      </div>
    </>
  );
}
