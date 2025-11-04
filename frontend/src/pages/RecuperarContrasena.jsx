import { useState } from "react";
import { Link } from "react-router-dom";
import { API_CONFIG, buildUrl } from "../config/api";
import "../styles/Login.css";

function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email) {
      setError("❌ Por favor ingresa tu email");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        buildUrl(API_CONFIG.ENDPOINTS.PASSWORD_RESET_REQUEST),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("✅ Se ha enviado un enlace de recuperación a tu email");
        setEmail("");
      } else {
        setError(
          data.email?.[0] || data.detail || "❌ Error al procesar la solicitud"
        );
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError("⚠️ Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center min-vh-100 bg-primary">
      <div
        className="login-card bg-dark text-light p-4 rounded-3 shadow-lg"
        style={{ width: "400px" }}
      >
        <div className="brand-header text-center mb-4">
          <i className="fas fa-key fa-2x text-warning mb-3"></i>
          <h2 className="fw-bold">Recuperar Contraseña</h2>
          <p className="text-muted">
            Ingresa tu email para restablecer tu contraseña
          </p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success d-flex align-items-center">
            <i className="fas fa-check-circle me-2"></i>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="form-label">
              <i className="fas fa-envelope me-2"></i>Email
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="Ingresa tu email registrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-warning w-100 fw-bold mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
                  <span className="visually-hidden">Cargando...</span>
                </div>
                Enviando...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i> Enviar Enlace
              </>
            )}
          </button>

          <div className="text-center">
            <Link to="/login" className="btn btn-outline-light btn-sm">
              <i className="fas fa-arrow-left me-2"></i> Volver al Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecuperarContrasena;
