// Module de debug pour tester l'API backend

export interface ApiTestResult {
  success: boolean;
  status: number;
  data: any;
  error?: any;
  payload: any;
}

export async function testApiEndpoint(
  endpoint: string, 
  payload: any, 
  method: 'POST' | 'GET' = 'POST'
): Promise<ApiTestResult> {
  try {
    console.group(`🧪 Test API: ${method} ${endpoint}`);
    console.log('📤 Payload:', payload);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method === 'POST' ? JSON.stringify(payload) : undefined,
    });
    
    const data = await response.json();
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('📥 Response Data:', data);
    
    const result: ApiTestResult = {
      success: response.ok,
      status: response.status,
      data,
      payload
    };
    
    if (!response.ok) {
      result.error = data;
      console.error('❌ API Error:', data);
    } else {
      console.log('✅ API Success:', data);
    }
    
    console.groupEnd();
    return result;
    
  } catch (error: any) {
    console.group(`🧪 Test API: ${method} ${endpoint}`);
    console.log('📤 Payload:', payload);
    console.error('❌ Network Error:', error);
    console.groupEnd();
    
    return {
      success: false,
      status: 0,
      data: null,
      error: error.message,
      payload
    };
  }
}

// Tests prédéfinis pour l'inscription
export const registerTests = [
  {
    name: "Test 1: Format simple",
    payload: {
      email: "test1@example.com",
      password: "password123",
      name: "John Doe"
    }
  },
  {
    name: "Test 2: Format avec firstName/lastName",
    payload: {
      email: "test2@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe"
    }
  },
  {
    name: "Test 3: Format avec nom complet séparé",
    payload: {
      email: "test3@example.com",
      password: "password123",
      name: "John Doe",
      firstName: "John",
      lastName: "Doe"
    }
  },
  {
    name: "Test 4: Format minimal",
    payload: {
      email: "test4@example.com",
      password: "password123"
    }
  },
  {
    name: "Test 5: Format avec validation",
    payload: {
      email: "test5@example.com",
      password: "password123",
      name: "John Doe",
      confirmPassword: "password123"
    }
  }
];

// Tests prédéfinis pour la connexion
export const loginTests = [
  {
    name: "Test 1: Format simple",
    payload: {
      email: "test@example.com",
      password: "password123"
    }
  },
  {
    name: "Test 2: Format avec validation",
    payload: {
      email: "test@example.com",
      password: "password123",
      remember: true
    }
  }
];

// Fonction pour exécuter tous les tests
export async function runAllTests() {
  console.group('🧪 Tests complets de l\'API');
  
  console.log('📝 Tests d\'inscription:');
  for (const test of registerTests) {
    console.group(`Test: ${test.name}`);
    const result = await testApiEndpoint('/api/auth/register', test.payload);
    console.log('Résultat:', result.success ? '✅ Succès' : '❌ Échec');
    console.groupEnd();
  }
  
  console.log('🔐 Tests de connexion:');
  for (const test of loginTests) {
    console.group(`Test: ${test.name}`);
    const result = await testApiEndpoint('/api/auth/login', test.payload);
    console.log('Résultat:', result.success ? '✅ Succès' : '❌ Échec');
    console.groupEnd();
  }
  
  console.groupEnd();
}

// Fonction pour tester un endpoint spécifique
export async function debugEndpoint(endpoint: string, payload: any) {
  console.group(`🔍 Debug endpoint: ${endpoint}`);
  
  const result = await testApiEndpoint(endpoint, payload);
  
  if (result.success) {
    console.log('✅ Endpoint fonctionne avec ce payload');
  } else {
    console.log('❌ Endpoint échoue avec ce payload');
    console.log('💡 Suggestions:');
    console.log('- Vérifiez le format des données');
    console.log('- Vérifiez les champs requis');
    console.log('- Vérifiez la validation côté serveur');
  }
  
  console.groupEnd();
  return result;
} 