import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  API_CONFIG,
  getAuthHeadersJSON,
  buildUrl,
  getImagenUrl,
} from "../../config/api";
import "../../styles/admin/GestionProductos.css";

const GestionProductos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Remover cualquier imagen de fondo del body
    document.body.style.backgroundImage = "none";
    document.body.style.background =
      "linear-gradient(135deg, #aaaaaaff, #b3b3b3ff)";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.minHeight = "100vh";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    const obtenerUsuario = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setCargandoUsuario(false);
          return;
        }

        // ✅ URL usando la configuración centralizada
        const res = await fetch(buildUrl(API_CONFIG.ENDPOINTS.USUARIO_ACTUAL), {
          headers: getAuthHeadersJSON(),
        });

        if (res.ok) {
          const data = await res.json();
          setUsuario(data);
          if (!data.is_admin) {
            alert("No tienes permisos para acceder a esta página");
            navigate("/");
          }
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user_data");
        }
      } catch (err) {
        console.error("Error fetching usuario:", err);
      } finally {
        setCargandoUsuario(false);
      }
    };

    const cargarProductos = async () => {
      try {
        const token = localStorage.getItem("access_token");

        // ✅ URLs usando la configuración centralizada
        const [
          resProteinas,
          resSnacks,
          resCreatinas,
          resAminoacidos,
          resVitaminas,
        ] = await Promise.all([
          fetch(buildUrl(API_CONFIG.ENDPOINTS.PROTEINAS), {
            headers: getAuthHeadersJSON(),
          }),
          fetch(buildUrl(API_CONFIG.ENDPOINTS.SNACKS), {
            headers: getAuthHeadersJSON(),
          }),
          fetch(buildUrl(API_CONFIG.ENDPOINTS.CREATINAS), {
            headers: getAuthHeadersJSON(),
          }),
          fetch(buildUrl(API_CONFIG.ENDPOINTS.AMINOACIDOS), {
            headers: getAuthHeadersJSON(),
          }),
          fetch(buildUrl(API_CONFIG.ENDPOINTS.VITAMINAS), {
            headers: getAuthHeadersJSON(),
          }),
        ]);

        if (
          resProteinas.ok &&
          resSnacks.ok &&
          resCreatinas.ok &&
          resAminoacidos.ok &&
          resVitaminas.ok
        ) {
          const proteinas = await resProteinas.json();
          const snacks = await resSnacks.json();
          const creatinas = await resCreatinas.json();
          const aminoacidos = await resAminoacidos.json();
          const vitaminas = await resVitaminas.json();

          // Combinar todos los productos
          const productosCombinados = [
            ...proteinas.map((p) => ({ ...p, tipo_producto: "Proteina" })),
            ...snacks.map((s) => ({ ...s, tipo_producto: "Snack" })),
            ...creatinas.map((c) => ({ ...c, tipo_producto: "Creatina" })),
            ...aminoacidos.map((a) => ({ ...a, tipo_producto: "Aminoacido" })),
            ...vitaminas.map((v) => ({
              ...v,
              tipo_producto: "Vitamina",
            })),
          ];

          setProductos(productosCombinados);
        } else {
          console.error("Error cargando productos");
        }
      } catch (error) {
        console.error("Error cargando productos:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerUsuario();
    cargarProductos();
  }, [navigate]);

  const handleEliminarProducto = async () => {
    if (!productoAEliminar) return;

    try {
      const token = localStorage.getItem("access_token");
      let endpoint = "";

      // ✅ Determinar el endpoint usando la configuración centralizada
      switch (productoAEliminar.tipo) {
        case "Proteina":
          endpoint = buildUrl(
            `${API_CONFIG.ENDPOINTS.PROTEINAS}${productoAEliminar.id}/`
          );
          break;
        case "Snack":
          endpoint = buildUrl(
            `${API_CONFIG.ENDPOINTS.SNACKS}${productoAEliminar.id}/`
          );
          break;
        case "Creatina":
          endpoint = buildUrl(
            `${API_CONFIG.ENDPOINTS.CREATINAS}${productoAEliminar.id}/`
          );
          break;
        case "Aminoacido":
          endpoint = buildUrl(
            `${API_CONFIG.ENDPOINTS.AMINOACIDOS}${productoAEliminar.id}/`
          );
          break;
        case "Vitamina":
          endpoint = buildUrl(
            `${API_CONFIG.ENDPOINTS.VITAMINAS}${productoAEliminar.id}/`
          );
          break;
        default:
          console.error("Tipo de producto no válido");
          return;
      }

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: getAuthHeadersJSON(),
      });

      if (res.ok) {
        setProductos(productos.filter((p) => p.id !== productoAEliminar.id));
        setShowDeleteModal(false);
        setProductoAEliminar(null);
        alert("✅ Producto eliminado exitosamente");
      } else if (res.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        alert("❌ Sesión expirada. Por favor, inicie sesión nuevamente.");
        navigate("/login");
      } else if (res.status === 403) {
        alert("❌ No tienes permisos para realizar esta acción.");
      } else {
        console.error("Error eliminando producto:", res.status);
        alert("❌ Error al eliminar el producto");
      }
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("⚠️ Error de conexión al eliminar el producto");
    }
  };

  const abrirModalEliminar = (producto) => {
    setProductoAEliminar({
      id: producto.id,
      nombre: producto.nombre,
      tipo: producto.tipo_producto,
      sabor: producto.sabor || producto.tipo || "N/A",
    });
    setShowDeleteModal(true);
  };

  const cerrarModalEliminar = () => {
    setShowDeleteModal(false);
    setProductoAEliminar(null);
  };

  const hoy = new Date().toISOString().split("T")[0];

  const ordenarTabla = (columna) => {
    const productosOrdenados = [...productos].sort((a, b) => {
      switch (columna) {
        case "nombre":
          return a.nombre.localeCompare(b.nombre);
        case "sabor":
          return (a.sabor || "").localeCompare(b.sabor || "");
        case "stock":
          return (a.stock || 0) - (b.stock || 0);
        case "precio":
          return (a.precio || 0) - (b.precio || 0);
        case "fecha_vencimiento":
          return (
            new Date(a.fecha_vencimiento || hoy) -
            new Date(b.fecha_vencimiento || hoy)
          );
        default:
          return 0;
      }
    });
    setProductos(productosOrdenados);
  };

  // Función para manejar error en carga de imagen
  const manejarErrorImagen = (e) => {
    e.target.style.display = "none";
    const placeholder = e.target.nextSibling;
    if (placeholder && placeholder.style) {
      placeholder.style.display = "block";
    }
  };

  // Función para obtener la clase del badge según el tipo de producto
  const getBadgeClass = (tipoProducto) => {
    switch (tipoProducto) {
      case "Proteina":
        return "bg-primary";
      case "Snack":
        return "bg-warning";
      case "Creatina":
        return "bg-info";
      case "Aminoacido":
        return "bg-success";
      case "Vitamina":
        return "bg-purple";
      default:
        return "bg-secondary";
    }
  };

  // Función para obtener la ruta de edición según el tipo de producto
  const getEditRoute = (producto) => {
    switch (producto.tipo_producto) {
      case "Proteina":
        return `/admin/editar-proteina/${producto.id}`;
      case "Snack":
        return `/admin/editar-snack/${producto.id}`;
      case "Creatina":
        return `/admin/editar-creatina/${producto.id}`;
      case "Aminoacido":
        return `/admin/editar-aminoacido/${producto.id}`;
      case "Vitamina":
        return `/admin/editar-vitamina/${producto.id}`;
      default:
        return "#";
    }
  };

  if (cargandoUsuario || loading) {
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

  if (!usuario || !usuario.is_admin) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <h4>Acceso Denegado</h4>
          <p>No tienes permisos para acceder a esta página.</p>
          <Link to="/" className="btn btn-primary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fondo-imagen gestion-productos-page">
      {/* NAVBAR */}
      <Navbar />

      {/* CONTENIDO PRINCIPAL */}
      <div className="container py-5 gestion-productos-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-5 fw-bold">
            <i className="fas fa-cogs me-2"></i>Gestión de Productos
          </h1>
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-accent fs-6">
              {productos.length} productos en total
            </span>
          </div>
        </div>

        {/* Botones para agregar productos */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card bg-dark">
              <div className="card-body">
                <h5 className="card-title text-accent mb-3">
                  <i className="fas fa-plus-circle me-2"></i>Agregar Nuevos
                  Productos
                </h5>
                <div className="d-flex flex-wrap gap-2">
                  <Link
                    to="/admin/agregar-proteina"
                    className="btn btn-primary"
                  >
                    <i className="fas fa-plus me-1"></i> Proteína
                  </Link>
                  <Link to="/admin/agregar-snack" className="btn btn-warning">
                    <i className="fas fa-plus me-1"></i> Snack
                  </Link>
                  <Link to="/admin/agregar-creatina" className="btn btn-info">
                    <i className="fas fa-plus me-1"></i> Creatina
                  </Link>
                  <Link
                    to="/admin/agregar-aminoacido"
                    className="btn btn-success"
                  >
                    <i className="fas fa-plus me-1"></i> Aminoácidos
                  </Link>
                  <Link to="/admin/agregar-vitamina" className="btn btn-purple">
                    <i className="fas fa-plus me-1"></i> Vitaminas & Salud
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="card table-card">
          <div className="card-header bg-dark">
            <h5 className="mb-0 text-accent">
              <i className="fas fa-list me-2"></i>Lista de Productos
            </h5>
          </div>
          <div className="card-body p-0">
            {productos.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0">
                  <thead className="table-header">
                    <tr>
                      <th
                        onClick={() => ordenarTabla("imagen")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-image me-2"></i>Imagen
                      </th>
                      <th
                        onClick={() => ordenarTabla("nombre")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-tag me-2"></i>Nombre
                      </th>
                      <th
                        onClick={() => ordenarTabla("sabor")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-ice-cream me-2"></i>Sabor/Tipo
                      </th>
                      <th>
                        <i className="fas fa-tags me-2"></i>Categoría
                      </th>
                      <th
                        onClick={() => ordenarTabla("stock")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-box me-2"></i>Stock
                      </th>
                      <th
                        onClick={() => ordenarTabla("precio")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-dollar-sign me-2"></i>Precio
                      </th>
                      <th
                        onClick={() => ordenarTabla("fecha_vencimiento")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-calendar me-2"></i>Vencimiento
                      </th>
                      <th>
                        <i className="fas fa-cogs me-2"></i>Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((producto) => {
                      const imagenUrl = getImagenUrl(producto.imagen);
                      const badgeClass = getBadgeClass(producto.tipo_producto);
                      const editRoute = getEditRoute(producto);

                      return (
                        <tr key={producto.id} className="product-row">
                          <td>
                            {imagenUrl ? (
                              <>
                                <img
                                  src={imagenUrl}
                                  alt={producto.nombre}
                                  className="product-thumbnail"
                                  onError={manejarErrorImagen}
                                />
                                <div
                                  className="no-image-small"
                                  style={{ display: "none" }}
                                >
                                  <i className="fas fa-image"></i>
                                </div>
                              </>
                            ) : (
                              <div className="no-image-small">
                                <i className="fas fa-image"></i>
                              </div>
                            )}
                          </td>
                          <td className="fw-bold">{producto.nombre}</td>
                          <td>{producto.sabor || producto.tipo || "N/A"}</td>
                          <td>
                            <span className={`badge ${badgeClass}`}>
                              {producto.tipo_producto}
                            </span>
                          </td>
                          <td>
                            {producto.stock > 10 ? (
                              <span className="text-success fw-bold">
                                {producto.stock} unidades
                              </span>
                            ) : producto.stock > 0 ? (
                              <span className="text-warning fw-bold">
                                {producto.stock} unidades
                              </span>
                            ) : (
                              <span className="text-danger fw-bold">
                                {producto.stock} unidades
                              </span>
                            )}
                          </td>
                          <td className="fw-bold text-accent">
                            ${(producto.precio || 0).toLocaleString()}
                          </td>
                          <td>
                            {producto.fecha_vencimiento &&
                            producto.fecha_vencimiento < hoy ? (
                              <span className="text-danger">
                                {producto.fecha_vencimiento}
                              </span>
                            ) : (
                              <span className="text-light">
                                {producto.fecha_vencimiento ||
                                  "No especificada"}
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              {/* Botón Editar */}
                              <Link
                                to={editRoute}
                                className="btn btn-sm btn-outline-primary"
                              >
                                <i className="fas fa-edit"></i>
                              </Link>

                              {/* Botón Eliminar */}
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => abrirModalEliminar(producto)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-box-open display-1 text-muted mb-3"></i>
                <h3 className="text-light mb-3">
                  No hay productos registrados
                </h3>
                <p className="text-muted mb-4">
                  Utiliza los botones de arriba para agregar tus primeros
                  productos
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Confirmación para Eliminar */}
        {showDeleteModal && productoAEliminar && (
          <div className="modal-backdrop show">
            <div className="modal d-block">
              <div className="modal-dialog">
                <div className="modal-content bg-dark">
                  <div className="modal-header border-secondary">
                    <h5 className="modal-title text-accent">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Confirmar Eliminación
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={cerrarModalEliminar}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>¿Estás seguro de que deseas eliminar el producto?</p>
                    <div className="alert alert-warning">
                      <strong>{productoAEliminar.nombre}</strong>
                      <br />
                      <div className="row mt-2">
                        <div className="col-6">
                          <small>
                            <i className="fas fa-ice-cream me-1"></i>
                            {productoAEliminar.sabor}
                          </small>
                        </div>
                        <div className="col-6">
                          <small>
                            <i className="fas fa-tags me-1"></i>
                            {productoAEliminar.tipo}
                          </small>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted">
                      Esta acción no se puede deshacer.
                    </p>
                  </div>
                  <div className="modal-footer border-secondary">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={cerrarModalEliminar}
                    >
                      <i className="fas fa-times me-1"></i>
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleEliminarProducto}
                    >
                      <i className="fas fa-trash me-1"></i>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionProductos;
