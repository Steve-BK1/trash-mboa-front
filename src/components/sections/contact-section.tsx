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

export function ContactSection() {
  const contactRef = useRef(null);
  const contactInView = useInView(contactRef, { once: true, margin: "-100px" });

  return (
    <motion.section
      id="contact"
      ref={contactRef}
      initial="hidden"
      animate={contactInView ? "visible" : "hidden"}
      variants={fadeIn}
      className="max-w-3xl mx-auto px-8 py-20 text-center"
    >
      <motion.h2
        initial="hidden"
        animate={contactInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent"
      >
        Contact
      </motion.h2>
      <motion.p
        initial="hidden"
        animate={contactInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="text-xl text-foreground/80 mb-6"
      >
        Une question, une suggestion ou envie de rejoindre l'aventure ?
      </motion.p>
      <motion.a
        whileHover={{ scale: 1.05, boxShadow: "0 2px 16px 0 #007AFF33" }}
        whileTap={{ scale: 0.97 }}
        href="mailto:contact@trashmboa.com"
        className="inline-block px-10 py-4 rounded-full border border-border bg-background/80 text-foreground font-bold hover:bg-foreground/5 transition-all backdrop-blur-md"
      >
        contact@trashmboa.com
      </motion.a>
    </motion.section>
  );
} 