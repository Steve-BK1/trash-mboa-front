"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Temps de cache par défaut (5 minutes)
            staleTime: 5 * 60 * 1000,
            // Temps de cache maximum (10 minutes)
            gcTime: 10 * 60 * 1000,
            // Retry automatique en cas d'échec
            retry: (failureCount, error: any) => {
              // Ne pas retry sur les erreurs 4xx (sauf 408, 429)
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
              }
              // Retry max 3 fois pour les autres erreurs
              return failureCount < 3;
            },
            // Refetch automatique quand la fenêtre reprend le focus
            refetchOnWindowFocus: true,
            // Refetch automatique quand la connexion reprend
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry automatique pour les mutations
            retry: (failureCount, error: any) => {
              // Ne pas retry sur les erreurs 4xx
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
              }
              // Retry max 2 fois pour les autres erreurs
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
} 