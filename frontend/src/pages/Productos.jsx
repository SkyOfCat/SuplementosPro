import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_CONFIG, buildUrl, getImagenUrl } from "../config/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../styles/Productos.css";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("all");
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState("all");
  const [soloEnStock, setSoloEnStock] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [imagenesCargadas, setImagenesCargadas] = useState({});
  const [erroresImagen, setErroresImagen] = useState({});

  useEffect(() => {
    obtenerProductos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [productos, categoriaFiltro, subcategoriaFiltro, soloEnStock]);

  const obtenerProductos = async () => {
    try {
      setCargando(true);

      // ✅ URLs usando la configuración centralizada
      const endpoints = [
        API_CONFIG.ENDPOINTS.PROTEINAS,
        API_CONFIG.ENDPOINTS.SNACKS,
        API_CONFIG.ENDPOINTS.CREATINAS,
        API_CONFIG.ENDPOINTS.AMINOACIDOS,
        API_CONFIG.ENDPOINTS.VITAMINAS,
      ];

      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(buildUrl(endpoint)).then((res) => (res.ok ? res.json() : []))
        )
      );

      const [proteinas, snacks, creatinas, aminoacidos, vitaminas] = responses;

      // ✅ CORRECCIÓN: Crear IDs únicos para evitar duplicados
      const productosCombinados = [
        ...proteinas.map((p) => ({
          ...p,
          id: `proteina_${p.id}`, // ID único
          tipo_producto: "Proteina",
          categoria_filtro: "Proteina",
          subcategoria: p.tipo || "Whey",
        })),
        ...snacks.map((s) => ({
          ...s,
          id: `snack_${s.id}`, // ID único
          tipo_producto: "Snack",
          categoria_filtro: "Snack",
          subcategoria: "Snack",
        })),
        ...creatinas.map((c) => ({
          ...c,
          id: `creatina_${c.id}`, // ID único
          tipo_producto: "Creatina",
          categoria_filtro: "Creatina",
          subcategoria: "Creatina",
        })),
        ...aminoacidos.map((a) => ({
          ...a,
          id: `aminoacido_${a.id}`, // ID único
          tipo_producto: "Aminoacido",
          categoria_filtro: "Aminoacido",
          subcategoria: "Aminoacido",
        })),
        ...vitaminas.map((v) => ({
          ...v,
          id: `vitamina_${v.id}`, // ID único
          tipo_producto: "Vitamina",
          categoria_filtro: "Vitamina",
          subcategoria: "Vitamina",
        })),
      ];

      console.log("📦 Productos cargados:", {
        total: productosCombinados.length,
        proteinas: proteinas.length,
        snacks: snacks.length,
        creatinas: creatinas.length,
        aminoacidos: aminoacidos.length,
        vitaminas: vitaminas.length,
      });

      // ✅ CORRECCIÓN: Eliminar duplicados por ID único
      const productosUnicos = eliminarDuplicados(productosCombinados);

      console.log(
        "✅ Productos únicos después de eliminar duplicados:",
        productosUnicos.length
      );

      setProductos(productosUnicos);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    } finally {
      setCargando(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Eliminar productos duplicados
  const eliminarDuplicados = (productosArray) => {
    const seen = new Set();
    return productosArray.filter((producto) => {
      // Usar el ID único para verificar duplicados
      if (seen.has(producto.id)) {
        console.warn(
          "⚠️ Producto duplicado eliminado:",
          producto.id,
          producto.nombre
        );
        return false;
      }
      seen.add(producto.id);
      return true;
    });
  };

  const aplicarFiltros = () => {
    console.log("🔍 Aplicando filtros...", {
      totalProductos: productos.length,
      categoriaFiltro,
      subcategoriaFiltro,
      soloEnStock,
    });

    let filtrados = [...productos];

    // ✅ CORRECCIÓN: Aplicar filtros de manera más estricta
    if (categoriaFiltro !== "all") {
      filtrados = filtrados.filter(
        (producto) => producto.categoria_filtro === categoriaFiltro
      );
      console.log(
        `📊 Después de filtro categoría "${categoriaFiltro}":`,
        filtrados.length
      );
    }

    if (subcategoriaFiltro !== "all" && categoriaFiltro === "Proteina") {
      filtrados = filtrados.filter(
        (producto) => producto.subcategoria === subcategoriaFiltro
      );
      console.log(
        `📊 Después de filtro subcategoría "${subcategoriaFiltro}":`,
        filtrados.length
      );
    }

    if (soloEnStock) {
      const antesStock = filtrados.length;
      filtrados = filtrados.filter((producto) => producto.stock > 0);
      console.log(
        `📊 Después de filtro stock: ${antesStock} → ${filtrados.length}`
      );
    }

    // ✅ DEBUG: Mostrar productos filtrados
    if (categoriaFiltro === "Vitamina") {
      console.log("🍎 Productos de vitamina filtrados:", filtrados);
    }

    setProductosFiltrados(filtrados);
  };

  const handleCategoriaChange = (e) => {
    const nuevaCategoria = e.target.value;
    console.log("🔄 Cambiando categoría a:", nuevaCategoria);
    setCategoriaFiltro(nuevaCategoria);
    setSubcategoriaFiltro("all"); // Resetear subcategoría
  };

  const handleSubcategoriaChange = (e) => {
    setSubcategoriaFiltro(e.target.value);
  };

  const handleStockChange = (e) => {
    setSoloEnStock(e.target.checked);
  };

  const limpiarFiltros = () => {
    console.log("🧹 Limpiando filtros");
    setCategoriaFiltro("all");
    setSubcategoriaFiltro("all");
    setSoloEnStock(false);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "No especificada";
    return new Date(fecha).toLocaleDateString("es-ES");
  };

  const manejarCargaImagen = (productoId) => {
    setImagenesCargadas((prev) => ({
      ...prev,
      [productoId]: true,
    }));
  };

  const manejarErrorImagen = (e, productoId) => {
    console.error(`Error cargando imagen para producto ${productoId}:`, e);
    setErroresImagen((prev) => ({
      ...prev,
      [productoId]: true,
    }));
  };

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

  const getDetailRoute = (producto) => {
    switch (producto.tipo_producto) {
      case "Proteina":
        return `/proteina/${producto.id.replace("proteina_", "")}`;
      case "Snack":
        return `/snack/${producto.id.replace("snack_", "")}`;
      case "Creatina":
        return `/creatina/${producto.id.replace("creatina_", "")}`;
      case "Aminoacido":
        return `/aminoacido/${producto.id.replace("aminoacido_", "")}`;
      case "Vitamina":
        return `/vitamina/${producto.id.replace("vitamina_", "")}`;
      default:
        return "#";
    }
  };

  // ✅ DEBUG: Mostrar información de depuración
  if (import.meta.env.DEV) {
    console.log("🔍 Estado actual:", {
      productosTotal: productos.length,
      productosFiltrados: productosFiltrados.length,
      categoriaFiltro,
      subcategoriaFiltro,
      soloEnStock,
    });
  }

  if (cargando) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="productos-layout">
      <Navbar />

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-5 fw-bold text-dark">
            <i className="fas fa-dumbbell me-2"></i>Nuestros Productos
          </h1>
          <div>
            <span className="badge bg-primary fs-6">
              {productosFiltrados.length} productos encontrados
            </span>
          </div>
        </div>

        {/* ✅ DEBUG INFO - Solo en desarrollo */}
        {/*{import.meta.env.DEV && (
          <div className="alert alert-info mb-4">
            <small>
              <strong>Debug Info:</strong> Total: {productos.length} |
              Filtrados: {productosFiltrados.length} | Categoría:{" "}
              {categoriaFiltro} | Subcategoría: {subcategoriaFiltro}
            </small>
          </div>
        )}*/}

        <div className="row">
          {/* Panel lateral de filtros */}
          <div className="col-lg-3 mb-4">
            <div className="filter-card p-4 rounded bg-white shadow-sm border">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0 text-dark">
                  <i className="fas fa-filter me-2"></i>Filtros
                </h4>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={limpiarFiltros}
                >
                  <i className="fas fa-times me-1"></i>Limpiar
                </button>
              </div>

              {/* Filtro por categoría principal */}
              <div className="mb-4">
                <h5 className="mb-3 text-dark">Categoría Principal</h5>
                <div className="filter-options">
                  {[
                    {
                      id: "allProducts",
                      value: "all",
                      label: "Todos los productos",
                    },
                    { id: "proteinas", value: "Proteina", label: "Proteínas" },
                    { id: "snacks", value: "Snack", label: "Snacks" },
                    { id: "creatinas", value: "Creatina", label: "Creatinas" },
                    {
                      id: "aminoacidos",
                      value: "Aminoacido",
                      label: "Aminoácidos",
                    },
                    { id: "vitaminas", value: "Vitamina", label: "Vitaminas" },
                  ].map((option) => (
                    <div key={option.id} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="categoryFilter"
                        id={option.id}
                        value={option.value}
                        checked={categoriaFiltro === option.value}
                        onChange={handleCategoriaChange}
                      />
                      <label
                        className="form-check-label text-dark"
                        htmlFor={option.id}
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtro por subcategoría de proteínas */}
              {categoriaFiltro === "Proteina" && (
                <div className="mb-4">
                  <h5 className="mb-3 text-dark">Tipo de Proteína</h5>
                  <div className="filter-options">
                    {[
                      {
                        id: "allProteins",
                        value: "all",
                        label: "Todas las proteínas",
                      },
                      {
                        id: "wheyProtein",
                        value: "Whey",
                        label: "Whey Protein",
                      },
                      {
                        id: "isolateProtein",
                        value: "Isolate",
                        label: "Isolated Protein",
                      },
                      {
                        id: "caseinProtein",
                        value: "Casein",
                        label: "Casein Protein",
                      },
                    ].map((option) => (
                      <div key={option.id} className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="subcategoryFilter"
                          id={option.id}
                          value={option.value}
                          checked={subcategoriaFiltro === option.value}
                          onChange={handleSubcategoriaChange}
                        />
                        <label
                          className="form-check-label text-dark"
                          htmlFor={option.id}
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtro por stock */}
              <div className="mb-3">
                <h5 className="mb-3 text-dark">Filtrar por Stock</h5>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="inStockOnly"
                    checked={soloEnStock}
                    onChange={handleStockChange}
                  />
                  <label
                    className="form-check-label text-dark"
                    htmlFor="inStockOnly"
                  >
                    Solo productos en stock
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="col-lg-9">
            {productosFiltrados.length > 0 ? (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {productosFiltrados.map((producto) => {
                  const imagenUrl = getImagenUrl(producto.imagen);
                  const tieneErrorImagen = erroresImagen[producto.id];
                  const enStock = producto.stock > 0;
                  const badgeClass = getBadgeClass(producto.tipo_producto);
                  const detailRoute = getDetailRoute(producto);

                  return (
                    <div key={producto.id} className="col">
                      <div className="card h-100 product-card shadow-sm">
                        <div className="product-image-container position-relative">
                          {imagenUrl && !tieneErrorImagen ? (
                            <img
                              src={imagenUrl}
                              className="card-img-top product-image"
                              alt={producto.nombre}
                              onLoad={() => manejarCargaImagen(producto.id)}
                              onError={(e) =>
                                manejarErrorImagen(e, producto.id)
                              }
                            />
                          ) : (
                            <div className="no-image-placeholder d-flex align-items-center justify-content-center bg-light">
                              <div className="text-center text-muted">
                                <i className="fas fa-image fa-3x mb-2"></i>
                                <p className="mb-0 small">
                                  Imagen no disponible
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="product-badges position-absolute top-0 start-0 p-2">
                            <span className={`badge ${badgeClass} me-1`}>
                              {producto.tipo_producto}
                            </span>
                            {enStock ? (
                              <span className="badge bg-success">En stock</span>
                            ) : (
                              <span className="badge bg-danger">Agotado</span>
                            )}
                          </div>
                        </div>

                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title text-dark">
                            {producto.nombre}
                          </h5>
                          <div className="card-text flex-grow-1">
                            <p className="mb-1 text-dark">
                              <i className="fas fa-ice-cream me-1 text-primary"></i>
                              <strong>Sabor:</strong>{" "}
                              {producto.sabor || producto.tipo || "N/A"}
                            </p>
                            <p className="mb-1 text-dark">
                              <i className="fas fa-box me-1 text-primary"></i>
                              <strong>Stock:</strong> {producto.stock} unidades
                            </p>
                            <p className="mb-1 text-dark">
                              <i className="fas fa-calendar me-1 text-primary"></i>
                              <strong>Vencimiento:</strong>{" "}
                              {formatearFecha(producto.fecha_vencimiento)}
                            </p>
                            {producto.peso && (
                              <p className="mb-1 text-dark">
                                <i className="fas fa-weight me-1 text-primary"></i>
                                <strong>Peso:</strong> {producto.peso}
                              </p>
                            )}
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <h4 className="text-primary mb-0 fw-bold">
                              ${(producto.precio || 0).toLocaleString()}
                            </h4>
                          </div>
                        </div>

                        <div className="card-footer bg-white border-top">
                          <div className="d-grid gap-2">
                            <Link
                              to={detailRoute}
                              className={`btn ${
                                enStock ? "btn-primary" : "btn-secondary"
                              }`}
                              onClick={(e) => {
                                if (!enStock) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <i className="fas fa-cart-plus me-1"></i>
                              {enStock ? "Seleccionar" : "Agotado"}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-box-open display-1 text-muted"></i>
                <h3 className="mt-3 text-dark">No hay productos disponibles</h3>
                <p className="text-muted">
                  {productos.length === 0
                    ? "No hay productos en el sistema"
                    : "No hay productos que coincidan con los filtros aplicados"}
                </p>
                {productos.length > 0 && (
                  <button
                    className="btn btn-primary mt-3"
                    onClick={limpiarFiltros}
                  >
                    <i className="fas fa-times me-2"></i>
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Productos;
