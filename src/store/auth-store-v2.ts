import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useLogin, useRegister, useLogout, useIsAuthenticated, useHasRole } from '@/hooks/use-auth-api';
import { ErrorHandler } from '@/lib/error-handler';
import { NotificationService } from '@/lib/notifications';
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// Types pour l'authentification
interface User {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'COLLECTOR' | 'ADMIN';
}

interface AuthState {
  error: string | null;
  user: User | null;
}

interface AuthActions {
  setError: (error: string | null) => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

type AuthStore = AuthState & AuthActions;

// Store Zustand pour l'état UI uniquement
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // État initial
      error: null,
      user: null,

      // Actions
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-ui-storage',
      partialize: (state) => ({
        error: state.error,
        user: state.user,
      }),
    }
  )
);

// Hook composé qui combine TanStack Query et Zustand
export const useAuth = () => {
  // TanStack Query hooks
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const { isAuthenticated, user: queryUser, isLoading, error: authError } = useIsAuthenticated();
  
  // Zustand store pour l'UI
  const { error: uiError, setError, clearError, setUser, user } = useAuthStore();

  // Actions composées
  const login = async (email: string, password: string) => {
    try {
      clearError();
      const data = await loginMutation.mutateAsync({ email, password });
      // Stocke le user dans Zustand
      if (loginMutation.data?.user) {
        setUser(loginMutation.data.user);
      } else if (data?.user) {
        setUser(data.user);
      }
      // Notification de succès
      const userToNotify = loginMutation.data?.user || data?.user;
      if (userToNotify) {
        NotificationService.showLoginSuccess((userToNotify as any).name || userToNotify.email);
      }
    } catch (error: any) {
      const errorMessage = ErrorHandler.translateError(error);
      console.error('Erreur de connexion détaillée:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: errorMessage
      });
      setError(errorMessage);
      // Notification d'erreur
      NotificationService.showAuthError(error);
      setUser(null);
    }
  };

  const register = async (payload: { nom: string; email: string; password: string; telephone: string; adresse: string }) => {
    try {
      clearError();
      const data = await registerMutation.mutateAsync(payload);
      // Stocke le user dans Zustand
      if (registerMutation.data?.user) {
        setUser(registerMutation.data.user);
      } else if (data?.user) {
        setUser(data.user);
      }
      // Notification de succès
      const userToNotify = registerMutation.data?.user || data?.user;
      if (userToNotify) {
        NotificationService.showRegisterSuccess((userToNotify as any).name || userToNotify.email);
      }
    } catch (error: any) {
      const errorMessage = ErrorHandler.translateError(error);
      console.error('Erreur d\'inscription détaillée:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: errorMessage
      });
      setError(errorMessage);
      // Notification d'erreur
      NotificationService.showAuthError(error);
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Suppression du cookie accessToken côté client
      Cookies.remove("accessToken");
      NotificationService.showLogoutSuccess();
      setUser(null);
      // La navigation (router.push) doit être faite dans le composant appelant !
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error);
      NotificationService.showError(error, 'Erreur de déconnexion');
      setUser(null);
      throw error; // Permet au composant de gérer l'erreur si besoin
    }
  };

  return {
    // État
    user: user || queryUser,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error: uiError || authError?.message,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    
    // Mutations individuelles pour plus de contrôle
    loginMutation,
    registerMutation,
    logoutMutation,
  };
};

// Hooks utilitaires pour les rôles
export const useUserRole = () => {
  const { user } = useIsAuthenticated();
  return user?.role;
};

export const useIsAdmin = () => {
  const hasRole = useHasRole('ADMIN');
  return hasRole;
};

export const useIsCollector = () => {
  const hasRole = useHasRole('COLLECTOR');
  return hasRole;
};

export const useIsUser = () => {
  const hasRole = useHasRole('USER');
  return hasRole;
}; 