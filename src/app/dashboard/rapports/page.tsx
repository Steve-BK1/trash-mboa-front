"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-store-v2";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Download, Calendar, TrendingUp, BarChart3, Users, Trash2, AlertTriangle, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function RapportsPage() {
  const { user, isLoading } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedReportType, setSelectedReportType] = useState("general");
  const [generatingReport, setGeneratingReport] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Vérification des droits admin
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAdmin, router]);

  // Requêtes pour les données de rapports
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["rapports-stats", selectedPeriod],
    queryFn: async () => {
      const [usersRes, dechetsRes, signalementsRes] = await Promise.all([
        apiClient.get("/api/users"),
        apiClient.get("/api/dechets"),
        apiClient.get("/api/signalements")
      ]);
      
      const users = usersRes.data;
      const dechets = dechetsRes.data;
      const signalements = signalementsRes.data;

      // Calculer les statistiques par période
      const now = new Date();
      const periodStart = new Date();
      
      switch (selectedPeriod) {
        case "week":
          periodStart.setDate(now.getDate() - 7);
          break;
        case "month":
          periodStart.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          periodStart.setMonth(now.getMonth() - 3);
          break;
        case "year":
          periodStart.setFullYear(now.getFullYear() - 1);
          break;
        default:
          periodStart.setMonth(now.getMonth() - 1);
      }

      const filteredDechets = dechets.filter((d: any) => 
        new Date(d.createdAt) >= periodStart
      );
      const filteredSignalements = signalements.filter((s: any) => 
        new Date(s.createdAt) >= periodStart
      );

      return {
        totalUsers: users.length,
        newUsers: users.filter((u: any) => new Date(u.createdAt) >= periodStart).length,
        totalDechets: filteredDechets.length,
        dechetsEnAttente: filteredDechets.filter((d: any) => d.statut === 'EN_ATTENTE').length,
        dechetsCollectes: filteredDechets.filter((d: any) => d.statut === 'COLLECTE').length,
        dechetsTraites: filteredDechets.filter((d: any) => d.statut === 'TRAITE').length,
        totalSignalements: filteredSignalements.length,
        signalementsEnCours: filteredSignalements.filter((s: any) => s.statut === 'EN_COURS').length,
        signalementsTraites: filteredSignalements.filter((s: any) => s.statut === 'TERMINEE').length,
        collecteurs: users.filter((u: any) => u.role === 'COLLECTOR').length,
        admins: users.filter((u: any) => u.role === 'ADMIN').length,
        period: selectedPeriod,
      };
    },
    enabled: isAdmin,
  });

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96 text-foreground/60">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Initialisation…
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-foreground/60">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Vérification des droits…
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const periodLabels = {
    week: "Cette semaine",
    month: "Ce mois",
    quarter: "Ce trimestre",
    year: "Cette année",
  };

  const reportTypes = [
    { value: "general", label: "Rapport général", icon: BarChart3 },
    { value: "dechets", label: "Rapport déchets", icon: Trash2 },
    { value: "signalements", label: "Rapport signalements", icon: AlertTriangle },
    { value: "utilisateurs", label: "Rapport utilisateurs", icon: Users },
  ];

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      // Simulation de génération de rapport
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Rapport généré avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la génération du rapport");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadReport = (format: 'pdf' | 'excel') => {
    toast.success(`Téléchargement du rapport en ${format.toUpperCase()}...`);
    // Ici on ajouterait la logique de téléchargement réel
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4 mb-8"
      >
        <FileText className="w-8 h-8 text-accent" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rapports et Analytics</h1>
      </motion.div>

      {/* Filtres et contrôles */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Période :</span>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Type de rapport :</span>
          <Select value={selectedReportType} onValueChange={setSelectedReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 ml-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Générer un rapport
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Générer un rapport</DialogTitle>
                <DialogDescription>
                  Créez un rapport détaillé pour la période sélectionnée
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Période</label>
                  <p className="text-sm text-muted-foreground">{periodLabels[selectedPeriod as keyof typeof periodLabels]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type de rapport</label>
                  <p className="text-sm text-muted-foreground">
                    {reportTypes.find(t => t.value === selectedReportType)?.label}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="flex items-center gap-2"
                >
                  {generatingReport ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {generatingReport ? "Génération..." : "Générer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDownloadReport('pdf')}
              className="flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              PDF
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDownloadReport('excel')}
              className="flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      {statsLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nouveaux utilisateurs</CardTitle>
              <Users className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.newUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.round((stats?.newUsers || 0) * 0.15)}% vs période précédente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Déchets signalés</CardTitle>
              <Trash2 className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDechets || 0}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round(((stats?.dechetsTraites || 0) / (stats?.totalDechets || 1)) * 100)}% traités
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signalements</CardTitle>
              <AlertTriangle className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSignalements || 0}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round(((stats?.signalementsTraites || 0) / (stats?.totalSignalements || 1)) * 100)}% traités
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de satisfaction</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">
                +2% vs période précédente
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphiques et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Répartition des déchets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Répartition des déchets
            </CardTitle>
            <CardDescription>Statut des déchets pour {periodLabels[selectedPeriod as keyof typeof periodLabels]}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">En attente</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${((stats?.dechetsEnAttente || 0) / (stats?.totalDechets || 1)) * 100}%` }}
                    />
                  </div>
                  <Badge variant="secondary">{stats?.dechetsEnAttente || 0}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">En collecte</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${((stats?.dechetsCollectes || 0) / (stats?.totalDechets || 1)) * 100}%` }}
                    />
                  </div>
                  <Badge variant="outline">{stats?.dechetsCollectes || 0}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Traités</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${((stats?.dechetsTraites || 0) / (stats?.totalDechets || 1)) * 100}%` }}
                    />
                  </div>
                  <Badge variant="default">{stats?.dechetsTraites || 0}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Activité récente
            </CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nouveau rapport généré</p>
                  <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Collecte validée</p>
                  <p className="text-xs text-muted-foreground">Il y a 4 heures</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nouveau signalement</p>
                  <p className="text-xs text-muted-foreground">Il y a 6 heures</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historique des rapports */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Historique des rapports</CardTitle>
          <CardDescription>Rapports générés précédemment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">Rapport mensuel - Janvier 2024</p>
                  <p className="text-sm text-muted-foreground">Généré le 1er février 2024</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleDownloadReport('pdf')}>
                  <Download className="w-3 h-3 mr-1" />
                  PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownloadReport('excel')}>
                  <Download className="w-3 h-3 mr-1" />
                  Excel
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">Rapport trimestriel - Q4 2023</p>
                  <p className="text-sm text-muted-foreground">Généré le 1er janvier 2024</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleDownloadReport('pdf')}>
                  <Download className="w-3 h-3 mr-1" />
                  PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownloadReport('excel')}>
                  <Download className="w-3 h-3 mr-1" />
                  Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 