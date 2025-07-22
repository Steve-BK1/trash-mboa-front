"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  location: string;
  rating: number;
}

interface TestimonialSliderProps {
  testimonials: Testimonial[];
  autoPlayInterval?: number;
}

export function TestimonialSlider({ 
  testimonials, 
  autoPlayInterval = 4000 
}: TestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [currentIndex, isPaused, autoPlayInterval, testimonials.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };
  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const t = testimonials[currentIndex];

  return (
    <div
      className="relative w-full max-w-3xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Contenu principal */}
      <div className="relative px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="text-center space-y-8"
          >
            {/* Citation */}
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground/90 leading-relaxed">
              "{t.quote}"
            </blockquote>

            {/* Auteur */}
            <div className="text-sm text-foreground/60">
              — {t.name}, {t.location}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Flèches discrètes aux extrémités */}
        <button
          onClick={goToPrevious}
          aria-label="Précédent"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-foreground/40 hover:text-foreground/60 transition-colors focus:outline-none"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goToNext}
          aria-label="Suivant"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 text-foreground/40 hover:text-foreground/60 transition-colors focus:outline-none"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Indicateurs simples */}
      <div className="flex justify-center gap-1 mt-12">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Témoignage ${index + 1}`}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
              index === currentIndex
                ? "bg-foreground"
                : "bg-foreground/20 hover:bg-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
} 