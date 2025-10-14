import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_CONFIG, getAuthHeadersJSON, buildUrl } from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/ProductoDetalle.css";

function ProductoDetalle({ tipo }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [imagenActiva, setImagenActiva] = useState(0);

  useEffect(() => {
    if (tipo && id) {
      obtenerProducto();
    }
  }, [id, tipo]);

  const obtenerProducto = async () => {
    try {
      let endpoint = "";

      const endpoints = {
        proteina: buildUrl(`${API_CONFIG.ENDPOINTS.PROTEINAS}${id}/`),
        snack: buildUrl(`${API_CONFIG.ENDPOINTS.SNACKS}${id}/`),
        creatina: buildUrl(`${API_CONFIG.ENDPOINTS.CREATINAS}${id}/`),
        aminoacido: buildUrl(`${API_CONFIG.ENDPOINTS.AMINOACIDOS}${id}/`),
        vitamina: buildUrl(`${API_CONFIG.ENDPOINTS.VITAMINAS}${id}/`),
      };

      endpoint = endpoints[tipo];

      if (!endpoint) {
        console.error("Tipo de producto no válido:", tipo);
        setMensaje("❌ Tipo de producto no válido");
        setTipoMensaje("error");
        return;
      }

      const response = await fetch(endpoint);

      if (response.ok) {
        const data = await response.json();
        setProducto(data);
      } else if (response.status === 404) {
        setMensaje("❌ Producto no encontrado");
        setTipoMensaje("error");
      } else {
        console.error("Error cargando producto. Status:", response.status);
        setMensaje("⚠️ Error al cargar el producto");
        setTipoMensaje("error");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("⚠️ Error de conexión al cargar el producto");
      setTipoMensaje("error");
    } finally {
      setCargando(false);
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

  // Obtener todas las imágenes disponibles del producto
  const getImagenesProducto = () => {
    if (!producto) return [];

    const imagenes = [];

    // Imagen principal siempre primera
    if (producto.imagen) {
      imagenes.push({
        url: getImagenUrl(producto.imagen),
        tipo: "principal",
        alt: producto.nombre,
      });
    }

    // Imagen nutricional si existe
    if (producto.imagen_nutricional) {
      imagenes.push({
        url: getImagenUrl(producto.imagen_nutricional),
        tipo: "nutricional",
        alt: `Información nutricional - ${producto.nombre}`,
      });
    }

    return imagenes;
  };

  const aumentarCantidad = () => {
    if (producto && cantidad < producto.stock) {
      setCantidad(cantidad + 1);
    }
  };

  const disminuirCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const calcularTotal = () => {
    if (!producto) return "0";
    return (producto.precio * cantidad).toLocaleString();
  };

  const formatearPrecio = (precio) => {
    if (!precio) return "0";
    return precio.toLocaleString();
  };

  const agregarAlCarrito = async (e) => {
    e.preventDefault();

    if (!producto) {
      setMensaje("❌ No hay producto para agregar");
      setTipoMensaje("error");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setMensaje("❌ Debes iniciar sesión para agregar productos al carrito");
        setTipoMensaje("error");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      const carritoData = {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: cantidad,
        imagen: producto.imagen,
        tipo: tipo,
      };

      // ✅ URL usando la configuración centralizada
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CARRITO), {
        method: "POST",
        headers: getAuthHeadersJSON(),
        body: JSON.stringify(carritoData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setMensaje("✅ Producto agregado al carrito con éxito");
        setTipoMensaje("success");
        setCantidad(1);
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setMensaje("❌ Sesión expirada. Por favor, inicie sesión nuevamente.");
        setTipoMensaje("error");
        setTimeout(() => navigate("/login"), 2000);
      } else if (response.status === 403) {
        setMensaje("❌ No tienes permisos para realizar esta acción");
        setTipoMensaje("error");
      } else {
        const errorMsg =
          responseData.error ||
          responseData.detail ||
          "Error al agregar al carrito";
        setMensaje(`❌ ${errorMsg}`);
        setTipoMensaje("error");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setMensaje("⚠️ Error de conexión con el servidor");
      setTipoMensaje("error");
    }

    setTimeout(() => {
      setMensaje("");
      setTipoMensaje("");
    }, 5000);
  };

  const manejarCambioCantidad = (e) => {
    const nuevaCantidad = parseInt(e.target.value);

    if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
      setCantidad(1);
    } else if (producto && nuevaCantidad > producto.stock) {
      setCantidad(producto.stock);
      setMensaje(`❌ No puedes agregar más de ${producto.stock} unidades`);
      setTipoMensaje("error");
      setTimeout(() => setMensaje(""), 3000);
    } else {
      setCantidad(nuevaCantidad);
    }
  };

  const getCamposProducto = () => {
    const campos = [];

    campos.push(
      <div className="detail-item" key="sabor">
        <span className="detail-label">Sabor/Tipo:</span>
        <span className="detail-value">
          {producto.sabor || producto.tipo || "N/A"}
        </span>
      </div>
    );

    if (tipo === "proteina" && producto.peso) {
      campos.push(
        <div className="detail-item" key="peso">
          <span className="detail-label">Peso:</span>
          <span className="detail-value">{producto.peso}</span>
        </div>
      );
    }

    if (tipo === "proteina" && producto.tipo_proteina) {
      campos.push(
        <div className="detail-item" key="tipo-proteina">
          <span className="detail-label">Tipo de Proteína:</span>
          <span className="detail-value">{producto.tipo_proteina}</span>
        </div>
      );
    }

    campos.push(
      <div className="detail-item" key="vencimiento">
        <span className="detail-label">Vence:</span>
        <span className="detail-value">
          {producto.fecha_vencimiento
            ? new Date(producto.fecha_vencimiento).toLocaleDateString("es-ES")
            : "No especificada"}
        </span>
      </div>
    );

    return campos;
  };

  if (cargando) {
    return (
      <div className="container py-5 text-center">
        <Navbar />
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="container py-5 text-center">
        <Navbar />
        <div className="alert alert-danger">
          <h4>Producto no encontrado</h4>
          <p>
            No se pudo cargar el producto {tipo} con ID: {id}
          </p>
          <Link to="/productos" className="btn btn-primary">
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  const imagenes = getImagenesProducto();
  const enStock = producto.stock > 0;
  const imagenActual = imagenes[imagenActiva];

  return (
    <div>
      <Navbar />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {mensaje && (
              <div
                className={`alert ${
                  tipoMensaje === "success"
                    ? "alert-success"
                    : tipoMensaje === "error"
                    ? "alert-danger"
                    : "alert-warning"
                } alert-dismissible fade show`}
                role="alert"
              >
                <i
                  className={`fas ${
                    tipoMensaje === "success"
                      ? "fa-check-circle"
                      : tipoMensaje === "error"
                      ? "fa-exclamation-circle"
                      : "fa-exclamation-triangle"
                  } me-2`}
                ></i>
                <strong>{mensaje}</strong>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMensaje("")}
                ></button>
              </div>
            )}

            <div className="product-detail-card">
              <form onSubmit={agregarAlCarrito} className="product-form">
                <div className="row">
                  {/* Columna de imágenes */}
                  <div className="col-md-5">
                    <div className="product-images-section">
                      {/* Imagen principal grande */}
                      <div className="main-image-container text-center mb-4">
                        <div className="product-image-container">
                          {imagenActual?.url ? (
                            <img
                              src={imagenActual.url}
                              alt={imagenActual.alt}
                              className="product-detail-image"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "block";
                              }}
                            />
                          ) : null}
                          <div
                            className="no-image-placeholder-large"
                            style={{
                              display: imagenActual?.url ? "none" : "block",
                            }}
                          >
                            <i className="fas fa-image fa-5x text-light"></i>
                          </div>
                          {enStock ? (
                            <span className="stock-badge in-stock">
                              <i className="fas fa-check me-1"></i>En stock
                            </span>
                          ) : (
                            <span className="stock-badge out-of-stock">
                              <i className="fas fa-times me-1"></i>Agotado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Galería de miniaturas */}
                      {imagenes.length > 1 && (
                        <div className="image-gallery">
                          <h5 className="gallery-title">
                            <i className="fas fa-images me-2"></i>
                            Vista del Producto
                          </h5>
                          <div className="thumbnail-container">
                            {imagenes.map((imagen, index) => (
                              <div
                                key={index}
                                className={`thumbnail-item ${
                                  index === imagenActiva ? "active" : ""
                                }`}
                                onClick={() => setImagenActiva(index)}
                              >
                                <img
                                  src={imagen.url}
                                  alt={imagen.alt}
                                  className="thumbnail-image"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                                <div
                                  className="thumbnail-placeholder"
                                  style={{ display: "none" }}
                                >
                                  <i className="fas fa-image"></i>
                                </div>
                                <div className="thumbnail-badge">
                                  {imagen.tipo === "principal" ? (
                                    <i
                                      className="fas fa-cube"
                                      title="Producto"
                                    ></i>
                                  ) : (
                                    <i
                                      className="fas fa-chart-bar"
                                      title="Información Nutricional"
                                    ></i>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="col-md-7">
                    <div className="product-info">
                      <div className="product-category-badge mb-2">
                        <span
                          className={`badge ${getCategoryBadgeClass(tipo)}`}
                        >
                          {getCategoryName(tipo)}
                        </span>
                      </div>

                      <h1 className="product-title">{producto.nombre}</h1>

                      <div className="product-details">
                        <div className="detail-item">
                          <span className="detail-label">Precio:</span>
                          <span className="detail-value price-highlight">
                            ${formatearPrecio(producto.precio)}
                          </span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-label">
                            Stock disponible:
                          </span>
                          <span
                            className={`detail-value ${
                              producto.stock < 10 ? "text-warning" : ""
                            }`}
                          >
                            {producto.stock} unidades
                            {producto.stock < 10 && producto.stock > 0 && (
                              <small className="ms-2 text-warning">
                                (Quedan pocos!)
                              </small>
                            )}
                          </span>
                        </div>

                        {getCamposProducto()}
                      </div>

                      {enStock && (
                        <>
                          <div className="quantity-section">
                            <label
                              htmlFor="cantidadProducto"
                              className="quantity-label"
                            >
                              <i className="fas fa-sort-amount-up me-2"></i>
                              Cantidad:
                            </label>
                            <div className="quantity-controls">
                              <button
                                type="button"
                                className="quantity-btn"
                                onClick={disminuirCantidad}
                                disabled={cantidad <= 1}
                              >
                                <i className="fas fa-minus"></i>
                              </button>
                              <input
                                type="number"
                                name="cantidad"
                                id="cantidadProducto"
                                value={cantidad}
                                min="1"
                                max={producto.stock}
                                onChange={manejarCambioCantidad}
                                className="quantity-input"
                              />
                              <button
                                type="button"
                                className="quantity-btn"
                                onClick={aumentarCantidad}
                                disabled={cantidad >= producto.stock}
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                            <small className="text-muted ms-3">
                              Máx: {producto.stock} unidades
                            </small>
                          </div>

                          <div className="total-section">
                            <h4 className="total-label">Total:</h4>
                            <div className="total-amount">
                              ${calcularTotal()}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="product-actions">
                        {enStock ? (
                          <button
                            type="submit"
                            className="btn btn-add-to-cart"
                            disabled={cantidad > producto.stock}
                          >
                            <i className="fas fa-cart-plus me-2"></i>
                            Agregar al Carrito
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-out-of-stock"
                            disabled
                          >
                            <i className="fas fa-times-circle me-2"></i>
                            Producto Agotado
                          </button>
                        )}

                        <Link to="/productos" className="btn btn-back">
                          <i className="fas fa-arrow-left me-2"></i>
                          Seguir Comprando
                        </Link>

                        <Link to="/carrito" className="btn btn-view-cart">
                          <i className="fas fa-shopping-cart me-2"></i>
                          Ver Carrito
                        </Link>
                      </div>
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
}

// Funciones auxiliares
function getCategoryBadgeClass(tipo) {
  const classes = {
    proteina: "bg-primary",
    snack: "bg-warning",
    creatina: "bg-info",
    aminoacido: "bg-success",
    vitamina: "bg-purple",
  };
  return classes[tipo] || "bg-secondary";
}

function getCategoryName(tipo) {
  const names = {
    proteina: "Proteína",
    snack: "Snack",
    creatina: "Creatina",
    aminoacido: "Aminoácido",
    vitamina: "Vitamina",
  };
  return names[tipo] || "Producto";
}

export default ProductoDetalle;
