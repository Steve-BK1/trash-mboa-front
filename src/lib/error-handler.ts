// Gestionnaire d'erreurs centralisé pour l'API
export interface ApiError {
  status: number;
  message: string;
  data?: any;
}

export class ErrorHandler {
  // Traduire les erreurs du backend en messages utilisateur
  static translateError(error: any): string {
    const status = error?.response?.status;
    const backendMessage = error?.response?.data?.message;
    const networkError = error?.message;

    // Erreurs spécifiques du backend
    if (backendMessage) {
      return this.translateBackendMessage(backendMessage);
    }

    // Erreurs HTTP par statut
    switch (status) {
      case 400:
        return "Les données envoyées sont incorrectes. Veuillez vérifier vos informations.";
      case 401:
        return "Email ou mot de passe incorrect. Veuillez réessayer.";
      case 403:
        return "Vous n'avez pas les permissions nécessaires pour cette action.";
      case 404:
        return "La ressource demandée n'existe pas.";
      case 409:
        return "Cette adresse email est déjà utilisée.";
      case 422:
        return "Les données fournies ne sont pas valides.";
      case 429:
        return "Trop de tentatives. Veuillez patienter avant de réessayer.";
      case 500:
        return "Erreur serveur. Veuillez réessayer plus tard.";
      default:
        break;
    }

    // Erreurs réseau
    if (networkError) {
      if (networkError.includes('Network Error')) {
        return "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";
      }
      if (networkError.includes('timeout')) {
        return "La requête a pris trop de temps. Veuillez réessayer.";
      }
    }

    // Erreur par défaut
    return "Une erreur inattendue s'est produite. Veuillez réessayer.";
  }

  // Traduire les messages spécifiques du backend
  private static translateBackendMessage(message: string): string {
    const translations: Record<string, string> = {
      // Authentification
      'Email ou mot de passe incorrect': 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.',
      'Invalid credentials': 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.',
      'User not found': 'Aucun compte trouvé avec cet email.',
      'User already exists': 'Un compte existe déjà avec cette adresse email.',
      'Password is required': 'Le mot de passe est requis.',
      'Email is required': 'L\'adresse email est requise.',
      'Email must be valid': 'Veuillez saisir une adresse email valide.',
      'Password must be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
      'Name is required': 'Le nom est requis.',
      
      // Validation
      'Validation failed': 'Les données fournies ne sont pas valides.',
      'Invalid email format': 'Format d\'email invalide.',
      'Password too short': 'Le mot de passe est trop court.',
      'Password too weak': 'Le mot de passe est trop faible.',
      
      // Général
      'Internal server error': 'Erreur serveur interne. Veuillez réessayer plus tard.',
      'Service unavailable': 'Service temporairement indisponible.',
      'Request timeout': 'La requête a pris trop de temps.',
    };

    return translations[message] || message;
  }

  // Obtenir le type d'erreur pour l'UI
  static getErrorType(error: any): 'auth' | 'validation' | 'network' | 'server' {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message;

    // Erreurs d'authentification
    if (status === 401 || status === 403) {
      return 'auth';
    }

    // Erreurs de validation
    if (status === 400 || status === 422) {
      return 'validation';
    }

    // Erreurs réseau
    if (status === 0 || message?.includes('Network Error')) {
      return 'network';
    }

    // Erreurs serveur
    if (status >= 500) {
      return 'server';
    }

    return 'server';
  }

  // Obtenir l'icône pour l'erreur
  static getErrorIcon(errorType: 'auth' | 'validation' | 'network' | 'server'): string {
    switch (errorType) {
      case 'auth':
        return '🔐';
      case 'validation':
        return '⚠️';
      case 'network':
        return '🌐';
      case 'server':
        return '⚙️';
      default:
        return '❌';
    }
  }

  // Obtenir la couleur pour l'erreur
  static getErrorColor(errorType: 'auth' | 'validation' | 'network' | 'server'): string {
    switch (errorType) {
      case 'auth':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'validation':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'network':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'server':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  }
} 