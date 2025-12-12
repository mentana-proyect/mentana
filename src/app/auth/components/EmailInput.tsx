import styles from "../AuthPage.module.css";

interface EmailInputProps {
  email: string;
  setEmail: (value: string) => void;
  loading: boolean;
}

export const EmailInput = ({ email, setEmail, loading }: EmailInputProps) => (
  <div className={styles.inputGroup}>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder=" "
      disabled={loading}
      required
    />
    <label>Correo</label>
  </div>
);
