// Simulation de l'API backend pour les tests
// À supprimer une fois le backend réel connecté

import { authAPI } from './api-client';

// Mock des réponses API
const mockUsers = [
  {
    id: '1',
    email: 'admin@trashmboa.com',
    name: 'Admin Trash Mboa',
    role: 'ADMIN' as const,
  },
  {
    id: '2',
    email: 'collector@trashmboa.com',
    name: 'Collecteur Local',
    role: 'COLLECTOR' as const,
  },
  {
    id: '3',
    email: 'user@trashmboa.com',
    name: 'Utilisateur Test',
    role: 'USER' as const,
  },
];

// Simulation des tokens
const mockTokens = {
  'admin@trashmboa.com': {
    accessToken: 'mock-admin-token',
    refreshToken: 'mock-admin-refresh-token',
  },
  'collector@trashmboa.com': {
    accessToken: 'mock-collector-token',
    refreshToken: 'mock-collector-refresh-token',
  },
  'user@trashmboa.com': {
    accessToken: 'mock-user-token',
    refreshToken: 'mock-user-refresh-token',
  },
};

// Override des fonctions API pour les tests
export const testAuthAPI = {
  login: async (email: string, password: string) => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Vérifier les credentials
    const user = mockUsers.find(u => u.email === email);
    if (!user || password !== 'password123') {
      throw new Error('Email ou mot de passe incorrect');
    }
    
    const tokens = mockTokens[email as keyof typeof mockTokens];
    if (!tokens) {
      throw new Error('Erreur de génération de token');
    }
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  },

  register: async (email: string, password: string, name: string) => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Vérifier si l'email existe déjà
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }
    
    // Créer un nouvel utilisateur
    const newUser = {
      id: String(mockUsers.length + 1),
      email,
      name,
      role: 'USER' as const,
    };
    
    const tokens = {
      accessToken: `mock-new-user-token-${Date.now()}`,
      refreshToken: `mock-new-user-refresh-token-${Date.now()}`,
    };
    
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: newUser,
    };
  },

  logout: async () => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  getCurrentUser: async () => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Non authentifié');
    }
    
    // Trouver l'utilisateur correspondant au token
    const user = mockUsers.find(u => {
      const userTokens = mockTokens[u.email as keyof typeof mockTokens];
      return userTokens?.accessToken === token;
    });
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    return user;
  },
};

// Fonction pour activer le mode test
export const enableTestMode = () => {
  // Override des fonctions API
  Object.assign(authAPI, testAuthAPI);
  
  console.log('🔧 Mode test activé - API simulée');
  console.log('📧 Emails de test:');
  console.log('  - admin@trashmboa.com (Admin)');
  console.log('  - collector@trashmboa.com (Collecteur)');
  console.log('  - user@trashmboa.com (Utilisateur)');
  console.log('🔑 Mot de passe pour tous: password123');
}; 