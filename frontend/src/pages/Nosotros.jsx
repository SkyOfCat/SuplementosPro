import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../styles/Nosotros.css";
import "../styles/Footer.css";

function Nosotros() {
  // Estado para controlar si estamos en la página Nosotros
  const [enNosotros, setEnNosotros] = useState(true);

  useEffect(() => {
    // Reseteamos márgenes y aseguramos altura mínima y color base claro.
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = "#eef2f5";
    document.body.style.minHeight = "100vh";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    return () => {
      // Cleanup
      document.body.style.background = "";
      document.body.style.backgroundImage = "";
      document.body.style.backgroundColor = "";
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
              <h1 className="display-4 fw-bold mb-3">
                <i className="fas fa-users me-2 text-accent"></i>
                Nuestro Equipo
              </h1>
              <p className="lead text-muted mb-4">
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
          <div className="col-md-5 col-lg-3 mb-4">
            <div className="team-card">
              <div className="card-header-bg"></div>
              <div className="team-img-container">
                <div className="img-placeholder">
                  <i className="fas fa-user"></i>
                </div>
                {/* SE ELIMINÓ EL BLOQUE 'team-overlay' CON LOS ICONOS AQUÍ */}
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
                    <span>React</span>
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
          <div className="col-md-5 col-lg-3 mb-4">
            <div className="team-card">
              <div className="card-header-bg"></div>
              <div className="team-img-container">
                <div className="img-placeholder">
                  <i className="fas fa-user"></i>
                </div>
                {/* SE ELIMINÓ EL BLOQUE 'team-overlay' CON LOS ICONOS AQUÍ */}
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

          {/* Tarjeta de Tomás Torres */}
          <div className="col-md-5 col-lg-3 mb-4">
            <div className="team-card">
              <div className="card-header-bg"></div>
              <div className="team-img-container">
                <div className="img-placeholder">
                  <i className="fas fa-user"></i>
                </div>
                {/* SE ELIMINÓ EL BLOQUE 'team-overlay' CON LOS ICONOS AQUÍ */}
              </div>
              <div className="team-info">
                <h3>Tomás Torres</h3>
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
                    <span>React</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "88%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="skill-item">
                    <span>JavaScript</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="skill-item">
                    <span>Vite</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "80%" }}
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

          {/* Tarjeta de Camilo Morales */}
          <div className="col-md-5 col-lg-3 mb-4">
            <div className="team-card">
              <div className="card-header-bg"></div>
              <div className="team-img-container">
                <div className="img-placeholder">
                  <i className="fas fa-user"></i>
                </div>
                {/* SE ELIMINÓ EL BLOQUE 'team-overlay' CON LOS ICONOS AQUÍ */}
              </div>
              <div className="team-info">
                <h3>Camilo Morales</h3>
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
                        style={{ width: "83%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="skill-item">
                    <span>Python</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "81%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="skill-item">
                    <span>Bootstrap</span>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "79%" }}
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
              <h3 className="text-center mb-4">Sobre el Proyecto</h3>
              <div className="row">
                <div className="col-md-4 text-center mb-4">
                  <div className="project-feature">
                    <i className="fas fa-code feature-icon"></i>
                    <h5 className="mt-3">Tecnologías</h5>
                    <p className="text-muted">React, Django, Bootstrap</p>
                  </div>
                </div>
                <div className="col-md-4 text-center mb-4">
                  <div className="project-feature">
                    <i className="fas fa-rocket feature-icon"></i>
                    <h5 className="mt-3">Propósito</h5>
                    <p className="text-muted">
                      Plataforma de e-commerce fitness
                    </p>
                  </div>
                </div>
                <div className="col-md-4 text-center mb-4">
                  <div className="project-feature">
                    <i className="fas fa-graduation-cap feature-icon"></i>
                    <h5 className="mt-3">Educación</h5>
                    <p className="text-muted">
                      Proyecto académico universitario
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Nosotros;
