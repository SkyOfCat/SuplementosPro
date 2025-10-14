import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG, getAuthHeadersFormData, buildUrl } from "../../config/api";
import "../../styles/admin/AgregarVitamina.css";

const AgregarVitamina = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
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
        if (!value.trim()) error = "El nombre de la vitamina es requerido";
        else if (value.trim().length < 2)
          error = "El nombre debe tener al menos 2 caracteres";
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
      case "imagen":
        if (!value) error = "La imagen del producto es obligatoria";
        break;
      case "imagen_nutricional":
        if (!value) error = "La imagen nutricional es obligatoria";
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
    const camposRequeridos = ["nombre", "precio", "stock", "fecha_vencimiento"];
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
      const fieldIsValid = validateField(key, formData[key]);
      if (!fieldIsValid) isValid = false;
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");
    setErrors({});

    // Validar token
    const token = localStorage.getItem("access_token");
    console.log("Token encontrado:", token ? "Sí" : "No");

    if (!token) {
      setMensaje("❌ Debes iniciar sesión para agregar productos");
      setLoading(false);
      setTimeout(() => navigate("/login"), 2000);
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

    // Agregar tipo fijo para vitamina
    data.append("tipo_producto", "Vitamina");
    data.append("tipo", "Vitamina");

    try {
      // ✅ URL usando la configuración centralizada
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.VITAMINAS), {
        method: "POST",
        headers: getAuthHeadersFormData(),
        body: data,
      });

      console.log("Status de respuesta:", response.status);

      if (response.ok) {
        setMensaje("✅ Vitamina agregada con éxito");
        setFormData({
          nombre: "",
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
        } else if (errorData.imagen) {
          setErrors((prev) => ({ ...prev, imagen: errorData.imagen[0] }));
          setMensaje("❌ Error en los datos del formulario");
        } else if (errorData.imagen_nutricional) {
          setErrors((prev) => ({
            ...prev,
            imagen_nutricional: errorData.imagen_nutricional[0],
          }));
          setMensaje("❌ Error en los datos del formulario");
        } else {
          setMensaje("❌ Error al agregar la vitamina. Revisa los campos.");
        }
      }
    } catch (error) {
      console.error("Error al agregar vitamina:", error);
      setMensaje("⚠️ Error de conexión. Intente nuevamente.");
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
                <i className="fas fa-capsules me-2"></i>Agregar Nueva Vitamina
              </h1>
              <p className="text-light mb-0">
                Complete el formulario para agregar una nueva vitamina al
                inventario
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
                  {/* Nombre de la Vitamina */}
                  <div className="col-md-6 mb-4">
                    <label htmlFor="id_nombre" className="form-label fw-bold">
                      <i className="fas fa-tag me-2"></i>Nombre de la Vitamina *
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
                      placeholder="Ej: Vitamina C 1000mg 120 tabletas"
                      required
                      disabled={loading}
                    />
                    {hasError("nombre") && (
                      <div className="invalid-feedback">{errors.nombre}</div>
                    )}
                    <div className="form-text">
                      Ingrese el nombre comercial de la vitamina
                    </div>
                  </div>

                  {/* Tipo (fijo como Vitamina) */}
                  <div className="col-md-6 mb-4">
                    <label htmlFor="id_tipo" className="form-label fw-bold">
                      <i className="fas fa-heartbeat me-2"></i>Tipo
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="id_tipo"
                      value="Vitamina"
                      disabled
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "rgba(255, 255, 255, 0.6)",
                      }}
                    />
                    <div className="form-text">
                      Tipo de producto (automático)
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

                {/* SECCIÓN DE IMÁGENES OBLIGATORIAS */}
                <div className="row">
                  {/* Imagen del Producto - OBLIGATORIA */}
                  <div className="col-md-6 mb-4">
                    <div className="image-upload-card required">
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
                        onBlur={handleBlur}
                        accept="image/*"
                        required
                        disabled={loading}
                      />
                      {hasError("imagen") && (
                        <div className="invalid-feedback">{errors.imagen}</div>
                      )}
                      <div className="form-text">
                        Imagen principal de la vitamina (obligatoria)
                      </div>

                      {/* Vista previa de la imagen del producto */}
                      {imagePreview && (
                        <div className="mt-3 text-center">
                          <p className="small fw-bold mb-2">
                            Vista Previa Producto:
                          </p>
                          <img
                            src={imagePreview}
                            className="img-thumbnail preview-image"
                            alt="Vista previa de la vitamina"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Imagen Nutricional - OBLIGATORIA */}
                  <div className="col-md-6 mb-4">
                    <div className="image-upload-card required">
                      <label
                        htmlFor="id_imagen_nutricional"
                        className="form-label fw-bold"
                      >
                        <i className="fas fa-chart-bar me-2"></i>Imagen
                        Nutricional *
                      </label>
                      <input
                        type="file"
                        className={`form-control form-control-lg ${
                          hasError("imagen_nutricional") ? "is-invalid" : ""
                        }`}
                        id="id_imagen_nutricional"
                        name="imagen_nutricional"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        accept="image/*"
                        required
                        disabled={loading}
                      />
                      {hasError("imagen_nutricional") && (
                        <div className="invalid-feedback">
                          {errors.imagen_nutricional}
                        </div>
                      )}
                      <div className="form-text">
                        Tabla de información nutricional (obligatoria)
                      </div>

                      {/* Vista previa de la imagen nutricional */}
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
                            <i className="fas fa-save me-2"></i>Guardar Vitamina
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

export default AgregarVitamina;
