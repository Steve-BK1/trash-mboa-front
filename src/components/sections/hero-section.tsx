"use client";

import { motion, easeInOut } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: easeInOut },
  }),
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-8 sm:px-12 lg:px-16 pt-24 pb-20 overflow-hidden">
      {/* Background gradient subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
      
      {/* Contenu principal centré */}
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center space-y-12">
        
        {/* Badge Apple-style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 backdrop-blur-md rounded-full border border-accent/20"
        >
          <span className="text-sm font-medium text-accent">Nouveau</span>
          <span className="text-xs text-foreground/60">Gestion intelligente des déchets</span>
        </motion.div>

        {/* Titre principal */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight text-foreground"
        >
          La révolution de la
          <span className="block text-accent">gestion des déchets</span>
          <span className="block text-foreground">à Douala</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-lg sm:text-xl text-foreground/70 leading-relaxed max-w-3xl mx-auto"
        >
          Une plateforme moderne et intuitive qui transforme la façon dont Douala gère ses déchets. 
          Design inspiré par Apple pour une expérience utilisateur exceptionnelle.
        </motion.p>

        {/* Boutons Apple-style */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="#contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-accent text-white rounded-full text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Commencer maintenant
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 bg-background/80 backdrop-blur-md border border-border text-foreground rounded-full text-base font-semibold hover:bg-foreground/5 transition-all duration-200"
          >
            En savoir plus
          </motion.a>
        </motion.div>

        {/* Statistiques Apple-style en bas */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid grid-cols-3 gap-12 pt-12 border-t border-border/30 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">3M+</div>
            <div className="text-sm text-foreground/60 mt-2">Habitants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">24/7</div>
            <div className="text-sm text-foreground/60 mt-2">Disponible</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">100%</div>
            <div className="text-sm text-foreground/60 mt-2">Couvrage</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator Apple-style */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-foreground/40 font-medium">Découvrir</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center"
          >
            <div className="w-1 h-3 bg-foreground/40 rounded-full mt-2" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
} 