"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useMemo } from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserDechets } from "@/hooks/use-dechets-api";
import { useUserSignalements } from "@/hooks/use-signalements-api";
import { useAuth } from '@/store/auth-store-v2';

// Import dynamique de la carte pour éviter les problèmes SSR
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

import "leaflet/dist/leaflet.css";

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_COURS: "En cours",
  TERMINEE: "Traité",
  TRAITE: "Traité",
  COLLECTE: "Collecté",
};

// Palette de couleurs par type de déchet
const DECHET_COLORS: Record<string, string> = {
  ORGANIQUE: "#4ade80", // vert
  PLASTIQUE: "#60a5fa", // bleu
  PAPIER: "#fbbf24", // jaune
  METAL: "#a3a3a3", // gris
  VERRE: "#34d399", // vert clair
  DANGEREUX: "#f87171", // rouge
};
const SIGNALEMENT_COLOR = "#f59e42"; // orange

export default function HistoriquePage() {
  // Centrage sur Douala par défaut
  const [center] = useState<[number, number]>([4.0511, 9.7679]);
  const { user } = useAuth();
  const isCollector = user?.role === "COLLECTOR";
  const { data: dechets, isLoading: loadingDechets } = useUserDechets();
  const { data: signalements, isLoading: loadingSignalements } = useUserSignalements();
  const [typeFilter, setTypeFilter] = useState<"ALL" | "DECHET" | "SIGNALEMENT">("ALL");
  const [statutFilter, setStatutFilter] = useState<string>("ALL");
  // Ajout de l'état mounted pour éviter le mismatch SSR/CSR
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    import("leaflet").then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    });
  }, []);

  // Filtrage par user connecté (sauf pour les collecteurs)
  const dechetsFiltres = !isCollector && user ? dechets?.filter((d: any) => d.userId === user.id) : dechets || [];
  const signalementsFiltres = !isCollector && user ? signalements?.filter((s: any) => s.userId === user.id) : signalements || [];

  // Génère une icône Leaflet colorée côté client uniquement
  const getColoredIcon = (color: string) => {
    if (typeof window === 'undefined') return undefined;
    const L = require('leaflet');
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      shadowSize: [41, 41],
    });
  };
  const getDechetIcon = (type: string) => {
    if (typeof window === 'undefined') return undefined;
    switch (type) {
      case "ORGANIQUE": return getColoredIcon("green");
      case "PLASTIQUE": return getColoredIcon("blue");
      case "PAPIER": return getColoredIcon("yellow");
      case "METAL": return getColoredIcon("grey");
      case "VERRE": return getColoredIcon("violet");
      case "DANGEREUX": return getColoredIcon("red");
      default: return getColoredIcon("blue");
    }
  };
  const getSignalementIcon = () => {
    if (typeof window === 'undefined') return undefined;
    return getColoredIcon("orange");
  };

  // Fusionne et filtre les données
  const allItems = useMemo(() => {
    const d = (dechetsFiltres || []).map((item: any) => ({
      ...item,
      _type: "DECHET",
      _lat: item.latitude,
      _lng: item.longitude,
      _statut: item.statut || "EN_ATTENTE",
      _label: item.nom || item.type,
    }));
    const s = (signalementsFiltres || []).map((item: any) => ({
      ...item,
      _type: "SIGNALEMENT",
      _lat: item.latitude,
      _lng: item.longitude,
      _statut: item.statut || "EN_ATTENTE",
      _label: item.type || "Signalement",
    }));
    let arr = [...d, ...s];
    if (typeFilter !== "ALL") arr = arr.filter(i => i._type === typeFilter);
    if (statutFilter !== "ALL") arr = arr.filter(i => i._statut === statutFilter);
    return arr;
  }, [dechetsFiltres, signalementsFiltres, typeFilter, statutFilter]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Historique de mes déclarations</h1>
      {/* Carte Leaflet */}
      <div className="w-full h-[350px] rounded-xl overflow-hidden border mb-8 relative">
        {!mounted ? (
          <div className="flex items-center justify-center h-full text-foreground/60">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Chargement de la carte…
          </div>
        ) : (
          <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {allItems.filter(i => i._lat && i._lng).map((item, i) => (
              <Marker
                key={item._type + item.id + i}
                position={[item._lat, item._lng]}
                icon={item._type === "DECHET" ? getDechetIcon(item.type) : getSignalementIcon()}
              >
                <Popup>
                  <div className="font-semibold mb-1">{item._label}</div>
                  <div className="text-xs mb-1">{item._type === "DECHET" ? "Déchet" : "Signalement"}</div>
                  <div className="text-xs">Statut : {STATUS_LABELS[item._statut] || item._statut}</div>
                  {item.adresse && <div className="text-xs mt-1">{item.adresse}</div>}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
      {/* Légende sous la carte */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center gap-2"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" className="w-5 h-8" alt="Organique" /> <span className="text-xs">Organique</span></div>
        <div className="flex items-center gap-2"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" className="w-5 h-8" alt="Plastique" /> <span className="text-xs">Plastique</span></div>
        <div className="flex items-center gap-2"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png" className="w-5 h-8" alt="Papier" /> <span className="text-xs">Papier</span></div>
        <div className="flex items-center gap-2"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png" className="w-5 h-8" alt="Métal" /> <span className="text-xs">Métal</span></div>
        <div className="flex items-center gap-2"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png" className="w-5 h-8" alt="Verre" /> <span className="text-xs">Verre</span></div>
        <div className="flex items-center gap-2"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" className="w-5 h-8" alt="Dangereux" /> <span className="text-xs">Dangereux</span></div>
        <div className="flex items-center gap-2"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png" className="w-5 h-8" alt="Signalement" /> <span className="text-xs">Signalement</span></div>
      </div>
      {/* Filtres dynamiques */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant={typeFilter === "ALL" ? "default" : "outline"} size="sm" onClick={() => setTypeFilter("ALL")}>Tous</Button>
          <Button variant={typeFilter === "DECHET" ? "default" : "outline"} size="sm" onClick={() => setTypeFilter("DECHET")}>Déchets</Button>
          <Button variant={typeFilter === "SIGNALEMENT" ? "default" : "outline"} size="sm" onClick={() => setTypeFilter("SIGNALEMENT")}>Signalements</Button>
          <Button variant={statutFilter === "ALL" ? "default" : "outline"} size="sm" onClick={() => setStatutFilter("ALL")}>Tous statuts</Button>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <Button key={key} variant={statutFilter === key ? "default" : "outline"} size="sm" onClick={() => setStatutFilter(key)}>{label}</Button>
          ))}
        </div>
        {/* Liste des déclarations filtrées */}
        {loadingDechets || loadingSignalements ? (
          <div className="flex items-center justify-center py-8 text-foreground/60">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement…
          </div>
        ) : allItems.length === 0 ? (
          <div className="text-center text-foreground/60 py-8">Aucune déclaration à afficher pour le moment.</div>
        ) : (
          <ul className="space-y-4">
            {allItems.map((item, i) => (
              <li key={item._type + item.id + i} className="bg-card/80 border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-muted border">
                  {item._type === "DECHET" ? <Trash2 className="w-5 h-5 text-accent" /> : <AlertTriangle className="w-5 h-5 text-orange-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">{item._label}</div>
                  <div className="text-xs text-foreground/60 mt-1">{item._type === "DECHET" ? "Déchet" : "Signalement"} • Statut : {STATUS_LABELS[item._statut] || item._statut}</div>
                  {item.adresse && <div className="text-xs text-foreground/50 mt-1">{item.adresse}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 