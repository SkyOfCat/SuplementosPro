// Configuración de la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  ENDPOINTS: {
    // Autenticación JWT
    TOKEN: "/api/token/",
    TOKEN_REFRESH: "/api/token/refresh/",

    // Endpoints de la API (según tus routers)
    PROTEINAS: "/api/proteinas/",
    SNACKS: "/api/snacks/",
    CREATINAS: "/api/creatinas/",
    AMINOACIDOS: "/api/aminoacidos/",
    VITAMINAS: "/api/vitaminas/",
    CARRITO: "/api/carrito/",
    USUARIOS: "/api/usuarios/",

    // Endpoints específicos de vistas
    USUARIO_ACTUAL: "/api/usuario/actual/",
    REGISTRO: "/api/registro/",
  },
  TIMEOUT: 10000,
};

// Headers para autenticación
export const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Headers para FormData (sin Content-Type)
export const getAuthHeadersFormData = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Headers para JSON
export const getAuthHeadersJSON = () => {
  const token = localStorage.getItem("access_token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };
};

// Función para construir URLs completas
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función para manejar respuestas de la API
export const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw {
      status: response.status,
      message:
        errorData?.detail ||
        errorData?.non_field_errors?.[0] ||
        "Error en la solicitud",
      data: errorData,
    };
  }
  return response.json();
};

// ✅ NUEVA FUNCIÓN: Manejo de URLs de imágenes con Cloudinary
export const getImagenUrl = (imagenPath) => {
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!imagenPath) {
    return "https://via.placeholder.com/300x300/4A5568/FFFFFF?text=Imagen+No+Disponible";
  }

  // ✅ Si ya es una URL completa de Cloudinary
  if (imagenPath.includes("res.cloudinary.com")) {
    return imagenPath;
  }

  // ✅ Si es una URL HTTP/HTTPS normal
  if (imagenPath.startsWith("http")) {
    return imagenPath;
  }

  // ✅ Si es un objeto de Cloudinary
  if (typeof imagenPath === "object" && imagenPath.url) {
    return imagenPath.url;
  }

  // ✅ CORREGIDO: Usar el cloud name real
  if (
    typeof imagenPath === "string" &&
    !imagenPath.includes("/") &&
    !imagenPath.startsWith("media/")
  ) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${imagenPath}`;
  }

  // ✅ Para imágenes locales
  if (imagenPath.startsWith("/media/") || imagenPath.startsWith("media/")) {
    return `${API_CONFIG.BASE_URL}${
      imagenPath.startsWith("/") ? "" : "/"
    }${imagenPath}`;
  }

  return "https://via.placeholder.com/300x300/4A5568/FFFFFF?text=Imagen+No+Disponible";
};

// ✅ Función mejorada con debug (opcional)
export const getImagenUrlConDebug = (imagenPath, contexto = "") => {
  const url = getImagenUrl(imagenPath);

  if (import.meta.env.DEV) {
    console.log("🔍 Debug Imagen:", {
      contexto,
      imagenPath,
      urlFinal: url,
      tipo: typeof imagenPath,
      esCloudinary: url.includes("cloudinary.com"),
      esPlaceholder: url.includes("placeholder.com"),
      esLocal: url.includes(API_CONFIG.BASE_URL),
    });
  }

  return url;
};

// ✅ Función para obtener imagen optimizada de Cloudinary
export const getImagenOptimizada = (imagenPath, ancho = 300, alto = 300) => {
  const urlBase = getImagenUrl(imagenPath);

  // Si es Cloudinary, aplicar optimizaciones
  if (urlBase.includes("res.cloudinary.com")) {
    // Transformaciones de Cloudinary para optimización
    return urlBase.replace(
      "/upload/",
      `/upload/w_${ancho},h_${alto},c_fill,q_auto,f_auto/`
    );
  }

  return urlBase;
};
