"use client";

import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/store/auth-store-v2";
import { ErrorAlert } from "@/components/ui/error-alert";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { toast } from "sonner";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

// Schéma de validation Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Format d'email invalide")
    .required("L'email est requis"),
  password: Yup.string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .required("Le mot de passe est requis"),
});

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const [lastError, setLastError] = useState<any>(null);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    // Rendu identique côté serveur et client avant hydratation
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-card rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Connexion</h2>
          <p className="text-foreground/60">Chargement du formulaire...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (values: LoginFormData, { setSubmitting, setFieldError }: any) => {
    try {
      clearError();
      setLastError(null);

      // Appel API via le hook TanStack Query
      await login(values.email, values.password);
      
      // Feedback de succès
      toast.success("Connexion réussie !");
      
      // Redirection automatique après succès
      router.push("/dashboard");
      onSuccess?.();
      
    } catch (error: any) {
      setLastError(error);
      console.error('Erreur de connexion:', error);
      
      // Gestion des erreurs spécifiques
      if (error?.response?.status === 401) {
        setFieldError('email', 'Email ou mot de passe incorrect');
        setFieldError('password', 'Email ou mot de passe incorrect');
      } else {
        toast.error("Erreur lors de la connexion");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Connexion</h2>
        <p className="text-foreground/60">Accédez à votre compte Trash Mboa</p>
      </div>

      {/* Affichage des erreurs globales */}
      <ErrorAlert 
        error={lastError || error} 
        onClose={() => {
          setLastError(null);
          clearError();
        }}
        className="mb-6"
      />

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={true}
      >
        {({ isSubmitting, errors, touched, handleBlur, handleChange, values }) => (
          <Form className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  className={`pl-10 ${errors.email && touched.email ? 'border-red-500' : ''}`}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  aria-invalid={!!(errors.email && touched.email)}
                  aria-describedby={errors.email && touched.email ? "error-email" : undefined}
                />
              </div>
              {errors.email && touched.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="error-email"
                  className="text-sm text-red-500"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <Field
                  as={Input}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  className={`pl-10 pr-10 ${errors.password && touched.password ? 'border-red-500' : ''}`}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  aria-invalid={!!(errors.password && touched.password)}
                  aria-describedby={errors.password && touched.password ? "error-password" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground/60 transition-colors"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="error-password"
                  className="text-sm text-red-500"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Bouton de connexion */}
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full h-12 sm:h-12 text-base font-semibold min-h-[44px]"
              aria-disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>

            {/* Lien d'inscription */}
            <div className="text-center mt-4">
              <p className="text-sm text-foreground/60">
                Pas encore de compte ?{" "}
                <a
                  href="/register"
                  className="text-accent hover:text-accent/80 font-medium transition-colors"
                >
                  S'inscrire
                </a>
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </motion.div>
  );
} 