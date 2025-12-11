// ============================================
// 📄 frontend/js/config.js
// Configuración global de la aplicación
// ============================================

const CONFIG = {
  API_URL: 'https://voz-animal-backend-production.up.railway.app/api',
  APP_NAME: 'Voz Animal',
  VERSION: '1.0.0'
};

// Función para obtener el token
function getToken() {
  return localStorage.getItem('token');
}

// Función para obtener el usuario actual
function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Función para verificar si está autenticado
function isAuthenticated() {
  return !!getToken() && !!getCurrentUser();
}

// Función para verificar si es admin
function isAdmin() {
  const user = getCurrentUser();
  return user && user.rol === 'admin';
}

// Headers por defecto para peticiones autenticadas
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

// Función genérica para hacer peticiones a la API
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    const data = await response.json();

    // Si el token expiró, redirigir al login
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error en API request:', error);
    throw error;
  }
}

// Función para formatear fechas
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Función para formatear moneda
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount);
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, getToken, getCurrentUser, isAuthenticated, isAdmin, getAuthHeaders, apiRequest, formatDate, formatCurrency };
}