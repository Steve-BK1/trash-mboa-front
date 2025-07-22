import { Trash2, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const CarteMissionsCollecteur = dynamic(() => import("./CarteMissionsCollecteur"), { ssr: false });

export default function VueMissionsCollecteur({
  geoLoading,
  geoError,
  position,
  refreshGeo,
  isLoadingMissions,
  errorMissions,
  missions,
  signalements = [],
  isValidating,
  handleValider,
  setSelectedMission
}: any) {
  return (
    <div className="max-w-full mx-auto py-8">
      <Card className="bg-card/80 rounded-2xl shadow-sm p-5">
        <CardHeader className="flex flex-col gap-2 pb-0">
          <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl font-bold tracking-tight">
            <Trash2 className="w-8 h-8 text-accent" />
            Missions à proximité
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            {geoLoading ? (
              <span className="text-sm text-foreground/60">Recherche de la position…</span>
            ) : geoError ? (
              <span className="text-sm text-red-500">Erreur GPS : {geoError}</span>
            ) : position ? (
              <span className="text-sm text-foreground/70">Position : {position.coords.latitude.toFixed(5)}, {position.coords.longitude.toFixed(5)}</span>
            ) : (
              <span className="text-sm text-foreground/60">Position non disponible</span>
            )}
            <Button size="sm" variant="outline" onClick={refreshGeo} disabled={geoLoading}>Rafraîchir</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Affichage de la carte */}
          {position && (missions.length > 0 || signalements.length > 0) && (
            <div className="mb-8 rounded-xl overflow-hidden border">
              <CarteMissionsCollecteur position={position} missions={missions} signalements={signalements} />
            </div>
          )}
          {isLoadingMissions ? (
            <div className="text-center py-8 text-foreground/60">
              <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
              Chargement des missions…
            </div>
          ) : errorMissions ? (
            <div className="text-center text-red-500 py-8">Erreur lors du chargement des missions.</div>
          ) : (missions.length > 0 || signalements.length > 0) ? (
            <div className="space-y-6 mb-4">
              {/* Déchets à proximité */}
              {missions.map((mission: any) => (
                <div
                  key={"dechet-" + mission.id}
                  className="bg-card/80 border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm cursor-pointer hover:bg-accent/10 transition"
                  onClick={() => setSelectedMission(mission)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">{mission.type} • {mission.quantite} kg</div>
                    <div className="text-xs text-foreground/60 mt-1">Adresse : {mission.adresse} ({mission.ville})</div>
                    <div className="text-xs text-foreground/60 mt-1">Signalé le {new Date(mission.createdAt).toLocaleString()}</div>
                    {mission.user && (
                      <div className="text-xs text-foreground/60 mt-1">Par : {mission.user.nom} ({mission.user.telephone})</div>
                    )}
                  </div>
                  <Button
                    variant="default"
                    onClick={e => { e.stopPropagation(); handleValider(mission.id); }}
                    disabled={isValidating}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Valider
                  </Button>
                </div>
              ))}
              {/* Signalements à proximité */}
              {signalements.map((signalement: any) => (
                <div
                  key={"signalement-" + signalement.id}
                  className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm cursor-pointer hover:bg-orange-100 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-orange-700 truncate flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" /> Signalement</div>
                    <div className="text-xs text-foreground/60 mt-1">{signalement.description}</div>
                    {signalement.latitude && signalement.longitude && (
                      <div className="text-xs text-foreground/50 mt-1">
                        Lat: {signalement.latitude.toFixed(5)}, Lon: {signalement.longitude.toFixed(5)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-foreground/60 py-8">Aucun déchet ou signalement à proximité pour le moment.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 