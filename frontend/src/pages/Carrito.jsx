import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_CONFIG, getAuthHeadersJSON, buildUrl } from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../styles/Carrito.css";

function Carrito() {
  const [carritoCompras, setCarritoCompras] = useState([]);
  const [totalPagar, setTotalPagar] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    obtenerCarrito();
  }, []);

  const obtenerCarrito = async () => {
    try {
      const token = localStorage.getItem("access_token");

      // ✅ URL usando la configuración centralizada
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CARRITO), {
        headers: getAuthHeadersJSON(),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Carrito obtenido:", data);
        setCarritoCompras(data.items || []);
        setTotalPagar(data.total || 0);
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setMensaje("❌ Sesión expirada. Por favor, inicie sesión nuevamente.");
      } else {
        console.error("Error al obtener el carrito:", response.status);
        setMensaje("❌ Error al cargar el carrito");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setMensaje("⚠️ Error de conexión al cargar el carrito");
    } finally {
      setCargando(false);
    }
  };

  const eliminarProducto = async (productoId) => {
    try {
      const token = localStorage.getItem("access_token");

      console.log("Eliminando producto con ID:", productoId);

      // ✅ URL usando la configuración centralizada
      const response = await fetch(
        buildUrl(`${API_CONFIG.ENDPOINTS.CARRITO}${productoId}/`),
        {
          method: "DELETE",
          headers: getAuthHeadersJSON(),
        }
      );

      console.log("Respuesta de eliminación:", response.status);

      if (response.ok) {
        setMensaje("✅ Producto eliminado del carrito");
        const nuevoCarrito = carritoCompras.filter(
          (item) => item.id !== productoId
        );
        setCarritoCompras(nuevoCarrito);

        const nuevoTotal = nuevoCarrito.reduce(
          (total, item) => total + item.precio * item.cantidad,
          0
        );
        setTotalPagar(nuevoTotal);

        setTimeout(() => setMensaje(""), 3000);
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setMensaje("❌ Sesión expirada. Por favor, inicie sesión nuevamente.");
      } else {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        setMensaje("❌ Error al eliminar el producto");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("⚠️ Error de conexión al eliminar producto");
    }
  };

  const actualizarCantidad = async (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarProducto(productoId);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      // ✅ URL usando la configuración centralizada
      const response = await fetch(
        buildUrl(`${API_CONFIG.ENDPOINTS.CARRITO}actualizar/`),
        {
          method: "POST",
          headers: getAuthHeadersJSON(),
          body: JSON.stringify({
            id: productoId,
            cantidad: nuevaCantidad,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCarritoCompras(data.items || []);
        setTotalPagar(data.total || 0);
        setMensaje("✅ Cantidad actualizada");
        setTimeout(() => setMensaje(""), 3000);
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setMensaje("❌ Sesión expirada. Por favor, inicie sesión nuevamente.");
      } else {
        const errorData = await response.json();
        setMensaje(`❌ ${errorData.error || "Error al actualizar cantidad"}`);
        obtenerCarrito();
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("⚠️ Error de conexión al actualizar cantidad");
    }
  };

  const vaciarCarrito = async () => {
    if (!window.confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      // ✅ URL usando la configuración centralizada
      const response = await fetch(
        buildUrl(`${API_CONFIG.ENDPOINTS.CARRITO}vaciar/`),
        {
          method: "POST",
          headers: getAuthHeadersJSON(),
        }
      );

      if (response.ok) {
        setCarritoCompras([]);
        setTotalPagar(0);
        setMensaje("✅ Carrito vaciado correctamente");
        setTimeout(() => setMensaje(""), 3000);
      } else if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setMensaje("❌ Sesión expirada. Por favor, inicie sesión nuevamente.");
      } else {
        setMensaje("❌ Error al vaciar el carrito");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("⚠️ Error de conexión al vaciar carrito");
    }
  };

  const getImagenUrl = (imagenPath) => {
    if (!imagenPath) return "/static/imagenes/default.png";

    if (imagenPath.startsWith("http")) {
      return imagenPath;
    }

    if (imagenPath.startsWith("/")) {
      return `${API_CONFIG.BASE_URL}${imagenPath}`;
    }

    return `${API_CONFIG.BASE_URL}/media/${imagenPath}`;
  };

  const getTipoProductoNombre = (tipo) => {
    const tipos = {
      proteina: "Proteína",
      snack: "Snack",
      creatina: "Creatina",
      aminoacido: "Aminoácido",
      vitamina: "Vitamina",
    };
    return tipos[tipo] || "Producto";
  };

  if (cargando) {
    return (
      <div className="carrito-layout">
        <Navbar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-layout">
      <Navbar />

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-5 fw-bold text-dark">
            <i className="fas fa-shopping-cart me-2"></i>Tu Carrito de Compras
          </h1>
          <div>
            <span className="badge bg-primary fs-6">
              {carritoCompras.length} producto
              {carritoCompras.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

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

        {carritoCompras.length > 0 ? (
          <div className="cart-container bg-white rounded shadow-sm">
            {/* Encabezado */}
            <div className="cart-header bg-light p-3 rounded-top">
              <div className="row fw-bold text-dark">
                <div className="col-md-4">Producto</div>
                <div className="col-md-2 text-center">Precio</div>
                <div className="col-md-2 text-center">Cantidad</div>
                <div className="col-md-2 text-center">Total</div>
                <div className="col-md-2 text-center">Acciones</div>
              </div>
            </div>

            {/* Productos */}
            <div className="cart-items">
              {carritoCompras.map((item) => (
                <div
                  key={item.id}
                  className="cart-item border-bottom p-3 bg-white"
                >
                  <div className="row align-items-center">
                    <div className="col-md-4 d-flex align-items-center">
                      <img
                        src={getImagenUrl(item.imagen)}
                        alt={item.nombre}
                        className="rounded me-3 border"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          backgroundColor: "#f8f9fa",
                        }}
                        onError={(e) => {
                          e.target.src = "/static/imagenes/default.png";
                        }}
                      />
                      <div>
                        <h6 className="mb-1 text-dark">{item.nombre}</h6>
                        <small className="text-muted">
                          {getTipoProductoNombre(item.tipo)}
                        </small>
                      </div>
                    </div>

                    <div className="col-md-2 text-center fw-bold text-dark">
                      ${item.precio?.toLocaleString() || "0"}
                    </div>

                    <div className="col-md-2 text-center">
                      <div className="quantity-controls d-flex align-items-center justify-content-center">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() =>
                            actualizarCantidad(item.id, item.cantidad - 1)
                          }
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <span className="mx-3 fw-bold text-dark">
                          {item.cantidad}
                        </span>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() =>
                            actualizarCantidad(item.id, item.cantidad + 1)
                          }
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>

                    <div className="col-md-2 text-center fw-bold text-primary">
                      ${((item.precio || 0) * item.cantidad).toLocaleString()}
                    </div>

                    <div className="col-md-2 text-center">
                      <button
                        onClick={() => eliminarProducto(item.id)}
                        className="btn btn-outline-danger btn-sm"
                        title="Eliminar producto"
                      >
                        <i className="fas fa-trash-alt"></i> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Acciones y Resumen */}
            <div className="cart-summary mt-4">
              <div className="row">
                <div className="col-md-7">
                  <div className="d-flex gap-2">
                    <Link to="/productos" className="btn btn-outline-primary">
                      <i className="fas fa-arrow-left me-2"></i> Seguir
                      comprando
                    </Link>
                    <button
                      onClick={vaciarCarrito}
                      className="btn btn-outline-danger"
                    >
                      <i className="fas fa-trash me-2"></i> Vaciar carrito
                    </button>
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="summary-card border p-4 rounded bg-white">
                    <h4 className="mb-3 text-dark">Resumen de compra</h4>
                    <div className="d-flex justify-content-between mb-2 text-dark">
                      <span>Subtotal:</span>
                      <span>${totalPagar.toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2 text-dark">
                      <span>Envío:</span>
                      <span className="text-success">Gratis</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold fs-5 text-dark">
                      <span>Total:</span>
                      <span className="text-primary">
                        ${totalPagar.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      to="/pagar"
                      className="btn btn-primary w-100 mt-3 py-2"
                    >
                      <i className="fas fa-credit-card me-2"></i>Proceder al
                      pago
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-cart text-center py-5 bg-white rounded shadow-sm">
            <i className="fas fa-shopping-cart display-1 text-muted mb-4"></i>
            <h3 className="mt-3 text-dark">Tu carrito está vacío</h3>
            <p className="text-muted mb-4">
              Agrega algunos productos para comenzar a comprar
            </p>
            <Link to="/productos" className="btn btn-primary btn-lg">
              <i className="fas fa-arrow-left me-2"></i> Continuar comprando
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Carrito;
