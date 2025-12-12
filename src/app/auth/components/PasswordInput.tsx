import styles from "../AuthPage.module.css";

interface PasswordInputProps {
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  loading: boolean;
}

export const PasswordInput = ({
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
}: PasswordInputProps) => (
  <div className={`${styles.inputGroup} ${styles.passwordWrapper}`}>
    <input
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder=" "
      disabled={loading}
      required
    />
    <label>Contraseña</label>

    <button
      type="button"
      className={styles.showPasswordToggle}
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          fill="white"
          viewBox="0 0 30 18"
        >
          <path d="M12 5c7.633 0 12 7 12 7s-4.367 7-12 7-12-7-12-7 4.367-7 12-7zm0 12c2.761 0 5-2.239 5-5s-2.239-5-5-5c-2.761 0-5 2.239-5 5s2.239 5 5 5z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          fill="white"
          viewBox="0 0 30 18"
        >
          <path d="M12 5c-7.633 0-12 7-12 7s4.367 7 12 7 12-7 12-7-4.367-7-12-7zm0 12c-2.761 
                    0-5-2.239-5-5s2.239-5 5-5c2.761 0 5 2.239 
                    5 5s-2.239 5-5 5zm0-8c-1.657 0-3 
                    1.343-3 3s1.343 3 3 3 3-1.343 
                    3-3-1.343-3-3-3z" />
        </svg>
      )}
    </button>
  </div>
);
