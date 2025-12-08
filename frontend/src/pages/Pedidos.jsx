import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { API_CONFIG, getAuthHeadersJSON, buildUrl } from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Pedidos.css"; // CSS Personalizado abajo

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Ajustar fondo para consistencia visual
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = "#eef2f5";
    document.body.style.minHeight = "100vh";

    obtenerPedidos();

    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const obtenerPedidos = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Asegúrate de que esta URL coincida con tu router de Django ('mis-compras')
      const response = await fetch(buildUrl("/api/mis-compras/"), {
        headers: getAuthHeadersJSON(),
      });

      if (response.ok) {
        const data = await response.json();
        setPedidos(data);
      } else {
        setError("No se pudieron cargar tus pedidos.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  // Función auxiliar para formatear precio
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(precio);
  };

  // Función para obtener nombre del producto desde el detalle
  const getNombreProducto = (item) => {
    return item.nombre_producto || "Producto no disponible";
  };

  return (
    <div className="pedidos-layout">
      <Navbar />

      <div className="container py-5 content-wrapper">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="section-header text-center mb-5">
              <h2 className="display-5 fw-bold text-dark">
                <i className="fas fa-shopping-bag me-3 text-accent"></i>
                Mis Pedidos
              </h2>
              <p className="text-muted">Historial de tus compras realizadas</p>
            </div>

            {cargando ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
                <p className="mt-3 text-muted">Cargando historial...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center shadow-sm">
                <i className="fas fa-exclamation-triangle me-2"></i> {error}
              </div>
            ) : pedidos.length === 0 ? (
              <div className="empty-state text-center py-5 card shadow-sm border-0 rounded-4">
                <div className="card-body">
                  <i className="fas fa-box-open fa-4x text-muted mb-3"></i>
                  <h4 className="fw-bold text-dark">Aún no tienes pedidos</h4>
                  <p className="text-muted mb-4">
                    ¡Explora nuestros productos y realiza tu primera compra!
                  </p>
                  <Link
                    to="/productos"
                    className="btn btn-primary btn-lg px-5 rounded-pill"
                  >
                    Ir a la Tienda
                  </Link>
                </div>
              </div>
            ) : (
              <div className="orders-list">
                {pedidos.map((pedido) => (
                  <div key={pedido.folio} className="order-card mb-4">
                    {/* Header de la Tarjeta */}
                    <div className="order-header d-flex flex-wrap justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1 text-white fw-bold">
                          Pedido #{pedido.folio}
                        </h5>
                        <small className="text-white-50">
                          <i className="far fa-calendar-alt me-1"></i>
                          {new Date(pedido.fecha).toLocaleDateString("es-CL")}
                        </small>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-white text-primary px-3 py-2 rounded-pill">
                          Completado{" "}
                          <i className="fas fa-check-circle ms-1"></i>
                        </span>
                      </div>
                    </div>

                    {/* Cuerpo de la Tarjeta */}
                    <div className="order-body p-4">
                      <div className="table-responsive">
                        <table className="table table-borderless mb-0 align-middle">
                          <thead className="text-muted border-bottom">
                            <tr>
                              <th scope="col">Producto</th>
                              <th scope="col" className="text-center">
                                Cant.
                              </th>
                              <th scope="col" className="text-end">
                                Precio Unit.
                              </th>
                              <th scope="col" className="text-end">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pedido.detalles?.map((detalle, idx) => (
                              <tr key={idx} className="order-item-row">
                                <td className="fw-bold text-dark">
                                  {getNombreProducto(detalle)}
                                </td>
                                <td className="text-center">
                                  x{detalle.cantidad}
                                </td>
                                <td className="text-end text-muted">
                                  {formatearPrecio(detalle.precio_unitario)}
                                </td>
                                <td className="text-end fw-bold text-dark">
                                  {formatearPrecio(
                                    detalle.subTotal ||
                                      detalle.cantidad * detalle.precio_unitario
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Footer de la Tarjeta */}
                    <div className="order-footer d-flex justify-content-between align-items-center p-3">
                      <div className="text-muted small">
                        ID Transacción: {pedido.id_transaccion || "N/A"}
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="me-3 text-uppercase fw-bold text-muted small">
                          Total Pagado:
                        </span>
                        <span className="order-total-price">
                          {formatearPrecio(pedido.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Pedidos;
