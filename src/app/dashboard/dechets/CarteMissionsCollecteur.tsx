import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { getItineraireORS } from "@/lib/ors";
import "leaflet/dist/leaflet.css";
import { Trash2, AlertTriangle } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

export default function CarteMissionsCollecteur({ position, missions, signalements = [], rayon = 5 }: { position: any, missions: any[], signalements?: any[], rayon?: number }) {
  const [routes, setRoutes] = useState<{ [key: string]: [number, number][] }>({});

  useEffect(() => {
    if (!position) return;
    // Itinéraires pour les déchets
    missions.forEach(async (dechet: any) => {
      if (!routes["dechet-" + dechet.id]) {
        try {
          const chemin = await getItineraireORS(
            [position.coords.latitude, position.coords.longitude],
            [dechet.latitude, dechet.longitude]
          );
          setRoutes(r => ({ ...r, ["dechet-" + dechet.id]: chemin }));
        } catch (e) {}
      }
    });
    // Itinéraires pour les signalements
    signalements.forEach(async (sig: any) => {
      if (!routes["signalement-" + sig.id]) {
        try {
          const chemin = await getItineraireORS(
            [position.coords.latitude, position.coords.longitude],
            [sig.latitude, sig.longitude]
          );
          setRoutes(r => ({ ...r, ["signalement-" + sig.id]: chemin }));
        } catch (e) {}
      }
    });
    // eslint-disable-next-line
  }, [position, missions, signalements]);

  const userPos: [number, number] = [position.coords.latitude, position.coords.longitude];

  // Icône SVG Lucide pour Leaflet (Trash2 pour déchets, AlertTriangle pour signalements)
  const trashIcon = L.divIcon({
    html: renderToStaticMarkup(<Trash2 color="#3b82f6" width={32} height={32} />),
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  const alertIcon = L.divIcon({
    html: renderToStaticMarkup(<AlertTriangle color="#f59e42" width={32} height={32} />),
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <MapContainer center={userPos} zoom={13} style={{ height: 350, width: "100%" }} scrollWheelZoom={true}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {/* Cercle du rayon de recherche */}
      <Circle
        center={userPos}
        radius={rayon * 1000} // km -> mètres
        pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.08 }}
      />
      <Marker position={userPos}>
        <Popup>Vous (collecteur)</Popup>
      </Marker>
      {/* Marqueurs des déchets */}
      {missions?.map((dechet: any) => {
        const dechetPos: [number, number] = [dechet.latitude, dechet.longitude];
        return (
          <Marker key={"dechet-" + dechet.id} position={dechetPos} icon={trashIcon}>
            <Popup>
              {dechet.type} • {dechet.quantite}kg<br />
              {dechet.adresse}
            </Popup>
          </Marker>
        );
      })}
      {/* Marqueurs des signalements */}
      {signalements?.map((sig: any) => {
        const sigPos: [number, number] = [sig.latitude, sig.longitude];
        return (
          <Marker key={"signalement-" + sig.id} position={sigPos} icon={alertIcon}>
            <Popup>
              <span className="text-orange-700 font-semibold">Signalement</span><br />
              {sig.description}
            </Popup>
          </Marker>
        );
      })}
      {/* Itinéraires routiers pour les déchets */}
      {missions?.map((dechet: any) =>
        routes["dechet-" + dechet.id] ? (
          <Polyline
            key={"route-dechet-" + dechet.id}
            positions={routes["dechet-" + dechet.id]}
            color="blue"
          />
        ) : null
      )}
      {/* Itinéraires routiers pour les signalements */}
      {signalements?.map((sig: any) =>
        routes["signalement-" + sig.id] ? (
          <Polyline
            key={"route-signalement-" + sig.id}
            positions={routes["signalement-" + sig.id]}
            color="orange"
          />
        ) : null
      )}
    </MapContainer>
  );
} 