"use client";

import { motion, useInView, easeInOut } from "framer-motion";
import { useRef } from "react";
import { 
  Smartphone, 
  Brain, 
  Satellite, 
  BarChart3, 
  Link, 
  Zap,
  TrendingUp,
  MapPin,
  Activity,
  Target,
  Users,
  Shield,
  Check
} from "lucide-react";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: easeInOut },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2, ease: easeInOut } },
};

// Données des modules principaux
const mainModules = [
  {
    icon: Satellite,
    title: "IoT & Capteurs",
    subtitle: "Infrastructure connectée",
    features: [
      { name: "Capteurs de remplissage", color: "bg-green-500" },
      { name: "GPS en temps réel", color: "bg-blue-500" },
      { name: "Analyse de qualité", color: "bg-purple-500" }
    ],
    metric: { label: "Données collectées", value: "2.4M/jour", percentage: 78 }
  },
  {
    icon: Brain,
    title: "IA & Optimisation",
    subtitle: "Intelligence artificielle",
    features: [
      { name: "Prédiction de remplissage", color: "bg-orange-500" },
      { name: "Optimisation des tournées", color: "bg-red-500" },
      { name: "Analyse comportementale", color: "bg-yellow-500" }
    ],
    metric: { label: "Efficacité optimisée", value: "+47%", percentage: 47 }
  }
];

// Données des modules secondaires
const secondaryModules = [
  {
    icon: Smartphone,
    title: "Application Mobile",
    desc: "Interface native iOS/Android avec notifications push et géolocalisation",
    metrics: "98% satisfaction",
    color: "bg-green-500"
  },
  {
    icon: Link,
    title: "Blockchain",
    desc: "Traçabilité complète et récompenses tokenisées pour les citoyens",
    metrics: "100% transparent",
    color: "bg-purple-500"
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Tableaux de bord en temps réel et rapports automatisés",
    metrics: "24/7 monitoring",
    color: "bg-blue-500"
  }
];

export function FeaturesSection() {
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  return (
    <motion.section
      id="features"
      ref={featuresRef}
      initial="hidden"
      animate={featuresInView ? "visible" : "hidden"}
      variants={fadeIn}
      className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-20 relative overflow-hidden"
    >
      {/* Grille technique en arrière-plan */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `linear-gradient(rgba(0,122,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,122,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      <motion.div
        initial="hidden"
        animate={featuresInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="text-center mb-16 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 backdrop-blur-md rounded-full border border-accent/20 mb-6"
        >
          <span className="text-sm font-medium text-accent">Système Intelligent</span>
          <span className="text-xs text-foreground/60">Technologie de pointe</span>
        </motion.div>
        
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
          Architecture Technique
        </h2>
        <p className="text-lg text-foreground/60 max-w-3xl mx-auto leading-relaxed">
          Une plateforme technologique avancée combinant IoT, IA et blockchain pour révolutionner la gestion des déchets à Douala
        </p>
      </motion.div>
      
      {/* Système principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
        {mainModules.map((module, index) => (
          <motion.div
            key={module.title}
            initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
            animate={featuresInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index === 0 ? -50 : 50 }}
            transition={{ delay: 0.3 + index * 0.2, duration: 0.8 }}
            className="relative group"
          >
            <div className="bg-gradient-to-br from-background/80 to-accent/5 backdrop-blur-xl rounded-3xl p-8 border border-border/20 hover:border-accent/40 transition-all duration-500 hover:shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center">
                  <module.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{module.title}</h3>
                  <p className="text-foreground/60 text-sm">{module.subtitle}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {module.features.map((feature, i) => (
                  <div key={feature.name} className="flex items-center gap-3 p-3 bg-background/40 rounded-xl">
                    <div className={`w-2 h-2 ${feature.color} rounded-full animate-pulse`} />
                    <span className="text-sm font-medium">{feature.name}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-accent/10 rounded-xl">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/60">{module.metric.label}</span>
                  <span className="text-accent font-bold">{module.metric.value}</span>
                </div>
                <div className="w-full bg-background/40 rounded-full h-2 mt-2">
                  <motion.div 
                    className="bg-accent h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={featuresInView ? { width: `${module.metric.percentage}%` } : { width: 0 }}
                    transition={{ delay: 0.8 + index * 0.2, duration: 1.5 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modules secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {secondaryModules.map((module, i) => (
          <motion.div
            key={module.title}
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.7 + i * 0.1, duration: 0.6 }}
            className="group relative"
          >
            <div className="bg-background/60 backdrop-blur-xl rounded-2xl p-6 border border-border/20 hover:border-accent/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 ${module.color} rounded-lg flex items-center justify-center`}>
                  <module.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">{module.title}</h3>
              </div>
              
              <p className="text-foreground/70 text-sm mb-4 leading-relaxed">{module.desc}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground/50">Performance</span>
                <span className="text-sm font-bold text-accent">{module.metrics}</span>
              </div>
              
              <motion.div 
                className={`w-full h-1 ${module.color} rounded-full mt-2`}
                initial={{ scaleX: 0 }}
                animate={featuresInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.8 }}
                style={{ transformOrigin: "left" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
} 