import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_CONFIG, getAuthHeadersJSON, buildUrl } from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";

function PerfilCliente() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [esAdmin, setEsAdmin] = useState(false); // ✅ Nuevo estado para controlar si es admin
  const navigate = useNavigate();

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        buildUrl(API_CONFIG.ENDPOINTS.USUARIO_ACTUAL),
        {
          headers: getAuthHeadersJSON(),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // ✅ LÓGICA DE RESTRICCIÓN:
        if (data.is_admin) {
          setEsAdmin(true); // Marcamos que es admin
          setUsuario(null); // No cargamos datos de perfil
        } else {
          setUsuario(data); // Es cliente, cargamos datos
        }
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
      } else {
        setError("No se pudo cargar la información del perfil.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión al cargar el perfil.");
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "No especificada";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
  };

  if (cargando) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  // ✅ VISTA PARA ADMINISTRADORES (ACCESO DENEGADO)
  if (esAdmin) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow-sm text-center p-5">
                <div className="mb-4">
                  <i className="fas fa-user-shield fa-5x text-warning"></i>
                </div>
                <h2 className="text-dark mb-3">Vista de Cliente Restringida</h2>
                <p className="text-muted mb-4">
                  Hola Administrador. Esta vista ("Mi Perfil") está diseñada
                  exclusivamente para clientes de la tienda.
                  <br />
                  Para gestionar tu cuenta o la tienda, por favor utiliza el
                  panel de administración.
                </p>
                <div className="d-grid gap-2 col-8 mx-auto">
                  <Link to="/admin/usuarios" className="btn btn-primary">
                    <i className="fas fa-cogs me-2"></i>Ir al Panel Admin
                  </Link>
                  <Link to="/" className="btn btn-outline-secondary">
                    <i className="fas fa-home me-2"></i>Volver al Inicio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <div className="mt-3">
              <Link to="/" className="btn btn-outline-danger">
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ VISTA NORMAL (SOLO SI HAY USUARIO Y NO ES ADMIN)
  if (usuario) {
    return (
      <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
        <Navbar />

        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow-sm border-0 rounded-3">
                {/* Encabezado */}
                <div
                  className="card-header bg-dark text-white p-4 text-center rounded-top-3" // Cambié a bg-dark para coincidir con tu imagen
                >
                  <div className="mb-3">
                    <div
                      className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{ width: "100px", height: "100px" }}
                    >
                      <i className="fas fa-user fa-4x text-dark"></i>
                    </div>
                  </div>
                  <h2 className="mb-1">
                    {usuario.nombre} {usuario.apellido_paterno}
                  </h2>
                  <p className="mb-0 opacity-75">{usuario.email}</p>
                </div>

                <div className="card-body p-4">
                  <h4 className="mb-4 border-bottom pb-2 text-primary">
                    <i className="fas fa-id-card me-2"></i>Información Personal
                  </h4>

                  <div className="row g-4 mb-4">
                    {/* RUT */}
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <div className="bg-light p-3 rounded me-3">
                          <i className="fas fa-fingerprint text-primary fa-lg"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">RUT</small>
                          {/* ✅ AGREGADO: text-dark */}
                          <span className="fw-bold text-dark">
                            {usuario.rut}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fecha de Nacimiento */}
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <div className="bg-light p-3 rounded me-3">
                          <i className="fas fa-birthday-cake text-primary fa-lg"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">
                            Fecha de Nacimiento
                          </small>
                          {/* ✅ AGREGADO: text-dark */}
                          <span className="fw-bold text-dark">
                            {formatearFecha(usuario.fecha_nacimiento)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Nombre Completo */}
                    <div className="col-12">
                      <div className="d-flex align-items-start">
                        <div className="bg-light p-3 rounded me-3">
                          <i className="fas fa-user-tag text-primary fa-lg"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">
                            Nombre Completo
                          </small>
                          {/* ✅ AGREGADO: text-dark */}
                          <span className="fw-bold text-dark">
                            {usuario.nombre} {usuario.apellido_paterno}{" "}
                            {usuario.apellido_materno || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h4 className="mb-4 border-bottom pb-2 text-primary mt-5">
                    <i className="fas fa-address-book me-2"></i>Datos de
                    Contacto
                  </h4>

                  <div className="row g-4">
                    {/* Teléfono */}
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <div className="bg-light p-3 rounded me-3">
                          <i className="fas fa-phone-alt text-primary fa-lg"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">
                            Teléfono
                          </small>
                          {/* ✅ AGREGADO: text-dark */}
                          <span className="fw-bold text-dark">
                            {usuario.telefono || "No registrado"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dirección */}
                    <div className="col-md-6">
                      <div className="d-flex align-items-start">
                        <div className="bg-light p-3 rounded me-3">
                          <i className="fas fa-map-marker-alt text-primary fa-lg"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">
                            Dirección de Envío
                          </small>
                          {/* ✅ AGREGADO: text-dark */}
                          <span className="fw-bold text-dark">
                            {usuario.direccion || "No registrada"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-12">
                      <div className="d-flex align-items-start">
                        <div className="bg-light p-3 rounded me-3">
                          <i className="fas fa-envelope text-primary fa-lg"></i>
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">
                            Correo Electrónico
                          </small>
                          {/* ✅ AGREGADO: text-dark */}
                          <span className="fw-bold text-dark">
                            {usuario.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-light p-3 d-flex justify-content-between">
                  <Link to="/" className="btn btn-outline-secondary">
                    <i className="fas fa-arrow-left me-2"></i>Volver al Inicio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Retorno por defecto (por si acaso)
  return null;
}

export default PerfilCliente;
