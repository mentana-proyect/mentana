"use client";
import Head from "next/head";
import { AuthInput } from "../../components/AuthInput";
import { AuthExtras } from "../../components/AuthExtras";
import { AuthButtons } from "../../components/AuthButtons";
import { AuthMessage } from "../../components/AuthMessage";
import { AuthLoading } from "../../components/AuthLoading";
import { useAuthForm } from "../../hooks/useAuthForm";
import styles from "./AuthPage.module.css"; // CSS Module


export default function AuthPage() {
  const {
    isLogin,
    setIsLogin,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    message,
    messageType,
    loading,
    redirecting,
    termsAccepted,
    setTermsAccepted,
    handleSubmit,
  } = useAuthForm();

  return (
    <>
      <Head>
        <title>{isLogin ? "Iniciar Sesión" : "Registrarse"}</title>
      </Head>

      <div className={styles.page}>
        {!redirecting ? (
          <div className={styles.container}>
            <img
              src="logo.jpg"
              alt="Logo Mentana"
              className={styles.logoContainer}
            />
            <form className={styles.form} onSubmit={handleSubmit}>
              <AuthInput
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                loading={loading}
              />
              <AuthExtras
                isLogin={isLogin}
                termsAccepted={termsAccepted}
                setTermsAccepted={setTermsAccepted}
              />
              <AuthButtons
                isLogin={isLogin}
                setIsLogin={setIsLogin}
                loading={loading}
              />
            </form>

            <AuthMessage message={message} type={messageType} />

            <footer className={styles.footer}>
              <strong>&copy; 2025 Mentana 🧠</strong>
            </footer>
          </div>
        ) : (
          <AuthLoading isLogin={isLogin} />
        )}
      </div>
    </>
  );
}
