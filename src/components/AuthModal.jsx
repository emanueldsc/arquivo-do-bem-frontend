import { useState } from "react";
import style from "./AuthModal.module.css";

export function AuthModal({ isOpen, onClose }) {
  const [authMode, setAuthMode] = useState("login");
  const [roleType, setRoleType] = useState("student");

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

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Aqui você irá chamar sua função de registro
      // registerStudent() ou registerProfessor()
      console.log("Registrar", roleType, form);

      setSuccess("Conta criada com sucesso!");

      // Limpa os campos
      setForm({ username: "", email: "", password: "" });

      // Volta ao modo de login
      setAuthMode("login");
    } catch (err) {
      setError("Erro ao registrar.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log("login", form);
              }}
            >
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

              <button
                type="submit"
                className="w3-button w3-teal w3-block w3-margin-bottom"
              >
                Entrar
              </button>

              <div className={`w3-center w3-small ${style["register-footer"]}`}>
                <span>Não tem conta?</span>
                <button
                  type="button"
                  className="w3-button w3-small w3-white w3-border"
                  onClick={() => setAuthMode("register")}
                >
                  Registrar
                </button>
              </div>
            </form>
          ) : (
            /* REGISTRO */
            <form onSubmit={handleRegister}>
              <label className="w3-text-black">
                Tipo de usuário
                <select
                  className="w3-select w3-border w3-margin-bottom"
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
                >
                  <option value="student">Aluno</option>
                  <option value="professor">Professor</option>
                </select>
              </label>

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

              {error && <p className="w3-text-red">{error}</p>}
              {success && <p className="w3-text-green">{success}</p>}

              <button
                type="submit"
                className="w3-button w3-teal w3-block w3-margin-bottom"
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
                  onClick={() => setAuthMode("login")}
                >
                  Voltar para login
                </button>
              </div>
            </form>
          )}
        </div>

        <footer className="w3-container w3-teal">
          <p style={{ margin: 0, padding: "8px 0" }}>Portal Arquivo do Bem</p>
        </footer>
      </div>
    </div>
  );
}
