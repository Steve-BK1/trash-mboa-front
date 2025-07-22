"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotificationService } from "@/lib/notifications";
import { adaptRegisterPayload, adaptLoginPayload } from "@/lib/api-adapters";
import { runAllTests, debugEndpoint } from "@/lib/api-debug";

export function ApiTest() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testPayloads = [
    {
      name: "Format simple (email, password, name)",
      payload: { email: "test@example.com", password: "password123", name: "John Doe" }
    },
    {
      name: "Format détaillé (avec firstName, lastName)",
      payload: { email: "test@example.com", password: "password123", name: "John Doe", firstName: "John", lastName: "Doe" }
    },
    {
      name: "Format adapté (via adaptRegisterPayload)",
      payload: adaptRegisterPayload("test@example.com", "password123", "John Doe")
    }
  ];

  const testLoginPayloads = [
    {
      name: "Format simple (email, password)",
      payload: { email: "test@example.com", password: "password123" }
    },
    {
      name: "Format adapté (via adaptLoginPayload)",
      payload: adaptLoginPayload("test@example.com", "password123")
    }
  ];

  const testRegisterPayload = async (payload: any, name: string) => {
    setIsLoading(true);
    try {
      console.log(`🧪 Test inscription: ${name}`);
      console.log('📤 Payload:', payload);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      const result = {
        name,
        success: response.ok,
        status: response.status,
        data,
        payload
      };
      
      setTestResults(prev => [...prev, result]);
      
      if (response.ok) {
        NotificationService.showSuccess(`Test réussi: ${name}`);
      } else {
        NotificationService.showError({ response: { status: response.status, data } }, `Test échoué: ${name}`);
      }
      
    } catch (error: any) {
      const result = {
        name,
        success: false,
        status: 'ERROR',
        data: error.message,
        payload
      };
      
      setTestResults(prev => [...prev, result]);
      NotificationService.showError(error, `Test échoué: ${name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLoginPayload = async (payload: any, name: string) => {
    setIsLoading(true);
    try {
      console.log(`🧪 Test connexion: ${name}`);
      console.log('📤 Payload:', payload);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      const result = {
        name,
        success: response.ok,
        status: response.status,
        data,
        payload
      };
      
      setTestResults(prev => [...prev, result]);
      
      if (response.ok) {
        NotificationService.showSuccess(`Test réussi: ${name}`);
      } else {
        NotificationService.showError({ response: { status: response.status, data } }, `Test échoué: ${name}`);
      }
      
    } catch (error: any) {
      const result = {
        name,
        success: false,
        status: 'ERROR',
        data: error.message,
        payload
      };
      
      setTestResults(prev => [...prev, result]);
      NotificationService.showError(error, `Test échoué: ${name}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Test des formats de payload API</CardTitle>
        <div className="flex gap-2 mt-4">
          <Button
            onClick={async () => {
              setIsLoading(true);
              try {
                await runAllTests();
                NotificationService.showSuccess('Tests complets exécutés. Vérifiez la console.');
              } catch (error) {
                NotificationService.showError(error, 'Erreur lors des tests');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Tests...' : '🧪 Tests complets'}
          </Button>
          <Button
            onClick={() => {
              debugEndpoint('/api/auth/register', { email: "debug@test.com", password: "password123", name: "Debug User" });
              NotificationService.showInfo('Debug lancé. Vérifiez la console.');
            }}
            variant="outline"
          >
            🔍 Debug Register
          </Button>
          <Button
            onClick={() => {
              debugEndpoint('/api/auth/login', { email: "debug@test.com", password: "password123" });
              NotificationService.showInfo('Debug lancé. Vérifiez la console.');
            }}
            variant="outline"
          >
            🔍 Debug Login
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tests d'inscription */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tests d'inscription</h3>
          <div className="grid gap-4">
            {testPayloads.map((test, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">{test.name}</Label>
                  <Button
                    onClick={() => testRegisterPayload(test.payload, test.name)}
                    disabled={isLoading}
                    size="sm"
                  >
                    {isLoading ? 'Test...' : 'Tester'}
                  </Button>
                </div>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(test.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Tests de connexion */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tests de connexion</h3>
          <div className="grid gap-4">
            {testLoginPayloads.map((test, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium">{test.name}</Label>
                  <Button
                    onClick={() => testLoginPayload(test.payload, test.name)}
                    disabled={isLoading}
                    size="sm"
                  >
                    {isLoading ? 'Test...' : 'Tester'}
                  </Button>
                </div>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(test.payload, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Résultats des tests */}
        {testResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Résultats des tests</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.name}</span>
                    <span className={`text-sm ${
                      result.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.success ? '✅ Succès' : '❌ Échec'}
                    </span>
                  </div>
                  <div className="text-xs mt-1">
                    <strong>Statut:</strong> {result.status}
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer">Voir les détails</summary>
                    <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 