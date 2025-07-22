import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  User,
  Trash2,
  AlertTriangle,
  PlusCircle,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/store/auth-store-v2";
import { useUserDechets } from "@/hooks/use-dechets-api";
import { useUserSignalements } from "@/hooks/use-signalements-api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_COURS: "En cours",
  TERMINEE: "Traité",
  TRAITE: "Traité",
  COLLECTE: "Collecté",
};

function getStatutLabel(statut: string) {
  return STATUS_LABELS[statut] || statut;
}

export default function DashboardUser() {
  const { user } = useAuth();
  const { data: dechets, isLoading: loadingDechets } = useUserDechets();
  const { data: signalements, isLoading: loadingSignalements } =
    useUserSignalements();

  // Filtrage pour ne compter que les déchets et signalements du user connecté
  const dechetsFiltres =
    dechets && user ? dechets.filter((d: any) => d.userId === user.id) : [];
  const signalementsFiltres =
    signalements && user
      ? signalements.filter((s: any) => s.userId === user.id)
      : [];

  // Statistiques par statut
  const dechetsByStatut = dechetsFiltres.reduce(
    (acc: Record<string, number>, d: any) => {
      acc[d.statut || "EN_ATTENTE"] = (acc[d.statut || "EN_ATTENTE"] || 0) + 1;
      return acc;
    },
    {}
  );
  const signalementsByStatut = signalementsFiltres.reduce(
    (acc: Record<string, number>, s: any) => {
      acc[s.statut || "EN_ATTENTE"] = (acc[s.statut || "EN_ATTENTE"] || 0) + 1;
      return acc;
    },
    {}
  );

  // Dernières activités (3 derniers)
  const derniersDechets = [...dechetsFiltres]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);
  const derniersSignalements = [...signalementsFiltres]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  return (
    <div className="grid gap-6">
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl font-bold">
            <User className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">
              {" "}
              Bienvenue {user?.name || user?.email} sur votre tableau de bord
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm mb-4">
            Vous pouvez consulter vos déchets signalés, votre profil, et suivre
            l’évolution de vos signalements.
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Card className="bg-blue-50">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Trash2 className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Déchets signalés</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {loadingDechets ? (
                    <Loader2 className="w-5 h-5 animate-spin inline" />
                  ) : (
                    dechetsFiltres.length
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <span
                      key={key}
                      className="bg-blue-100 text-blue-700 rounded px-2 py-1"
                    >
                      {label}: {dechetsByStatut[key] || 0}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">Signalements</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {loadingSignalements ? (
                    <Loader2 className="w-5 h-5 animate-spin inline" />
                  ) : (
                    signalementsFiltres.length
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <span
                      key={key}
                      className="bg-orange-100 text-orange-700 rounded px-2 py-1"
                    >
                      {label}: {signalementsByStatut[key] || 0}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link href="/dashboard/dechets">
              <Button variant="default" className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Signaler un déchet
              </Button>
            </Link>
            <Link href="/dashboard/signalements">
              <Button variant="secondary" className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Nouveau signalement
              </Button>
            </Link>
            <Link href="/dashboard/historique">
              <Button variant="outline" className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Voir l’historique
              </Button>
            </Link>
          </div>

          {/* Dernières activités */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Trash2 className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Derniers déchets signalés</span>
              </CardHeader>
              <CardContent>
                {derniersDechets.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Aucun déchet signalé récemment.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {derniersDechets.map((d: any) => (
                      <li
                        key={d.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="font-semibold">{d.type}</span>
                        <span className="text-xs text-muted-foreground">
                          {getStatutLabel(d.statut)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">Derniers signalements</span>
              </CardHeader>
              <CardContent>
                {derniersSignalements.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Aucun signalement récent.
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {derniersSignalements.map((s: any) => (
                      <li
                        key={s.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="font-semibold">{s.type}</span>
                        <span className="text-xs text-muted-foreground">
                          {getStatutLabel(s.statut)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
