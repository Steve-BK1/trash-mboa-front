import axios from "axios";

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjI3MTJlNDdmOGU4MzQ4MzFiOTM5YTliZmZmNDI4NDUwIiwiaCI6Im11cm11cjY0In0=";

export async function getItineraireORS(
  start: [number, number], // [lat, lon]
  end: [number, number]    // [lat, lon]
): Promise<[number, number][]> {
  const url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
  const res = await axios.post(
    url,
    {
      coordinates: [
        [start[1], start[0]], // ORS attend [lon, lat]
        [end[1], end[0]],
      ],
    },
    {
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  // Retourne un tableau de [lat, lon] pour Leaflet
  return res.data.features[0].geometry.coordinates.map(
    ([lon, lat]: [number, number]) => [lat, lon]
  );
} 