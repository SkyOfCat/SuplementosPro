import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_CONFIG, buildUrl } from "../config/api";
import "../styles/Login.css";

function ResetearContrasena() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    console.log("🔑 Token recibido:", token);
    validarToken();
  }, [token]);

  const validarToken = async () => {
    try {
      console.log("📡 Validando token...");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PASSWORD_RESET_VALIDATE}${token}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("✅ Respuesta validación:", data);

      if (response.ok && data.valid) {
        setValidToken(true);
        setEmail(data.email);
      } else {
        setValidToken(false);
        setError(data.error || "Token inválido o expirado");
      }
    } catch (err) {
      console.error("❌ Error validando token:", err);
      setValidToken(false);
      setError("Error de conexión con el servidor");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (formData.new_password !== formData.confirm_password) {
      setError("❌ Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 6) {
      setError("❌ La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      console.log("📡 Enviando nueva contraseña...");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PASSWORD_RESET_CONFIRM}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            new_password: formData.new_password,
            confirm_password: formData.confirm_password,
          }),
        }
      );

      const data = await response.json();
      console.log("✅ Respuesta cambio contraseña:", data);

      if (response.ok) {
        setSuccess("✅ Contraseña restablecida exitosamente");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(
          data.new_password?.[0] ||
            data.token?.[0] ||
            data.detail ||
            "❌ Error al restablecer la contraseña"
        );
      }
    } catch (err) {
      console.error("❌ Error de conexión:", err);
      setError("⚠️ Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras valida
  if (validToken === null) {
    return (
      <div className="login-container d-flex justify-content-center align-items-center min-vh-100 bg-primary">
        <div
          className="login-card bg-dark text-light p-4 rounded-3 shadow-lg text-center"
          style={{ width: "400px" }}
        >
          <div className="spinner-border text-info mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5>Validando enlace...</h5>
          <p className="text-muted">
            Verificando la validez del enlace de recuperación
          </p>
        </div>
      </div>
    );
  }

  // Mostrar error si el token no es válido
  if (!validToken) {
    return (
      <div className="login-container d-flex justify-content-center align-items-center min-vh-100 bg-primary">
        <div
          className="login-card bg-dark text-light p-4 rounded-3 shadow-lg text-center"
          style={{ width: "400px" }}
        >
          <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
          <h3>Enlace Inválido</h3>
          <p className="text-muted mb-4">
            {error || "El enlace de recuperación es inválido o ha expirado."}
          </p>
          <Link
            to="/recuperar-contrasena"
            className="btn btn-warning w-100 mb-2"
          >
            <i className="fas fa-redo me-2"></i> Solicitar nuevo enlace
          </Link>
          <Link to="/login" className="btn btn-outline-light btn-sm">
            <i className="fas fa-arrow-left me-2"></i> Volver al Login
          </Link>
        </div>
      </div>
    );
  }

  // Mostrar formulario si el token es válido
  return (
    <div className="login-container d-flex justify-content-center align-items-center min-vh-100 bg-primary">
      <div
        className="login-card bg-dark text-light p-4 rounded-3 shadow-lg"
        style={{ width: "400px" }}
      >
        <div className="brand-header text-center mb-4">
          <i className="fas fa-lock fa-2x text-success mb-3"></i>
          <h2 className="fw-bold">Nueva Contraseña</h2>
          <p className="text-muted">Para: {email}</p>
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
          <div className="mb-3">
            <label htmlFor="new_password" className="form-label">
              <i className="fas fa-lock me-2"></i>Nueva Contraseña
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              className="form-control"
              placeholder="Ingresa tu nueva contraseña (mín. 6 caracteres)"
              value={formData.new_password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirm_password" className="form-label">
              <i className="fas fa-lock me-2"></i>Confirmar Contraseña
            </label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              className="form-control"
              placeholder="Confirma tu nueva contraseña"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 fw-bold mb-3"
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
                Restableciendo...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i> Restablecer Contraseña
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

export default ResetearContrasena;
