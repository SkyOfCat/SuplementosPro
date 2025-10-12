import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/admin/EditarUsuario.css";

const EditarUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [formData, setFormData] = useState({
    rut: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    is_admin: false, // ✅ CORRECTO - es is_admin, no is_staff
    is_active: true,
  });
  const [mensaje, setMensaje] = useState("");

  // Cargar datos reales del usuario desde la API
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `http://localhost:8000/api/usuarios/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
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
            is_admin: datosUsuario.is_admin || false, // ✅ CORRECTO
            is_active:
              datosUsuario.is_active !== undefined
                ? datosUsuario.is_active
                : true,
          });
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
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("access_token");

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
        is_admin: formData.is_admin, // ✅ CORRECTO
        is_active: formData.is_active,
      };

      console.log("Enviando datos actualizados:", datosParaEnviar);

      const response = await fetch(
        `http://localhost:8000/api/usuarios/${id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        setMensaje(
          `❌ Error al actualizar usuario: ${JSON.stringify(errorData)}`
        );
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setMensaje("❌ Error de conexión al actualizar el usuario");
    }
  };

  const handleCancel = () => {
    navigate("/admin/usuarios");
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
      name: "is_admin", // ✅ CORRECTO - es is_admin
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
                      {field.type === "checkbox" ? (
                        <i className="fas fa-cog me-1"></i>
                      ) : (
                        <i className="fas fa-user me-1"></i>
                      )}
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
                <button type="submit" className="btn btn-submit">
                  <i className="fas fa-save me-2"></i>Actualizar Usuario
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-cancel"
                >
                  <i className="fas fa-times me-2"></i>Cancelar
                </button>
              </div>
            </form>

            {mensaje && (
              <div
                className={`alert ${
                  mensaje.includes("✅") ? "alert-success" : "alert-danger"
                } alert-dismissible fade show mt-3`}
              >
                {mensaje}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMensaje("")}
                ></button>
              </div>
            )}

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
