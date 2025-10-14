import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  API_CONFIG,
  buildUrl,
  getImagenUrl, // ✅ IMPORTAR LA FUNCIÓN CENTRALIZADA
} from "../config/api";
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
      // ✅ URLs usando la configuración centralizada
      const [
        resProteinas,
        resSnacks,
        resCreatinas,
        resAminoacidos,
        resVitaminas,
      ] = await Promise.all([
        fetch(buildUrl(API_CONFIG.ENDPOINTS.PROTEINAS)),
        fetch(buildUrl(API_CONFIG.ENDPOINTS.SNACKS)),
        fetch(buildUrl(API_CONFIG.ENDPOINTS.CREATINAS)),
        fetch(buildUrl(API_CONFIG.ENDPOINTS.AMINOACIDOS)),
        fetch(buildUrl(API_CONFIG.ENDPOINTS.VITAMINAS)),
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

        const productosCombinados = [
          ...proteinas.map((p) => ({
            ...p,
            tipo_producto: "Proteina",
            categoria_filtro: "Proteina",
            subcategoria: p.tipo || "Whey",
          })),
          ...snacks.map((s) => ({
            ...s,
            tipo_producto: "Snack",
            categoria_filtro: "Snack",
            subcategoria: "Snack",
          })),
          ...creatinas.map((c) => ({
            ...c,
            tipo_producto: "Creatina",
            categoria_filtro: "Creatina",
            subcategoria: "Creatina",
          })),
          ...aminoacidos.map((a) => ({
            ...a,
            tipo_producto: "Aminoacido",
            categoria_filtro: "Aminoacido",
            subcategoria: "Aminoacido",
          })),
          ...vitaminas.map((v) => ({
            ...v,
            tipo_producto: "Vitamina",
            categoria_filtro: "Vitamina",
            subcategoria: "Vitamina",
          })),
        ];

        setProductos(productosCombinados);
      } else {
        console.error("Error al obtener productos");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = () => {
    let filtrados = [...productos];

    if (categoriaFiltro !== "all") {
      filtrados = filtrados.filter(
        (producto) => producto.categoria_filtro === categoriaFiltro
      );
    }

    if (subcategoriaFiltro !== "all" && categoriaFiltro === "Proteina") {
      filtrados = filtrados.filter(
        (producto) => producto.subcategoria === subcategoriaFiltro
      );
    }

    if (soloEnStock) {
      filtrados = filtrados.filter((producto) => producto.stock > 0);
    }

    setProductosFiltrados(filtrados);
  };

  const handleCategoriaChange = (e) => {
    setCategoriaFiltro(e.target.value);
    setSubcategoriaFiltro("all");
  };

  const handleSubcategoriaChange = (e) => {
    setSubcategoriaFiltro(e.target.value);
  };

  const handleStockChange = (e) => {
    setSoloEnStock(e.target.checked);
  };

  const limpiarFiltros = () => {
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
        return `/proteina/${producto.id}`;
      case "Snack":
        return `/snack/${producto.id}`;
      case "Creatina":
        return `/creatina/${producto.id}`;
      case "Aminoacido":
        return `/aminoacido/${producto.id}`;
      case "Vitamina":
        return `/vitamina/${producto.id}`;
      default:
        return "#";
    }
  };

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
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="categoryFilter"
                      id="allProducts"
                      value="all"
                      checked={categoriaFiltro === "all"}
                      onChange={handleCategoriaChange}
                    />
                    <label
                      className="form-check-label text-dark"
                      htmlFor="allProducts"
                    >
                      Todos los productos
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="categoryFilter"
                      id="proteinas"
                      value="Proteina"
                      checked={categoriaFiltro === "Proteina"}
                      onChange={handleCategoriaChange}
                    />
                    <label
                      className="form-check-label text-dark"
                      htmlFor="proteinas"
                    >
                      Proteínas
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="categoryFilter"
                      id="snacks"
                      value="Snack"
                      checked={categoriaFiltro === "Snack"}
                      onChange={handleCategoriaChange}
                    />
                    <label
                      className="form-check-label text-dark"
                      htmlFor="snacks"
                    >
                      Snacks
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="categoryFilter"
                      id="creatinas"
                      value="Creatina"
                      checked={categoriaFiltro === "Creatina"}
                      onChange={handleCategoriaChange}
                    />
                    <label
                      className="form-check-label text-dark"
                      htmlFor="creatinas"
                    >
                      Creatinas
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="categoryFilter"
                      id="aminoacidos"
                      value="Aminoacido"
                      checked={categoriaFiltro === "Aminoacido"}
                      onChange={handleCategoriaChange}
                    />
                    <label
                      className="form-check-label text-dark"
                      htmlFor="aminoacidos"
                    >
                      Aminoácidos
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="categoryFilter"
                      id="vitaminas"
                      value="Vitamina"
                      checked={categoriaFiltro === "Vitamina"}
                      onChange={handleCategoriaChange}
                    />
                    <label
                      className="form-check-label text-dark"
                      htmlFor="vitaminas"
                    >
                      Vitaminas
                    </label>
                  </div>
                </div>
              </div>

              {/* Filtro por subcategoría de proteínas */}
              {categoriaFiltro === "Proteina" && (
                <div className="mb-4">
                  <h5 className="mb-3 text-dark">Tipo de Proteína</h5>
                  <div className="filter-options">
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="subcategoryFilter"
                        id="allProteins"
                        value="all"
                        checked={subcategoriaFiltro === "all"}
                        onChange={handleSubcategoriaChange}
                      />
                      <label
                        className="form-check-label text-dark"
                        htmlFor="allProteins"
                      >
                        Todas las proteínas
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="subcategoryFilter"
                        id="wheyProtein"
                        value="Whey"
                        checked={subcategoriaFiltro === "Whey"}
                        onChange={handleSubcategoriaChange}
                      />
                      <label
                        className="form-check-label text-dark"
                        htmlFor="wheyProtein"
                      >
                        Whey Protein
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="subcategoryFilter"
                        id="isolateProtein"
                        value="Isolate"
                        checked={subcategoriaFiltro === "Isolate"}
                        onChange={handleSubcategoriaChange}
                      />
                      <label
                        className="form-check-label text-dark"
                        htmlFor="isolateProtein"
                      >
                        Isolated Protein
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="subcategoryFilter"
                        id="caseinProtein"
                        value="Casein"
                        checked={subcategoriaFiltro === "Casein"}
                        onChange={handleSubcategoriaChange}
                      />
                      <label
                        className="form-check-label text-dark"
                        htmlFor="caseinProtein"
                      >
                        Casein Protein
                      </label>
                    </div>
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
