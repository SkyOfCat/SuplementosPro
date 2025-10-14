import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG, getAuthHeadersJSON, buildUrl } from "../../config/api";
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const camposRequeridos = [
      "rut",
      "nombre",
      "apellido_paterno",
      "fecha_nacimiento",
      "telefono",
      "email",
      "password",
    ];

    camposRequeridos.forEach((campo) => {
      if (!formData[campo].trim()) {
        newErrors[campo] = "Este campo es requerido";
      }
    });

    // Validación específica de email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El formato del email no es válido";
    }

    // Validación específica de contraseña
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    // Validación específica de RUT
    if (formData.rut && !/^[0-9]+-[0-9kK]{1}$/.test(formData.rut)) {
      newErrors.rut = "El formato del RUT no es válido (ej: 12345678-9)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    setErrors({});

    // Validar token
    const token = localStorage.getItem("access_token");
    if (!token) {
      setMensaje("❌ Debes iniciar sesión para agregar usuarios");
      setLoading(false);
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // Validar formulario
    if (!validateForm()) {
      setMensaje("❌ Por favor corrige los errores en el formulario");
      setLoading(false);
      return;
    }

    try {
      // Preparar datos para enviar
      const datosParaEnviar = {
        rut: formData.rut.trim(),
        nombre: formData.nombre.trim(),
        apellido_paterno: formData.apellido_paterno.trim(),
        apellido_materno: formData.apellido_materno.trim(),
        fecha_nacimiento: formData.fecha_nacimiento,
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        direccion: formData.direccion.trim(),
        password: formData.password,
        is_admin: formData.is_admin,
        is_active: formData.is_active,
      };

      console.log("Enviando datos del usuario:", datosParaEnviar);

      // ✅ URL usando la configuración centralizada
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.USUARIOS), {
        method: "POST",
        headers: getAuthHeadersJSON(),
        body: JSON.stringify(datosParaEnviar),
      });

      console.log("Response status:", response.status);

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
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setMensaje("❌ Sesión expirada. Por favor, inicie sesión nuevamente.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (response.status === 403) {
        setMensaje("❌ No tienes permisos de administrador para esta acción.");
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);

        // Manejar errores específicos del backend
        if (errorData.detail) {
          setMensaje(`❌ ${errorData.detail}`);
        } else if (errorData.non_field_errors) {
          setMensaje(`❌ ${errorData.non_field_errors.join(", ")}`);
        } else if (errorData.rut) {
          setErrors((prev) => ({ ...prev, rut: errorData.rut[0] }));
          setMensaje("❌ Error en los datos del formulario");
        } else if (errorData.email) {
          setErrors((prev) => ({ ...prev, email: errorData.email[0] }));
          setMensaje("❌ Error en los datos del formulario");
        } else if (errorData.password) {
          setErrors((prev) => ({ ...prev, password: errorData.password[0] }));
          setMensaje("❌ Error en los datos del formulario");
        } else {
          setMensaje("❌ Error al agregar el usuario. Revisa los campos.");
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setMensaje("⚠️ Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "¿Está seguro de que desea cancelar? Los datos no guardados se perderán."
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
      password: "fas fa-lock",
      is_admin: "fas fa-cog",
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
              {/* Mensaje general */}
              {mensaje && (
                <div
                  className={`alert ${
                    mensaje.includes("éxito") || mensaje.includes("✅")
                      ? "alert-success"
                      : "alert-danger"
                  }`}
                >
                  <i
                    className={`fas ${
                      mensaje.includes("éxito") || mensaje.includes("✅")
                        ? "fa-check-circle"
                        : "fa-exclamation-circle"
                    } me-2`}
                  ></i>
                  {mensaje}
                </div>
              )}

              <div className="form-grid">
                {formFields.map((field, index) => (
                  <div
                    key={field.name}
                    className={`form-group ${
                      field.type === "checkbox" ? "checkbox-group" : ""
                    } ${index >= formFields.length - 2 ? "full-width" : ""} ${
                      field.required ? "required" : ""
                    }`}
                  >
                    <label htmlFor={field.name} className="form-label">
                      <i className={`${getFieldIcon(field.name)} me-1`}></i>
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
                        className={`form-control ${
                          errors[field.name] ? "is-invalid" : ""
                        }`}
                        required={field.required}
                        placeholder={field.placeholder}
                        minLength={field.name === "password" ? 6 : undefined}
                        disabled={loading}
                      />
                    )}

                    {errors[field.name] && (
                      <div className="invalid-feedback d-block">
                        {errors[field.name]}
                      </div>
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
                  disabled={loading}
                >
                  <i className="fas fa-times me-2"></i>Cancelar
                </button>
              </div>
            </form>

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
                  <li>
                    <small className="text-muted">
                      <i className="fas fa-envelope me-1"></i>
                      El email debe ser único en el sistema
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
