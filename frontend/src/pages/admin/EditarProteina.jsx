import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  API_CONFIG,
  getAuthHeadersFormData,
  getAuthHeadersJSON,
  buildUrl,
} from "../../config/api";
import "../../styles/admin/EditarProteina.css";

const EditarProteina = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [proteina, setProteina] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    sabor: "",
    tipo: "Whey",
    fecha_vencimiento: "",
    peso: "",
    precio: "",
    stock: "",
    imagen: null,
    imagen_nutricional: null,
  });
  const [mensaje, setMensaje] = useState("");
  const [imagenPrevia, setImagenPrevia] = useState("");
  const [imagenNutricionalPrevia, setImagenNutricionalPrevia] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar datos reales de la proteína desde la API
  useEffect(() => {
    const cargarProteina = async () => {
      try {
        // ✅ URL usando la configuración centralizada
        const response = await fetch(
          buildUrl(`${API_CONFIG.ENDPOINTS.PROTEINAS}${id}/`),
          {
            headers: getAuthHeadersJSON(),
          }
        );

        if (response.ok) {
          const datosProteina = await response.json();
          console.log("Datos cargados:", datosProteina);

          setProteina(datosProteina);
          setFormData({
            nombre: datosProteina.nombre || "",
            sabor: datosProteina.sabor || "",
            tipo: datosProteina.tipo || "Whey",
            fecha_vencimiento: datosProteina.fecha_vencimiento || "",
            peso: datosProteina.peso || "",
            precio: datosProteina.precio || "",
            stock: datosProteina.stock || "",
            imagen: null,
            imagen_nutricional: null,
          });

          // Configurar imagen previa si existe
          if (datosProteina.imagen) {
            const imagenUrl = datosProteina.imagen.startsWith("http")
              ? datosProteina.imagen
              : `${API_CONFIG.BASE_URL}${datosProteina.imagen}`;
            setImagenPrevia(imagenUrl);
          }

          // Configurar imagen nutricional previa si existe
          if (datosProteina.imagen_nutricional) {
            const imagenNutricionalUrl =
              datosProteina.imagen_nutricional.startsWith("http")
                ? datosProteina.imagen_nutricional
                : `${API_CONFIG.BASE_URL}${datosProteina.imagen_nutricional}`;
            setImagenNutricionalPrevia(imagenNutricionalUrl);
          }
        } else if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setMensaje(
            "❌ Sesión expirada. Por favor, inicie sesión nuevamente."
          );
          setTimeout(() => navigate("/login"), 2000);
        } else if (response.status === 404) {
          setMensaje("❌ Producto no encontrado");
        } else {
          console.error("Error al cargar proteína:", response.status);
          setMensaje("❌ Error al cargar los datos del producto");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        setMensaje("⚠️ Error de conexión al cargar el producto");
      } finally {
        setCargando(false);
      }
    };

    cargarProteina();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imagen") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        imagen: file,
      }));

      // Crear URL previa para la nueva imagen
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagenPrevia(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    } else if (name === "imagen_nutricional") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        imagen_nutricional: file,
      }));

      // Crear URL previa para la nueva imagen nutricional
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagenNutricionalPrevia(e.target.result);
        };
        reader.readAsDataURL(file);
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
    const camposRequeridos = [
      "nombre",
      "sabor",
      "tipo",
      "fecha_vencimiento",
      "peso",
      "precio",
      "stock",
    ];
    const camposFaltantes = camposRequeridos.filter(
      (campo) => !formData[campo]
    );

    if (camposFaltantes.length > 0) {
      setMensaje("❌ Por favor completa todos los campos requeridos");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setMensaje("❌ Debes iniciar sesión para editar productos");
        setLoading(false);
        navigate("/login");
        return;
      }

      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      formDataToSend.append("nombre", formData.nombre.trim());
      formDataToSend.append("sabor", formData.sabor.trim());
      formDataToSend.append("tipo", formData.tipo);
      formDataToSend.append("fecha_vencimiento", formData.fecha_vencimiento);
      formDataToSend.append("peso", formData.peso.trim());
      formDataToSend.append("precio", parseFloat(formData.precio));
      formDataToSend.append("stock", parseInt(formData.stock));

      // Solo agregar la imagen si se seleccionó una nueva
      if (formData.imagen) {
        formDataToSend.append("imagen", formData.imagen);
      }

      // Solo agregar la imagen nutricional si se seleccionó una nueva
      if (formData.imagen_nutricional) {
        formDataToSend.append(
          "imagen_nutricional",
          formData.imagen_nutricional
        );
      }

      console.log("Enviando datos:", Object.fromEntries(formDataToSend));

      // ✅ URL usando la configuración centralizada
      const response = await fetch(
        buildUrl(`${API_CONFIG.ENDPOINTS.PROTEINAS}${id}/`),
        {
          method: "PUT",
          headers: getAuthHeadersFormData(),
          body: formDataToSend,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Producto actualizado:", data);
        setMensaje("✅ Producto actualizado con éxito");

        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate("/admin/productos");
        }, 2000);
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setMensaje("❌ Sesión expirada. Por favor, inicie sesión nuevamente.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (response.status === 403) {
        setMensaje("❌ No tienes permisos para editar productos");
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);

        // Manejar errores específicos del backend
        if (errorData.detail) {
          setMensaje(`❌ ${errorData.detail}`);
        } else if (errorData.non_field_errors) {
          setMensaje(`❌ ${errorData.non_field_errors.join(", ")}`);
        } else {
          setMensaje("❌ Error al actualizar el producto. Revisa los campos.");
        }
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setMensaje("⚠️ Error de conexión al actualizar el producto");
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

  if (cargando) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="form-card">
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando datos del producto...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!proteina) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="form-card">
              <div className="alert alert-danger text-center">
                <h4>Producto no encontrado</h4>
                <p>No se pudo cargar el producto con ID: {id}</p>
                <button onClick={handleCancel} className="btn btn-primary">
                  Volver a gestión de productos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="form-card">
            <div className="form-header">
              <h2>
                <i className="fas fa-edit me-2"></i>Modificar Proteína
              </h2>
              <p className="text-muted">
                Actualice los datos del producto {proteina.nombre}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="product-form"
              encType="multipart/form-data"
            >
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

              <div className="form-grid">
                {/* Campos del formulario */}
                <div className="form-group required">
                  <label htmlFor="id_nombre" className="form-label">
                    <i className={`${getFieldIcon("nombre")} me-1`}></i>Nombre:
                  </label>
                  <input
                    type="text"
                    id="id_nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group required">
                  <label htmlFor="id_sabor" className="form-label">
                    <i className={`${getFieldIcon("sabor")} me-1`}></i>Sabor:
                  </label>
                  <input
                    type="text"
                    id="id_sabor"
                    name="sabor"
                    value={formData.sabor}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group required">
                  <label htmlFor="id_tipo" className="form-label">
                    <i className={`${getFieldIcon("tipo")} me-1`}></i>Tipo:
                  </label>
                  <select
                    id="id_tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={loading}
                  >
                    <option value="Whey">Whey Protein</option>
                    <option value="Isolate">Isolate Protein</option>
                    <option value="Casein">Casein Protein</option>
                  </select>
                </div>

                <div className="form-group required">
                  <label htmlFor="id_fecha_vencimiento" className="form-label">
                    <i
                      className={`${getFieldIcon("fecha_vencimiento")} me-1`}
                    ></i>
                    Fecha de Vencimiento:
                  </label>
                  <input
                    type="date"
                    id="id_fecha_vencimiento"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group required">
                  <label htmlFor="id_peso" className="form-label">
                    <i className={`${getFieldIcon("peso")} me-1`}></i>Peso:
                  </label>
                  <input
                    type="text"
                    id="id_peso"
                    name="peso"
                    value={formData.peso}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ej: 2kg, 5lbs, 900g"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group required">
                  <label htmlFor="id_precio" className="form-label">
                    <i className={`${getFieldIcon("precio")} me-1`}></i>Precio:
                  </label>
                  <input
                    type="number"
                    id="id_precio"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    step="0.01"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group required">
                  <label htmlFor="id_stock" className="form-label">
                    <i className={`${getFieldIcon("stock")} me-1`}></i>Stock:
                  </label>
                  <input
                    type="number"
                    id="id_stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Imagen del producto */}
                <div className="form-group full-width">
                  <label className="form-label">
                    <i className={`${getFieldIcon("imagen")} me-1`}></i>Imagen
                    actual:
                  </label>
                  <div className="current-image-container">
                    {imagenPrevia ? (
                      <img
                        src={imagenPrevia}
                        alt={`Imagen actual de ${formData.nombre}`}
                        className="current-image"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                    ) : null}
                    <div
                      className="no-image-placeholder"
                      style={{ display: imagenPrevia ? "none" : "block" }}
                    >
                      <i className="fas fa-image fa-3x text-muted"></i>
                      <p className="mt-2 text-muted">Sin imagen</p>
                    </div>
                  </div>

                  <label htmlFor="id_imagen" className="form-label mt-3">
                    <i className="fas fa-camera me-1"></i>Nueva Imagen
                    (opcional):
                  </label>
                  <input
                    type="file"
                    id="id_imagen"
                    name="imagen"
                    onChange={handleChange}
                    className="form-control file-input"
                    accept="image/*"
                    disabled={loading}
                  />
                  <small className="form-help">
                    Seleccione una nueva imagen solo si desea reemplazar la
                    actual
                  </small>
                </div>

                {/* Imagen nutricional */}
                <div className="form-group full-width">
                  <label className="form-label">
                    <i
                      className={`${getFieldIcon("imagen_nutricional")} me-1`}
                    ></i>
                    Imagen nutricional actual:
                  </label>
                  <div className="current-image-container">
                    {imagenNutricionalPrevia ? (
                      <img
                        src={imagenNutricionalPrevia}
                        alt={`Información nutricional de ${formData.nombre}`}
                        className="current-image"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                    ) : null}
                    <div
                      className="no-image-placeholder"
                      style={{
                        display: imagenNutricionalPrevia ? "none" : "block",
                      }}
                    >
                      <i className="fas fa-chart-bar fa-3x text-muted"></i>
                      <p className="mt-2 text-muted">Sin imagen nutricional</p>
                    </div>
                  </div>

                  <label
                    htmlFor="id_imagen_nutricional"
                    className="form-label mt-3"
                  >
                    <i className="fas fa-camera me-1"></i>Nueva Imagen
                    Nutricional (opcional):
                  </label>
                  <input
                    type="file"
                    id="id_imagen_nutricional"
                    name="imagen_nutricional"
                    onChange={handleChange}
                    className="form-control file-input"
                    accept="image/*"
                    disabled={loading}
                  />
                  <small className="form-help">
                    Seleccione una nueva imagen nutricional solo si desea
                    reemplazar la actual
                  </small>
                </div>
              </div>

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
                      <i className="fas fa-save me-2"></i>Actualizar Producto
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

export default EditarProteina;
