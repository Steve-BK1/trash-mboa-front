import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Truck, CheckCircle2, Clock, AlertTriangle, Badge } from 'lucide-react';
import { useCollectesEnAttente, useCollectesHistorique } from '@/hooks/use-collectes-api';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import dynamic from 'next/dynamic';
import { differenceInHours } from 'date-fns';

// Import dynamique de la carte pour éviter les problèmes SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function DashboardCollector() {
  const { data: enAttente, isLoading: loadingAttente } = useCollectesEnAttente();
  const { data: historique, isLoading: loadingHistorique } = useCollectesHistorique();

  const nbAttente = enAttente ? enAttente.length : 0;
  const nbValidees = historique ? historique.length : 0;

  // Activité récente : 5 dernières collectes validées
  const recent = useMemo(() => (historique || []).slice(0, 5), [historique]);

  // Préparation des données pour le graphique mensuel
  const monthlyData = useMemo(() => {
    if (!historique) return [];
    const map = new Map<string, number>();
    historique.forEach((c: any) => {
      const d = new Date(c.updatedAt || c.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    // Générer les 12 derniers mois
    const now = new Date();
    const months: { mois: string; total: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        mois: d.toLocaleString('fr-FR', { month: 'short', year: '2-digit' }),
        total: map.get(key) || 0,
      });
    }
    return months;
  }, [historique]);

  // Alertes : collectes urgentes (en attente > 24h) ou dangereuses
  const alertes = useMemo(() => {
    if (!enAttente) return [];
    return enAttente
      .map((c: any) => {
        const heures = differenceInHours(new Date(), new Date(c.createdAt));
        if (heures > 24) {
          return { ...c, typeAlerte: 'urgent', motif: `En attente depuis ${heures}h` };
        }
        if (c.type === 'DANGEREUX') {
          return { ...c, typeAlerte: 'info', motif: 'Déchet dangereux' };
        }
        return null;
      })
      .filter(Boolean);
  }, [enAttente]);

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-accent" /> Collectes à faire</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAttente ? <Loader2 className="animate-spin" /> : <span className="text-2xl font-bold">{nbAttente}</span>}
            <div className="text-xs text-muted-foreground mt-1">En attente de ramassage</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Collectes validées</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistorique ? <Loader2 className="animate-spin" /> : <span className="text-2xl font-bold">{nbValidees}</span>}
            <div className="text-xs text-muted-foreground mt-1">Collectes ramassées</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Mini-carte des collectes à faire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-56 rounded-lg overflow-hidden border relative">
            {(() => {
              const collectesGPS = (enAttente || []).filter(
                (c: any) => typeof c.latitude === 'number' && typeof c.longitude === 'number' && c.latitude !== null && c.longitude !== null
              );
              const mapCenter = collectesGPS.length > 0
                ? [collectesGPS[0].latitude, collectesGPS[0].longitude]
                : [4.05, 9.76]; // Cameroun par défaut
              return (
                <>
                  <MapContainer
                    key="mini-collecte-map"
                    center={Array.isArray(mapCenter) && mapCenter.length === 2 ? mapCenter as [number, number] : [4.05, 9.76]}
                    zoom={10}
                    scrollWheelZoom={false}
                    dragging={true}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {collectesGPS.map((c: any) => (
                      <Marker key={c.id} position={[c.latitude, c.longitude]}>
                        <Popup>
                          <div className="text-sm font-semibold mb-1">{c.type} • {c.quantite} kg</div>
                          <div className="text-xs mb-1">{c.adresse} ({c.ville})</div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                  {collectesGPS.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-foreground/60 text-sm pointer-events-none">
                      Aucune collecte avec coordonnées GPS à afficher sur la carte.
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Évolution mensuelle des collectes validées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Collectes validées" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-accent" /> Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistorique ? <Loader2 className="animate-spin" /> : recent.length === 0 ? (
            <div className="text-muted-foreground text-sm">Aucune collecte validée récemment.</div>
          ) : (
            <ul className="space-y-2">
              {recent.map((c: any) => (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{c.type} • {c.quantite}kg à {c.ville} ({new Date(c.updatedAt || c.createdAt).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Alertes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {alertes.length === 0 ? (
            <div className="text-muted-foreground text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />Aucune alerte en ce moment</div>
          ) : (
            <ul className="space-y-2">
              {alertes.map((a: any) => (
                <li key={a.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                  <AlertTriangle className={`w-5 h-5 ${a.typeAlerte === 'urgent' ? 'text-red-500' : 'text-orange-500'}`} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{a.type} • {a.quantite}kg à {a.ville}</div>
                    <div className="text-xs text-muted-foreground">{a.motif}</div>
                  </div>
                  <Badge className={a.typeAlerte === 'urgent' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}>
                    {a.typeAlerte === 'urgent' ? 'Urgent' : 'Info'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 