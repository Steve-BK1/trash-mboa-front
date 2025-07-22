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
import { useAuth, useUserRole } from "@/store/auth-store-v2";
import DashboardAdmin from './DashboardAdmin';
import DashboardCollector from './DashboardCollector';
import DashboardUser from './DashboardUser';
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
  const role = useUserRole();
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
          {role !== 'COLLECTOR' && (
            <Link href="/dashboard/signalements">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xs">Signalements</span>
              </Button>
            </Link>
          )}
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
  const role = useUserRole();
  if (role === 'ADMIN') return <DashboardAdmin />;
  if (role === 'COLLECTOR') return <DashboardCollector />;
  return <DashboardUser />;
} 
