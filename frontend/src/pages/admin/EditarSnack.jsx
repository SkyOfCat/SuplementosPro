import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/admin/EditarSnack.css";

const EditarSnack = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [snack, setSnack] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    sabor: "",
    fecha_vencimiento: "",
    precio: "",
    stock: "",
    imagen: null,
  });
  const [mensaje, setMensaje] = useState("");
  const [imagenPrevia, setImagenPrevia] = useState("");

  // Cargar datos reales del snack desde la API
  useEffect(() => {
    const cargarSnack = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `http://localhost:8000/api/snacks/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const datosSnack = await response.json();
          console.log("Datos cargados del snack:", datosSnack);

          setSnack(datosSnack);
          setFormData({
            nombre: datosSnack.nombre || "",
            sabor: datosSnack.sabor || "",
            fecha_vencimiento: datosSnack.fecha_vencimiento || "",
            precio: datosSnack.precio || "",
            stock: datosSnack.stock || "",
            imagen: null,
          });

          // Configurar imagen previa si existe
          if (datosSnack.imagen) {
            const imagenUrl = datosSnack.imagen.startsWith("http")
              ? datosSnack.imagen
              : `http://localhost:8000${datosSnack.imagen}`;
            setImagenPrevia(imagenUrl);
          }
        } else {
          console.error("Error al cargar snack:", response.status);
          setMensaje("Error al cargar los datos del snack");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        setMensaje("Error de conexión al cargar el snack");
      } finally {
        setCargando(false);
      }
    };

    cargarSnack();
  }, [id]);

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
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("access_token");

      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("sabor", formData.sabor);
      formDataToSend.append("fecha_vencimiento", formData.fecha_vencimiento);
      formDataToSend.append("precio", formData.precio);
      formDataToSend.append("stock", formData.stock);

      // Solo agregar la imagen si se seleccionó una nueva
      if (formData.imagen) {
        formDataToSend.append("imagen", formData.imagen);
      }

      console.log(
        "Enviando datos del snack:",
        Object.fromEntries(formDataToSend)
      );

      const response = await fetch(`http://localhost:8000/api/snacks/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // NO incluir Content-Type cuando usas FormData
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Snack actualizado:", data);
        setMensaje("✅ Snack actualizado con éxito");

        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate("/admin/productos");
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        setMensaje(
          `❌ Error al actualizar el snack: ${JSON.stringify(errorData)}`
        );
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setMensaje("❌ Error de conexión al actualizar el snack");
    }
  };

  const handleCancel = () => {
    navigate("/admin/productos");
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
                <p className="mt-3">Cargando datos del snack...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!snack) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="form-card">
              <div className="alert alert-danger text-center">
                <h4>Snack no encontrado</h4>
                <p>No se pudo cargar el snack con ID: {id}</p>
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
                <i className="fas fa-edit me-2"></i>Modificar Snack
              </h2>
              <p className="text-muted">
                Actualice los datos del snack {snack.nombre}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="product-form"
              encType="multipart/form-data"
            >
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="id_nombre" className="form-label">
                    <i className="fas fa-tag me-1"></i>Nombre:
                  </label>
                  <input
                    type="text"
                    id="id_nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ej: Barrita energética, Mix de frutos secos"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="id_sabor" className="form-label">
                    <i className="fas fa-ice-cream me-1"></i>Sabor:
                  </label>
                  <input
                    type="text"
                    id="id_sabor"
                    name="sabor"
                    value={formData.sabor}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ej: Chocolate, Vainilla, Frutos Rojos"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="id_fecha_vencimiento" className="form-label">
                    <i className="fas fa-calendar-alt me-1"></i>Fecha de
                    Vencimiento:
                  </label>
                  <input
                    type="date"
                    id="id_fecha_vencimiento"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="id_precio" className="form-label">
                    <i className="fas fa-dollar-sign me-1"></i>Precio:
                  </label>
                  <input
                    type="number"
                    id="id_precio"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    step="100"
                    placeholder="Ej: 2990"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="id_stock" className="form-label">
                    <i className="fas fa-boxes me-1"></i>Stock:
                  </label>
                  <input
                    type="number"
                    id="id_stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    placeholder="Cantidad disponible"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <i className="fas fa-image me-1"></i>Imagen actual:
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
                </div>

                <div className="form-group full-width">
                  <label htmlFor="id_nueva_imagen" className="form-label">
                    <i className="fas fa-camera me-1"></i>Nueva Imagen
                    (opcional):
                  </label>
                  <input
                    type="file"
                    id="id_nueva_imagen"
                    name="imagen"
                    onChange={handleChange}
                    className="form-control file-input"
                    accept="image/*"
                  />
                  <small className="form-help">
                    Seleccione una nueva imagen solo si desea reemplazar la
                    actual
                  </small>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-submit">
                  <i className="fas fa-save me-2"></i>Actualizar Snack
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
                className={`alert ${
                  mensaje.includes("✅") ? "alert-success" : "alert-danger"
                } alert-dismissible fade show mt-3`}
              >
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

export default EditarSnack;
