import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        if (data.user) {
          localStorage.setItem("user_data", JSON.stringify(data.user));
        } else {
          await obtenerDatosUsuario(data.access);
        }

        alert("✅ Inicio de sesión exitoso");
        window.location.href = "/";
      } else {
        setError(data.detail || data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const obtenerDatosUsuario = async (token) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/usuario/actual/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem("user_data", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
    }
  };

  const handleRecoverPassword = () => {
    // Aquí puedes implementar la lógica para recuperar contraseña
    // Por ejemplo, redirigir a una página de recuperación o mostrar un modal
    alert("Función de recuperar contraseña - Próximamente");
    // O redirigir a una página de recuperación:
    // window.location.href = "/recuperar-contrasena";
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center min-vh-100 bg-primary">
      <div
        className="login-card bg-dark text-light p-4 rounded-3 shadow-lg"
        style={{ width: "400px" }}
      >
        <div className="brand-header text-center mb-4">
          <i className="fas fa-dumbbell fa-2x text-info mb-3"></i>
          <h2>SuplementosPro</h2>
          <p className="text-muted">Inicia sesión en tu cuenta</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

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
          <Link to="/registro" className="btn btn-outline-success w-100">
            <i className="fas fa-user-plus me-2"></i> Crear Cuenta
          </Link>
        </form>

        <div className="login-footer text-center mt-4 pt-3 border-top">
          <p className="text-muted small">
            ¿Necesitas ayuda?{" "}
            <a href="#" className="text-info text-decoration-none">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
