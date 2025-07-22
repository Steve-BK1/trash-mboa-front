import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export function useDechetsProximite(
  latitude?: number,
  longitude?: number,
  rayon: number = 5,
  type: 'all' | 'dechets' | 'signalements' = 'dechets'
) {
  return useQuery({
    queryKey: ["dechets-proximite", latitude, longitude, rayon, type],
    queryFn: async () => {
      if (latitude == null || longitude == null) return { dechets: [], signalements: [] };
      const res = await apiClient.get("/api/geo/proximite", {
        params: {
          latitude,
          longitude,
          rayon,
          type,
        },
      });
      return {
        dechets: res.data.dechets || [],
        signalements: res.data.signalements || [],
      };
    },
    enabled: latitude != null && longitude != null,
    staleTime: 1000 * 60, // 1 min (optionnel)
  });
} 