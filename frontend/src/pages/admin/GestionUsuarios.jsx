import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { API_CONFIG, getAuthHeadersJSON, buildUrl } from "../../config/api";
import "../../styles/admin/GestionUsuarios.css";

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Remover cualquier imagen de fondo del body
    document.body.style.backgroundImage = "none";
    document.body.style.background =
      "linear-gradient(135deg, #aaaaaaff, #b3b3b3ff)";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.minHeight = "100vh";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    const obtenerUsuario = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setCargandoUsuario(false);
          navigate("/login");
          return;
        }

        // ✅ URL usando la configuración centralizada
        const res = await fetch(buildUrl(API_CONFIG.ENDPOINTS.USUARIO_ACTUAL), {
          headers: getAuthHeadersJSON(),
        });

        if (res.ok) {
          const data = await res.json();
          setUsuario(data);
          if (!data.is_admin) {
            setMensaje("❌ No tienes permisos para acceder a esta página");
            setTimeout(() => navigate("/"), 2000);
          }
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_data");
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching usuario:", err);
        setMensaje("⚠️ Error de conexión al cargar usuario");
      } finally {
        setCargandoUsuario(false);
      }
    };

    const cargarUsuarios = async () => {
      try {
        const token = localStorage.getItem("access_token");

        // ✅ URL usando la configuración centralizada
        const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.USUARIOS), {
          headers: getAuthHeadersJSON(),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Usuarios cargados:", data);
          setUsuarios(data);
        } else if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setMensaje(
            "❌ Sesión expirada. Por favor, inicie sesión nuevamente."
          );
          setTimeout(() => navigate("/login"), 2000);
        } else if (response.status === 403) {
          setMensaje("❌ No tienes permisos para ver los usuarios.");
        } else {
          console.error("Error cargando usuarios:", response.status);
          setMensaje("❌ Error al cargar los usuarios");
        }
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        setMensaje("⚠️ Error de conexión al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };

    obtenerUsuario();
    if (usuario?.is_admin) {
      cargarUsuarios();
    }
  }, [navigate, usuario?.is_admin]);

  const handleEliminarUsuario = async (usuarioId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      // ✅ URL usando la configuración centralizada
      const response = await fetch(
        buildUrl(`${API_CONFIG.ENDPOINTS.USUARIOS}${usuarioId}/`),
        {
          method: "DELETE",
          headers: getAuthHeadersJSON(),
        }
      );

      if (response.ok) {
        setUsuarios(usuarios.filter((u) => u.id !== usuarioId));
        setMensaje("✅ Usuario eliminado exitosamente");
        setTimeout(() => setMensaje(""), 3000);
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setMensaje("❌ Sesión expirada. Por favor, inicie sesión nuevamente.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (response.status === 403) {
        setMensaje("❌ No tienes permisos para eliminar usuarios.");
      } else if (response.status === 404) {
        setMensaje("❌ El usuario no existe o ya fue eliminado.");
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        setMensaje(
          `❌ Error al eliminar usuario: ${
            errorData.detail || "Error desconocido"
          }`
        );
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      setMensaje("⚠️ Error de conexión al eliminar usuario");
    }
  };

  const formatearNombreCompleto = (usuario) => {
    const nombre = usuario.nombre || "";
    const apellidoPaterno = usuario.apellido_paterno || "";
    const apellidoMaterno = usuario.apellido_materno || "";

    if (nombre && apellidoPaterno && apellidoMaterno) {
      return `${nombre} ${apellidoPaterno} ${apellidoMaterno}`;
    } else if (nombre && apellidoPaterno) {
      return `${nombre} ${apellidoPaterno}`;
    }
    return nombre || "Sin nombre";
  };

  const formatearRut = (rut) => {
    if (!rut) return "-";
    // Limpiar el RUT y formatear
    const rutLimpio = rut.replace(/[^\dkK]/g, "");
    if (rutLimpio.length < 2) return rut;

    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toUpperCase();

    // Formatear con puntos
    let rutFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${rutFormateado}-${dv}`;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-ES");
  };

  const formatearTelefono = (telefono) => {
    if (!telefono) return "-";
    // Formato chileno: +56 9 XXXX XXXX
    const telefonoLimpio = telefono.replace(/\D/g, "");
    if (telefonoLimpio.length === 9) {
      return `+56 ${telefonoLimpio.slice(0, 1)} ${telefonoLimpio.slice(
        1,
        5
      )} ${telefonoLimpio.slice(5)}`;
    }
    return telefono;
  };

  if (cargandoUsuario) {
    return (
      <div className="container py-5">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "50vh" }}
        >
          <div className="spinner-border text-accent" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="ms-3 mb-0 text-light">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!usuario || !usuario.is_admin) {
    return (
      <div className="container py-5">
        <Navbar />
        <div className="alert alert-danger text-center mt-5">
          <h4>Acceso Denegado</h4>
          <p>No tienes permisos para acceder a esta página.</p>
          {mensaje && <p className="text-muted">{mensaje}</p>}
          <Link to="/" className="btn btn-primary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fondo-imagen gestion-usuarios-page">
      <Navbar />

      <div className="container py-5 gestion-usuarios-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-5 fw-bold text-light">
            <i className="fas fa-users-cog me-2"></i>Gestión de Usuarios
          </h1>
          <Link to="/admin/agregar-usuario" className="btn btn-accent">
            <i className="fas fa-user-plus me-2"></i>Agregar Usuario
          </Link>
        </div>

        {mensaje && (
          <div
            className={`alert ${
              mensaje.includes("✅")
                ? "alert-success"
                : mensaje.includes("❌")
                ? "alert-danger"
                : "alert-warning"
            } alert-dismissible fade show`}
          >
            <i
              className={`fas ${
                mensaje.includes("✅")
                  ? "fa-check-circle"
                  : mensaje.includes("❌")
                  ? "fa-exclamation-circle"
                  : "fa-exclamation-triangle"
              } me-2`}
            ></i>
            {mensaje}
            <button
              type="button"
              className="btn-close"
              onClick={() => setMensaje("")}
            ></button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-accent" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-light">Cargando usuarios...</p>
          </div>
        ) : usuarios.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover table-dark crud-table">
              <thead className="table-accent">
                <tr>
                  <th scope="col" className="text-center">
                    ID
                  </th>
                  <th scope="col" className="text-center">
                    RUT
                  </th>
                  <th scope="col">Nombre Completo</th>
                  <th scope="col">Email</th>
                  <th scope="col" className="text-center">
                    Teléfono
                  </th>
                  <th scope="col" className="text-center">
                    Fecha Nac.
                  </th>
                  <th scope="col" className="text-center">
                    Tipo
                  </th>
                  <th scope="col" className="text-center">
                    Estado
                  </th>
                  <th scope="col" className="text-center" colSpan="2">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuarioItem) => (
                  <tr key={usuarioItem.id} className="crud-row">
                    <td className="align-middle text-center">
                      <span className="badge bg-secondary">
                        {usuarioItem.id}
                      </span>
                    </td>
                    <td className="align-middle text-center">
                      <code className="text-light">
                        {formatearRut(usuarioItem.rut)}
                      </code>
                    </td>
                    <td className="align-middle">
                      <div>
                        <strong className="d-block">
                          {formatearNombreCompleto(usuarioItem)}
                        </strong>
                        {usuarioItem.email && (
                          <small className="text-muted d-none d-md-block">
                            {usuarioItem.email}
                          </small>
                        )}
                      </div>
                    </td>
                    <td className="align-middle">
                      {usuarioItem.email ? (
                        <a
                          href={`mailto:${usuarioItem.email}`}
                          className="email-link text-truncate d-block"
                          style={{ maxWidth: "200px" }}
                          title={usuarioItem.email}
                        >
                          <i className="fas fa-envelope me-1"></i>
                          {usuarioItem.email}
                        </a>
                      ) : (
                        <span className="text-muted">
                          <i className="fas fa-envelope-slash me-1"></i>
                          Sin email
                        </span>
                      )}
                    </td>
                    <td className="align-middle text-center">
                      <small>{formatearTelefono(usuarioItem.telefono)}</small>
                    </td>
                    <td className="align-middle text-center">
                      <small>
                        {formatearFecha(usuarioItem.fecha_nacimiento)}
                      </small>
                    </td>
                    <td className="align-middle text-center">
                      {usuarioItem.is_admin ? (
                        <span className="badge bg-warning text-dark">
                          <i className="fas fa-crown me-1"></i>
                          Admin
                        </span>
                      ) : (
                        <span className="badge bg-info">
                          <i className="fas fa-user me-1"></i>
                          Cliente
                        </span>
                      )}
                    </td>
                    <td className="align-middle text-center">
                      {usuarioItem.is_active ? (
                        <span className="badge bg-success">
                          <i className="fas fa-check me-1"></i>
                          Activo
                        </span>
                      ) : (
                        <span className="badge bg-danger">
                          <i className="fas fa-times me-1"></i>
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="align-middle text-center">
                      <Link
                        to={`/admin/editar-usuario/${usuarioItem.id}`}
                        className="btn btn-action btn-edit"
                        title="Editar usuario"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                    </td>
                    <td className="align-middle text-center">
                      <div className="d-flex flex-column align-items-center">
                        <button
                          onClick={() => handleEliminarUsuario(usuarioItem.id)}
                          className="btn btn-action btn-delete"
                          title="Eliminar usuario"
                          disabled={usuarioItem.id === usuario.id}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                        {usuarioItem.id === usuario.id && (
                          <small className="text-warning mt-1 d-none d-md-block">
                            No puedes eliminarte
                          </small>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="fas fa-users-slash display-1 text-muted mb-4"></i>
            <h3 className="mt-3 text-light">No hay usuarios registrados</h3>
            <p className="text-muted mb-4">
              Comienza agregando el primer usuario
            </p>
            <Link to="/admin/agregar-usuario" className="btn btn-accent">
              <i className="fas fa-user-plus me-2"></i>Agregar Primer Usuario
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionUsuarios;
