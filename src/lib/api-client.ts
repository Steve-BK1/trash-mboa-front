import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { NotificationService } from './notifications';
import { adaptLoginPayload, adaptRegisterPayload, detectBackendFormat } from './api-adapters';
import Cookies from "js-cookie";

// Configuration de base
//  || 'http://localhost:3002'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Types pour les réponses d'erreur
interface ApiError {
  message: string;
  status: number;
}

// Types pour l'authentification
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: 'USER' | 'COLLECTOR' | 'ADMIN';
  };
}

// Client Axios principal
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour obtenir le token depuis le localStorage
const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Fonction pour obtenir le refresh token
const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

// Fonction pour sauvegarder les tokens
const saveTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

// Fonction pour nettoyer les tokens
const clearTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// Variable pour éviter les appels multiples de refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Intercepteur de requête - Ajoute le token JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gère le refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Si l'erreur est 401 et qu'on n'a pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si un refresh est déjà en cours, on met en queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        // Notification de session expirée
        NotificationService.showSessionExpired();
        // Rediriger vers login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<AuthResponse>(
          `${API_BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        saveTokens(accessToken, newRefreshToken);

        // Mettre à jour le header de la requête originale
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        // Notification de session expirée
        NotificationService.showSessionExpired();
        // Rediriger vers login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Fonctions utilitaires pour l'authentification
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const payload = adaptLoginPayload(email, password);
    console.log('🔐 Tentative de connexion:', { email, password: '***' });
    console.log('📤 Payload envoyé:', payload);
    
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', payload);
      console.log('✅ Connexion réussie:', response.data);
      // Stocke le token dans un cookie pour le middleware
      if (typeof window !== 'undefined') {
        Cookies.set('accessToken', response.data.accessToken, { path: '/', sameSite: 'lax' });
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        payload: payload
      });
      throw error;
    }
  },

  register: async (email: string, password: string, nom: string, telephone: string, adresse: string): Promise<AuthResponse> => {
    const payload = { nom, email, password, telephone, adresse };
    console.log('📝 Tentative d\'inscription:', { nom, email, password: '***', telephone, adresse });
    console.log('📤 Payload envoyé:', payload);
    
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/register', payload);
      console.log('✅ Inscription réussie:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erreur d\'inscription:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        payload: payload,
        backendFormat: detectBackendFormat(error)
      });
      
      // Log détaillé de la réponse du backend
      if (error.response?.data) {
        console.group('🔍 Détails de l\'erreur backend:');
        console.log('Status:', error.response.status);
        console.log('Headers:', error.response.headers);
        console.log('Data:', error.response.data);
        console.log('Message:', error.response.data.message);
        console.log('Errors:', error.response.data.errors);
        console.log('Validation:', error.response.data.validation);
        console.groupEnd();
      }
      
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      clearTokens();
    }
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/users/me');
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await apiClient.put(`/api/users/${id}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  createDechet: async (data: any) => {
    // Vérification des champs obligatoires
    if (!data.type || !data.quantite || !data.adresse || !data.ville) {
      throw new Error("Tous les champs obligatoires doivent être remplis.");
    }

    // Construction du payload JSON conforme au backend
    const payload: any = {
      type: data.type,
      quantite: data.quantite,
      adresse: data.adresse,
      ville: data.ville,
    };
    if (data.latitude !== undefined && data.latitude !== null && data.latitude !== "") {
      payload.latitude = data.latitude;
    }
    if (data.longitude !== undefined && data.longitude !== null && data.longitude !== "") {
      payload.longitude = data.longitude;
    }
    if (data.photo) {
      payload.photo = data.photo;
    }

    const response = await apiClient.post('/api/dechets', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },
  updateDechet: async (id: number, data: any) => {
    try {
      const response = await apiClient.put(`/api/dechets/${id}`, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur modification déchet:', error);
      throw error;
    }
  },
  deleteDechet: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/dechets/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur suppression déchet:', error);
      throw error;
    }
  },
  createSignalement: async (data: any) => {
    try {
      const response = await apiClient.post('/api/signalements', data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur création signalement:', error);
      throw error;
    }
  },
  getUserSignalements: async () => {
    try {
      const response = await apiClient.get('/api/signalements');
      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération signalements:', error);
      throw error;
    }
  },
  updateSignalement: async (id: number, data: any) => {
    try {
      const response = await apiClient.put(`/api/signalements/${id}`, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur modification signalement:', error);
      throw error;
    }
  },
  deleteSignalement: async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/signalements/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur suppression signalement:', error);
      throw error;
    }
  },
  changePassword: async (ancienPassword: string, nouveauPassword: string) => {
    const response = await apiClient.post('/api/users/change-password', {
      ancienPassword,
      nouveauPassword,
    });
    return response.data;
  },
};

// --- API COLLECTES ---
export const collecteAPI = {
  getCollectesEnAttente: async () => {
    const response = await apiClient.get('/api/collectes/en-attente');
    return response.data;
  },
  validerCollecte: async (id: number) => {
    const response = await apiClient.put(`/api/collectes/${id}/valider`);
    return response.data;
  },
  getCollectesByStatus: async (status: string) => {
    const response = await apiClient.get(`/api/collectes?status=${encodeURIComponent(status)}`);
    return response.data;
  },
};

// Export du client pour utilisation directe
export default apiClient; 