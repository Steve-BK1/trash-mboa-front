import { useState, useCallback } from "react";

export function useGeolocation(options?: PositionOptions) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par ce navigateur.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === 1
            ? "Permission refusée."
            : err.code === 2
            ? "Position indisponible."
            : "Erreur inconnue."
        );
        setLoading(false);
      },
      options
    );
  }, [options]);

  // Ne plus appeler getLocation automatiquement au montage
  // useEffect(() => {
  //   getLocation();
  // }, [getLocation]);

  return { position, error, loading, refresh: getLocation };
} 