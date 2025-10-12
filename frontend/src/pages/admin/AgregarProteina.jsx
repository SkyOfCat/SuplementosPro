import React from "react";
import { useNavigate } from "react-router-dom";
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imagen") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        imagen: file,
      }));

      // Vista previa para imagen del producto
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

      // Vista previa para imagen nutricional
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    // Obtener el token JWT
    const token = localStorage.getItem("access_token");

    // Verificar si hay token
    if (!token) {
      setMensaje("❌ Debes iniciar sesión para agregar productos");
      setLoading(false);
      navigate("/login");
      return;
    }

    // Crear objeto FormData para enviar imagen y texto
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        data.append(key, value);
      }
    });

    try {
      const response = await fetch("http://localhost:8000/api/proteinas/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        setMensaje("✅ Producto agregado con éxito");
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
        if (errorData.detail) {
          setMensaje(`❌ ${errorData.detail}`);
        } else if (errorData.non_field_errors) {
          setMensaje(`❌ ${errorData.non_field_errors.join(", ")}`);
        } else {
          setMensaje("❌ Error al agregar el producto. Revisa los campos.");
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
    navigate("/admin/productos");
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
      <div className={`form-group ${required ? "required" : ""}`} key={name}>
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
            className="form-control"
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
            className="form-control"
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
            className="form-control"
            placeholder={`Ingrese ${label.toLowerCase()}`}
            required={required}
          />
        )}

        {helpText && <small className="form-help">{helpText}</small>}
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
    { name: "precio", label: "Precio ($)", type: "number", required: true },
    { name: "stock", label: "Stock", type: "number", required: true },
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
                    <div className="image-upload-card required">
                      <label htmlFor="imagen" className="form-label fw-bold">
                        <i className="fas fa-image me-2"></i>Imagen del Producto
                        *
                      </label>
                      <input
                        type="file"
                        id="imagen"
                        name="imagen"
                        onChange={handleChange}
                        className="form-control"
                        accept="image/*"
                        required
                      />
                      <div className="form-text">
                        Imagen principal de la proteína (obligatoria)
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
                            alt="Vista previa de la proteína"
                            style={{ maxHeight: "200px" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Imagen Nutricional */}
                  <div className="col-12 mb-4">
                    <div className="image-upload-card required">
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
                        className="form-control"
                        accept="image/*"
                        required
                      />
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
                >
                  <i className="fas fa-times me-2"></i>Cancelar
                </button>
              </div>
            </form>

            {mensaje && (
              <div
                className={`alert alert-message ${
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

export default AgregarProteina;
