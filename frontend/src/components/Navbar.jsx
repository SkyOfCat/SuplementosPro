import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_CONFIG, getAuthHeadersJSON, buildUrl } from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function Navbar() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerUsuario();
  }, []);

  const obtenerUsuario = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setCargando(false);
        return;
      }

      const res = await fetch(buildUrl(API_CONFIG.ENDPOINTS.USUARIO_ACTUAL), {
        headers: getAuthHeadersJSON(),
      });

      if (res.ok) {
        const data = await res.json();
        setUsuario(data);
      } else if (res.status === 401) {
        const nuevoToken = await refrescarToken();
        if (nuevoToken) {
          await obtenerUsuario();
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setError("Sesión expirada");
        }
      } else {
        setError("Error al cargar usuario");
      }
    } catch (err) {
      console.error("Error en Navbar:", err);
      setError("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  const refrescarToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        return null;
      }

      const response = await fetch(
        buildUrl(API_CONFIG.ENDPOINTS.TOKEN_REFRESH),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access);
        return data.access;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error al refrescar token:", error);
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUsuario(null);
    window.location.href = "/";
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark"
      style={{ backgroundColor: "rgba(41, 43, 44, 0.9)" }}
    >
      <div className="container">
        {/* --- INICIO DEL LOGO NUEVO --- */}
        <Link className="navbar-brand p-0" to="/">
          <svg
            width="auto"
            height="45" // Ajusta la altura aquí si lo ves muy grande o chico
            viewBox="0 0 320 60"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="SuplementosPro Logo"
            style={{ display: "block" }} // Asegura que no tenga márgenes extraños
          >
            {/* Texto SUPLEMENTOS (Gris claro/blanco para que se vea en tu navbar oscura) */}
            <text
              x="5"
              y="40"
              fontWeight="800"
              fontSize="28"
              fill="#f8f9fa" // Cambiado a blanco/gris claro para tu fondo oscuro
              style={{
                fontFamily: "'Montserrat', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "-2px",
              }}
            >
              SUPLEMENTOS
            </text>

            {/* Grupo PRO (Azul eléctrico y cursiva) */}
            <g transform="translate(215, 0)">
              {/* Texto PRO */}
              <text
                x="0"
                y="40"
                fontWeight="900"
                fontStyle="italic"
                fontSize="28"
                fill="#0d6efd" // Azul Bootstrap
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                PRO
              </text>
              {/* Elemento gráfico de rayo/subrayado debajo de PRO */}
              <path d="M 5,48 L 65,45 L 60,55 L 0,58 Z" fill="#0d6efd" />
            </g>
          </svg>
        </Link>
        {/* --- FIN DEL LOGO NUEVO --- */}

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {error && (
            <div
              className="alert alert-warning alert-dismissible fade show m-2"
              role="alert"
            >
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="fas fa-home me-1"></i> Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/nosotros">
                <i className="fas fa-users me-1"></i> ¿Quiénes Somos?
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/productos">
                <i className="fas fa-box me-1"></i> Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/carrito">
                <i className="fas fa-shopping-cart me-1"></i> Ver Carrito
              </Link>
            </li>

            {/* MENÚ ADMIN NAV PRINCIPAL */}
            {usuario && usuario.is_admin && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="fas fa-cog me-1"></i> Administración
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/admin/usuarios">
                      <i className="fas fa-user-cog me-2"></i>CRUD Usuarios
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/productos">
                      <i className="fas fa-cogs me-2"></i>CRUD Productos
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {cargando ? (
              <div className="text-light me-3">
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
                  <span className="visually-hidden">Cargando...</span>
                </div>
                Cargando...
              </div>
            ) : usuario ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="fas fa-user-circle me-1"></i>
                  {usuario.nombre || usuario.email}
                  {usuario.is_admin && (
                    <span className="badge bg-warning ms-2">Admin</span>
                  )}
                </button>
                <ul className="dropdown-menu">
                  {/* MODIFICACIÓN AQUÍ: Solo se muestran si NO es admin */}
                  {!usuario.is_admin && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/perfil-cliente">
                          <i className="fas fa-user me-2"></i>Mi Perfil
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/mis-compras">
                          <i className="fas fa-shopping-bag me-2"></i>Mis
                          Pedidos
                        </Link>
                      </li>
                    </>
                  )}

                  {usuario.is_admin && (
                    <>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <Link
                          className="dropdown-item text-warning"
                          to="/admin/usuarios"
                        >
                          <i className="fas fa-user-cog me-2"></i>Gestión de
                          Usuarios
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item text-warning"
                          to="/admin/productos"
                        >
                          <i className="fas fa-cogs me-2"></i>Gestión de
                          Productos
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/login">
                <button className="btn btn-info">
                  <i className="fas fa-sign-in-alt me-1"></i> Iniciar Sesión
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
