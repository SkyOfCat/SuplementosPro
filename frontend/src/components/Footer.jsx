import React from "react";
import "../styles/Footer.css"; // Asegúrate de crear este archivo CSS

const Footer = () => {
  return (
    <footer className="footer-home text-white">
      <div className="container">
        {/* --- SECCIÓN 1: Newsletter --- */}
        <div className="row align-items-center mb-5 pb-4 border-bottom border-secondary">
          <div className="col-md-6 mb-3 mb-md-0">
            <h4 className="fw-bold mb-1">¡Suscríbete a nuestras novedades!</h4>
            <p className="mb-0 text-white-50 small">
              Recibe ofertas exclusivas y cupones de descuento.
            </p>
          </div>
          <div className="col-md-6">
            <form className="d-flex gap-2">
              <input
                type="email"
                className="form-control footer-input"
                placeholder="Ingresa tu correo aquí..."
                required
              />
              <button type="submit" className="btn btn-warning fw-bold px-4">
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        {/* --- SECCIÓN 2: Enlaces y Confianza --- */}
        <div className="row justify-content-between">
          {/* Columna: Servicio al Cliente */}
          <div className="col-md-4 mb-4">
            <h6 className="text-uppercase fw-bold text-warning mb-3 ls-1">
              Servicio al Cliente
            </h6>
            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <a
                  href="/tiempos-despacho"
                  className="text-decoration-none text-light hover-accent"
                >
                  <i className="fas fa-truck me-2 text-white-50"></i>Tiempos de
                  despacho
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/normas-devoluciones"
                  className="text-decoration-none text-light hover-accent"
                >
                  <i className="fas fa-undo me-2 text-white-50"></i>Normas y
                  devoluciones
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/nuestras-tiendas"
                  className="text-decoration-none text-light hover-accent"
                >
                  <i className="fas fa-store me-2 text-white-50"></i>Nuestras
                  tiendas
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/nosotros"
                  className="text-decoration-none text-light hover-accent"
                >
                  <i className="fas fa-phone me-2 text-white-50"></i>¿Necesita
                  ayuda? Contacte con nosotros
                </a>
              </li>
            </ul>
          </div>

          {/* Columna: Seguridad y Pagos */}
          <div className="col-md-5">
            {/* Compra Segura */}
            <div className="mb-4">
              <h6 className="text-uppercase fw-bold text-warning mb-3 ls-1">
                Compra 100% Segura
              </h6>
              <div className="d-flex align-items-center gap-3 p-3 rounded bg-dark-glass">
                <i className="fas fa-shield-alt fa-2x text-success"></i>
                <div>
                  <p className="mb-0 fw-bold small">Sitio Seguro</p>
                  <p className="mb-0 small text-white-50">
                    Tus datos están protegidos con cifrado SSL.
                  </p>
                </div>
              </div>
            </div>

            {/* Métodos de Pago */}
            <div>
              <h6 className="text-uppercase fw-bold text-warning mb-3 ls-1">
                Medios de Pago
              </h6>
              <div className="d-flex gap-3 align-items-center">
                {/* Icono Mercado Pago (Simulado con FontAwesome o Texto si no tienes img) */}
                <div className="payment-badge bg-light text-primary fw-bold px-2 py-1 rounded">
                  <i className="fas fa-handshake me-1"></i> Mercado Pago
                </div>
                {/* Icono PayPal */}
                <div className="payment-badge bg-light text-primary fw-bold px-2 py-1 rounded">
                  <i className="fab fa-paypal me-1"></i> PayPal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-5 pt-3 border-top border-secondary small text-white-50">
          &copy; {new Date().getFullYear()} SuplementosPro. Todos los derechos
          reservados.
        </div>
      </div>

      {/* --- BOTÓN CHATBOT FLOTANTE --- */}
      <div className="chatbot-float">
        <button
          className="btn btn-primary rounded-circle shadow-lg p-3"
          title="¿Necesitas ayuda?"
        >
          <i className="fas fa-comments fa-2x"></i>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
