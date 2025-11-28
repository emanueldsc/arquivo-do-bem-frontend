import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authController } from "../controllers/authController";
import styles from "./RegisterProfessor.module.css";

export default function RegisterProfessor() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.username || !form.email || !form.password) {
      setError("Preencha username, email e senha.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    try {
      setLoading(true);

      await authController.handleRegisterProfessor({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      setSuccessMsg("Administrador cadastrado com sucesso!");
      setForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          "Erro ao cadastrar administrador."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Cadastrar Administrador</h1>
        <p className={styles.subtitle}>
          Esta página é acessível apenas via URL.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Username
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="ex: joao.silva"
              className={styles.input}
              disabled={loading || !!successMsg}
            />
          </label>

          <label className={styles.label}>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ex: joao@email.com"
              className={styles.input}
              disabled={loading || !!successMsg}
            />
          </label>

          <label className={styles.label}>
            Senha
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              className={styles.input}
              disabled={loading || !!successMsg}
            />
          </label>

          <label className={styles.label}>
            Confirmar senha
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="********"
              className={styles.input}
              disabled={loading || !!successMsg}
            />
          </label>

          {!successMsg && (
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          )}
        </form>

        {error && <p className={styles.error}>{error}</p>}

        {successMsg && (
          <div className={styles.successBox}>
            <p className={styles.success}>{successMsg}</p>
            <button
              className={styles.button}
              onClick={() => navigate("/")}
            >
              Ir para Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
