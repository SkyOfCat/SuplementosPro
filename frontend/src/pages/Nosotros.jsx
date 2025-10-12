import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../styles/Nosotros.css";

function Nosotros() {
  // Estado para controlar si estamos en la página Nosotros
  const [enNosotros, setEnNosotros] = useState(true);

  useEffect(() => {
    // Remover cualquier imagen de fondo del body
    document.body.style.backgroundImage = "none";
    document.body.style.background =
      "linear-gradient(135deg, #1a1f36, #2d3748)";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.minHeight = "100vh";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    return () => {
      // Cleanup cuando el componente se desmonte
      document.body.style.background = "";
      document.body.style.backgroundImage = "";
    };
  }, []);

  return (
    <div className="nosotros-layout">
      {/* NAVBAR */}
      <Navbar />

      {/* CONTENIDO NOSOTROS */}
      <div className="container py-5">
        {/* Header Section */}
        <div className="row justify-content-center mb-5">
          <div className="col-12 text-center">
            <div className="nosotros-header">
              <h1 className="display-4 fw-bold text-white mb-3">
                <i className="fas fa-users me-2 text-accent"></i>
                Nuestro Equipo
              </h1>
              <p className="lead text-light mb-4">
                Conoce a los desarrolladores detrás de SuplementosPro
              </p>
              <div className="header-divider">
                <div className="divider-line"></div>
                <i className="fas fa-code divider-icon"></i>
                <div className="divider-line"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Cards */}
        <div className="row justify-content-center">
          {/* Tarjeta de José */}
          <div className="col-md-5 col-lg-4 mb-4">
            <div className="team-card">
              <div className="card-header-bg"></div>
              <div className="team-img-container">
                <div className="img-placeholder">
                  <i className="fas fa-user"></i>
                </div>
                <div className="team-overlay">
                  <div className="social-icons">
                    <a href="#" className="social-link">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="#" className="social-link">
                      <i className="fab fa-github"></i>
                    </a>
                    <a href="#" className="social-link">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </div>
                </div>
              </div>
              <div className="team-info">
                <h3>José Miguel Pérez</h3>
                <p className="team-role">Ingeniero en Informática</p>
                <div className="team-stats">
                  <div className="stat-item">
                    <i className="fas fa-graduation-cap text-accent"></i>
                    <span>4to año de estudio y en curso</span>
                  </div>
                </div>
              </div>
              <div className="team-skills">
                <h4>Habilidades Técnicas</h4>
                <div className="skills">
                  <div className="skill-item">
                    <span>Django</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="skill-item">
                    <span>Python</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "80%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="skill-item">
                    <span>HTML/CSS</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="contact-btn">
                  <a href="#" className="btn btn-primary">
                    <i className="fas fa-envelope me-2"></i>
                    Contactar
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Luis */}
          <div className="col-md-5 col-lg-4 mb-4">
            <div className="team-card">
              <div className="card-header-bg"></div>
              <div className="team-img-container">
                <div className="img-placeholder">
                  <i className="fas fa-user"></i>
                </div>
                <div className="team-overlay">
                  <div className="social-icons">
                    <a href="#" className="social-link">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href="#" className="social-link">
                      <i className="fab fa-github"></i>
                    </a>
                    <a href="#" className="social-link">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </div>
                </div>
              </div>
              <div className="team-info">
                <h3>Luis Vargas</h3>
                <p className="team-role">Ingeniero en Informática</p>
                <div className="team-stats">
                  <div className="stat-item">
                    <i className="fas fa-graduation-cap text-accent"></i>
                    <span>4to año de estudio y en curso</span>
                  </div>
                </div>
              </div>
              <div className="team-skills">
                <h4>Habilidades Técnicas</h4>
                <div className="skills">
                  <div className="skill-item">
                    <span>Django</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "82%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="skill-item">
                    <span>Python</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="skill-item">
                    <span>HTML/CSS</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "70%" }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="contact-btn">
                  <a href="#" className="btn btn-primary">
                    <i className="fas fa-envelope me-2"></i>
                    Contactar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="about-project">
              <h3 className="text-center text-white mb-4">Sobre el Proyecto</h3>
              <div className="row">
                <div className="col-md-4 text-center mb-4">
                  <div className="project-feature">
                    <i className="fas fa-code feature-icon"></i>
                    <h5 className="text-white mt-3">Tecnologías</h5>
                    <p className="text-light">React, Django, Bootstrap</p>
                  </div>
                </div>
                <div className="col-md-4 text-center mb-4">
                  <div className="project-feature">
                    <i className="fas fa-rocket feature-icon"></i>
                    <h5 className="text-white mt-3">Propósito</h5>
                    <p className="text-light">
                      Plataforma de e-commerce fitness
                    </p>
                  </div>
                </div>
                <div className="col-md-4 text-center mb-4">
                  <div className="project-feature">
                    <i className="fas fa-graduation-cap feature-icon"></i>
                    <h5 className="text-white mt-3">Educación</h5>
                    <p className="text-light">
                      Proyecto académico universitario
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Nosotros;
