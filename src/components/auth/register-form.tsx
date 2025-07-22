"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Loader2, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/store/auth-store-v2";
import { ErrorAlert } from "@/components/ui/error-alert";
import * as Yup from "yup";
import { toast } from "sonner";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { useRouter } from "next/navigation";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

// Schéma de validation Yup
const RegisterSchema = Yup.object().shape({
  nom: Yup.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .required("Le nom est requis"),
  email: Yup.string()
    .email("Format d'email invalide")
    .required("L'email est requis"),
  password: Yup.string()
    .min(8, "Le mot de passe doit contenir au moins 6 caractères")
    .required("Le mot de passe est requis"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], "Les mots de passe ne correspondent pas")
    .required("La confirmation du mot de passe est requise"),
  telephone: Yup.string()
    .min(8, "Le numéro de téléphone doit contenir au moins 8 caractères")
    .required("Le téléphone est requis"),
  adresse: Yup.string()
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .required("L'adresse est requise"),
});

interface RegisterFormData {
  nom: string;
  email: string;
  password: string;
  confirmPassword: string;
  telephone: string;
  adresse: string;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading, error, clearError } = useAuth();
  const [lastError, setLastError] = useState<any>(null);
  const router = useRouter();

  const initialValues: RegisterFormData = {
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
    telephone: "",
    adresse: ""
  };

  const handleSubmit = async (values: RegisterFormData, { setSubmitting, setFieldError }: any) => {
    try {
      clearError();
      setLastError(null);

      // Appel API via le hook TanStack Query
      await register({
        nom: values.nom,
        email: values.email,
        password: values.password,
        telephone: values.telephone,
        adresse: values.adresse
      });
      // Feedback de succès
      toast.success("Inscription réussie !");
      router.push("/login");
      
      // Callback de succès
      onSuccess?.();
      
    } catch (error: any) {
      setLastError(error);
      // Affichage du vrai message d'erreur
      const apiMessage = error?.response?.data?.message || error?.message || "Erreur lors de l'inscription";
      toast.error(apiMessage);
      // Log complet de l'erreur backend pour debug
      console.log("Erreur complète backend :", error?.response?.data);
      console.log("Erreur complète backend :", error?.response);
      console.log("Erreur complète backend data :", error?.response?.data);
      // Gestion des erreurs spécifiques
      if (error?.response?.status === 409) {
        setFieldError('email', 'Cet email est déjà utilisé');
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
        <h2 className="text-3xl font-bold text-foreground mb-2">Inscription</h2>
        <p className="text-foreground/60">Créez votre compte Trash Mboa</p>
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
        initialValues={initialValues}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
        validateOnChange={false}
        validateOnBlur={true}
      >
        {({ isSubmitting, errors, touched, handleBlur, handleChange, values, setFieldValue }) => (
          <Form className="space-y-6">
            {/* Nom */}
            <div className="space-y-2">
              <label htmlFor="nom" className="text-sm font-medium text-foreground">
                Nom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <Field
                  as={Input}
                  id="nom"
                  name="nom"
                  type="text"
                  placeholder="Votre nom complet"
                  className={`pl-10 ${errors.nom && touched.nom ? 'border-red-500' : ''}`}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.nom}
                  aria-invalid={!!(errors.nom && touched.nom)}
                  aria-describedby={errors.nom && touched.nom ? "error-nom" : undefined}
                />
              </div>
              {errors.nom && touched.nom && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="error-nom"
                  className="text-sm text-red-500"
                >
                  {errors.nom}
                </motion.p>
              )}
            </div>

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

            {/* Confirmation du mot de passe */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <Field
                  as={Input}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmez votre mot de passe"
                  className={`pl-10 pr-10 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.confirmPassword}
                  aria-invalid={!!(errors.confirmPassword && touched.confirmPassword)}
                  aria-describedby={errors.confirmPassword && touched.confirmPassword ? "error-confirmPassword" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground/60 transition-colors"
                  aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="error-confirmPassword"
                  className="text-sm text-red-500"
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <label htmlFor="telephone" className="text-sm font-medium text-foreground">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <Field
                  as={Input}
                  id="telephone"
                  name="telephone"
                  type="text"
                  placeholder="Votre numéro de téléphone"
                  className={`pl-10 ${errors.telephone && touched.telephone ? 'border-red-500' : ''}`}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.telephone}
                  aria-invalid={!!(errors.telephone && touched.telephone)}
                  aria-describedby={errors.telephone && touched.telephone ? "error-telephone" : undefined}
                />
              </div>
              {errors.telephone && touched.telephone && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="error-telephone"
                  className="text-sm text-red-500"
                >
                  {errors.telephone}
                </motion.p>
              )}
            </div>

            {/* Adresse (auto-complétion) */}
            <div className="space-y-2">
              <label htmlFor="adresse" className="text-sm font-medium text-foreground">
                Adresse
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <AddressAutocomplete
                  id="adresse"
                  name="adresse"
                  value={values.adresse}
                  onChange={(val) => setFieldValue("adresse", val)}
                  placeholder="Ex : Douala, Akwa"
                  inputClassName={`pl-10 ${errors.adresse && touched.adresse ? 'border-red-500' : ''}`}
                  aria-invalid={!!(errors.adresse && touched.adresse)}
                  aria-describedby={errors.adresse && touched.adresse ? "error-adresse" : undefined}
                />
              </div>
              {errors.adresse && touched.adresse && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="error-adresse"
                  className="text-sm text-red-500"
                >
                  {errors.adresse}
                </motion.p>
              )}
            </div>

            {/* Bouton d'inscription */}
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full h-12 sm:h-12 text-base font-semibold min-h-[44px]"
              aria-disabled={isSubmitting || isLoading}
            >
              {typeof window !== "undefined" && (isSubmitting || isLoading) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Inscription...
                </>
              ) : (
                "S'inscrire"
              )}
            </Button>

            {/* Lien de connexion */}
            <div className="text-center mt-4">
              <p className="text-sm text-foreground/60">
                Déjà un compte ?{" "}
                <a
                  href="/login"
                  className="text-accent hover:text-accent/80 font-medium transition-colors"
                >
                  Se connecter
                </a>
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </motion.div>
  );
} 