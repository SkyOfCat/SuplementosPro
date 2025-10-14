import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../src/styles/App.css";

function App() {
  const [imagenActual, setImagenActual] = useState(0);
  const [imagenSiguiente, setImagenSiguiente] = useState(1);
  const [transicionando, setTransicionando] = useState(false);
  const [imagenesPrecargadas, setImagenesPrecargadas] = useState([]);

  const imagenes = [
    "/static/images/backgrounds/Dymatize-x-Dunkin.jpg",
    "/static/images/backgrounds/Optimum_Nutrition.png",
    "/static/images/backgrounds/Ronnie_Coleman.png",
  ];

  useEffect(() => {
    // Precargar todas las imágenes
    const precargarImagenes = async () => {
      const imagenesCargadas = [];

      for (let i = 0; i < imagenes.length; i++) {
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.src = imagenes[i];
            img.onload = () => {
              console.log("✅ Imagen precargada:", imagenes[i]);
              imagenesCargadas.push(imagenes[i]);
              resolve();
            };
            img.onerror = () => {
              console.error("❌ Error al precargar:", imagenes[i]);
              // Intentar con ruta alternativa
              const imgAlt = new Image();
              const rutaAlternativa = imagenes[i].replace(
                "/static/",
                "/dist/static/"
              );
              imgAlt.src = rutaAlternativa;
              imgAlt.onload = () => {
                console.log(
                  "✅ Imagen precargada (ruta alternativa):",
                  rutaAlternativa
                );
                imagenesCargadas.push(rutaAlternativa);
                resolve();
              };
              imgAlt.onerror = () =>
                reject(new Error(`No se pudo cargar: ${imagenes[i]}`));
            };
          });
        } catch (error) {
          console.error("Error en precarga:", error);
        }
      }

      setImagenesPrecargadas(
        imagenesCargadas.length > 0 ? imagenesCargadas : imagenes
      );
      iniciarTransiciones();
    };

    precargarImagenes();
  }, []);

  const iniciarTransiciones = () => {
    if (imagenesPrecargadas.length === 0) return;

    // Configurar el fondo inicial
    document.body.className = "body-background body-background-0";

    // Configurar intervalo para transiciones
    const intervalo = setInterval(() => {
      realizarTransicion();
    }, 8000); // Cambiar cada 8 segundos

    return () => clearInterval(intervalo);
  };

  const realizarTransicion = () => {
    if (transicionando || imagenesPrecargadas.length === 0) return;

    setTransicionando(true);

    const siguienteIndex = (imagenActual + 1) % imagenesPrecargadas.length;
    setImagenSiguiente(siguienteIndex);

    // Agregar clase de transición
    document.body.classList.add("body-transitioning");
    document.body.classList.add(`body-background-${siguienteIndex}`);

    // Remover clase anterior después de la transición
    setTimeout(() => {
      document.body.classList.remove(`body-background-${imagenActual}`);
      document.body.classList.remove("body-transitioning");
      setImagenActual(siguienteIndex);
      setTransicionando(false);
    }, 2000); // Duración de la transición
  };

  // Estilos CSS en línea como fallback
  const estilosBody = `
    .body-background {
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-attachment: fixed;
      min-height: 100vh;
      margin: 0;
      padding: 0;
      transition: background-image 2s ease-in-out;
    }

    .body-background-0 {
      background-image: url('${imagenesPrecargadas[0] || imagenes[0]}');
    }

    .body-background-1 {
      background-image: url('${imagenesPrecargadas[1] || imagenes[1]}');
    }

    .body-background-2 {
      background-image: url('${imagenesPrecargadas[2] || imagenes[2]}');
    }

    .body-transitioning {
      transition: background-image 2s ease-in-out !important;
    }

    .app-container {
      position: relative;
      min-height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
    }

    .main-content {
      position: relative;
      z-index: 2;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 80px; /* Espacio para el navbar */
      padding-bottom: 60px; /* Espacio para el footer */
    }

    .hero-section {
      min-height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero-content {
      margin-top: 5rem; /* Baja el contenido para ver mejor las imágenes */
    }

    /* Overlay para mejor legibilidad */
    .app-container::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        rgba(0, 0, 0, 0.4) 0%,
        rgba(0, 0, 0, 0.2) 50%,
        rgba(0, 0, 0, 0.4) 100%
      );
      z-index: 1;
      pointer-events: none;
    }

    /* Ajustes para el título */
    .hero-title {
      font-size: 4rem;
      text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
      margin-bottom: 2rem !important;
    }

    .hero-subtitle {
      font-size: 1.5rem;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
      margin-bottom: 2rem !important;
    }

    .brand-highlight {
      color: #ff6b35;
      font-weight: bold;
    }

    .text-accent {
      color: #ff6b35 !important;
    }

    /* Botones más prominentes */
    .hero-buttons .btn {
      padding: 12px 30px;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 50px;
      transition: all 0.3s ease;
    }

    .hero-buttons .btn-primary {
      background: linear-gradient(135deg, #ff6b35, #ff8e35);
      border: none;
      box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
    }

    .hero-buttons .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.6);
    }

    .hero-buttons .btn-outline-light:hover {
      transform: translateY(-2px);
      background-color: rgba(255, 255, 255, 0.1);
    }

    /* Features section */
    .feature-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.15);
    }

    .feature-icon {
      font-size: 3rem;
    }

    /* Footer */
    .footer-home {
      background: rgba(0, 0, 0, 0.7);
      padding: 2rem 0;
      margin-top: auto;
    }

    .social-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      margin: 0 0.5rem;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      background: #ff6b35;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .hero-subtitle {
        font-size: 1.2rem;
      }
      
      .hero-content {
        margin-top: 3rem;
      }
      
      .main-content {
        padding-top: 60px;
      }
    }
  `;

  return (
    <>
      <style>{estilosBody}</style>
      <div className="app-container">
        <Navbar />

        <main className="main-content">
          <div className="container">
            {/* HERO SECTION - Centrado y más abajo */}
            <div className="hero-section">
              <div className="row align-items-center justify-content-center">
                <div className="col-lg-8 col-xl-6 text-center">
                  <div className="hero-content">
                    <h1 className="hero-title display-3 fw-bold text-white mb-4">
                      SUPLEMENTOS<span className="text-accent">PRO</span>
                    </h1>
                    <p className="hero-subtitle lead text-light mb-4">
                      Descubre los mejores suplementos de
                      <span className="brand-highlight"> Ronnie Coleman</span>,
                      <span className="brand-highlight"> Dymatize</span> y
                      <span className="brand-highlight">
                        {" "}
                        Optimum Nutrition
                      </span>
                    </p>
                    <p className="text-light mb-5 fs-5">
                      Potencia tu rendimiento, acelera tu recuperación y alcanza
                      tus metas fitness con productos de calidad premium.
                    </p>

                    <div className="hero-buttons">
                      <Link
                        to="/productos"
                        className="btn btn-primary btn-lg me-3 mb-3"
                      >
                        <i className="fas fa-store me-2"></i>
                        Ver Productos
                      </Link>
                      <Link
                        to="/registro"
                        className="btn btn-outline-light btn-lg mb-3"
                      >
                        <i className="fas fa-user-plus me-2"></i>
                        Crear Cuenta
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FEATURES SECTION */}
            <div className="row mt-5 pt-5">
              <div className="col-md-4 text-center mb-4">
                <div className="feature-card p-4 rounded">
                  <i className="fas fa-shipping-fast feature-icon text-primary mb-3"></i>
                  <h4 className="text-white">Envío Rápido</h4>
                  <p className="text-light">
                    Recibe tus productos en 24-48 horas
                  </p>
                </div>
              </div>
              <div className="col-md-4 text-center mb-4">
                <div className="feature-card p-4 rounded">
                  <i className="fas fa-award feature-icon text-warning mb-3"></i>
                  <h4 className="text-white">Calidad Premium</h4>
                  <p className="text-light">Productos de las mejores marcas</p>
                </div>
              </div>
              <div className="col-md-4 text-center mb-4">
                <div className="feature-card p-4 rounded">
                  <i className="fas fa-headset feature-icon text-success mb-3"></i>
                  <h4 className="text-white">Soporte 24/7</h4>
                  <p className="text-light">
                    Asesoramiento profesional siempre disponible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="footer-home position-relative">
          <div className="container text-center">
            <div className="social-icons mb-3">
              <a href="#" className="social-link">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-link">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="social-link">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#" className="social-link">
                <i className="fab fa-tiktok"></i>
              </a>
            </div>
            <p className="mb-2 text-light">
              &copy; 2025 SuplementosPro - Todos los derechos reservados
            </p>
            <p className="mb-0 text-light">
              Desarrollado con <i className="fas fa-heart text-danger"></i> para
              la comunidad fitness
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
