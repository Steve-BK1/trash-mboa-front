import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api-client';

// Types pour l'authentification
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  nom: string;
  email: string;
  password: string;
  telephone: string;
  adresse: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'COLLECTOR' | 'ADMIN';
}

// Hook pour la connexion
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials.email, credentials.password),
    onSuccess: (data) => {
      // Sauvegarder les tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Invalider et refetch les données utilisateur
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      
      // Optimistic update pour l'utilisateur
      queryClient.setQueryData(['auth', 'user'], data.user);
    },
    onError: (error: any) => {
      console.error('Erreur de connexion:', error);
      // Afficher le message d'erreur du backend
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur de connexion';
      console.error('Message d\'erreur:', errorMessage);
      // Nettoyer les tokens en cas d'erreur
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },
  });
};

// Hook pour l'inscription
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => 
      authAPI.register(credentials.email, credentials.password, credentials.nom, credentials.telephone, credentials.adresse),
    onSuccess: (data) => {
      // Sauvegarder les tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Invalider et refetch les données utilisateur
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      
      // Optimistic update pour l'utilisateur
      queryClient.setQueryData(['auth', 'user'], data.user);
    },
    onError: (error: any) => {
      console.error('Erreur d\'inscription:', error);
      // Afficher le message d'erreur du backend
      const errorMessage = error?.response?.data?.message || error?.message || 'Erreur d\'inscription';
      console.error('Message d\'erreur:', errorMessage);
      // Nettoyer les tokens en cas d'erreur
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },
  });
};

// Hook pour la déconnexion
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // Nettoyer le cache complet
      queryClient.clear();
      
      // Nettoyer les tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },
    onError: (error: any) => {
      console.error('Erreur de déconnexion:', error);
      // Nettoyer quand même le cache et les tokens
      queryClient.clear();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },
  });
};

// Hook pour récupérer l'utilisateur actuel
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: authAPI.getCurrentUser,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('accessToken'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Ne pas retry sur les erreurs 401 (non authentifié)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook pour vérifier si l'utilisateur est authentifié
export const useIsAuthenticated = () => {
  const { data: user, isLoading, error } = useCurrentUser();
  
  return {
    isAuthenticated: !!user && !error,
    user: user as User | undefined,
    isLoading,
    error,
  };
};

// Hook pour vérifier les permissions selon le rôle
export const useHasRole = (requiredRole: 'USER' | 'COLLECTOR' | 'ADMIN') => {
  const { data: user } = useCurrentUser();
  
  if (!user) return false;
  
  const roleHierarchy = {
    USER: 1,
    COLLECTOR: 2,
    ADMIN: 3,
  };
  
  const userRole = (user as User).role;
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Hook pour changer le mot de passe
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ ancienPassword, nouveauPassword }: { ancienPassword: string, nouveauPassword: string }) =>
      authAPI.changePassword(ancienPassword, nouveauPassword),
  });
};

// Hook pour mettre à jour l'utilisateur
export const useUpdateUser = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => authAPI.updateUser(id, data),
  });
};

// Fonctions utilitaires pour invalider le cache
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    // Invalider toutes les requêtes liées aux utilisateurs
    users: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    // Invalider toutes les requêtes liées aux déchets
    dechets: () => queryClient.invalidateQueries({ queryKey: ['dechets'] }),
    // Invalider toutes les requêtes liées aux signalements
    signalements: () => queryClient.invalidateQueries({ queryKey: ['signalements'] }),
    // Invalider toutes les requêtes liées aux collectes
    collectes: () => queryClient.invalidateQueries({ queryKey: ['collectes'] }),
    // Invalider toutes les requêtes liées aux statistiques
    stats: () => queryClient.invalidateQueries({ queryKey: ['stats'] }),
    // Invalider toutes les requêtes liées à l'authentification
    auth: () => queryClient.invalidateQueries({ queryKey: ['auth'] }),
  };
}; 