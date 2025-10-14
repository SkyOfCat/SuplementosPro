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
