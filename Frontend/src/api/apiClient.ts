/**
 * @file apiClient.ts
 * @brief Módulo cliente API con autenticación JWT
 * 
 * @details
 * Este módulo implementa un cliente HTTP basado en Axios con manejo automático de autenticación JWT.
 * Proporciona una función factoría para crear instancias de cliente HTTP pre-configuradas con:
 * - Inyección automática del token de acceso en las cabeceras
 * - Manejo de refresco de tokens vencidos
 * - Reintento automático de peticiones fallidas por token expirado
 * - Gestión centralizada de errores de autenticación
 */

import axios from 'axios';
import type { RefreshTokenResponse, User } from '../types/models';

/**
 * @brief Crea una instancia de Axios configurada con autenticación JWT
 * @details
 * La instancia incluye interceptores para:
 * - Inyectar automáticamente el token de acceso en las cabeceras
 * - Manejar la renovación de tokens vencidos
 * - Reintentar peticiones fallidas por token expirado
 * * @param baseURL La URL base del microservicio al que esta instancia se conectará.
 * @return {axios.AxiosInstance} Instancia de Axios configurada
 */
const createAuthApiClient = (baseURL: string) => { 
  // Crea una instancia base de Axios con la configuración inicial
  const instance = axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * @brief Interceptor de petición para inyectar el token de acceso
   * @private
   */
  instance.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      const publicUrls = ['/api/usuarios/login/', '/api/usuarios/signup/', '/api/usuarios/refresh_token/'];

      if (token && !publicUrls.some(url => config.url?.includes(url))) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

    /**
     * @brief Maneja errores de autenticación y renueva tokens expirados
     * @private
     * @param error Objeto de error que contiene la respuesta fallida
     * @returns {Promise} Promesa que resuelve con la respuesta exitosa o rechaza con el error
     * 
     * @details
     * Este manejador asíncrono se activa cuando una petición recibe una respuesta de error.
     * Su principal función es manejar el error 401 (No autorizado) intentando:
     * 1. Verificar si el error es por token expirado (401) y no es una petición de refresco
     * 2. Obtener un nuevo token de acceso usando el refresh token
     * 3. Reintentar la petición original con el nuevo token
     * 4. Redirigir al login si el refresh token también es inválido
     */  
  instance.interceptors.response.use(
    (response) => response,

    async (error) => {
      const originalRequest = error.config;
      const refreshUrl = `${import.meta.env.VITE_API_USUARIOS_URL}/api/usuarios/refresh_token/`;

      if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== refreshUrl) {        
        
        originalRequest._retry = true;
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          removeTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const refreshResponse = await axios.post<RefreshTokenResponse>(
            refreshUrl,
            { refresh: refreshToken, }
          );

          const newAccessToken = refreshResponse.data.access;
          const newRefreshToken = refreshResponse.data.refresh || refreshToken;
          setTokens(newAccessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return instance(originalRequest);

        } catch (refreshError) {
          removeTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance; 
};

export default createAuthApiClient;

/**
 * @brief Almacena los tokens de autenticación en el almacenamiento local.
 * @param accessToken Token de acceso JWT para autenticación
 * @param refreshToken Token de refresco para renovar el token de acceso
 * 
 * @details
 * Almacena tanto el token de acceso como el de refresco en el localStorage del navegador.
 * Estos tokens son necesarios para autenticar las peticiones posteriores al servidor.
 * 
 * @note Los tokens se almacenan en localStorage para persistencia entre recargas de página
 */
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * @brief Elimina todos los datos de autenticación del almacenamiento local.
 * 
 * @details
 * Esta función limpia todos los tokens y datos de usuario almacenados,
 * efectivamente cerrando la sesión del usuario de manera segura.
 * 
 * @see setTokens
 */
export const removeTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

/**
 * @brief Obtiene el token de acceso almacenado
 * @return {string | null} Token de acceso o null si no existe
 */
export const getAccessToken = (): string | null => localStorage.getItem('accessToken');

/**
 * @brief Obtiene el token de refresco almacenado
 * @return {string | null} Token de refresco o null si no existe
 */
export const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');

/**
 * @brief Obtiene los datos del usuario actual almacenados
 * @return {User | null} Datos del usuario o null si no hay sesión activa
 * 
 * @details
 * Los datos del usuario se almacenan como una cadena JSON en el localStorage.
 * Esta función se encarga de parsear dicha cadena y devolver el objeto User correspondiente.
 */
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};