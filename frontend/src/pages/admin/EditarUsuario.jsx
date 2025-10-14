import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  API_CONFIG,
  getAuthHeadersJSON,
  buildUrl,
  handleResponse,
} from "../../config/api";
import "../../styles/admin/EditarUsuario.css";

const EditarUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rut: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    is_admin: false,
    is_active: true,
  });
  const [mensaje, setMensaje] = useState("");

  // Cargar datos reales del usuario desde la API
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        // ✅ URL usando la configuración centralizada
        const response = await fetch(
          buildUrl(`${API_CONFIG.ENDPOINTS.USUARIOS}${id}/`),
          {
            headers: getAuthHeadersJSON(),
          }
        );

        if (response.ok) {
          const datosUsuario = await response.json();
          console.log("Datos del usuario cargados:", datosUsuario);

          setUsuario(datosUsuario);
          setFormData({
            rut: datosUsuario.rut || "",
            nombre: datosUsuario.nombre || "",
            apellido_paterno: datosUsuario.apellido_paterno || "",
            apellido_materno: datosUsuario.apellido_materno || "",
            fecha_nacimiento: datosUsuario.fecha_nacimiento || "",
            telefono: datosUsuario.telefono || "",
            email: datosUsuario.email || "",
            direccion: datosUsuario.direccion || "",
            is_admin: datosUsuario.is_admin || false,
            is_active:
              datosUsuario.is_active !== undefined
                ? datosUsuario.is_active
                : true,
          });
        } else if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setMensaje(
            "❌ Sesión expirada. Por favor, inicie sesión nuevamente."
          );
          setTimeout(() => navigate("/login"), 2000);
        } else if (response.status === 403) {
          setMensaje("❌ No tiene permisos para ver usuarios");
        } else if (response.status === 404) {
          setMensaje("❌ Usuario no encontrado");
        } else {
          console.error("Error al cargar usuario:", response.status);
          setMensaje("❌ Error al cargar los datos del usuario");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        setMensaje("❌ Error de conexión al cargar el usuario");
      } finally {
        setCargando(false);
      }
    };

    cargarUsuario();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setMensaje("❌ Debe iniciar sesión para editar usuarios");
        setLoading(false);
        navigate("/login");
        return;
      }

      // Validación básica
      const camposRequeridos = [
        "rut",
        "nombre",
        "apellido_paterno",
        "fecha_nacimiento",
      ];
      const camposFaltantes = camposRequeridos.filter(
        (campo) => !formData[campo]
      );

      if (camposFaltantes.length > 0) {
        setMensaje("❌ Por favor completa todos los campos requeridos");
        setLoading(false);
        return;
      }

      // Preparar datos para enviar
      const datosParaEnviar = {
        rut: formData.rut,
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno,
        fecha_nacimiento: formData.fecha_nacimiento,
        telefono: formData.telefono,
        email: formData.email,
        direccion: formData.direccion,
        is_admin: formData.is_admin,
        is_active: formData.is_active,
      };

      console.log("Enviando datos actualizados:", datosParaEnviar);

      // ✅ URL usando la configuración centralizada
      const response = await fetch(
        buildUrl(`${API_CONFIG.ENDPOINTS.USUARIOS}${id}/`),
        {
          method: "PUT",
          headers: getAuthHeadersJSON(),
          body: JSON.stringify(datosParaEnviar),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Usuario actualizado:", data);
        setMensaje("✅ Usuario actualizado con éxito");

        setTimeout(() => {
          navigate("/admin/usuarios");
        }, 2000);
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setMensaje("❌ Sesión expirada. Por favor, inicie sesión nuevamente.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (response.status === 403) {
        setMensaje("❌ No tiene permisos para editar usuarios");
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);

        // Manejar errores específicos del backend
        if (errorData.detail) {
          setMensaje(`❌ ${errorData.detail}`);
        } else if (errorData.non_field_errors) {
          setMensaje(`❌ ${errorData.non_field_errors.join(", ")}`);
        } else {
          // Mostrar errores de campos específicos
          const erroresCampos = Object.entries(errorData)
            .map(([campo, errores]) => `${campo}: ${errores.join(", ")}`)
            .join("; ");
          setMensaje(`❌ Errores en los campos: ${erroresCampos}`);
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setMensaje("❌ Error de conexión al actualizar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán."
      )
    ) {
      navigate("/admin/usuarios");
    }
  };

  const getFieldIcon = (fieldName) => {
    const icons = {
      rut: "fas fa-id-card",
      nombre: "fas fa-user",
      apellido_paterno: "fas fa-user-tag",
      apellido_materno: "fas fa-user-tag",
      fecha_nacimiento: "fas fa-calendar-alt",
      telefono: "fas fa-phone",
      email: "fas fa-envelope",
      direccion: "fas fa-map-marker-alt",
      is_admin: "fas fa-crown",
      is_active: "fas fa-user-check",
    };
    return icons[fieldName] || "fas fa-edit";
  };

  const formFields = [
    {
      name: "rut",
      label: "RUT",
      type: "text",
      required: true,
      helpText: "RUT del usuario (formato: 12.345.678-9)",
      placeholder: "Ej: 12.345.678-9",
    },
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      required: true,
      helpText: "Nombre del usuario",
      placeholder: "Ej: Juan",
    },
    {
      name: "apellido_paterno",
      label: "Apellido Paterno",
      type: "text",
      required: true,
      helpText: "Primer apellido del usuario",
      placeholder: "Ej: Pérez",
    },
    {
      name: "apellido_materno",
      label: "Apellido Materno",
      type: "text",
      required: false,
      helpText: "Segundo apellido del usuario (opcional)",
      placeholder: "Ej: González",
    },
    {
      name: "fecha_nacimiento",
      label: "Fecha de Nacimiento",
      type: "date",
      required: true,
      helpText: "Fecha de nacimiento del usuario",
    },
    {
      name: "telefono",
      label: "Teléfono",
      type: "tel",
      required: false,
      helpText: "Número de teléfono (opcional)",
      placeholder: "Ej: +56912345678",
    },
    {
      name: "email",
      label: "Correo Electrónico",
      type: "email",
      required: false,
      helpText: "Correo electrónico (opcional)",
      placeholder: "Ej: usuario@ejemplo.com",
    },
    {
      name: "direccion",
      label: "Dirección",
      type: "text",
      required: false,
      helpText: "Dirección del usuario (opcional)",
      placeholder: "Ej: Av. Principal 123",
    },
    {
      name: "is_admin",
      label: "Es Administrador",
      type: "checkbox",
      required: false,
      helpText: "¿El usuario tiene permisos de administrador?",
    },
    {
      name: "is_active",
      label: "Usuario Activo",
      type: "checkbox",
      required: false,
      helpText: "¿El usuario está activo en el sistema?",
    },
  ];

  if (cargando) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="form-card">
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando datos del usuario...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="form-card">
              <div className="alert alert-danger text-center">
                <h4>Usuario no encontrado</h4>
                <p>No se pudo cargar el usuario con ID: {id}</p>
                <button onClick={handleCancel} className="btn btn-primary">
                  Volver a gestión de usuarios
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="form-card">
            <div className="form-header">
              <h2>
                <i className="fas fa-user-edit me-2"></i>Modificar Usuario
              </h2>
              <p className="text-muted">
                Actualice los datos del usuario {usuario.nombre}{" "}
                {usuario.apellido_paterno}
              </p>
            </div>

            {/* Mensaje general */}
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

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {formFields.map((field, index) => (
                  <div
                    key={field.name}
                    className={`form-group ${
                      field.type === "checkbox" ? "checkbox-group" : ""
                    } ${index >= formFields.length - 2 ? "full-width" : ""}`}
                  >
                    <label htmlFor={field.name} className="form-label">
                      <i className={`${getFieldIcon(field.name)} me-1`}></i>
                      {field.label}
                    </label>

                    {field.type === "checkbox" ? (
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          id={field.name}
                          name={field.name}
                          checked={formData[field.name]}
                          onChange={handleChange}
                          className="form-checkbox"
                          disabled={loading}
                        />
                        <span
                          className={`checkbox-label ${
                            formData[field.name] ? "active" : ""
                          }`}
                        >
                          {formData[field.name] ? (
                            <>
                              <i className="fas fa-check me-1"></i>Activado
                            </>
                          ) : (
                            <>
                              <i className="fas fa-times me-1"></i>Desactivado
                            </>
                          )}
                        </span>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        id={field.name}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="form-control"
                        required={field.required}
                        placeholder={field.placeholder}
                        disabled={loading}
                      />
                    )}

                    {field.helpText && (
                      <span className="form-help">
                        <i className="fas fa-info-circle me-1"></i>
                        {field.helpText}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      >
                        <span className="visually-hidden">Guardando...</span>
                      </div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>Actualizar Usuario
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-cancel"
                  disabled={loading}
                >
                  <i className="fas fa-times me-2"></i>Cancelar
                </button>
              </div>
            </form>

            {/* Información adicional */}
            <div className="card mt-4 bg-light">
              <div className="card-body">
                <h6 className="card-title">
                  <i className="fas fa-info-circle me-2"></i>Información del
                  Usuario
                </h6>
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">ID:</small>
                    <p className="mb-1">
                      <strong>{usuario.id}</strong>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Tipo de usuario:</small>
                    <p className="mb-1">
                      <span
                        className={`badge ${
                          usuario.is_admin ? "bg-warning" : "bg-info"
                        }`}
                      >
                        {usuario.is_admin ? "Administrador" : "Cliente"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">Estado:</small>
                    <p className="mb-1">
                      <span
                        className={`badge ${
                          usuario.is_active ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {usuario.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Fecha de creación:</small>
                    <p className="mb-1">
                      <strong>
                        {usuario.fecha_creacion
                          ? new Date(usuario.fecha_creacion).toLocaleDateString(
                              "es-ES"
                            )
                          : "No disponible"}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarUsuario;
