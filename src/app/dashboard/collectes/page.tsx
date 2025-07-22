"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { motion } from "framer-motion";
import { Truck, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollectesEnAttente, useValiderCollecte, useCollectesHistorique } from '@/hooks/use-collectes-api';
import { toast } from 'sonner';
import { useUserRole } from '@/store/auth-store-v2';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Image as ImageIcon, MapPin } from 'lucide-react';
import nextDynamic from 'next/dynamic';

// Import dynamique de la carte pour éviter les problèmes SSR
const MapContainer = nextDynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = nextDynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = nextDynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = nextDynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Fix pour les icônes Leaflet dans Next.js (doit être côté client)

export default function CollectesPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/marker-icon-2x.png',
        iconUrl: '/marker-icon.png',
        shadowUrl: '/marker-shadow.png',
      });
    }
  }, []);

  const { data, isLoading, error, refetch } = useCollectesEnAttente();
  const { mutateAsync: validerCollecte, status: validationStatus } = useValiderCollecte();
  const isValidating = validationStatus === 'pending';

  const { data: historique, isLoading: isLoadingHistorique, error: errorHistorique } = useCollectesHistorique();

  const role = useUserRole();
  const isCollector = role === 'COLLECTOR';

  // Toast d'information si de nouvelles collectes apparaissent (polling simple)
  const previousCountRef = useRef<number>(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (data && previousCountRef.current !== 0 && data.length > previousCountRef.current) {
      toast.info('Nouvelle collecte à faire disponible !');
    }
    if (data) previousCountRef.current = data.length;
  }, [data]);

  const handleValider = async (id: number) => {
    try {
      await validerCollecte(id);
      toast.success('Collecte validée avec succès !', { duration: 3500 });
      refetch();
    } catch (e: any) {
      toast.error("Erreur lors de la validation de la collecte : " + (e?.message || 'Erreur inconnue'));
    }
  };

  // Filtres avancés pour les collectes en attente
  const [filterVille, setFilterVille] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  // Extraction des villes/types uniques pour les filtres
  const villes = useMemo(() => Array.from(new Set((data || []).map((c: any) => c.ville).filter(Boolean))), [data]);
  const types = useMemo(() => Array.from(new Set((data || []).map((c: any) => c.type).filter(Boolean))), [data]);

  // Filtrage dynamique
  const filteredCollectes = useMemo(() => {
    return (data || []).filter((c: any) => {
      if (filterVille && c.ville !== filterVille) return false;
      if (filterType && c.type !== filterType) return false;
      if (search && !(
        (c.adresse && c.adresse.toLowerCase().includes(search.toLowerCase())) ||
        (c.user?.nom && c.user.nom.toLowerCase().includes(search.toLowerCase()))
      )) return false;
      return true;
    });
  }, [data, filterVille, filterType, search]);

  // État pour la collecte sélectionnée (fiche détail)
  const [selectedCollecte, setSelectedCollecte] = useState<any | null>(null);

  if (!isCollector) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Truck className="w-12 h-12 mx-auto mb-4 text-accent" />
        <h1 className="text-2xl font-bold mb-2">Section réservée aux collecteurs</h1>
        <p className="text-foreground/70 mb-4">Vous devez être connecté en tant que <b>collecteur</b> pour accéder à la gestion des collectes.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex items-center gap-4 mb-8"
      >
        <Truck className="w-8 h-8 text-accent" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Collectes</h1>
      </motion.div>

      <Tabs defaultValue="attente" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="attente">À collecter</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="attente">
          {/* Filtres avancés */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Select
              value={filterVille || "__all__"}
              onValueChange={val => setFilterVille(val === "__all__" ? "" : val)}
            >
              <SelectTrigger className="w-36" aria-label="Filtrer par ville">
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Toutes les villes</SelectItem>
                {villes.map((v) => (
                  <SelectItem key={String(v)} value={String(v)}>{String(v)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterType || "__all__"}
              onValueChange={val => setFilterType(val === "__all__" ? "" : val)}
            >
              <SelectTrigger className="w-36" aria-label="Filtrer par type">
                <SelectValue placeholder="Type de déchet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tous les types</SelectItem>
                {types.map((t) => (
                  <SelectItem key={String(t)} value={String(t)}>{String(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Recherche (adresse, nom...)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-56"
              aria-label="Recherche"
            />
          </div>
          {/* Carte interactive Leaflet */}
          <div className="w-full h-72 mb-6 rounded-lg overflow-hidden border relative">
            {(() => {
              const collectesGPS = filteredCollectes.filter(
                (c: any) => typeof c.latitude === 'number' && typeof c.longitude === 'number' && c.latitude !== null && c.longitude !== null
              );
              const mapCenter = collectesGPS.length > 0
                ? [collectesGPS[0].latitude, collectesGPS[0].longitude]
                : [4.05, 9.76]; // Cameroun par défaut
              return (
                <>
                  <MapContainer
                    key="collecte-map"
                    center={Array.isArray(mapCenter) && mapCenter.length === 2 ? mapCenter as [number, number] : [4.05, 9.76]}
                    zoom={10}
                    scrollWheelZoom={true}
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
                          <Button size="sm" variant="outline" onClick={() => setSelectedCollecte(c)}>
                            Voir détail
                          </Button>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                  {collectesGPS.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-foreground/60 text-sm pointer-events-none bg-background/80">
                      Aucune collecte avec coordonnées GPS à afficher sur la carte.
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          {/* Liste des collectes en attente filtrée + Dialog fiche détail */}
          <Dialog open={!!selectedCollecte} onOpenChange={open => !open && setSelectedCollecte(null)}>
            {isLoading ? (
              <div className="text-center py-8 text-foreground/60">
                <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
                Chargement des collectes…
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">Erreur lors du chargement des collectes.</div>
            ) : filteredCollectes && filteredCollectes.length > 0 ? (
              <div className="space-y-6 mb-10">
                {filteredCollectes.map((collecte: any) => (
                  <div
                    key={collecte.id}
                    className="bg-card/80 border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm cursor-pointer hover:bg-accent/10 transition"
                    onClick={() => setSelectedCollecte(collecte)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">{collecte.type} • {collecte.quantite} kg</div>
                      <div className="text-xs text-foreground/60 mt-1">Adresse : {collecte.adresse} ({collecte.ville})</div>
                      <div className="text-xs text-foreground/60 mt-1">Signalé le {new Date(collecte.createdAt).toLocaleString()}</div>
                      {collecte.user && (
                        <div className="text-xs text-foreground/60 mt-1">Par : {collecte.user.nom} ({collecte.user.telephone})</div>
                      )}
                    </div>
                    <Button
                      variant="default"
                      onClick={e => { e.stopPropagation(); handleValider(collecte.id); }}
                      disabled={isValidating}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Valider
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-foreground/60 py-8">Aucune collecte en attente.</div>
            )}
            {/* Modal fiche détail collecte */}
            {selectedCollecte && (
              <DialogContent showCloseButton>
                <DialogHeader>
                  <DialogTitle>Détail de la collecte</DialogTitle>
                  <DialogDescription>
                    Signalée le {new Date(selectedCollecte.createdAt).toLocaleString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    {selectedCollecte.photo ? (
                      <img src={selectedCollecte.photo} alt="Photo collecte" className="w-24 h-24 object-cover rounded-lg border" />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center bg-muted rounded-lg border">
                        <ImageIcon className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">{selectedCollecte.type} • {selectedCollecte.quantite} kg</div>
                      <div className="text-xs text-foreground/60">Statut : {selectedCollecte.statut}</div>
                    </div>
                  </div>
                  <div className="text-sm mt-2">
                    <div className="mb-1"><b>Adresse :</b> {selectedCollecte.adresse} ({selectedCollecte.ville})</div>
                    {selectedCollecte.latitude && selectedCollecte.longitude && (
                      <div className="mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        <span>GPS : {selectedCollecte.latitude}, {selectedCollecte.longitude}</span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedCollecte.latitude},${selectedCollecte.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 underline text-accent"
                        >
                          Itinéraire
                        </a>
                      </div>
                    )}
                    {selectedCollecte.user && (
                      <div className="mb-1"><b>Signalé par :</b> {selectedCollecte.user.nom} ({selectedCollecte.user.telephone})</div>
                    )}
                  </div>
                </div>
                <DialogClose asChild>
                  <Button variant="outline" className="mt-4 w-full">Fermer</Button>
                </DialogClose>
              </DialogContent>
            )}
          </Dialog>
        </TabsContent>
        <TabsContent value="historique">
          {/* Liste de l'historique des collectes validées */}
          {isLoadingHistorique ? (
            <div className="text-center py-8 text-foreground/60">
              <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
              Chargement de l'historique…
            </div>
          ) : errorHistorique ? (
            <div className="text-center text-red-500 py-8">Erreur lors du chargement de l'historique.</div>
          ) : historique && historique.length > 0 ? (
            <div className="space-y-6 mb-10">
              {historique.map((collecte: any) => (
                <div key={collecte.id} className="bg-card/80 border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm opacity-80">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">{collecte.type} • {collecte.quantite} kg</div>
                    <div className="text-xs text-foreground/60 mt-1">Adresse : {collecte.adresse} ({collecte.ville})</div>
                    <div className="text-xs text-foreground/60 mt-1">Validée le {new Date(collecte.updatedAt || collecte.createdAt).toLocaleString()}</div>
                    {collecte.user && (
                      <div className="text-xs text-foreground/60 mt-1">Par : {collecte.user.nom} ({collecte.user.telephone})</div>
                    )}
                  </div>
                  <div className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground border ml-2">
                    {collecte.statut}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-foreground/60 py-8">Aucune collecte validée pour le moment.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 