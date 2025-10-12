import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin/AgregarUsuario.css";

const AgregarUsuario = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    rut: "",
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
    direccion: "",
    password: "",
    is_admin: false,
    is_active: true,
  });

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

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
        password: formData.password,
        is_admin: formData.is_admin,
        is_active: formData.is_active,
      };

      console.log("Enviando datos del usuario:", datosParaEnviar);

      const response = await fetch("http://localhost:8000/api/usuarios/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosParaEnviar),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Usuario creado:", data);
        setMensaje("✅ Usuario agregado con éxito");

        // Limpiar formulario después de enviar
        setFormData({
          rut: "",
          nombre: "",
          apellido_paterno: "",
          apellido_materno: "",
          fecha_nacimiento: "",
          telefono: "",
          email: "",
          direccion: "",
          password: "",
          is_admin: false,
          is_active: true,
        });

        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate("/admin/usuarios");
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        setMensaje(`❌ Error al agregar usuario: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setMensaje("❌ Error de conexión al agregar el usuario");
    } finally {
      setCargando(false);
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
      helpText: "RUT del usuario (formato: 12345678-9)",
      placeholder: "Ej: 12345678-9",
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
      required: true,
      helpText: "Número de teléfono",
      placeholder: "Ej: +56912345678",
    },
    {
      name: "email",
      label: "Correo Electrónico",
      type: "email",
      required: true,
      helpText: "Correo electrónico",
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
      name: "password",
      label: "Contraseña",
      type: "password",
      required: true,
      helpText: "Contraseña para el usuario (mínimo 6 caracteres)",
      placeholder: "Ingrese la contraseña",
    },
    {
      name: "is_admin",
      label: "Es Administrador",
      type: "checkbox",
      required: false,
      helpText: "¿El usuario tendrá permisos de administrador?",
    },
    {
      name: "is_active",
      label: "Usuario Activo",
      type: "checkbox",
      required: false,
      helpText: "¿El usuario estará activo en el sistema?",
    },
  ];

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="form-card">
            <div className="form-header">
              <h2>
                <i className="fas fa-user-plus me-2"></i>Agregar Nuevo Usuario
              </h2>
              <p className="text-muted">
                Complete los datos para registrar un nuevo usuario en el sistema
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
                      ) : field.name === "password" ? (
                        <i className="fas fa-lock me-1"></i>
                      ) : (
                        <i className="fas fa-user me-1"></i>
                      )}
                      {field.label}
                      {field.required && (
                        <span className="text-danger"> *</span>
                      )}
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
                        minLength={field.name === "password" ? 6 : undefined}
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
                  disabled={cargando}
                >
                  {cargando ? (
                    <>
                      <div
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      >
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      Creando Usuario...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>Crear Usuario
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-cancel"
                  disabled={cargando}
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
                  disabled={cargando}
                ></button>
              </div>
            )}

            {/* Información de campos obligatorios */}
            <div className="card mt-4 bg-light">
              <div className="card-body">
                <h6 className="card-title">
                  <i className="fas fa-info-circle me-2"></i>Información
                  Importante
                </h6>
                <ul className="list-unstyled mb-0">
                  <li>
                    <small className="text-muted">
                      <i className="fas fa-asterisk text-danger me-1"></i>
                      Los campos marcados con asterisco (*) son obligatorios
                    </small>
                  </li>
                  <li>
                    <small className="text-muted">
                      <i className="fas fa-shield-alt me-1"></i>
                      La contraseña debe tener al menos 6 caracteres
                    </small>
                  </li>
                  <li>
                    <small className="text-muted">
                      <i className="fas fa-id-card me-1"></i>
                      El RUT debe ser único en el sistema
                    </small>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarUsuario;
