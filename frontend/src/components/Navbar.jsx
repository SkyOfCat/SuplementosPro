import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

      const res = await fetch("http://localhost:8000/api/usuario/actual/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUsuario(data);
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setError("Error al cargar usuario");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setCargando(false);
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
        <Link className="navbar-brand" to="/">
          <i className="fas fa-dumbbell me-2"></i>SuplementosPro
        </Link>

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

            {/* MENÚ ADMIN */}
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
                <i className="fas fa-spinner fa-spin me-1"></i> Cargando...
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
                  <li>
                    <Link className="dropdown-item" to="/perfil">
                      <i className="fas fa-user me-2"></i>Mi Perfil
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/pedidos">
                      <i className="fas fa-shopping-bag me-2"></i>Mis Pedidos
                    </Link>
                  </li>
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
