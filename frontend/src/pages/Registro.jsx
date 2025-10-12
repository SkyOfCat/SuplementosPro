import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación de RUT (formato básico)
    if (!formData.rut || !/^\d{7,8}-[\dkK]$/.test(formData.rut)) {
      newErrors.rut = "RUT inválido. Formato: 12345678-9";
    }

    // Validación de email
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validación de contraseña
    if (formData.password.length < 6) {
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
        rut: formData.rut,
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno,
        fecha_nacimiento: formData.fecha_nacimiento,
        telefono: formData.telefono,
        email: formData.email,
        direccion: formData.direccion,
        password: formData.password,
        is_admin: false, // Siempre False para usuarios normales
      };

      console.log("Enviando datos:", userData);

      // Llamada a la API de registro
      const response = await fetch("http://127.0.0.1:8000/api/registro/", {
        // Ajusta esta URL según tu backend
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Registro exitoso. Ahora puedes iniciar sesión.");
        navigate("/login"); // Redirigir al login
      } else {
        // Manejar errores del backend
        if (data.error) {
          setErrors({ general: data.error });
        } else if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: "Error en el registro. Intenta nuevamente." });
        }
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      setErrors({ general: "Error de conexión con el servidor" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="brand-header">
          <i className="fas fa-dumbbell"></i>
          <h2>SuplementosPro</h2>
          <p>Registro para Clientes</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Mostrar errores generales */}
          {errors.general && (
            <div className="alert alert-danger">{errors.general}</div>
          )}

          {/* Campos del formulario */}
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-id-card me-1"></i> RUT *
                </label>
                <input
                  type="text"
                  name="rut"
                  className="form-control"
                  placeholder="12345678-9"
                  value={formData.rut}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.rut && <div className="errorlist">{errors.rut}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-user me-1"></i> Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.nombre && (
                  <div className="errorlist">{errors.nombre}</div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-user me-1"></i> Apellido Paterno *
                </label>
                <input
                  type="text"
                  name="apellido_paterno"
                  className="form-control"
                  placeholder="Apellido paterno"
                  value={formData.apellido_paterno}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.apellido_paterno && (
                  <div className="errorlist">{errors.apellido_paterno}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-user me-1"></i> Apellido Materno *
                </label>
                <input
                  type="text"
                  name="apellido_materno"
                  className="form-control"
                  placeholder="Apellido materno"
                  value={formData.apellido_materno}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.apellido_materno && (
                  <div className="errorlist">{errors.apellido_materno}</div>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-calendar me-1"></i> Fecha Nacimiento *
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  className="form-control"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.fecha_nacimiento && (
                  <div className="errorlist">{errors.fecha_nacimiento}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-phone me-1"></i> Teléfono *
                </label>
                <input
                  type="text"
                  name="telefono"
                  className="form-control"
                  placeholder="+56 9 1234 5678"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.telefono && (
                  <div className="errorlist">{errors.telefono}</div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-envelope me-1"></i> Email *
            </label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {errors.email && <div className="errorlist">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              <i className="fas fa-home me-1"></i> Dirección
            </label>
            <input
              type="text"
              name="direccion"
              className="form-control"
              placeholder="Tu dirección"
              value={formData.direccion}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.direccion && (
              <div className="errorlist">{errors.direccion}</div>
            )}
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-lock me-1"></i> Contraseña *
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Crea una contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.password && (
                  <div className="errorlist">{errors.password}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-lock me-1"></i> Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  name="confirmar_password"
                  className="form-control"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmar_password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.confirmar_password && (
                  <div className="errorlist">{errors.confirmar_password}</div>
                )}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
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
                <i className="fas fa-user-plus me-1"></i> Registrarse
              </>
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>
            ¿Ya tienes una cuenta?
            <Link to="/login" className="login-link">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;
