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
    "/static/images/backgrounds/Optimun_Nutrition.png",
    // Agrega más imágenes aquí cuando las tengas
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
              reject(new Error(`No se pudo cargar: ${imagenes[i]}`));
            };
          });
        } catch (error) {
          console.error("Error en precarga:", error);
        }
      }

      setImagenesPrecargadas(imagenesCargadas);
      iniciarTransiciones();
    };

    precargarImagenes();
  }, []);

  const iniciarTransiciones = () => {
    // Configurar el fondo inicial
    document.body.className = "body-background body-background-0";

    // Configurar intervalo para transiciones
    const intervalo = setInterval(() => {
      realizarTransicion();
    }, 8000); // Cambiar cada 8 segundos

    return () => clearInterval(intervalo);
  };

  const realizarTransicion = () => {
    if (transicionando) return;

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
      background-image: url('${imagenes[0]}');
    }

    .body-background-1 {
      background-image: url('${imagenes[1]}');
    }

    .body-transitioning {
      transition: background-image 2s ease-in-out !important;
    }

    .app-container {
      position: relative;
      min-height: 100vh;
      background: rgba(0, 0, 0, 0.4);
    }

    .main-content {
      position: relative;
      z-index: 2;
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
        rgba(0, 0, 0, 0.6) 0%,
        rgba(0, 0, 0, 0.4) 50%,
        rgba(0, 0, 0, 0.6) 100%
      );
      z-index: 1;
      pointer-events: none;
    }
  `;

  return (
    <>
      <style>{estilosBody}</style>
      <div className="app-container">
        <Navbar />

        <main className="main-content">
          <div className="container py-5">
            {/* HERO SECTION */}
            <div className="row align-items-center min-vh-75">
              <div className="col-lg-8 mx-auto text-center">
                <div className="hero-content">
                  <h1 className="hero-title display-4 fw-bold text-white mb-4">
                    SUPLEMENTOS<span className="text-accent">PRO</span>
                  </h1>
                  <p className="hero-subtitle lead text-light mb-4">
                    Descubre los mejores suplementos de
                    <span className="brand-highlight"> Ronnie Coleman</span>,
                    <span className="brand-highlight"> Dymatize</span> y
                    <span className="brand-highlight"> Optimum Nutrition</span>
                  </p>
                  <p className="text-light mb-5">
                    Potencia tu rendimiento, acelera tu recuperación y alcanza
                    tus metas fitness con productos de calidad premium.
                  </p>

                  <div className="hero-buttons">
                    <Link
                      to="/productos"
                      className="btn btn-primary btn-lg me-3"
                    >
                      <i className="fas fa-store me-2"></i>
                      Ver Productos
                    </Link>
                    <Link
                      to="/registro"
                      className="btn btn-outline-light btn-lg"
                    >
                      <i className="fas fa-user-plus me-2"></i>
                      Crear Cuenta
                    </Link>
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
          <div className="container">
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
