"use client";
import { useEffect } from "react";
import Head from "next/head";
import { AuthExtras } from "../../components/AuthExtras";
import { AuthButtons } from "../../components/AuthButtons";
import { AuthMessage } from "../../components/AuthMessage";
import { useAuthForm } from "../../hooks/useAuthForm";
import "../globals.css"; // ✅ Importa los estilos globales
import styles from "./AuthPage.module.css";
import Footer from "../../components/Footer";

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

  // 🔹 Scroll hacia abajo al cargar la página
  useEffect(() => {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    const timeout = setTimeout(() => {
      const middle = document.body.scrollHeight / 2;
      window.scrollTo({ top: middle, behavior: "smooth" });
    }, 400); // espera 0.4s para asegurar que todo se haya cargado

    return () => clearTimeout(timeout);
  }
}, []);


  return (
    <>
      <Head>
        <title>{isLogin ? "Iniciar Sesión" : "Registrarse"}</title>
      </Head>

      <div className={styles.page}>
        {!redirecting && (
          <div className={styles.container}>
            <img
              src="logo.png"
              alt="Logo Mentana"
              className={styles.logoContainer}
            />

            <form className={styles.form} onSubmit={handleSubmit}>
              {/* ======================= */}
              {/* EMAIL CON LABEL FLOTANTE */}
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" " // 🔹 importante para floating label
                  disabled={loading}
                />
                <label>Correo</label>
              </div>

              {/* ======================= */}
              {/* PASSWORD CON LABEL FLOTANTE */}
              <div className={`${styles.inputGroup} ${styles.passwordWrapper}`}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  disabled={loading}
                />
                <label>Contraseña</label>
                <button
                  type="button"
                  className={styles.showPasswordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" 
                          width="28" height="28" fill="white" 
                          viewBox="0 0 30 18">
                        <path d="M12 5c7.633 0 12 7 12 7s-4.367 
                                7-12 7-12-7-12-7 4.367-7 12-7zm0 
                                12c2.761 0 5-2.239 5-5s-2.239-5-5-5c-2.761 
                                0-5 2.239-5 5s2.239 5 5 5z"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" 
                          width="28" height="28" fill="white" 
                          viewBox="0 0 30 18">
                        <path d="M12 5c-7.633 0-12 7-12 7s4.367 7 12 7 12-7 12-7-4.367-7-12-7zm0 12c-2.761 
                                0-5-2.239-5-5s2.239-5 5-5c2.761 0 5 2.239 
                                5 5s-2.239 5-5 5zm0-8c-1.657 0-3 
                                1.343-3 3s1.343 3 3 3 3-1.343 
                                3-3-1.343-3-3-3z"/>
                      </svg>
                    )}
                </button>
              </div>
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
            <Footer />
          </div>
        )}
      </div>
    </>
  );
}
