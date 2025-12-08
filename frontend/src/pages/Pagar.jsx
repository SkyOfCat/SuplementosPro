import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Footer.css";

// --- CONFIGURACIÓN DE URL DEL BACKEND ---
// IMPORTANTE: Reemplaza esta URL con la tuya de Render sin la barra al final
const API_URL = "https://suplementos-pro-backend.onrender.com";

// Remover cualquier imagen de fondo del body
document.body.style.backgroundImage = "none";
document.body.style.background =
  "linear-gradient(135deg, #aaaaaaff, #b3b3b3ff)";
document.body.style.backgroundSize = "cover";
document.body.style.backgroundAttachment = "fixed";
document.body.style.minHeight = "100vh";
document.body.style.margin = "0";
document.body.style.padding = "0";

// INICIALIZAR MERCADO PAGO (Pon tu Public Key aquí)
initMercadoPago("APP_USR-1546c623-c220-4c67-9d10-48c3015a0156", {
  locale: "es-CL", // Idioma y formato de moneda chileno
});

function Pagar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null); // Estado para el ID de MP

  // Opciones iniciales de PayPal
  const paypalOptions = {
    "client-id":
      "AbA0HmY0xRkx_DA7kl19RMuOToiOU9oREmd-ofYPCjccnhftMymW-KuwF8BezaRq7CbFxuDS_T0Pre2I",
    currency: "USD",
    intent: "capture",
  };

  // --- LÓGICA PARA OBTENER LA PREFERENCIA DE MP ---
  const handleMercadoPago = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("access_token");

    try {
      // CORRECCIÓN: Usamos API_URL y la ruta exacta de Django
      const response = await fetch(`${API_URL}/api/pagos/mercadopago/crear/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.preferenceId) {
        setPreferenceId(data.preferenceId);
      } else {
        setError("No se pudo generar el pago con Mercado Pago");
        console.error("Error MP:", data);
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="container mt-4" style={{ maxWidth: "500px" }}>
        <h2 className="mb-4 text-center">Elige tu método de pago</h2>

        {/* SECCIÓN 1: PAYPAL */}
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">
              <i className="fab fa-paypal me-2"></i>PayPal
            </h5>

            <PayPalScriptProvider options={paypalOptions}>
              <PayPalButtons
                style={{ layout: "vertical" }}
                // 1. Crear la orden
                createOrder={async (data, actions) => {
                  const token = localStorage.getItem("access_token");

                  // CORRECCIÓN: Ruta exacta según tu urls.py
                  const response = await fetch(
                    `${API_URL}/api/pagos/paypal/crear/`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  const order = await response.json();
                  return order.id;
                }}
                // 2. Aprobar (Capturar) el pago
                onApprove={async (data, actions) => {
                  const token = localStorage.getItem("access_token");

                  // CORRECCIÓN: Ruta exacta según tu urls.py
                  const response = await fetch(
                    `${API_URL}/api/pagos/paypal/capturar/`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        orderID: data.orderID,
                      }),
                    }
                  );

                  const details = await response.json();

                  if (details.status === "success") {
                    // Redirigir a éxito
                    window.location.href = `/pago-exitoso?venta=${details.venta_id}`;
                  } else {
                    setError("Error al capturar el pago de PayPal");
                  }
                }}
                onError={(err) => {
                  console.error("Error PayPal:", err);
                  setError("Hubo un error con PayPal");
                }}
              />
            </PayPalScriptProvider>
          </div>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>

        <br></br>
        {/* SECCIÓN 2: MERCADO PAGO */}
        <div className="card mb-4 shadow-sm border-primary">
          <div className="card-body">
            <h5 className="card-title mb-3" style={{ color: "#009ee3" }}>
              Mercado Pago (Webpay / Débito / Crédito)
            </h5>

            {!preferenceId ? (
              <button
                className="btn btn-info text-white w-100 py-2"
                onClick={handleMercadoPago}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Pagar con Mercado Pago"}
              </button>
            ) : (
              /* Una vez tenemos el ID, mostramos el botón oficial "Wallet" */
              <div className="mt-3">
                <Wallet initialization={{ preferenceId: preferenceId }} />
              </div>
            )}
          </div>
        </div>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
      <Footer />
    </div>
  );
}

export default Pagar;
