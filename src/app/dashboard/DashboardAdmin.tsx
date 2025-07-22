 "use client";
import {
  User,
  Trash2,
  AlertTriangle,
  Users,
  TrendingUp,
  Activity,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  ChartBar,
} from "lucide-react";
import { useAuth } from "@/store/auth-store-v2";
import { ThemeToggle } from "@/components/theme-toggle";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/store/auth-store-v2";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";
import { differenceInHours, parseISO } from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// Composant pour les cartes de statistiques
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "text-accent",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  trend?: { value: number; label: string };
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`w-4 h-4 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp
                className={`w-3 h-3 ${
                  trend.value > 0 ? "text-green-500" : "text-red-500"
                } mr-1`}
              />
              <span
                className={`text-xs ${
                  trend.value > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Composant pour les alertes récentes
function RecentAlerts({ alerts }: { alerts: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Alertes récentes
        </CardTitle>
        <CardDescription>
          Dernières activités nécessitant votre attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">Aucune alerte en ce moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    alert.type === "urgent" ? "bg-red-500" : "bg-orange-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.description}
                  </p>
                </div>
                <Badge
                  variant={
                    alert.type === "urgent" ? "destructive" : "secondary"
                  }
                >
                  {alert.type === "urgent" ? "Urgent" : "Info"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Composant pour les actions rapides
function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" />
          Actions rapides
        </CardTitle>
        <CardDescription>
          Accès direct aux fonctions principales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/users">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="w-5 h-5" />
              <span className="text-xs">Gérer les utilisateurs</span>
            </Button>
          </Link>
          <Link href="/dashboard/collectes">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Trash2 className="w-5 h-5" />
              <span className="text-xs">Voir les collectes</span>
            </Button>
          </Link>
          <Link href="/dashboard/signalements">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs">Signalements</span>
            </Button>
          </Link>
          <Link href="/dashboard/rapports">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs">Rapports</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const isAdmin = useIsAdmin();

  // Requêtes pour les statistiques admin et données d'activité
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [usersRes, dechetsRes, signalementsRes] = await Promise.all([
        apiClient.get("/api/users"),
        apiClient.get("/api/dechets"),
        apiClient.get("/api/signalements"),
      ]);
      const users = usersRes.data;
      const dechets = dechetsRes.data;
      const signalements = signalementsRes.data;
      return {
        users,
        dechets,
        signalements,
        totalUsers: users.length,
        totalDechets: dechets.length,
        totalSignalements: signalements.length,
        dechetsEnAttente: dechets.filter((d: any) => d.statut === "EN_ATTENTE").length,
        signalementsEnCours: signalements.filter((s: any) => s.statut === "EN_COURS").length,
        collecteurs: users.filter((u: any) => u.role === "COLLECTOR").length,
        admins: users.filter((u: any) => u.role === "ADMIN").length,
      };
    },
    enabled: isAdmin,
  });

  // Requête pour les collectes (si endpoint global disponible, sinon ignorer)
  const { data: collectes, isLoading: collectesLoading } = useQuery({
    queryKey: ["admin-collectes"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/api/collectes");
        return res.data;
      } catch {
        return [];
      }
    },
    enabled: isAdmin,
  });

  // Construction des activités récentes (fusion, tri, mapping)
  const recentActivities = useMemo(() => {
    if (!stats || !stats.users || !stats.dechets || !stats.signalements) return [];
    const activities: Array<{
      type: string;
      title: string;
      description: string;
      date: string;
      color: string;
    }> = [];

    // Nouveaux signalements
    stats.signalements.forEach((s: any) => {
      activities.push({
        type: "signalement",
        title: "Nouveau signalement",
        description: s.description || s.type,
        date: s.createdAt,
        color: "orange",
      });
    });

    // Déchets traités
    stats.dechets.forEach((d: any) => {
      if (d.statut === "TRAITE") {
        activities.push({
          type: "dechet-traite",
          title: "Déchet traité",
          description: d.type + (d.adresse ? ` • ${d.adresse}` : ""),
          date: d.updatedAt || d.createdAt,
          color: "green",
        });
      }
      if (d.statut === "COLLECTE") {
        activities.push({
          type: "dechet-collecte",
          title: "Déchet collecté",
          description: d.type + (d.adresse ? ` • ${d.adresse}` : ""),
          date: d.updatedAt || d.createdAt,
          color: "blue",
        });
      }
    });

    // Nouveaux collecteurs
    stats.users.forEach((u: any) => {
      if (u.role === "COLLECTOR") {
        activities.push({
          type: "collecteur",
          title: "Nouveau collecteur ajouté",
          description: u.nom || u.email,
          date: u.createdAt,
          color: "blue",
        });
      }
    });

    // Collectes validées (si endpoint global)
    if (collectes && Array.isArray(collectes)) {
      collectes.forEach((c: any) => {
        if (c.statut === "TERMINEE" || c.statut === "COLLECTE") {
          activities.push({
            type: "collecte-validee",
            title: "Collecte validée",
            description: c.type + (c.adresse ? ` • ${c.adresse}` : ""),
            date: c.updatedAt || c.createdAt,
            color: "green",
          });
        }
      });
    }

    // Tri décroissant par date
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return activities.slice(0, 5);
  }, [stats, collectes]);

  // Construction factorisée des alertes récentes
  const recentAlerts = useMemo(() => {
    if (!stats || !stats.signalements || !collectes) return [];
    const alerts: Array<{
      type: "urgent" | "info";
      title: string;
      description: string;
      date: string;
    }> = [];
    const now = new Date();

    // Signalements dangereux ou description critique
    stats.signalements.forEach((s: any) => {
      if (
        (s.type && s.type.toUpperCase().includes("DANGEREUX")) ||
        (s.description && s.description.toLowerCase().includes("danger"))
      ) {
        alerts.push({
          type: "urgent",
          title: "Signalement dangereux",
          description: s.description || s.type,
          date: s.createdAt,
        });
      }
      // Signalement non traité depuis > 24h
      if (
        s.statut !== "TERMINEE" &&
        differenceInHours(now, parseISO(s.createdAt)) > 24
      ) {
        alerts.push({
          type: "info",
          title: "Signalement non traité depuis 24h+",
          description: s.description || s.type,
          date: s.createdAt,
        });
      }
    });

    // Collectes en attente depuis > 24h
    if (Array.isArray(collectes)) {
      collectes.forEach((c: any) => {
        if (
          c.statut === "EN_ATTENTE" &&
          differenceInHours(now, parseISO(c.createdAt)) > 24
        ) {
          alerts.push({
            type: "info",
            title: "Collecte en attente depuis 24h+",
            description: c.type + (c.adresse ? ` • ${c.adresse}` : ""),
            date: c.createdAt,
          });
        }
        // Collecte urgente (si champ dispo)
        if (c.urgent) {
          alerts.push({
            type: "urgent",
            title: "Collecte urgente",
            description: c.type + (c.adresse ? ` • ${c.adresse}` : ""),
            date: c.createdAt,
          });
        }
      });
    }

    // Tri décroissant par date
    alerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return alerts.slice(0, 5);
  }, [stats, collectes]);

  // Statut des déchets (calculé dynamiquement)
  const dechetsStats = useMemo(() => {
    if (!stats || !stats.dechets) return {
      attente: 0,
      collecte: 0,
      traites: 0,
      total: 0,
    };
    const attente = stats.dechets.filter((d: any) => d.statut === "EN_ATTENTE").length;
    const collecte = stats.dechets.filter((d: any) => d.statut === "COLLECTE").length;
    const traites = stats.dechets.filter((d: any) => d.statut === "TRAITE").length;
    return {
      attente,
      collecte,
      traites,
      total: stats.dechets.length,
    };
  }, [stats]);

  // Répartition des utilisateurs (calculée dynamiquement)
  const usersStats = useMemo(() => {
    if (!stats || !stats.users) return {
      users: 0,
      collecteurs: 0,
      admins: 0,
      total: 0,
    };
    const users = stats.users.filter((u: any) => u.role === "USER").length;
    const collecteurs = stats.users.filter((u: any) => u.role === "COLLECTOR").length;
    const admins = stats.users.filter((u: any) => u.role === "ADMIN").length;
    return {
      users,
      collecteurs,
      admins,
      total: stats.users.length,
    };
  }, [stats]);

  // Préparation des données pour le chart (déchets par mois/statut)
  const chartData = useMemo(() => {
    if (!stats || !stats.dechets) return [];
    // Initialiser les mois de l'année en cours
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), i, 1);
      return d.toLocaleString("fr-FR", { month: "short" });
    });
    // Grouper les déchets par mois et statut
    const data = months.map((label, idx) => {
      const month = idx;
      const year = now.getFullYear();
      const dechetsMois = stats.dechets.filter((d: any) => {
        const date = new Date(d.createdAt);
        return date.getFullYear() === year && date.getMonth() === month;
      });
      return {
        mois: label,
        signalés: dechetsMois.length,
        traités: dechetsMois.filter((d: any) => d.statut === "TRAITE").length,
      };
    });
    return data;
  }, [stats]);

  if (!isAdmin) {
    // Dashboard utilisateur normal
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
        <div className="flex items-center gap-4">
          <User className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Bienvenue, {user?.name || user?.email || "!"}
            </h1>
            <p className="text-foreground/60 text-sm sm:text-base mt-1">
              Votre espace personnel Trash Mboa
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-16">
        <div className="bg-card/80 shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col items-center transition hover:shadow-md">
            <span className="text-3xl sm:text-4xl font-bold text-accent">
              0
            </span>
            <span className="text-sm sm:text-base text-foreground/60 mt-2 text-center">
              Déchets déposés
            </span>
        </div>
        <div className="bg-card/80 shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col items-center transition hover:shadow-md">
            <span className="text-3xl sm:text-4xl font-bold text-accent">
              0
            </span>
            <span className="text-sm sm:text-base text-foreground/60 mt-2 text-center">
              Signalements
            </span>
          </div>
          <div className="bg-card/80 shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col items-center transition hover:shadow-md sm:col-span-2 lg:col-span-1">
            <span className="text-3xl sm:text-4xl font-bold text-accent">
              0
            </span>
            <span className="text-sm sm:text-base text-foreground/60 mt-2 text-center">
              Collectes effectuées
            </span>
          </div>
        </div>

        <div className="w-full max-w-2xl bg-muted/60 rounded-2xl p-6 sm:p-8 text-center text-foreground/60 shadow-none">
          <p className="text-base sm:text-lg">
            Prochainement : vos statistiques détaillées, l'historique de vos
            actions et bien plus encore !
          </p>
        </div>
      </div>
    );
  }

  // Dashboard admin
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <User className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Dashboard Administrateur
              </h1>
              <p className="text-foreground/60 text-sm sm:text-base mt-1">
                Vue d'ensemble de la plateforme Trash Mboa
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Statistiques principales */}
        {statsLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Utilisateurs totaux"
              value={stats?.totalUsers || 0}
              description="Tous les utilisateurs inscrits"
              icon={Users}
              trend={{ value: 12, label: "ce mois" }}
            />
            <StatCard
              title="Déchets signalés"
              value={stats?.totalDechets || 0}
              description="Déchets en attente de collecte"
              icon={Trash2}
              trend={{ value: 8, label: "cette semaine" }}
            />
            <StatCard
              title="Signalements"
              value={stats?.totalSignalements || 0}
              description="Signalements en cours"
              icon={AlertTriangle}
              trend={{ value: -3, label: "cette semaine" }}
            />
            <StatCard
              title="Collecteurs actifs"
              value={stats?.collecteurs || 0}
              description="Équipe de collecte"
              icon={MapPin}
            />
          </div>
        )}

        {/* Métriques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent" />
                  Activité récente
                </CardTitle>
                <CardDescription>
                  Dernières actions sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm">Aucune activité récente</p>
                    </div>
                  ) : recentActivities.map((act, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${act.color === 'green' ? 'bg-green-500' : act.color === 'blue' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{act.title}</p>
                        <p className="text-xs text-muted-foreground">{act.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(act.date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <RecentAlerts alerts={recentAlerts} />
            <QuickActions />
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Statut des déchets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">En attente</span>
                  <Badge variant="secondary">
                    {dechetsStats.attente}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">En collecte</span>
                  <Badge variant="outline">
                    {dechetsStats.collecte}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Traités</span>
                  <Badge variant="default">
                    {dechetsStats.traites}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Utilisateurs</span>
                  <Badge variant="secondary">
                    {usersStats.users}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Collecteurs</span>
                  <Badge variant="outline">
                    {usersStats.collecteurs}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Administrateurs</span>
                  <Badge variant="default">
                    {usersStats.admins}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
} 
