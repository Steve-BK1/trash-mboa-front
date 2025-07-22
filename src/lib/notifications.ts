import { toast } from 'sonner';
import { ErrorHandler } from './error-handler';

export class NotificationService {
  // Afficher une erreur avec le gestionnaire d'erreurs
  static showError(error: any, title?: string) {
    const errorMessage = ErrorHandler.translateError(error);
    const errorType = ErrorHandler.getErrorType(error);
    const errorIcon = ErrorHandler.getErrorIcon(errorType);

    toast.error(errorMessage, {
      id: `error-${Date.now()}`,
      description: title || 'Une erreur s\'est produite',
      duration: 5000,
      action: {
        label: 'Fermer',
        onClick: () => toast.dismiss(),
      },
    });

    // Log détaillé en développement
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Erreur ${errorType.toUpperCase()}`);
      console.error('Message utilisateur:', errorMessage);
      console.error('Statut HTTP:', error?.response?.status);
      console.error('Message backend:', error?.response?.data?.message);
      console.error('Erreur complète:', error);
      console.groupEnd();
    }
  }

  // Afficher un succès
  static showSuccess(message: string, title?: string) {
    toast.success(message, {
      id: `success-${Date.now()}`,
      description: title || 'Opération réussie',
      duration: 3000,
    });
  }

  // Afficher une information
  static showInfo(message: string, title?: string) {
    toast.info(message, {
      id: `info-${Date.now()}`,
      description: title || 'Information',
      duration: 4000,
    });
  }

  // Afficher un avertissement
  static showWarning(message: string, title?: string) {
    toast.warning(message, {
      id: `warning-${Date.now()}`,
      description: title || 'Attention',
      duration: 4000,
    });
  }

  // Afficher une notification de chargement
  static showLoading(message: string) {
    return toast.loading(message, {
      id: `loading-${Date.now()}`,
      duration: Infinity,
    });
  }

  // Mettre à jour une notification de chargement
  static updateLoading(toastId: string, message: string, type: 'success' | 'error' | 'info' = 'success') {
    toast.dismiss(toastId);
    
    switch (type) {
      case 'success':
        this.showSuccess(message);
        break;
      case 'error':
        this.showError({ message });
        break;
      case 'info':
        this.showInfo(message);
        break;
    }
  }

  // Notifications spécifiques à l'authentification
  static showAuthError(error: any) {
    const errorType = ErrorHandler.getErrorType(error);
    
    switch (errorType) {
      case 'auth':
        this.showError(error, 'Erreur d\'authentification');
        break;
      case 'validation':
        this.showError(error, 'Données invalides');
        break;
      case 'network':
        this.showError(error, 'Problème de connexion');
        break;
      default:
        this.showError(error, 'Erreur technique');
    }
  }

  // Notification de connexion réussie
  static showLoginSuccess(userName: string) {
    this.showSuccess(
      `Bienvenue ${userName} !`,
      'Connexion réussie'
    );
  }

  // Notification d'inscription réussie
  static showRegisterSuccess(userName: string) {
    this.showSuccess(
      `Compte créé avec succès pour ${userName} !`,
      'Inscription réussie'
    );
  }

  // Notification de déconnexion
  static showLogoutSuccess() {
    this.showInfo(
      'Vous avez été déconnecté avec succès.',
      'Déconnexion'
    );
  }

  // Notification de session expirée
  static showSessionExpired() {
    this.showWarning(
      'Votre session a expiré. Veuillez vous reconnecter.',
      'Session expirée'
    );
  }
} 