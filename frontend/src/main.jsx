import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import PerfilCliente from "./pages/PerfilCliente.jsx";
import Pedidos from "./pages/Pedidos.jsx";
import RecuperarContrasena from "./pages/RecuperarContrasena.jsx";
import ResetearContrasena from "./pages/ResetarContrasena.jsx";
import Productos from "./pages/Productos.jsx";
import ProductoDetalle from "./pages/ProductoDetalle.jsx";
import Carrito from "./pages/Carrito.jsx";
import Nosotros from "./pages/Nosotros.jsx";
/* ADMINISTRACIÓN */
import GestionUsuarios from "./pages/admin/GestionUsuarios.jsx";
import GestionProductos from "./pages/admin/GestionProductos.jsx";
import AgregarProteina from "./pages/admin/AgregarProteina.jsx";
import EditarProteina from "./pages/admin/EditarProteina.jsx";

import AgregarSnack from "./pages/admin/AgregarSnack.jsx";
import EditarSnack from "./pages/admin/EditarSnack.jsx";

import AgregarCreatina from "./pages/admin/AgregarCreatina.jsx";
import EditarCreatina from "./pages/admin/EditarCreatina.jsx";

import AgregarAminoacido from "./pages/admin/AgregarAminoacido.jsx";
import EditarAminoacido from "./pages/admin/EditarAminoacido.jsx";

import AgregarVitamina from "./pages/admin/AgregarVitamina.jsx";
import EditarVitamina from "./pages/admin/EditarVitamina.jsx";

import AgregarUsuario from "./pages/admin/AgregarUsuario.jsx";
import EditarUsuario from "./pages/admin/EditarUsuario.jsx";

/* Pagos */
import Pagar from "./pages/Pagar.jsx";
import PagoExitoso from "./pages/PagoExitoso.jsx";

{
  /*------------------------------------------------------ */
}
import Registro from "./pages/Registro.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/perfil-cliente" element={<PerfilCliente />} />
      <Route path="/mis-compras" element={<Pedidos />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route
        path="/resetear-contrasena/:token"
        element={<ResetearContrasena />}
      />
      <Route path="/productos" element={<Productos />} />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/nosotros" element={<Nosotros />} />
      {/* ADMINISTRACIÓN */}
      <Route path="/admin/usuarios" element={<GestionUsuarios />} />
      <Route path="/admin/productos" element={<GestionProductos />} />

      <Route path="/admin/agregar-proteina" element={<AgregarProteina />} />
      <Route path="/admin/editar-proteina/:id" element={<EditarProteina />} />

      <Route path="/admin/agregar-snack" element={<AgregarSnack />} />
      <Route path="/admin/editar-snack/:id" element={<EditarSnack />} />

      <Route path="/admin/agregar-creatina" element={<AgregarCreatina />} />
      <Route path="/admin/editar-creatina/:id" element={<EditarCreatina />} />

      <Route path="/admin/agregar-aminoacido" element={<AgregarAminoacido />} />
      <Route
        path="/admin/editar-aminoacido/:id"
        element={<EditarAminoacido />}
      />

      <Route path="/admin/agregar-vitamina" element={<AgregarVitamina />} />
      <Route path="/admin/editar-vitamina/:id" element={<EditarVitamina />} />

      <Route path="/admin/agregar-usuario" element={<AgregarUsuario />} />
      <Route path="/admin/editar-usuario/:id" element={<EditarUsuario />} />

      {/*  */}
      {/* SELECCIÓN DE PRODUCTOS */}
      <Route
        path="/proteina/:id"
        element={<ProductoDetalle tipo="proteina" />}
      />
      <Route path="/snack/:id" element={<ProductoDetalle tipo="snack" />} />
      <Route
        path="/creatina/:id"
        element={<ProductoDetalle tipo="creatina" />}
      />
      <Route
        path="/aminoacido/:id"
        element={<ProductoDetalle tipo="aminoacido" />}
      />
      <Route
        path="/vitamina/:id"
        element={<ProductoDetalle tipo="vitamina" />}
      />

      {/* */}
      {/* Pago */}
      <Route path="/pagar" element={<Pagar />} />
      <Route path="/pago-exitoso" element={<PagoExitoso />} />
      {/* */}
      <Route path="/registro" element={<Registro />} />
    </Routes>
  </BrowserRouter>
);
