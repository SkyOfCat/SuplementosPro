import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin/AgregarAminoacido.css";

const AgregarAminoacido = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    stock: "",
    fecha_vencimiento: "",
    imagen: null,
    imagen_nutricional: null, // NUEVO CAMPO OBLIGATORIO
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const [nutritionalImagePreview, setNutritionalImagePreview] = useState(""); // NUEVO PREVIEW
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // NUEVO MANEJO DE IMAGEN NUTRICIONAL
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
        if (!value.trim()) error = "El nombre del aminoácido es requerido";
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
        if (!value) error = "La imagen del producto es obligatoria"; // AHORA OBLIGATORIO
        break;
      case "imagen_nutricional":
        if (!value) error = "La imagen nutricional es obligatoria"; // NUEVA VALIDACIÓN OBLIGATORIA
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
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const fieldIsValid = validateField(key, formData[key]);
      if (!fieldIsValid) isValid = false;
    });

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      // Crear FormData para enviar archivos
      const submitData = new FormData();
      submitData.append("nombre", formData.nombre.trim());
      submitData.append("precio", parseInt(formData.precio));
      submitData.append("stock", parseInt(formData.stock));
      submitData.append("fecha_vencimiento", formData.fecha_vencimiento);
      submitData.append("tipo_producto", "Aminoacido");
      submitData.append("tipo", "Aminoacido");

      // IMÁGENES OBLIGATORIAS
      if (formData.imagen) {
        submitData.append("imagen", formData.imagen);
      }

      // NUEVO: Imagen nutricional obligatoria
      if (formData.imagen_nutricional) {
        submitData.append("imagen_nutricional", formData.imagen_nutricional);
      }

      const response = await fetch("http://localhost:8000/api/aminoacidos/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        alert("Aminoácido agregado con éxito");
        navigate("/admin/productos");
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);

        // Manejar errores específicos del backend
        if (errorData.nombre) {
          setErrors((prev) => ({ ...prev, nombre: errorData.nombre[0] }));
        } else if (errorData.precio) {
          setErrors((prev) => ({ ...prev, precio: errorData.precio[0] }));
        } else if (errorData.imagen) {
          setErrors((prev) => ({ ...prev, imagen: errorData.imagen[0] }));
        } else if (errorData.imagen_nutricional) {
          setErrors((prev) => ({
            ...prev,
            imagen_nutricional: errorData.imagen_nutricional[0],
          }));
        } else if (errorData.non_field_errors) {
          setErrors({ submit: errorData.non_field_errors[0] });
        } else {
          setErrors({
            submit: "Error al guardar el aminoácido. Verifique los datos.",
          });
        }
      }
    } catch (error) {
      console.error("Error al agregar aminoácido:", error);
      setErrors({ submit: "Error de conexión. Intente nuevamente." });
    } finally {
      setIsSubmitting(false);
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
                <i className="fas fa-dna me-2"></i>Agregar Nuevo Aminoácido
              </h1>
              <p className="text-light mb-0">
                Complete el formulario para agregar un nuevo aminoácido al
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
                {errors.submit && (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errors.submit}
                  </div>
                )}

                <div className="row">
                  {/* Nombre del Aminoácido */}
                  <div className="col-md-6 mb-4">
                    <label htmlFor="id_nombre" className="form-label fw-bold">
                      <i className="fas fa-tag me-2"></i>Nombre del Aminoácido *
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
                      placeholder="Ej: BCAA 2:1:1 300g"
                      required
                      disabled={isSubmitting}
                    />
                    {hasError("nombre") && (
                      <div className="invalid-feedback">{errors.nombre}</div>
                    )}
                    <div className="form-text">
                      Ingrese el nombre comercial del aminoácido
                    </div>
                  </div>

                  {/* Tipo (fijo como Aminoácido) */}
                  <div className="col-md-6 mb-4">
                    <label htmlFor="id_tipo" className="form-label fw-bold">
                      <i className="fas fa-atom me-2"></i>Tipo
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="id_tipo"
                      value="Aminoácido"
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
                        disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                        disabled={isSubmitting}
                      />
                      {hasError("imagen") && (
                        <div className="invalid-feedback">{errors.imagen}</div>
                      )}
                      <div className="form-text">
                        Imagen principal del aminoácido (obligatoria)
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
                            alt="Vista previa del aminoácido"
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                      >
                        <i className="fas fa-arrow-left me-2"></i>Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-warning btn-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            ></span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>Guardar
                            Aminoácido
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

export default AgregarAminoacido;
