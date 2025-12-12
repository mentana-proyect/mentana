import styles from "../AuthPage.module.css";
import { EmailInput } from "../components/EmailInput";
import { PasswordInput } from "../components/PasswordInput";
import { AuthExtras } from "../../../components/AuthExtras";
import { AuthButtons } from "../../../components/AuthButtons";
import { AuthMessage } from "../../../components/AuthMessage";

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
}: any) => (
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
