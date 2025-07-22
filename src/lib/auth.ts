import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from './validations';

// Types pour l'utilisateur
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

// Types pour les réponses d'API
export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  field?: string;
}

// Fonction de validation avec Zod
export const validateForm = <T>(schema: any, data: T) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  return {
    isValid: true,
    errors: {},
  };
};

// Fonction de connexion
export const loginUser = async (data: LoginFormData): Promise<AuthResponse> => {
  // Simulation d'une API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Validation côté client
  const validation = validateForm(loginSchema, data);
  if (!validation.isValid) {
    throw new Error('Données invalides');
  }

  // Simulation d'une réponse d'API
  return {
    user: {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: data.email,
    },
    token: 'fake-jwt-token',
  };
};

// Fonction d'inscription
export const registerUser = async (data: RegisterFormData): Promise<AuthResponse> => {
  // Simulation d'une API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Validation côté client
  const validation = validateForm(registerSchema, data);
  if (!validation.isValid) {
    throw new Error('Données invalides');
  }

  // Simulation d'une réponse d'API
  return {
    user: {
      id: '2',
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
    },
    token: 'fake-jwt-token',
  };
};

// Fonction de déconnexion
export const logoutUser = async (): Promise<void> => {
  // Simulation d'une API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Nettoyage local
  localStorage.removeItem('auth-token');
  localStorage.removeItem('user');
}; 