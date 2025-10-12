import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../../styles/admin/EditarAminoacido.css";

const EditarAminoacido = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    stock: "",
    fecha_vencimiento: "",
    imagen: null,
  });

  const [currentImage, setCurrentImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [cargandoProducto, setCargandoProducto] = useState(true);

  useEffect(() => {
    cargarAminoacido();
  }, [id]);

  const cargarAminoacido = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://localhost:8000/api/aminoacidos/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
        });

        if (data.imagen) {
          setCurrentImage(getImagenUrl(data.imagen));
        }
      } else {
        setMensaje("❌ Error al cargar el aminoácido");
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
      return `http://localhost:8000${imagenPath}`;
    }

    return `http://localhost:8000/media/${imagenPath}`;
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

    // Crear objeto FormData para enviar imagen y texto
    const data = new FormData();
    data.append("nombre", formData.nombre.trim());
    data.append("precio", parseInt(formData.precio));
    data.append("stock", parseInt(formData.stock));
    data.append("fecha_vencimiento", formData.fecha_vencimiento);
    data.append("tipo_producto", "Aminoacido");
    data.append("tipo", "Aminoacido");

    if (formData.imagen) {
      data.append("imagen", formData.imagen);
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/aminoacidos/${id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      if (response.ok) {
        setMensaje("✅ Aminoácido actualizado con éxito");
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
        console.error(errorData);
        setMensaje("❌ Error al actualizar el aminoácido. Revisa los campos.");
      }
    } catch (error) {
      console.error(error);
      setMensaje("⚠️ Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/productos");
  };

  const getFieldIcon = (fieldName) => {
    const icons = {
      nombre: "fas fa-tag",
      precio: "fas fa-dollar-sign",
      stock: "fas fa-boxes",
      fecha_vencimiento: "fas fa-calendar-alt",
      imagen: "fas fa-image",
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
      helpText: "Nombre comercial del aminoácido",
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
                <i className="fas fa-edit me-2"></i>Editar Aminoácido
              </h2>
              <p className="text-muted">
                Modifique los campos que desee actualizar
              </p>
            </div>

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
                    />
                  </div>
                  <small className="form-help">
                    Esta es la imagen actual del producto
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

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-submit"
                  disabled={loading}
                >
                  <i className="fas fa-save me-2"></i>
                  {loading ? "Guardando..." : "Actualizar Aminoácido"}
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
                className={`alert-message ${
                  mensaje.includes("éxito") || mensaje.includes("✅")
                    ? "alert-success"
                    : "alert-error"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarAminoacido;
