import React from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG, getAuthHeadersFormData, buildUrl } from "../../config/api";
import "../../styles/admin/AgregarProteina.css";

const AgregarProteina = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    nombre: "",
    sabor: "",
    tipo: "",
    fecha_vencimiento: "",
    peso: "",
    precio: "",
    stock: "",
    imagen: null,
    imagen_nutricional: null,
  });

  const [mensaje, setMensaje] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState("");
  const [nutritionalImagePreview, setNutritionalImagePreview] =
    React.useState("");
  const [errors, setErrors] = React.useState({});

  // Validación de formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.sabor.trim()) newErrors.sabor = "El sabor es requerido";
    if (!formData.tipo) newErrors.tipo = "El tipo de proteína es requerido";
    if (!formData.fecha_vencimiento)
      newErrors.fecha_vencimiento = "La fecha de vencimiento es requerida";
    if (!formData.peso.trim()) newErrors.peso = "El peso es requerido";
    if (!formData.precio || formData.precio <= 0)
      newErrors.precio = "El precio debe ser mayor a 0";
    if (!formData.stock || formData.stock < 0)
      newErrors.stock = "El stock no puede ser negativo";
    if (!formData.imagen)
      newErrors.imagen = "La imagen del producto es requerida";
    if (!formData.imagen_nutricional)
      newErrors.imagen_nutricional = "La imagen nutricional es requerida";

    // Validación de fecha
    if (formData.fecha_vencimiento) {
      const selectedDate = new Date(formData.fecha_vencimiento);
      const today = new Date();
      if (selectedDate <= today) {
        newErrors.fecha_vencimiento = "La fecha de vencimiento debe ser futura";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "imagen" || name === "imagen_nutricional") {
      const file = files[0];

      // Validar tipo de archivo
      if (file && !file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Solo se permiten archivos de imagen",
        }));
        return;
      }

      // Validar tamaño (max 5MB)
      if (file && file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [name]: "La imagen no debe superar los 5MB",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Vista previa
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (name === "imagen") {
            setImagePreview(e.target.result);
          } else {
            setNutritionalImagePreview(e.target.result);
          }
        };
        reader.readAsDataURL(file);
      } else {
        if (name === "imagen") {
          setImagePreview("");
        } else {
          setNutritionalImagePreview("");
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMensaje("❌ Por favor, corrige los errores en el formulario");
      return;
    }

    setLoading(true);
    setMensaje("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      setMensaje("❌ Debes iniciar sesión para agregar productos");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const data = new FormData();

      // Agregar todos los campos al FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          data.append(key, value);
        }
      });

      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PROTEINAS), {
        method: "POST",
        headers: getAuthHeadersFormData(),
        body: data,
      });

      if (response.ok) {
        setMensaje("✅ Producto agregado con éxito");

        // Resetear formulario
        setFormData({
          nombre: "",
          sabor: "",
          tipo: "",
          fecha_vencimiento: "",
          peso: "",
          precio: "",
          stock: "",
          imagen: null,
          imagen_nutricional: null,
        });
        setImagePreview("");
        setNutritionalImagePreview("");
        setErrors({});

        setTimeout(() => navigate("/admin/productos"), 2000);
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);

        // Manejar errores del servidor
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setMensaje(
            "❌ Sesión expirada. Por favor, inicie sesión nuevamente."
          );
          setTimeout(() => navigate("/login"), 2000);
        } else if (response.status === 400) {
          // Mostrar errores de validación del servidor
          const serverErrors = {};
          Object.keys(errorData).forEach((key) => {
            serverErrors[key] = Array.isArray(errorData[key])
              ? errorData[key].join(", ")
              : errorData[key];
          });
          setErrors(serverErrors);
          setMensaje("❌ Error en los datos del formulario");
        } else {
          setMensaje(errorData.detail || "❌ Error al agregar el producto");
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setMensaje("⚠️ Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres cancelar? Los datos no guardados se perderán."
      )
    ) {
      navigate("/admin/productos");
    }
  };

  const getFieldIcon = (fieldName) => {
    const icons = {
      nombre: "fas fa-tag",
      sabor: "fas fa-ice-cream",
      tipo: "fas fa-cubes",
      fecha_vencimiento: "fas fa-calendar-alt",
      peso: "fas fa-weight-hanging",
      precio: "fas fa-dollar-sign",
      stock: "fas fa-boxes",
      imagen: "fas fa-image",
      imagen_nutricional: "fas fa-chart-bar",
    };
    return icons[fieldName] || "fas fa-edit";
  };

  const renderFormField = (field) => {
    const {
      name,
      label,
      type = "text",
      required = false,
      helpText,
      options,
    } = field;

    return (
      <div
        className={`form-group ${required ? "required" : ""} ${
          errors[name] ? "has-error" : ""
        }`}
        key={name}
      >
        <label htmlFor={name} className="form-label">
          <i className={`${getFieldIcon(name)} me-1`}></i>
          {label}
        </label>

        {type === "select" ? (
          <select
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`form-control ${errors[name] ? "is-invalid" : ""}`}
            required={required}
          >
            <option value="">Seleccionar {label.toLowerCase()}</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === "file" ? (
          <input
            type="file"
            id={name}
            name={name}
            onChange={handleChange}
            className={`form-control ${errors[name] ? "is-invalid" : ""}`}
            accept="image/*"
            required={required}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`form-control ${errors[name] ? "is-invalid" : ""}`}
            placeholder={`Ingrese ${label.toLowerCase()}`}
            required={required}
            min={
              type === "number" ? (name === "precio" ? "1" : "0") : undefined
            }
          />
        )}

        {helpText && <small className="form-help">{helpText}</small>}
        {errors[name] && (
          <div className="invalid-feedback d-block">{errors[name]}</div>
        )}
      </div>
    );
  };

  const formFields = [
    { name: "nombre", label: "Nombre", required: true },
    { name: "sabor", label: "Sabor", required: true },
    {
      name: "tipo",
      label: "Tipo de Proteína",
      type: "select",
      required: true,
      options: [
        { value: "Whey", label: "Whey Protein" },
        { value: "Isolate", label: "Isolate Protein" },
        { value: "Casein", label: "Casein Protein" },
      ],
    },
    {
      name: "fecha_vencimiento",
      label: "Fecha Vencimiento",
      type: "date",
      required: true,
    },
    {
      name: "peso",
      label: "Peso (kg o lbs)",
      type: "text",
      required: true,
      helpText: "Ejemplo: 2kg, 5lbs, 900g",
    },
    {
      name: "precio",
      label: "Precio ($)",
      type: "number",
      required: true,
      min: 1,
    },
    {
      name: "stock",
      label: "Stock",
      type: "number",
      required: true,
      min: 0,
    },
  ];

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="form-card">
            <div className="form-header">
              <h2>
                <i className="fas fa-plus-circle me-2"></i>Agregar Nueva
                Proteína
              </h2>
              <p className="text-muted">
                Complete todos los campos para agregar un nuevo producto
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="product-form"
              encType="multipart/form-data"
            >
              <div className="form-grid">
                {formFields.map((field) => renderFormField(field))}

                {/* Sección de imágenes con vistas previas */}
                <div className="row">
                  {/* Imagen del Producto */}
                  <div className="col-12 mb-4">
                    <div
                      className={`image-upload-card required ${
                        errors.imagen ? "has-error" : ""
                      }`}
                    >
                      <label htmlFor="imagen" className="form-label fw-bold">
                        <i className="fas fa-image me-2"></i>Imagen del Producto
                        *
                      </label>
                      <input
                        type="file"
                        id="imagen"
                        name="imagen"
                        onChange={handleChange}
                        className={`form-control ${
                          errors.imagen ? "is-invalid" : ""
                        }`}
                        accept="image/*"
                        required
                      />
                      <div className="form-text">
                        Imagen principal de la proteína (formatos: JPG, PNG,
                        WEBP. Máx: 5MB)
                      </div>
                      {errors.imagen && (
                        <div className="invalid-feedback d-block">
                          {errors.imagen}
                        </div>
                      )}

                      {/* Vista previa */}
                      {imagePreview && (
                        <div className="mt-3 text-center">
                          <p className="small fw-bold mb-2">
                            Vista Previa Producto:
                          </p>
                          <img
                            src={imagePreview}
                            className="img-thumbnail preview-image"
                            alt="Vista previa de la proteína"
                            style={{ maxHeight: "200px" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Imagen Nutricional */}
                  <div className="col-12 mb-4">
                    <div
                      className={`image-upload-card required ${
                        errors.imagen_nutricional ? "has-error" : ""
                      }`}
                    >
                      <label
                        htmlFor="imagen_nutricional"
                        className="form-label fw-bold"
                      >
                        <i className="fas fa-chart-bar me-2"></i>Imagen
                        Nutricional *
                      </label>
                      <input
                        type="file"
                        id="imagen_nutricional"
                        name="imagen_nutricional"
                        onChange={handleChange}
                        className={`form-control ${
                          errors.imagen_nutricional ? "is-invalid" : ""
                        }`}
                        accept="image/*"
                        required
                      />
                      <div className="form-text">
                        Tabla de información nutricional (formatos: JPG, PNG,
                        WEBP. Máx: 5MB)
                      </div>
                      {errors.imagen_nutricional && (
                        <div className="invalid-feedback d-block">
                          {errors.imagen_nutricional}
                        </div>
                      )}

                      {/* Vista previa */}
                      {nutritionalImagePreview && (
                        <div className="mt-3 text-center">
                          <p className="small fw-bold mb-2">
                            Vista Previa Nutricional:
                          </p>
                          <img
                            src={nutritionalImagePreview}
                            className="img-thumbnail preview-image"
                            alt="Vista previa información nutricional"
                            style={{ maxHeight: "200px" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-submit"
                  disabled={loading}
                >
                  <i className="fas fa-save me-2"></i>
                  {loading ? "Guardando..." : "Guardar Producto"}
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

            {mensaje && (
              <div
                className={`alert ${
                  mensaje.includes("éxito") || mensaje.includes("✅")
                    ? "alert-success"
                    : "alert-danger"
                } alert-dismissible fade show`}
              >
                <i
                  className={`fas ${
                    mensaje.includes("éxito") || mensaje.includes("✅")
                      ? "fa-check-circle"
                      : "fa-exclamation-circle"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarProteina;
