"use client";

import { motion, useInView, easeInOut } from "framer-motion";
import { useRef } from "react";
import { TestimonialSlider } from "@/components/testimonial-slider";

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

// Données des témoignages
const testimonials = [
  {
    id: 1,
    quote: "Depuis Trash Mboa, mon quartier est beaucoup plus propre et tout le monde participe ! L'application est intuitive et les notifications m'aident à ne rien manquer.",
    name: "Awa Nkeng",
    location: "Bonamoussadi, Douala",
    rating: 5
  },
  {
    id: 2,
    quote: "La collecte est plus régulière et je reçois des alertes sur mon téléphone. C'est rassurant de savoir que la ville s'occupe vraiment de nos déchets.",
    name: "Jean Mbarga",
    location: "Akwa, Douala",
    rating: 5
  },
  {
    id: 3,
    quote: "C'est motivant de voir la ville s'impliquer et de pouvoir agir à mon niveau. L'interface est moderne et l'expérience utilisateur est exceptionnelle.",
    name: "Mireille Tchokouani",
    location: "Deido, Douala",
    rating: 5
  },
  {
    id: 4,
    quote: "Trash Mboa a transformé notre façon de gérer les déchets. L'application est si simple à utiliser que même mes parents l'utilisent maintenant !",
    name: "Sarah Etoa",
    location: "Bali, Douala",
    rating: 5
  },
  {
    id: 5,
    quote: "Enfin une solution moderne pour nos déchets ! L'équipe est réactive et l'application fonctionne parfaitement. Je recommande à tous mes voisins.",
    name: "Pierre Nguemo",
    location: "Makepe, Douala",
    rating: 5
  }
];

export function TestimonialsSection() {
  const impactRef = useRef(null);
  const impactInView = useInView(impactRef, { once: true, margin: "-100px" });

  return (
    <motion.section
      id="impact"
      ref={impactRef}
      initial="hidden"
      animate={impactInView ? "visible" : "hidden"}
      variants={fadeIn}
      className="max-w-6xl mx-auto px-8 py-20"
    >
      <motion.h2
        initial="hidden"
        animate={impactInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="text-4xl sm:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent"
      >
        Impact & témoignages
      </motion.h2>
      <motion.div
        initial="hidden"
        animate={impactInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="mt-12"
      >
        <TestimonialSlider 
          testimonials={testimonials}
          autoPlayInterval={5000}
        />
      </motion.div>
    </motion.section>
  );
} 