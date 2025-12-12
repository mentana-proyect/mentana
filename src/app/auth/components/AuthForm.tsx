import styles from "../AuthPage.module.css";
import { EmailInput } from "../components/EmailInput";
import { PasswordInput } from "../components/PasswordInput";
import { AuthExtras } from "../../../components/AuthExtras";
import { AuthButtons } from "../../../components/AuthButtons";
import { AuthMessage } from "../../../components/AuthMessage";
import { FormEvent } from "react";

export interface AuthFormProps {
  isLogin: boolean;
  setIsLogin: (v: boolean) => void;

  email: string;
  setEmail: (v: string) => void;

  password: string;
  setPassword: (v: string) => void;

  showPassword: boolean;
  setShowPassword: (v: boolean) => void;

  loading: boolean;

  termsAccepted: boolean;
  setTermsAccepted: (v: boolean) => void;

  message: string | null;
  messageType: "success" | "error" | null;

  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export const AuthForm = ({
  isLogin,
  setIsLogin,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  termsAccepted,
  setTermsAccepted,
  message,
  messageType,
  handleSubmit,
}: AuthFormProps) => (
  <>
    <form className={styles.form} onSubmit={handleSubmit}>
      <EmailInput email={email} setEmail={setEmail} loading={loading} />

      <PasswordInput
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
  </>
);
