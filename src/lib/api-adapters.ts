// Adaptateurs pour convertir les données du frontend au format attendu par le backend

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Adapter les données d'inscription selon l'API backend
export function adaptRegisterPayload(email: string, password: string, fullName: string): RegisterPayload {
  // Séparer le nom complet en prénom et nom
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Retourner le format attendu par le backend
  return {
    email,
    password,
    name: fullName,
    firstName,
    lastName,
  };
}

// Adapter les données de connexion
export function adaptLoginPayload(email: string, password: string): LoginPayload {
  return {
    email,
    password,
  };
}

// Fonction pour détecter le format attendu par le backend
export function detectBackendFormat(error: any): 'simple' | 'detailed' {
  const errorData = error?.response?.data;
  
  // Si l'erreur mentionne des champs spécifiques, on peut détecter le format
  if (errorData?.message?.includes('firstName') || errorData?.message?.includes('lastName')) {
    return 'detailed';
  }
  
  if (errorData?.message?.includes('name')) {
    return 'simple';
  }
  
  // Par défaut, utiliser le format simple
  return 'simple';
} 