import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  API_CONFIG,
  getAuthHeadersFormData,
  getAuthHeadersJSON,
  buildUrl,
} from "../../config/api";
import "../../styles/admin/EditarCreatina.css";

const EditarCreatina = () => {
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
  const [currentImageNutricional, setCurrentImageNutricional] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageNutricionalPreview, setImageNutricionalPreview] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [cargandoProducto, setCargandoProducto] = useState(true);

  useEffect(() => {
    cargarCreatina();
  }, [id]);

  const cargarCreatina = async () => {
    try {
      // ✅ URL usando la configuración centralizada
      const response = await fetch(
        buildUrl(`${API_CONFIG.ENDPOINTS.CREATINAS}${id}/`),
        {
          headers: getAuthHeadersJSON(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFormData({
          nombre: data.nombre || "",
          precio: data.precio || "",
          stock: data.stock || "",
          fecha_vencimiento: data.fecha_vencimiento || "",
          imagen: null,
          imagen_nutricional: null,
        });

        if (data.imagen) {
          setCurrentImage(getImagenUrl(data.imagen));
        }

        if (data.imagen_nutricional) {
          setCurrentImageNutricional(getImagenUrl(data.imagen_nutricional));
        }
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setMensaje("❌ Sesión expirada. Por favor, inicie sesión nuevamente.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (response.status === 404) {
        setMensaje("❌ Creatina no encontrada");
      } else {
        setMensaje("❌ Error al cargar la creatina");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("⚠️ Error de conexión con el servidor.");
    } finally {
      setCargandoProducto(false);
    }
  };

  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return null;

    if (imagenPath.startsWith("http")) {
      return imagenPath;
    }

    if (imagenPath.startsWith("/")) {
      return `${API_CONFIG.BASE_URL}${imagenPath}`;
    }

    return `${API_CONFIG.BASE_URL}/media/${imagenPath}`;
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
          setImageNutricionalPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImageNutricionalPreview("");
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

    const token = localStorage.getItem("access_token");

    if (!token) {
      setMensaje("❌ Debe iniciar sesión para editar productos");
      setLoading(false);
      navigate("/login");
      return;
    }

    // Crear objeto FormData para enviar imagen y texto
    const data = new FormData();
    data.append("nombre", formData.nombre.trim());
    data.append("precio", parseFloat(formData.precio));
    data.append("stock", parseInt(formData.stock));
    data.append("fecha_vencimiento", formData.fecha_vencimiento);
    data.append("tipo_producto", "Creatina");
    data.append("tipo", "Creatina");

    if (formData.imagen) {
      data.append("imagen", formData.imagen);
    }

    if (formData.imagen_nutricional) {
      data.append("imagen_nutricional", formData.imagen_nutricional);
    }

    try {
      // ✅ URL usando la configuración centralizada
      const response = await fetch(
        buildUrl(`${API_CONFIG.ENDPOINTS.CREATINAS}${id}/`),
        {
          method: "PUT",
          headers: getAuthHeadersFormData(),
          body: data,
        }
      );

      if (response.ok) {
        setMensaje("✅ Creatina actualizada con éxito");
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
          setMensaje("❌ Error al actualizar la creatina. Revisa los campos.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
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
      helpText: "Nombre comercial de la creatina",
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
      helpText: "Tabla de información nutricional (opcional)",
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
          <p className="ms-3 mb-0">Cargando creatina...</p>
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
                <i className="fas fa-edit me-2"></i>Editar Creatina
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

              {/* Imagen actual del producto */}
              {currentImage && (
                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="fas fa-image me-1"></i>Imagen Actual del
                    Producto
                  </label>
                  <div className="current-image-container">
                    <img
                      src={currentImage}
                      alt="Imagen actual del producto"
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

              {/* Vista previa de nueva imagen del producto */}
              {imagePreview && (
                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="fas fa-eye me-1"></i>Vista Previa Nueva Imagen
                    del Producto
                  </label>
                  <div className="current-image-container">
                    <img
                      src={imagePreview}
                      alt="Vista previa nueva imagen"
                      className="current-image"
                    />
                  </div>
                  <small className="form-help">
                    Vista previa de la nueva imagen seleccionada
                  </small>
                </div>
              )}

              {/* Imagen nutricional actual */}
              {currentImageNutricional && (
                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="fas fa-chart-bar me-1"></i>Imagen Nutricional
                    Actual
                  </label>
                  <div className="current-image-container">
                    <img
                      src={currentImageNutricional}
                      alt="Imagen nutricional actual"
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
                    Esta es la imagen nutricional actual
                  </small>
                </div>
              )}

              {/* Vista previa de nueva imagen nutricional */}
              {imageNutricionalPreview && (
                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="fas fa-eye me-1"></i>Vista Previa Nueva Imagen
                    Nutricional
                  </label>
                  <div className="current-image-container">
                    <img
                      src={imageNutricionalPreview}
                      alt="Vista previa nueva imagen nutricional"
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
                      <i className="fas fa-save me-2"></i>
                      Actualizar Creatina
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

export default EditarCreatina;
