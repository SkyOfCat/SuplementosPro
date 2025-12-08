import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { buildUrl } from "../config/api";

const PagoExitoso = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Estados para la UI
  const [mensaje, setMensaje] = useState("Verificando tu pago...");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [ventaInfo, setVentaInfo] = useState(null);

  // Referencia para evitar que React ejecute la petición 2 veces (modo estricto)
  const procesadoRef = useRef(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);

    // 1. DETECTAR SI VIENE DE PAYPAL (Trae ?venta=...)
    const ventaIdPayPal = queryParams.get("venta");

    // 2. DETECTAR SI VIENE DE MERCADO PAGO (Trae ?status=... & payment_id=...)
    const statusMP = queryParams.get("status");
    const paymentIdMP = queryParams.get("payment_id");

    // --- CASO A: PAYPAL (Ya está listo) ---
    if (ventaIdPayPal) {
      setCargando(false);
      setMensaje("¡Pago con PayPal procesado correctamente!");
      setVentaInfo(ventaIdPayPal);
      return;
    }

    // --- CASO B: MERCADO PAGO (Necesita confirmación) ---
    if (statusMP && paymentIdMP) {
      // Evitar doble ejecución
      if (procesadoRef.current) return;
      procesadoRef.current = true;

      if (statusMP === "approved") {
        confirmarVentaBackend(statusMP, paymentIdMP);
      } else {
        setCargando(false);
        setError(true);
        setMensaje("El pago no fue aprobado por Mercado Pago.");
      }
    } else if (!ventaIdPayPal) {
      // --- CASO C: ACCESO DIRECTO SIN DATOS ---
      setCargando(false);
      setError(true);
      setMensaje("No se encontró información del pago.");
    }
  }, [location]);

  // Función para llamar a Django
  const confirmarVentaBackend = async (status, payment_id) => {
    const token = localStorage.getItem("access_token");

    try {
      // 2. CORRECCIÓN CRÍTICA: Usamos buildUrl para apuntar a Render
      const response = await fetch(
        buildUrl("/api/pagos/mercadopago/confirmar/"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: status,
            payment_id: payment_id,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMensaje("¡Pago confirmado y stock actualizado!");
        setVentaInfo(data.venta_id);
      } else {
        setError(true);
        setMensaje(`Hubo un problema: ${data.error || "Error desconocido"}`);
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setMensaje("Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div
          className={`card shadow-lg p-5 text-center ${
            error ? "border-danger" : "border-success"
          }`}
          style={{ maxWidth: "600px", width: "100%" }}
        >
          {/* --- ICONOS --- */}
          {cargando && (
            <div className="mb-4">
              <div
                className="spinner-border text-primary"
                style={{ width: "4rem", height: "4rem" }}
                role="status"
              >
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          )}

          {!cargando && !error && (
            <div className="mb-4">
              <i
                className="fas fa-check-circle text-success"
                style={{ fontSize: "5rem" }}
              ></i>
            </div>
          )}

          {!cargando && error && (
            <div className="mb-4">
              <i
                className="fas fa-times-circle text-danger"
                style={{ fontSize: "5rem" }}
              ></i>
            </div>
          )}

          {/* --- TEXTOS --- */}
          <h2 className="mb-3">{error ? "¡Ups!" : "Estado del Pago"}</h2>

          <h4 className={error ? "text-danger" : "text-success"}>{mensaje}</h4>

          {ventaInfo && (
            <div className="alert alert-light mt-3 border">
              <strong>Folio de Venta:</strong> {ventaInfo}
              <p className="small text-muted mb-0">
                Guarda este número para cualquier reclamo.
              </p>
            </div>
          )}

          {/* --- BOTONES --- */}
          <div className="mt-5 d-grid gap-2">
            {!cargando && (
              <button
                className={`btn ${
                  error ? "btn-outline-danger" : "btn-primary"
                } btn-lg`}
                onClick={() => navigate("/mis-compras")}
              >
                Ver mis pedidos
              </button>
            )}

            <button
              className="btn btn-link text-decoration-none"
              onClick={() => navigate("/")}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoExitoso;
