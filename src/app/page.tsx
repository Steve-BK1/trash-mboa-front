"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Separator } from "@/components/ui/separator";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { AboutSection } from "@/components/sections/about-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CTASection } from "@/components/sections/cta-section";
import { ContactSection } from "@/components/sections/contact-section";
import { AuthTest } from "@/components/auth/auth-test";
import { ApiTest } from "@/components/auth/api-test";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <Header />
      
      <main>
        <HeroSection />
        
        <Separator />
        
        <FeaturesSection />
        
        <Separator />
        
        <AboutSection />
        
        <Separator />
        
        <TestimonialsSection />
        
        <Separator />
        
        <CTASection />
        
        <Separator />
        
        <ContactSection />
        
        {/* <Separator /> */}
        
        {/* Section de test pour l'authentification */}
        {/* <section className="py-20 px-8 sm:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Test d'authentification</h2>
              <p className="text-foreground/60">Testez les formulaires de connexion et d'inscription</p>
            </div>
            <AuthTest />
          </div>
        </section> */}

        {/* <Separator /> */}

        {/* Section de test des formats API */}
        {/* <section className="py-20 px-8 sm:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Test des formats API</h2>
              <p className="text-foreground/60">Testez différents formats de payload pour identifier le bon format</p>
            </div>
            <ApiTest />
          </div>
        </section> */}
      </main>
      
      <Footer />
    </div>
  );
}
