import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_CONFIG, buildUrl } from "../config/api";
import "../styles/Registro.css";

const Registro = () => {
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
    confirmar_password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Limpiar mensaje general
    if (mensaje) {
      setMensaje("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación de campos requeridos
    const camposRequeridos = [
      "rut",
      "nombre",
      "apellido_paterno",
      "fecha_nacimiento",
      "telefono",
      "email",
      "password",
      "confirmar_password",
    ];

    camposRequeridos.forEach((campo) => {
      if (!formData[campo].trim()) {
        newErrors[campo] = "Este campo es requerido";
      }
    });

    // Validación de RUT (formato básico)
    if (formData.rut && !/^\d{7,8}-[\dkK]$/.test(formData.rut)) {
      newErrors.rut = "RUT inválido. Formato: 12345678-9";
    }

    // Validación de email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validación de contraseña
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (formData.password !== formData.confirmar_password) {
      newErrors.confirmar_password = "Las contraseñas no coinciden";
    }

    // Validación de fecha (debe ser en el pasado)
    if (formData.fecha_nacimiento) {
      const birthDate = new Date(formData.fecha_nacimiento);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.fecha_nacimiento =
          "La fecha de nacimiento debe ser en el pasado";
      }

      // Validar que sea mayor de 18 años
      const edad = today.getFullYear() - birthDate.getFullYear();
      if (edad < 18) {
        newErrors.fecha_nacimiento =
          "Debes ser mayor de 18 años para registrarte";
      }
    }

    // Validación de teléfono (formato chileno básico)
    if (
      formData.telefono &&
      !/^(\+56|56)?\s?9\s?\d{4}\s?\d{4}$/.test(
        formData.telefono.replace(/\s/g, "")
      )
    ) {
      newErrors.telefono = "Teléfono inválido. Formato: +56 9 1234 5678";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMensaje("");

    // Validar formulario
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para enviar al backend
      const userData = {
        rut: formData.rut.trim(),
        nombre: formData.nombre.trim(),
        apellido_paterno: formData.apellido_paterno.trim(),
        apellido_materno: formData.apellido_materno.trim(),
        fecha_nacimiento: formData.fecha_nacimiento,
        telefono: formData.telefono.trim(),
        email: formData.email.trim().toLowerCase(),
        direccion: formData.direccion.trim(),
        password: formData.password,
        is_admin: false, // Siempre False para usuarios normales
        is_active: true, // Activo por defecto
      };

      console.log("Enviando datos de registro:", userData);

      // ✅ URL usando la configuración centralizada
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.REGISTRO), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje("✅ Registro exitoso. Ahora puedes iniciar sesión.");

        // Limpiar formulario
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
          confirmar_password: "",
        });

        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // Manejar errores del backend
        if (data.detail) {
          setMensaje(`❌ ${data.detail}`);
        } else if (data.error) {
          setMensaje(`❌ ${data.error}`);
        } else if (data.rut) {
          setErrors({ rut: data.rut[0] });
        } else if (data.email) {
          setErrors({ email: data.email[0] });
        } else if (data.password) {
          setErrors({ password: data.password[0] });
        } else if (data.non_field_errors) {
          setMensaje(`❌ ${data.non_field_errors.join(", ")}`);
        } else {
          setMensaje("❌ Error en el registro. Intenta nuevamente.");
        }
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      setMensaje("⚠️ Error de conexión con el servidor");
    } finally {
      setLoading(false);
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
      confirmar_password: "fas fa-lock",
    };
    return icons[fieldName] || "fas fa-edit";
  };

  const formFields = [
    {
      name: "rut",
      label: "RUT",
      type: "text",
      placeholder: "12345678-9",
      required: true,
      grid: "col-md-6",
    },
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      placeholder: "Tu nombre",
      required: true,
      grid: "col-md-6",
    },
    {
      name: "apellido_paterno",
      label: "Apellido Paterno",
      type: "text",
      placeholder: "Apellido paterno",
      required: true,
      grid: "col-md-6",
    },
    {
      name: "apellido_materno",
      label: "Apellido Materno",
      type: "text",
      placeholder: "Apellido materno",
      required: true,
      grid: "col-md-6",
    },
    {
      name: "fecha_nacimiento",
      label: "Fecha Nacimiento",
      type: "date",
      required: true,
      grid: "col-md-6",
    },
    {
      name: "telefono",
      label: "Teléfono",
      type: "text",
      placeholder: "+56 9 1234 5678",
      required: true,
      grid: "col-md-6",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "tu@email.com",
      required: true,
      grid: "col-12",
    },
    {
      name: "direccion",
      label: "Dirección",
      type: "text",
      placeholder: "Tu dirección",
      required: false,
      grid: "col-12",
    },
    {
      name: "password",
      label: "Contraseña",
      type: "password",
      placeholder: "Crea una contraseña",
      required: true,
      grid: "col-md-6",
    },
    {
      name: "confirmar_password",
      label: "Confirmar Contraseña",
      type: "password",
      placeholder: "Repite tu contraseña",
      required: true,
      grid: "col-md-6",
    },
  ];

  return (
    <div className="register-container d-flex justify-content-center align-items-center min-vh-100 bg-primary">
      <div
        className="register-card bg-dark text-light p-4 rounded-3 shadow-lg"
        style={{ width: "100%", maxWidth: "600px" }}
      >
        <div className="brand-header text-center mb-4">
          <i className="fas fa-dumbbell fa-2x text-info mb-3"></i>
          <h2 className="fw-bold">SuplementosPro</h2>
          <p className="text-muted">Crear Cuenta de Cliente</p>
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
          <div className="row">
            {formFields.map((field) => (
              <div key={field.name} className={field.grid}>
                <div className="form-group mb-3">
                  <label className="form-label">
                    <i className={`${getFieldIcon(field.name)} me-1`}></i>
                    {field.label}{" "}
                    {field.required && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    className={`form-control ${
                      errors[field.name] ? "is-invalid" : ""
                    }`}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    disabled={loading}
                    min={field.type === "date" ? "1900-01-01" : undefined}
                    max={
                      field.name === "fecha_nacimiento"
                        ? new Date().toISOString().split("T")[0]
                        : undefined
                    }
                  />
                  {errors[field.name] && (
                    <div className="invalid-feedback d-block">
                      {errors[field.name]}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-info w-100 fw-bold py-2"
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
                Registrando...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus me-2"></i> Crear Cuenta
              </>
            )}
          </button>
        </form>

        <div className="register-footer text-center mt-4 pt-3 border-top border-secondary">
          <p className="text-muted mb-2">
            ¿Ya tienes una cuenta?
            <Link
              to="/login"
              className="text-info text-decoration-none ms-1 fw-bold"
              onClick={(e) => loading && e.preventDefault()}
            >
              Inicia sesión aquí
            </Link>
          </p>
          <p className="text-muted small">
            <i className="fas fa-shield-alt me-1"></i>
            Tus datos están protegidos y seguros
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;
