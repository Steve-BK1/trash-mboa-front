"use client";

import { motion, useInView, easeInOut } from "framer-motion";
import { useRef } from "react";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2, ease: easeInOut } },
};

export function AboutSection() {
  const aboutRef = useRef(null);
  const aboutInView = useInView(aboutRef, { once: true, margin: "-100px" });

  return (
    <motion.section
      id="about"
      ref={aboutRef}
      initial="hidden"
      animate={aboutInView ? "visible" : "hidden"}
      variants={fadeIn}
      className="max-w-2xl mx-auto px-8 py-20 text-center"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={aboutInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-4xl sm:text-5xl font-bold text-foreground mb-8"
      >
        À propos de <span className="text-accent">Trash Mboa</span>
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={aboutInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-xl text-foreground/70 leading-relaxed"
      >
        Nous transformons la gestion des déchets à Douala grâce à la technologie et l'engagement citoyen.
      </motion.p>
    </motion.section>
  );
} 