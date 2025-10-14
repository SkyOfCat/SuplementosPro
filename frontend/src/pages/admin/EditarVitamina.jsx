import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  API_CONFIG,
  getAuthHeadersFormData,
  getAuthHeadersJSON,
  buildUrl,
} from "../../config/api";
import "../../styles/admin/EditarVitamina.css";

const EditarVitamina = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    stock: "",
    fecha_vencimiento: "",
    imagen: null,
    imagen_nutricional: null,
  });

  const [currentImage, setCurrentImage] = useState("");
  const [currentImagenNutricional, setCurrentImagenNutricional] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imagenNutricionalPreview, setImagenNutricionalPreview] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [cargandoProducto, setCargandoProducto] = useState(true);

  useEffect(() => {
    cargarVitamina();
  }, [id]);

  const cargarVitamina = async () => {
    try {
      // ✅ URL usando la configuración centralizada
      const response = await fetch(
        buildUrl(`${API_CONFIG.ENDPOINTS.VITAMINAS}${id}/`),
        {
          headers: getAuthHeadersJSON(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Datos cargados de la vitamina:", data);

        setFormData({
          nombre: data.nombre || "",
          precio: data.precio || "",
          stock: data.stock || "",
          fecha_vencimiento: data.fecha_vencimiento || "",
          imagen: null,
          imagen_nutricional: null,
        });

        // Configurar imagen actual si existe
        if (data.imagen) {
          const imagenUrl = data.imagen.startsWith("http")
            ? data.imagen
            : `${API_CONFIG.BASE_URL}${data.imagen}`;
          setCurrentImage(imagenUrl);
        }

        // Configurar imagen nutricional actual si existe
        if (data.imagen_nutricional) {
          const imagenNutricionalUrl = data.imagen_nutricional.startsWith(
            "http"
          )
            ? data.imagen_nutricional
            : `${API_CONFIG.BASE_URL}${data.imagen_nutricional}`;
          setCurrentImagenNutricional(imagenNutricionalUrl);
        }
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setMensaje("❌ Sesión expirada. Por favor, inicie sesión nuevamente.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (response.status === 404) {
        setMensaje("❌ Vitamina no encontrada");
      } else {
        setMensaje("❌ Error al cargar la vitamina");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("⚠️ Error de conexión con el servidor.");
    } finally {
      setCargandoProducto(false);
    }
  };

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
          setImagenNutricionalPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagenNutricionalPreview("");
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
    setLoading(true);
    setMensaje("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      setMensaje("❌ Debe iniciar sesión para editar productos");
      setLoading(false);
      navigate("/login");
      return;
    }

    // Validación básica
    const camposRequeridos = ["nombre", "precio", "stock", "fecha_vencimiento"];
    const camposFaltantes = camposRequeridos.filter(
      (campo) => !formData[campo]
    );

    if (camposFaltantes.length > 0) {
      setMensaje("❌ Por favor completa todos los campos requeridos");
      setLoading(false);
      return;
    }

    // Crear objeto FormData para enviar imagen y texto
    const data = new FormData();
    data.append("nombre", formData.nombre.trim());
    data.append("precio", parseInt(formData.precio));
    data.append("stock", parseInt(formData.stock));
    data.append("fecha_vencimiento", formData.fecha_vencimiento);
    data.append("tipo_producto", "Vitamina");
    data.append("tipo", "Vitamina");

    if (formData.imagen) {
      data.append("imagen", formData.imagen);
    }

    if (formData.imagen_nutricional) {
      data.append("imagen_nutricional", formData.imagen_nutricional);
    }

    try {
      // ✅ URL usando la configuración centralizada
      const response = await fetch(
        buildUrl(`${API_CONFIG.ENDPOINTS.VITAMINAS}${id}/`),
        {
          method: "PUT",
          headers: getAuthHeadersFormData(),
          body: data,
        }
      );

      if (response.ok) {
        setMensaje("✅ Vitamina actualizada con éxito");
        setTimeout(() => navigate("/admin/productos"), 2000);
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setMensaje("❌ Sesión expirada. Por favor, inicie sesión nuevamente.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (response.status === 403) {
        setMensaje("❌ No tiene permisos de administrador para esta acción.");
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);

        // Manejar errores específicos del backend
        if (errorData.detail) {
          setMensaje(`❌ ${errorData.detail}`);
        } else if (errorData.non_field_errors) {
          setMensaje(`❌ ${errorData.non_field_errors.join(", ")}`);
        } else {
          setMensaje("❌ Error al actualizar la vitamina. Revisa los campos.");
        }
      }
    } catch (error) {
      console.error(error);
      setMensaje("⚠️ Error de conexión con el servidor.");
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
      navigate("/admin/productos");
    }
  };

  const getFieldIcon = (fieldName) => {
    const icons = {
      nombre: "fas fa-tag",
      precio: "fas fa-dollar-sign",
      stock: "fas fa-boxes",
      fecha_vencimiento: "fas fa-calendar-alt",
      imagen: "fas fa-image",
      imagen_nutricional: "fas fa-chart-bar",
    };
    return icons[fieldName] || "fas fa-edit";
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const renderFormField = (field) => {
    const {
      name,
      label,
      type = "text",
      required = false,
      helpText,
      min,
      step,
    } = field;

    return (
      <div className={`form-group ${required ? "required" : ""}`} key={name}>
        <label htmlFor={name} className="form-label">
          <i className={`${getFieldIcon(name)} me-1`}></i>
          {label}
        </label>

        {type === "file" ? (
          <input
            type="file"
            id={name}
            name={name}
            onChange={handleChange}
            className="form-control file-input"
            accept="image/*"
            disabled={loading}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className="form-control"
            placeholder={`Ingrese ${label.toLowerCase()}`}
            required={required}
            min={min}
            step={step}
            disabled={loading}
          />
        )}

        {helpText && <small className="form-help">{helpText}</small>}
      </div>
    );
  };

  const formFields = [
    {
      name: "nombre",
      label: "Nombre",
      required: true,
      helpText: "Nombre comercial de la vitamina",
    },
    {
      name: "precio",
      label: "Precio ($)",
      type: "number",
      required: true,
      min: "0",
      step: "100",
      helpText: "Precio en pesos chilenos",
    },
    {
      name: "stock",
      label: "Stock",
      type: "number",
      required: true,
      min: "0",
      helpText: "Cantidad disponible en inventario",
    },
    {
      name: "fecha_vencimiento",
      label: "Fecha de Vencimiento",
      type: "date",
      required: true,
      min: getMinDate(),
      helpText: "Fecha de caducidad del producto",
    },
    {
      name: "imagen",
      label: "Imagen del Producto",
      type: "file",
      helpText: "Formatos: JPG, PNG, WEBP (opcional)",
    },
    {
      name: "imagen_nutricional",
      label: "Imagen Nutricional",
      type: "file",
      helpText: "Tabla nutricional del producto (opcional)",
    },
  ];

  if (cargandoProducto) {
    return (
      <div className="container py-5">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "50vh" }}
        >
          <div className="spinner-border text-accent" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="form-card">
            <div className="form-header">
              <h2>
                <i className="fas fa-edit me-2"></i>Editar Vitamina
              </h2>
              <p className="text-muted">
                Modifique los campos que desee actualizar
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

            <form
              onSubmit={handleSubmit}
              className="product-form"
              encType="multipart/form-data"
            >
              <div className="form-grid">
                {formFields.map((field) => renderFormField(field))}
              </div>

              {/* Imagen actual */}
              {currentImage && (
                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="fas fa-image me-1"></i>Imagen Actual
                  </label>
                  <div className="current-image-container">
                    <img
                      src={currentImage}
                      alt="Imagen actual"
                      className="current-image"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <div
                      className="no-image-placeholder"
                      style={{ display: "none" }}
                    >
                      <i className="fas fa-image fa-3x text-muted"></i>
                      <p className="mt-2 text-muted">Error al cargar imagen</p>
                    </div>
                  </div>
                  <small className="form-help">
                    Esta es la imagen actual del producto
                  </small>
                </div>
              )}

              {/* Imagen nutricional actual */}
              {currentImagenNutricional && (
                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="fas fa-chart-bar me-1"></i>Imagen Nutricional
                    Actual
                  </label>
                  <div className="current-image-container">
                    <img
                      src={currentImagenNutricional}
                      alt="Información nutricional actual"
                      className="current-image"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <div
                      className="no-image-placeholder"
                      style={{ display: "none" }}
                    >
                      <i className="fas fa-chart-bar fa-3x text-muted"></i>
                      <p className="mt-2 text-muted">
                        Error al cargar imagen nutricional
                      </p>
                    </div>
                  </div>
                  <small className="form-help">
                    Esta es la imagen nutricional actual del producto
                  </small>
                </div>
              )}

              {/* Vista previa de nueva imagen */}
              {imagePreview && (
                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="fas fa-eye me-1"></i>Vista Previa Nueva Imagen
                  </label>
                  <div className="current-image-container">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="current-image"
                    />
                  </div>
                  <small className="form-help">
                    Vista previa de la nueva imagen seleccionada
                  </small>
                </div>
              )}

              {/* Vista previa de nueva imagen nutricional */}
              {imagenNutricionalPreview && (
                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="fas fa-eye me-1"></i>Vista Previa Nueva Imagen
                    Nutricional
                  </label>
                  <div className="current-image-container">
                    <img
                      src={imagenNutricionalPreview}
                      alt="Vista previa nutricional"
                      className="current-image"
                    />
                  </div>
                  <small className="form-help">
                    Vista previa de la nueva imagen nutricional seleccionada
                  </small>
                </div>
              )}

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
                      <i className="fas fa-save me-2"></i>Actualizar Vitamina
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarVitamina;
