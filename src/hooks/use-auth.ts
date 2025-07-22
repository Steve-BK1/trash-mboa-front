import { useAuthStore, useUser, useIsAuthenticated, useIsLoading, useError } from "@/store/auth-store";
import { logoutUser } from "@/lib/auth";

export function useAuth() {
  const {
    setUser,
    setToken,
    setLoading,
    setError,
    clearError,
    logout: logoutFromStore,
  } = useAuthStore();

  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useIsLoading();
  const error = useError();

  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      logoutFromStore();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la déconnexion');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setToken,
    setLoading,
    setError,
    clearError,
    logout,
  };
} 