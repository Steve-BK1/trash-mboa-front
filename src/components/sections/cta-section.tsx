"use client";

import { motion, useInView, easeInOut } from "framer-motion";
import { useRef } from "react";

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

export function CTASection() {
  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ctaRef}
      initial="hidden"
      animate={ctaInView ? "visible" : "hidden"}
      variants={fadeIn}
      className="max-w-4xl mx-auto px-8 py-20 text-center"
    >
      <motion.h2
        initial="hidden"
        animate={ctaInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="text-4xl sm:text-5xl font-bold mb-8 bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent"
      >
        Rejoignez le mouvement Trash Mboa à Douala !
      </motion.h2>
      <motion.p
        initial="hidden"
        animate={ctaInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="text-xl text-foreground/80 mb-8"
      >
        Téléchargez l'application, impliquez votre quartier et contribuez à une ville plus propre et plus intelligente.
      </motion.p>
      <motion.a
        whileHover={{ scale: 1.08, boxShadow: "0 4px 32px 0 #007AFF55" }}
        whileTap={{ scale: 0.97 }}
        href="#contact"
        className="inline-block px-12 py-5 rounded-full bg-accent text-white text-xl font-bold shadow-xl hover:shadow-2xl transition-all backdrop-blur-md border border-accent/30"
      >
        Commencer maintenant
      </motion.a>
    </motion.section>
  );
} 