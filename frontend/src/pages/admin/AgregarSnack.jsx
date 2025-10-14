import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG, getAuthHeadersFormData, buildUrl } from "../../config/api";
import "../../styles/admin/AgregarSnack.css";

const AgregarSnack = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    sabor: "",
    precio: "",
    stock: "",
    fecha_vencimiento: "",
    imagen: null,
    imagen_nutricional: null,
  });

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [nutritionalImagePreview, setNutritionalImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imagen") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        imagen: file,
      }));

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview("");
      }
    } else if (name === "imagen_nutricional") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        imagen_nutricional: file,
      }));

      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setNutritionalImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setNutritionalImagePreview("");
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "nombre":
        if (!value.trim()) error = "El nombre del snack es requerido";
        else if (value.trim().length < 2)
          error = "El nombre debe tener al menos 2 caracteres";
        break;
      case "sabor":
        if (!value.trim()) error = "El sabor es requerido";
        break;
      case "precio":
        if (!value || value <= 0) error = "El precio debe ser mayor a 0";
        else if (value > 1000000)
          error = "El precio no puede exceder $1.000.000";
        break;
      case "stock":
        if (!value || value < 0) error = "El stock no puede ser negativo";
        else if (value > 10000)
          error = "El stock no puede exceder 10,000 unidades";
        break;
      case "fecha_vencimiento":
        if (!value) error = "La fecha de vencimiento es requerida";
        else if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
          error = "La fecha no puede ser anterior a hoy";
        }
        break;
      default:
        break;
    }

    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }

    return !error;
  };

  const validateForm = () => {
    const camposRequeridos = [
      "nombre",
      "sabor",
      "precio",
      "stock",
      "fecha_vencimiento",
    ];
    const camposFaltantes = camposRequeridos.filter(
      (campo) => !formData[campo]
    );

    if (camposFaltantes.length > 0) {
      setMensaje("❌ Por favor completa todos los campos requeridos");
      return false;
    }

    if (!formData.imagen || !formData.imagen_nutricional) {
      setMensaje("❌ Ambas imágenes son requeridas");
      return false;
    }

    let isValid = true;
    Object.keys(formData).forEach((key) => {
      if (key !== "imagen" && key !== "imagen_nutricional") {
        const fieldIsValid = validateField(key, formData[key]);
        if (!fieldIsValid) isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    // Validar token
    const token = localStorage.getItem("access_token");
    if (!token) {
      setMensaje("❌ Debes iniciar sesión para agregar productos");
      setLoading(false);
      navigate("/login");
      return;
    }

    // Validar formulario
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    // Crear FormData
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        data.append(key, value);
      }
    });

    try {
      // ✅ URL usando la configuración centralizada
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.SNACKS), {
        method: "POST",
        headers: getAuthHeadersFormData(),
        body: data,
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        setMensaje("✅ Snack agregado con éxito");
        setFormData({
          nombre: "",
          sabor: "",
          precio: "",
          stock: "",
          fecha_vencimiento: "",
          imagen: null,
          imagen_nutricional: null,
        });
        setImagePreview("");
        setNutritionalImagePreview("");
        setErrors({});
        setTouched({});

        setTimeout(() => navigate("/admin/productos"), 2000);
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
        } else if (errorData.nombre) {
          setErrors((prev) => ({ ...prev, nombre: errorData.nombre[0] }));
          setMensaje("❌ Error en los datos del formulario");
        } else if (errorData.precio) {
          setErrors((prev) => ({ ...prev, precio: errorData.precio[0] }));
          setMensaje("❌ Error en los datos del formulario");
        } else {
          setMensaje("❌ Error al agregar el snack. Revisa los campos.");
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
      navigate("/admin/productos");
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const hasError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card form-card">
            <div className="card-header bg-dark text-center py-4">
              <h1 className="display-6 fw-bold text-accent">
                <i className="fas fa-plus-circle me-2"></i>Agregar Nuevo Snack
              </h1>
              <p className="text-light mb-0">
                Complete el formulario para agregar un nuevo snack al inventario
              </p>
            </div>

            <div className="card-body p-5">
              <form
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                className="needs-validation"
                noValidate
              >
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

                <div className="row">
                  {/* Nombre del Snack */}
                  <div className="col-md-6 mb-4">
                    <label htmlFor="id_nombre" className="form-label fw-bold">
                      <i className="fas fa-tag me-2"></i>Nombre del Snack *
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${
                        hasError("nombre") ? "is-invalid" : ""
                      }`}
                      id="id_nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: Pack 5 Barras 'Nombre de la Marca'"
                      required
                      disabled={loading}
                    />
                    {hasError("nombre") && (
                      <div className="invalid-feedback">{errors.nombre}</div>
                    )}
                    <div className="form-text">
                      Ingrese el nombre comercial del snack
                    </div>
                  </div>

                  {/* Sabor */}
                  <div className="col-md-6 mb-4">
                    <label htmlFor="id_sabor" className="form-label fw-bold">
                      <i className="fas fa-ice-cream me-2"></i>Sabor *
                    </label>
                    <input
                      type="text"
                      className={`form-control form-control-lg ${
                        hasError("sabor") ? "is-invalid" : ""
                      }`}
                      id="id_sabor"
                      name="sabor"
                      value={formData.sabor}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Ej: Chocolate, Vainilla, etc."
                      required
                      disabled={loading}
                    />
                    {hasError("sabor") && (
                      <div className="invalid-feedback">{errors.sabor}</div>
                    )}
                    <div className="form-text">
                      Especifique el sabor del snack
                    </div>
                  </div>
                </div>

                <div className="row">
                  {/* Precio */}
                  <div className="col-md-6 mb-4">
                    <label htmlFor="id_precio" className="form-label fw-bold">
                      <i className="fas fa-dollar-sign me-2"></i>Precio *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-accent text-dark">
                        $
                      </span>
                      <input
                        type="number"
                        className={`form-control form-control-lg ${
                          hasError("precio") ? "is-invalid" : ""
                        }`}
                        id="id_precio"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="0"
                        min="0"
                        step="100"
                        required
                        disabled={loading}
                      />
                    </div>
                    {hasError("precio") && (
                      <div className="invalid-feedback d-block">
                        {errors.precio}
                      </div>
                    )}
                    <div className="form-text">Precio en pesos chilenos</div>
                  </div>

                  {/* Stock */}
                  <div className="col-md-6 mb-4">
                    <label htmlFor="id_stock" className="form-label fw-bold">
                      <i className="fas fa-boxes me-2"></i>Stock *
                    </label>
                    <input
                      type="number"
                      className={`form-control form-control-lg ${
                        hasError("stock") ? "is-invalid" : ""
                      }`}
                      id="id_stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="0"
                      min="0"
                      required
                      disabled={loading}
                    />
                    {hasError("stock") && (
                      <div className="invalid-feedback">{errors.stock}</div>
                    )}
                    <div className="form-text">
                      Cantidad disponible en inventario
                    </div>
                  </div>
                </div>

                <div className="row">
                  {/* Fecha de Vencimiento */}
                  <div className="col-md-6 mb-4">
                    <label
                      htmlFor="id_fecha_vencimiento"
                      className="form-label fw-bold"
                    >
                      <i className="fas fa-calendar-alt me-2"></i>Fecha de
                      Vencimiento *
                    </label>
                    <input
                      type="date"
                      className={`form-control form-control-lg ${
                        hasError("fecha_vencimiento") ? "is-invalid" : ""
                      }`}
                      id="id_fecha_vencimiento"
                      name="fecha_vencimiento"
                      value={formData.fecha_vencimiento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={getMinDate()}
                      required
                      disabled={loading}
                    />
                    {hasError("fecha_vencimiento") && (
                      <div className="invalid-feedback">
                        {errors.fecha_vencimiento}
                      </div>
                    )}
                    <div className="form-text">
                      Fecha de caducidad del producto
                    </div>
                  </div>
                </div>

                {/* SECCIÓN: IMÁGENES */}
                <div className="row">
                  {/* Imagen del Producto */}
                  <div className="col-md-6 mb-4">
                    <div className="image-upload-card">
                      <label htmlFor="id_imagen" className="form-label fw-bold">
                        <i className="fas fa-image me-2"></i>Imagen del Producto
                        *
                      </label>
                      <input
                        type="file"
                        className={`form-control form-control-lg ${
                          hasError("imagen") ? "is-invalid" : ""
                        }`}
                        id="id_imagen"
                        name="imagen"
                        onChange={handleChange}
                        accept="image/*"
                        disabled={loading}
                        required
                      />
                      {hasError("imagen") && (
                        <div className="invalid-feedback">{errors.imagen}</div>
                      )}
                      <div className="form-text">
                        Imagen principal del snack
                      </div>

                      {imagePreview && (
                        <div className="mt-3 text-center">
                          <p className="small fw-bold mb-2">
                            Vista Previa Producto:
                          </p>
                          <img
                            src={imagePreview}
                            className="img-thumbnail preview-image"
                            alt="Vista previa del snack"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Imagen Nutricional */}
                  <div className="col-md-6 mb-4">
                    <div className="image-upload-card">
                      <label
                        htmlFor="id_imagen_nutricional"
                        className="form-label fw-bold"
                      >
                        <i className="fas fa-chart-bar me-2"></i>Imagen
                        Nutricional *
                      </label>
                      <input
                        type="file"
                        className="form-control form-control-lg"
                        id="id_imagen_nutricional"
                        name="imagen_nutricional"
                        onChange={handleChange}
                        accept="image/*"
                        disabled={loading}
                        required
                      />
                      <div className="form-text">
                        Tabla de información nutricional
                      </div>

                      {nutritionalImagePreview && (
                        <div className="mt-3 text-center">
                          <p className="small fw-bold mb-2">
                            Vista Previa Nutricional:
                          </p>
                          <img
                            src={nutritionalImagePreview}
                            className="img-thumbnail preview-image"
                            alt="Vista previa información nutricional"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="d-grid gap-3 d-md-flex justify-content-md-end">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="btn btn-secondary btn-lg me-md-2"
                        disabled={loading}
                      >
                        <i className="fas fa-arrow-left me-2"></i>Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-warning btn-lg"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>Guardar Snack
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarSnack;
