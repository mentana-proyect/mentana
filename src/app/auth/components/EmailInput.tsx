import styles from "../AuthPage.module.css";

export const EmailInput = ({ email, setEmail, loading }: any) => (
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
