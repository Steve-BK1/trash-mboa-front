"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth-store-v2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthTest() {
  const { user, isAuthenticated, isLoading, error, logout } = useAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    // Rendu identique côté serveur et client avant hydratation
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-sm text-foreground/60">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test d'authentification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Connecté</h3>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Nom:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Rôle:</strong> {user?.role}</p>
              </div>
            </div>
            <Button onClick={logout} variant="destructive" className="w-full">
              Se déconnecter
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Non connecté</h3>
              <p className="text-sm text-blue-700">
                Utilisez les boutons de connexion/inscription dans le header pour tester l'authentification.
              </p>
            </div>
            <div className="text-xs text-foreground/60 space-y-1">
              <p><strong>Emails de test:</strong></p>
              <p>• admin@trashmboa.com (Admin)</p>
              <p>• collector@trashmboa.com (Collecteur)</p>
              <p>• user@trashmboa.com (Utilisateur)</p>
              <p><strong>Mot de passe:</strong> password123</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">❌ Erreur</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 