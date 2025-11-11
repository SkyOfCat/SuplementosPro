import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../src/styles/App.css";

function App() {
  const [imagenActual, setImagenActual] = useState(0);
  const [imagenesCargadas, setImagenesCargadas] = useState([]);
  const intervaloRef = useRef(null);

  const imagenes = [
    "/images/backgrounds/dunkin-dymatize.png", // 1600x898
    //"/images/backgrounds/optimum-nutrition.jpg", // 1024x971
    //"/images/backgrounds/ronnie-coleman.jpg", // 1500x1500
  ];

  useEffect(() => {
    // Precargar imágenes
    const precargarImagenes = () => {
      const promesasCarga = imagenes.map((ruta) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = ruta;
          img.onload = () => resolve({ ruta, cargada: true });
          img.onerror = () => resolve({ ruta, cargada: false });
        });
      });

      Promise.all(promesasCarga).then((resultados) => {
        const imagenesExitosas = resultados
          .filter((result) => result.cargada)
          .map((result) => result.ruta);

        setImagenesCargadas(imagenesExitosas);

        if (imagenesExitosas.length > 0) {
          aplicarImagenFondo(imagenesExitosas[0]);
          if (imagenesExitosas.length > 1) {
            setTimeout(() => {
              iniciarTransiciones();
            }, 2000);
          }
        }
      });
    };

    precargarImagenes();

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, []);

  const aplicarImagenFondo = (rutaImagen) => {
    document.body.style.backgroundImage = `url('${rutaImagen}')`;
  };

  const iniciarTransiciones = () => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
    }

    intervaloRef.current = setInterval(() => {
      transicionarSiguienteImagen();
    }, 5000);
  };

  const transicionarSiguienteImagen = () => {
    if (imagenesCargadas.length <= 1) return;

    const siguienteIndex = (imagenActual + 1) % imagenesCargadas.length;
    const siguienteImagen = imagenesCargadas[siguienteIndex];

    aplicarImagenFondo(siguienteImagen);
    setImagenActual(siguienteIndex);
  };

  // Estilos CSS optimizados para las dimensiones específicas
  const estilosBody = `
    body {
      background-size: cover !important; /* Muestra la imagen completa sin recortes */
      background-position: center center !important;
      background-repeat: no-repeat !important;
      background-attachment: fixed !important;
      background-color: #5f5f5fff !important; /* Fondo oscuro para mejor contraste */
      min-height: 100vh;
      margin: 0;
      padding: 0;
      transition: background-image 1.5s ease-in-out !important;
    }

    /* Overlay sutil para mejor legibilidad */
    .app-container::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        rgba(0, 0, 0, 0.2) 0%,
        rgba(0, 0, 0, 0.1) 50%,
        rgba(0, 0, 0, 0.2) 100%
      );
      z-index: 1;
      pointer-events: none;
    }

    .app-container {
      position: relative;
      min-height: 100vh;
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
      padding-top: 80px;
      padding-bottom: 60px;
    }

    .hero-section {
      min-height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hero-content {
      margin-top: 2rem;
      animation: fadeInUp 0.8s ease-out;
    }

    /* Tipografía optimizada */
    .hero-title {
      font-size: 3.5rem;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
      margin-bottom: 1.5rem !important;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: white;
    }

    .hero-subtitle {
      font-size: 1.4rem;
      text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.7);
      margin-bottom: 1.5rem !important;
      line-height: 1.6;
      font-weight: 500;
      color: white;
    }

    .brand-highlight {
      color: #00027cff;
      font-weight: 700;
    }

    .text-accent {
      color: #00027cff !important;
    }

    /* Botones */
    .hero-buttons .btn {
      padding: 14px 40px;
      font-size: 1.2rem;
      font-weight: 600;
      border-radius: 50px;
      transition: all 0.3s ease;
      margin: 0.5rem;
      border: none;
    }

    .hero-buttons .btn-primary {
      background: linear-gradient(135deg, #00027cff, #ff8e35);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
      color: white;
    }

    .hero-buttons .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(255, 107, 53, 0.6);
    }

    .hero-buttons .btn-outline-light {
      border: 2px solid rgba(255, 255, 255, 0.8);
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      color: white;
    }

    .hero-buttons .btn-outline-light:hover {
      background: #00027cff;
      color: #ffffffff;
      transform: translateY(-3px);
    }

    /* Feature cards */
    .feature-card {
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      transition: all 0.4s ease;
      padding: 2.5rem 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .feature-card:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, #00027cff, #ff8e35);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .feature-card h4 {
      color: white;
      margin-bottom: 1rem;
    }

    .feature-card p {
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 0;
    }

    /* Footer */
    .footer-home {
      background: rgba(0, 0, 0, 0.7);
      padding: 2.5rem 0;
      margin-top: auto;
      backdrop-filter: blur(10px);
    }

    .social-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 45px;
      height: 45px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      margin: 0 0.5rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.2);
      text-decoration: none;
      color: white;
    }

    .social-link:hover {
      background: #ff6b35;
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(255, 107, 53, 0.4);
    }

    /* Indicador de progreso minimalista */
    .progress-indicator {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      z-index: 1000;
    }

    .progress-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .progress-dot.active {
      background: #ff6b35;
      transform: scale(1.2);
    }

    .progress-dot:hover {
      background: #ff6b35;
    }

    /* Animaciones */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive optimizado para diferentes dimensiones */
    @media (max-width: 768px) {
      body {
        background-size: contain !important;
      }
      
      .hero-title {
        font-size: 2.5rem;
      }
      
      .hero-subtitle {
        font-size: 1.2rem;
      }
      
      .hero-buttons .btn {
        padding: 12px 30px;
        font-size: 1.1rem;
        display: block;
        width: 100%;
        max-width: 280px;
        margin: 0.5rem auto;
      }
      
      .feature-card {
        margin-bottom: 1rem;
        padding: 2rem 1rem;
      }
    }

    @media (max-width: 480px) {
      .hero-title {
        font-size: 2rem;
      }
    }

    /* Para pantallas muy grandes */
    @media (min-width: 1920px) {
      body {
        background-size: cover !important;
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
            {/* HERO SECTION */}
            <div className="hero-section">
              <div className="row align-items-center justify-content-center">
                <div className="col-lg-8 col-xl-6 text-center">
                  <div className="hero-content">
                    <h1 className="hero-title display-3 fw-bold mb-4">
                      SUPLEMENTOS<span className="text-accent">PRO</span>
                    </h1>

                    <p className="hero-subtitle lead mb-4">
                      Descubre los mejores suplementos de
                      <span className="brand-highlight"> Ronnie Coleman</span>,
                      <span className="brand-highlight"> Dymatize</span> y
                      <span className="brand-highlight">
                        {" "}
                        Optimum Nutrition
                      </span>
                    </p>

                    <p className="text-white mb-5 fs-5">
                      Potencia tu rendimiento, acelera tu recuperación y alcanza
                      tus metas fitness con productos de calidad premium.
                    </p>

                    <div className="hero-buttons">
                      <Link to="/productos" className="btn btn-primary btn-lg">
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
            </div>

            {/* FEATURES SECTION */}
            <div className="row mt-5 pt-5">
              <div className="col-md-4 text-center mb-4">
                <div className="feature-card">
                  <i className="fas fa-shipping-fast feature-icon"></i>
                  <h4>Envío Rápido</h4>
                  <p>Recibe tus productos en 24-48 horas</p>
                </div>
              </div>
              <div className="col-md-4 text-center mb-4">
                <div className="feature-card">
                  <i className="fas fa-award feature-icon"></i>
                  <h4>Calidad Premium</h4>
                  <p>Productos de las mejores marcas</p>
                </div>
              </div>
              <div className="col-md-4 text-center mb-4">
                <div className="feature-card">
                  <i className="fas fa-headset feature-icon"></i>
                  <h4>Soporte 24/7</h4>
                  <p>Asesoramiento profesional siempre disponible</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* INDICADOR DE PROGRESO MINIMALISTA */}
        {imagenesCargadas.length > 1 && (
          <div className="progress-indicator">
            {imagenesCargadas.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${
                  index === imagenActual ? "active" : ""
                }`}
                onClick={() => {
                  aplicarImagenFondo(imagenesCargadas[index]);
                  setImagenActual(index);
                }}
              />
            ))}
          </div>
        )}

        {/* FOOTER */}
        <footer className="footer-home">
          <div className="container text-center">
            <div className="social-icons mb-4">
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
            <p className="mb-2 text-white">
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
