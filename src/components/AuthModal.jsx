import { useState } from "react";
import { authController } from "../controllers/authController";
import {
  ERROR_400,
  ERROR_USER_ALREADY_EXISTS,
  SUCCESS_REGISTER,
} from "../utils/mesages";
import style from "./AuthModal.module.css";

import { useAuth } from "../context/AuthContext";

export function AuthModal({ isOpen, onClose, onSuccess }) {
  const { setUser, setIsLogged } = useAuth();
  const [authMode, setAuthMode] = useState("login");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm({
      username: "",
      email: "",
      password: "",
    });
    setError(null);
  }

  function resetMessages() {
    setError(null);
    setSuccess(null);
  }

  // 🔥 LOGIN
  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      const user = await authController.handleLogin({
        identifier: form.email,
        password: form.password,
      });
      setUser(user);
      setIsLogged(true);
      onSuccess?.(user);
      resetForm();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          ERROR_400
      );
    } finally {
      setLoading(false);
    }
  }

  // 🔥 REGISTRO (sempre student)
  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    try {
      await authController.handleRegisterStudent(form);
      setSuccess(SUCCESS_REGISTER);
      resetForm();
      setAuthMode("login");
    } catch (err) {
      setError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          ERROR_USER_ALREADY_EXISTS
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`w3-modal ${style.modal}`} style={{ display: "block" }}>
      <div
        className="w3-modal-content w3-animate-bottom w3-card-4 w3-round-xlarge"
        style={{ maxWidth: 420 }}
      >
        <header className={`w3-container ${style["modal-header"]}`}>
          <span
            className={`w3-button w3-display-topright ${style["modal-close-button"]}`}
            onClick={onClose}
          >
            &times;
          </span>
          <h2>{authMode === "login" ? "Login" : "Criar conta"}</h2>
        </header>

        <div className="w3-container" style={{ padding: "16px 24px" }}>
          {/* LOGIN */}
          {authMode === "login" ? (
            <form onSubmit={handleLoginSubmit}>
              <label className="w3-text-black">
                Email
                <input
                  className="w3-input w3-border w3-margin-bottom"
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </label>

              <label className="w3-text-black">
                Senha
                <input
                  className="w3-input w3-border w3-margin-bottom"
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                />
              </label>

              {error && (
                <p className="w3-text-red alert w3-border-red">
                  <span
                    className={style["close-mesage"]}
                    onClick={() => setError(null)}
                  >
                    &times;
                  </span>
                  {error}
                </p>
              )}
              {success && (
                <p className="w3-text-green alert w3-border-green">
                  <span
                    className={style["close-mesage"]}
                    onClick={() => setSuccess(null)}
                  >
                    &times;
                  </span>
                  {success}
                </p>
              )}

              <button
                type="submit"
                className={`w3-button w3-block w3-margin-bottom ${style["modal-primary-color"]}`}
                disabled={loading}
              >
                Entrar
              </button>

              <div className={`w3-center w3-small ${style["register-footer"]}`}>
                <span>Não tem conta?</span>
                {/* <button
                  type="button"
                  className="w3-button w3-small w3-white w3-border"
                  onClick={() => {
                    setAuthMode("register");
                    resetForm();
                  }}
                >
                  Registrar
                </button> */}
              </div>
            </form>
          ) : (
            /* REGISTRO */
            <form onSubmit={handleRegisterSubmit}>
              <label className="w3-text-black">
                Nome de usuário
                <input
                  className="w3-input w3-border w3-margin-bottom"
                  type="text"
                  name="username"
                  required
                  value={form.username}
                  onChange={handleChange}
                />
              </label>

              <label className="w3-text-black">
                Email
                <input
                  className="w3-input w3-border w3-margin-bottom"
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </label>

              <label className="w3-text-black">
                Senha
                <input
                  className="w3-input w3-border w3-margin-bottom"
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                />
              </label>

              {error && (
                <p className="w3-text-red alert w3-border-red">
                  <span
                    className={style["close-mesage"]}
                    onClick={() => setError(null)}
                  >
                    &times;
                  </span>
                  {error}
                </p>
              )}
              {success && (
                <p className="w3-text-green alert w3-border-green">
                  <span
                    className={style["close-mesage"]}
                    onClick={() => setSuccess(null)}
                  >
                    &times;
                  </span>
                  {success}
                </p>
              )}

              <button
                type="submit"
                className={`w3-button w3-block w3-margin-bottom ${style["modal-primary-color"]}`}
                disabled={loading}
              >
                Registrar
              </button>

              <div
                className={`w3-center w3-small w3-flex ${style["register-footer"]}`}
              >
                <span>Já tem conta?</span>
                <button
                  type="button"
                  className="w3-button w3-small w3-white w3-border"
                  onClick={() => {
                    setAuthMode("login");
                    resetForm();
                  }}
                >
                  Voltar para login
                </button>
              </div>
            </form>
          )}
        </div>

        <footer
          className={`w3-container ${style["modal-footer"]}`}
        >
          <p style={{ margin: 0, padding: "8px 0" }}>Portal Arquivo do Bem</p>
        </footer>
      </div>
    </div>
  );
}
