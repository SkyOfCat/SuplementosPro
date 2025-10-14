import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_CONFIG, getAuthHeadersJSON, buildUrl } from "../config/api";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validación básica
    if (!email || !password) {
      setError("❌ Por favor completa todos los campos");
      setLoading(false);
      return;
    }

    try {
      // ✅ URL usando la configuración centralizada
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.TOKEN), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar tokens en localStorage
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        // Obtener y guardar datos del usuario
        if (data.user) {
          localStorage.setItem("user_data", JSON.stringify(data.user));
          console.log("✅ Usuario autenticado:", data.user);
        } else {
          await obtenerDatosUsuario(data.access);
        }

        setError("");
        alert("✅ Inicio de sesión exitoso");

        // Redirigir usando navigate en lugar de window.location
        navigate("/");
      } else {
        // Manejar errores específicos del backend
        if (response.status === 401) {
          setError("❌ Email o contraseña incorrectos");
        } else if (response.status === 400) {
          setError("❌ Datos de inicio de sesión inválidos");
        } else {
          setError(data.detail || data.error || "❌ Error al iniciar sesión");
        }
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError("⚠️ Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const obtenerDatosUsuario = async (token) => {
    try {
      // ✅ URL usando la configuración centralizada
      const response = await fetch(
        buildUrl(API_CONFIG.ENDPOINTS.USUARIO_ACTUAL),
        {
          method: "GET",
          headers: getAuthHeadersJSON(),
        }
      );

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem("user_data", JSON.stringify(userData));
        console.log("✅ Datos de usuario obtenidos:", userData);
      } else if (response.status === 401) {
        console.error("Token inválido al obtener datos de usuario");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
    }
  };

  const handleRecoverPassword = () => {
    // Función para recuperar contraseña (puede implementarse después)
    alert("🔒 Función de recuperar contraseña - Próximamente");
    // Para implementar después:
    // navigate("/recuperar-contrasena");
  };

  const handleDemoLogin = () => {
    // Credenciales de demo (opcional - solo para desarrollo)
    setEmail("demo@suplementospro.com");
    setPassword("demopassword123");
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center min-vh-100 bg-primary">
      <div
        className="login-card bg-dark text-light p-4 rounded-3 shadow-lg"
        style={{ width: "400px" }}
      >
        <div className="brand-header text-center mb-4">
          <i className="fas fa-dumbbell fa-2x text-info mb-3"></i>
          <h2 className="fw-bold">SuplementosPro</h2>
          <p className="text-muted">Inicia sesión en tu cuenta</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <i className="fas fa-envelope me-2"></i>Email
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              <i className="fas fa-lock me-2"></i>Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="btn btn-info w-100 fw-bold mb-3"
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
                Iniciando sesión...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt me-2"></i> Iniciar Sesión
              </>
            )}
          </button>

          {/* Botón de demo (solo para desarrollo) */}
          {process.env.NODE_ENV === "development" && (
            <button
              type="button"
              className="btn btn-outline-light w-100 mb-3"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              <i className="fas fa-magic me-2"></i> Usar Credenciales Demo
            </button>
          )}

          {/* Botón de recuperar contraseña */}
          <button
            type="button"
            className="btn btn-outline-warning w-100 mb-3"
            onClick={handleRecoverPassword}
            disabled={loading}
          >
            <i className="fas fa-key me-2"></i> Recuperar Contraseña
          </button>

          {/* Botón de registrarse */}
          <Link
            to="/registro"
            className="btn btn-outline-success w-100"
            onClick={(e) => loading && e.preventDefault()}
          >
            <i className="fas fa-user-plus me-2"></i> Crear Cuenta
          </Link>
        </form>

        <div className="login-footer text-center mt-4 pt-3 border-top border-secondary">
          <p className="text-muted small mb-2">
            <i className="fas fa-shield-alt me-1"></i>
            Tus datos están protegidos
          </p>
          <p className="text-muted small">
            ¿Necesitas ayuda?{" "}
            <a
              href="#"
              className="text-info text-decoration-none"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  "📞 Soporte: +56 9 1234 5678\n✉️ Email: soporte@suplementospro.com"
                );
              }}
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
