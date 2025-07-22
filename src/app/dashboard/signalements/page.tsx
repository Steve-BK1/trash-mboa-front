"use client";
import {
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  PlusCircle,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateSignalement,
  useUserSignalements,
  useDeleteSignalement,
  useUpdateSignalement,
} from "@/hooks/use-signalements-api";
import { ErrorAlert } from "@/components/ui/error-alert";
import { useGeolocation } from "@/hooks/use-geolocation";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { toast } from "sonner";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useUserRole, useAuth } from '@/store/auth-store-v2';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold mb-2 text-accent/80">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

const types = [
  { value: "DECHET_ABANDONNE", label: "Déchet abandonné" },
  { value: "POUBELLE_PLEINE", label: "Poubelle pleine" },
  { value: "DECHET_DANGEREUX", label: "Déchet dangereux" },
  { value: "PROBLEME_COLLECTE", label: "Problème de collecte" },
  { value: "AUTRE", label: "Autre" },
];

async function uploadToCloudinary(file: File): Promise<string> {
  const url = "https://api.cloudinary.com/v1_1/dxgfy1gu4/image/upload";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "trashBoa");
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error?.message || "Erreur upload Cloudinary");
  return data.secure_url;
}

// Schéma de validation Yup pour le signalement
const SignalementSchema = Yup.object().shape({
  type: Yup.string().oneOf([
    "DECHET_ABANDONNE", 
    "POUBELLE_PLEINE", 
    "DECHET_DANGEREUX", 
    "PROBLEME_COLLECTE", 
    "AUTRE"
  ]).required("Le type est requis"),
  description: Yup.string().required("La description est requise"),
  adresse: Yup.string().required("L'adresse est requise"),
  ville: Yup.string().required("La ville est requise"),
  photo: Yup.mixed().nullable(),
  latitude: Yup.number().nullable(),
  longitude: Yup.number().nullable(),
});

export default function SignalementsPage() {
  const role = useUserRole();
  const { user } = useAuth();
  if (role === 'COLLECTOR') {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Accès interdit</h1>
        <p className="text-foreground/70 mb-4">Les collecteurs n'ont pas accès à la page des signalements.</p>
      </div>
    );
  }
  const {
    data,
    isLoading: isLoadingList,
    error: errorList,
    refetch,
  } = useUserSignalements();
  const { mutateAsync: createSignalement, error: errorCreate, reset: resetCreate, status: createStatus } = useCreateSignalement();
  const { mutateAsync: deleteSignalement, status: deleteStatus } =
    useDeleteSignalement();
  const { mutateAsync: updateSignalement, status: updateStatus } =
    useUpdateSignalement();
  const isLoading = createStatus === "pending";
  const [preview, setPreview] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    position,
    error: geoError,
    loading: geoLoading,
    refresh: refreshGeo,
  } = useGeolocation({ enableHighAccuracy: true, maximumAge: 60000 });
  const [editSignalement, setEditSignalement] = useState<any | null>(null);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  // Ajouter l'état pour la suppression
  const [signalementToDelete, setSignalementToDelete] = useState<any | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const steps = [
    "Informations générales",
    "Localisation",
    "Photo",
    "Récapitulatif"
  ];

  const handleEdit = (signalement: any) => {
    setEditSignalement(signalement);
    setPreview(signalement.photo || null);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setSignalementToDelete(data?.find((s: any) => s.id === id) || null);
  };

  useEffect(() => {
    if (position) {
      // setForm((f) => ({ // This line is removed as per the new_code
      //   ...f,
      //   latitude: position.coords.latitude,
      //   longitude: position.coords.longitude,
      // }));
    }
  }, [position]);

  // handleChange, handleFile, validateStep, handleNext, handleBack, handleFinalSubmit, handleDelete, confirmDelete, handleEdit, steps, handleOpenForm, filteredData, isLoadingList, errorList, isLoading, preview, showForm, fileInputRef, geoLoading, position, editSignalement, selectedType, signalementToDelete, deleting

  const confirmDelete = async (id: number) => {
    setDeleting(true);
    try {
      await deleteSignalement(id);
      toast.success("Signalement supprimé avec succès !");
      refetch();
    } catch (e) {
      toast.error("Erreur lors de la suppression du signalement.");
    } finally {
      setDeleting(false);
      setSignalementToDelete(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex items-center gap-4 mb-8"
      >
        <AlertTriangle className="w-8 h-8 text-accent" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Mes signalements
        </h1>
      </motion.div>

      {/* Consignes */}
      <div className="bg-muted/60 border border-muted rounded-xl p-4 mb-6 text-foreground/70 text-sm">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Vous pouvez signaler un problème en cliquant sur le bouton
            ci-dessous.
          </li>
          <li>Ajoutez une photo pour faciliter l’identification.</li>
          <li>Vos signalements apparaissent dans la liste ci-dessous.</li>
        </ul>
      </div>

      {/* Bouton pour ouvrir le formulaire */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => setShowForm(true)}
          variant="default"
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Signaler un problème
        </Button>
      </div>

      {/* Filtres par type */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedType === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedType("ALL")}
        >
          Tous
        </Button>
        {types.map((t) => (
          <Button
            key={t.value}
            variant={selectedType === t.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* Liste des signalements */}
      <div className="mb-10">
        {isLoadingList ? (
          <div className="text-center py-8 text-foreground/60">
            <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
            Chargement de vos signalements…
          </div>
        ) : errorList ? (
          <ErrorAlert error={errorList} />
        ) : data && data.length > 0 ? (
          <>
            {/* Filtrage des données */}
            {(() => {
              const filteredData = selectedType === "ALL" 
                ? data 
                : data.filter((signalement: any) => signalement.type === selectedType);
              
              if (filteredData.length === 0) {
                return (
                  <div className="text-center text-foreground/60 py-8">
                    Aucun signalement pour ce filtre.
                  </div>
                );
              }

              return (
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { staggerChildren: 0.08 },
                    },
                  }}
                  className="space-y-4"
                >
                  {filteredData.map((signalement: any) => (
              <motion.li
                key={signalement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-card/80 border rounded-xl p-4 flex items-center gap-4 shadow-sm"
              >
                {signalement.photo ? (
                  <img
                    src={signalement.photo}
                    alt={signalement.type}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg border">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {signalement.type}
                  </div>
                  <div className="text-xs text-foreground/60 mt-1">
                    {signalement.description}
                  </div>
                  {signalement.latitude && signalement.longitude && (
                    <div className="text-xs text-foreground/50 mt-1">
                      Lat: {signalement.latitude.toFixed(5)}, Lon:{" "}
                      {signalement.longitude.toFixed(5)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {/* Desktop : boutons texte */}
                  <div className="hidden sm:flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(signalement)}
                      disabled={
                        isLoading || deleteStatus === "pending"
                      }
                    >
                      Modifier
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={
                            isLoading || deleteStatus === "pending"
                          }
                        >
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Supprimer le signalement ?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Voulez-vous vraiment
                            supprimer ce signalement ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deleting}>
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction
                            disabled={deleting}
                            onClick={() => confirmDelete(signalement.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            {deleting ? "Suppression…" : "Supprimer"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  {/* Mobile : icônes seules */}
                  <div className="flex sm:hidden flex-row gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleEdit(signalement)}
                      aria-label="Modifier"
                      disabled={
                        isLoading || deleteStatus === "pending"
                      }
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(signalement.id)}
                          aria-label="Supprimer"
                          disabled={
                            isLoading || deleteStatus === "pending"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Supprimer le signalement ?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Voulez-vous vraiment
                            supprimer ce signalement ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deleting}>
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction
                            disabled={deleting}
                            onClick={() => confirmDelete(signalement.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            {deleting ? "Suppression…" : "Supprimer"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        );
            })()}
          </>
        ) : (
          <div className="text-center text-foreground/60 py-8">
            Aucun signalement pour ce filtre.
          </div>
        )}
      </div>

      {/* Formulaire animé */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              className="bg-card/90 shadow-lg rounded-2xl p-6 sm:p-8 flex flex-col gap-6 w-full max-w-md mx-auto relative"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              aria-label="Formulaire de signalement"
            >
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="absolute top-3 right-3 text-foreground/60 hover:text-foreground"
                aria-label="Fermer"
              >
                ×
              </button>
              {editSignalement && (
                <div className="mb-2 text-xs text-accent font-semibold">
                  Édition du signalement
                </div>
              )}
              <h2 className="text-xl font-semibold mb-2">
                Signaler un problème
              </h2>
              {/* Barre de progression */}
              <div className="flex items-center gap-2 mb-4">
                {/* Removed steps as they are now managed by Formik */}
              </div>
              <ErrorAlert error={errorCreate} onClose={resetCreate} />
              <Formik
                initialValues={{
                  type: editSignalement?.type || "",
                  description: editSignalement?.description || "",
                  adresse: editSignalement?.adresse || "",
                  ville: editSignalement?.ville || "",
                  latitude: editSignalement?.latitude || null,
                  longitude: editSignalement?.longitude || null,
                  photo: null,
                }}
                validationSchema={SignalementSchema}
                enableReinitialize
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                  console.log('SUBMIT SIGNALEMENT', values);
                  setUploadError(null);
                  setSubmitSuccess(false);
                  
                  let photoUrl: string | undefined = undefined;
                  if (values.photo && (values.photo as File) instanceof File) {
                    setUploading(true);
                    try {
                      photoUrl = await uploadToCloudinary(values.photo as File);
                      console.log('UPLOAD PHOTO OK', photoUrl);
                    } catch (err: any) {
                      setUploadError(err.message || "Erreur lors de l'upload de la photo.");
                      setUploading(false);
                      console.error('UPLOAD PHOTO ERROR', err);
                      return;
                    }
                    setUploading(false);
                  } else if (typeof values.photo === "string") {
                    photoUrl = values.photo;
                  }

                  const payload = {
                    type: values.type,
                    description: values.description,
                    adresse: values.adresse,
                    ville: values.ville,
                    latitude: values.latitude,
                    longitude: values.longitude,
                    photo: photoUrl,
                  };

                  console.log('APPEL API SIGNALEMENT', payload);

                  try {
                    if (editSignalement) {
                      const res = await updateSignalement({ 
                        id: editSignalement.id, 
                        data: payload 
                      });
                      console.log('API UPDATE SIGNALEMENT REPONSE', res);
                      toast.success("Signalement modifié avec succès !");
                    } else {
                      const res = await createSignalement(payload);
                      console.log('API CREATE SIGNALEMENT REPONSE', res);
                      toast.success("Signalement créé avec succès !");
                    }
                    setSubmitSuccess(true);
                    setShowForm(false);
                    setEditSignalement(null);
                    setPreview(null);
                    setStep(1);
                    resetForm();
                    refetch();
                  } catch (err: any) {
                    console.error('API SIGNALEMENT ERROR', err);
                    toast.error(err.message || "Erreur lors de la création du signalement.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting, validateForm }) => (
                  <Form className="space-y-6">
                    {/* Barre de progression */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        {steps.map((stepName, index) => (
                          <div key={index} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              step > index + 1 ? 'bg-green-500 text-white' :
                              step === index + 1 ? 'bg-blue-500 text-white' :
                              'bg-gray-200 text-gray-600'
                            }`}>
                              {step > index + 1 ? '✓' : index + 1}
                            </div>
                            {index < steps.length - 1 && (
                              <div className={`w-16 h-1 mx-2 ${
                                step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                              }`} />
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{steps[step - 1]}</p>
                    </div>

                    {/* Étape 1: Informations générales */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="type">Type de problème *</Label>
                          <Select
                            name="type"
                            value={values.type}
                            onValueChange={(value) => setFieldValue("type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DECHET_ABANDONNE">Déchet abandonné</SelectItem>
                              <SelectItem value="POUBELLE_PLEINE">Poubelle pleine</SelectItem>
                              <SelectItem value="DECHET_DANGEREUX">Déchet dangereux</SelectItem>
                              <SelectItem value="PROBLEME_COLLECTE">Problème de collecte</SelectItem>
                              <SelectItem value="AUTRE">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.type && touched.type && (
                            <p className="text-sm text-red-500 mt-1">{errors.type as string}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={values.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Décrivez le problème en détail..."
                            className="min-h-[100px]"
                          />
                          {errors.description && touched.description && (
                            <p className="text-sm text-red-500 mt-1">{errors.description as string}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Étape 2: Localisation */}
                    {step === 2 && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="adresse">Adresse *</Label>
                          <AddressAutocomplete
                            id="adresse"
                            name="adresse"
                            value={values.adresse}
                            onChange={(address, coords) => {
                              setFieldValue("adresse", address);
                              if (coords) {
                                setFieldValue("latitude", coords.lat);
                                setFieldValue("longitude", coords.lon);
                                // Extraire la ville à partir des données d'adresse
                                if (coords.raw?.address) {
                                  const addressData = coords.raw.address;
                                  // Priorité: city > town > village > municipality
                                  const ville = addressData.city || 
                                              addressData.town || 
                                              addressData.village || 
                                              addressData.municipality ||
                                              addressData.county ||
                                              '';
                                  if (ville) {
                                    setFieldValue("ville", ville);
                                  }
                                }
                              }
                            }}
                            placeholder="Entrez l'adresse exacte"
                            className="w-full"
                          />
                          {errors.adresse && touched.adresse && (
                            <p className="text-sm text-red-500 mt-1">{errors.adresse as string}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="ville">Ville *</Label>
                          <Input
                            id="ville"
                            name="ville"
                            value={values.ville}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Entrez la ville"
                          />
                          {errors.ville && touched.ville && (
                            <p className="text-sm text-red-500 mt-1">{errors.ville as string}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input
                              id="latitude"
                              name="latitude"
                              type="number"
                              step="any"
                              value={values.latitude || ""}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Latitude"
                            />
                          </div>
                          <div>
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input
                              id="longitude"
                              name="longitude"
                              type="number"
                              step="any"
                              value={values.longitude || ""}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="Longitude"
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            type="button"
                            onClick={() => {
                              refreshGeo();
                              if (position) {
                                setFieldValue(
                                  "latitude",
                                  position.coords.latitude
                                );
                                setFieldValue(
                                  "longitude",
                                  position.coords.longitude
                                );
                              }
                            }}
                            className="bg-accent text-white rounded-full p-2 shadow hover:bg-accent/80 transition focus:outline-none focus:ring-2 focus:ring-accent"
                            aria-label="Utiliser ma position"
                            title="Utiliser ma position actuelle"
                            disabled={geoLoading}
                          >
                            {geoLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MapPin className="w-4 h-4" />
                            )}
                          </Button>
                          <span className="text-sm text-foreground/70">
                            Utiliser ma position GPS actuelle
                          </span>
                        </div>
                        {values.latitude && values.longitude && (
                          <div className="text-xs text-foreground/70 mt-2">
                            Latitude : {values.latitude.toFixed(6)}
                            <br />
                            Longitude : {values.longitude.toFixed(6)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Étape 3: Photo */}
                    {step === 3 && (
                      <div className="mb-4">
                        <h2 className="text-lg font-bold mb-2">
                          Photo (optionnel)
                        </h2>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            {preview ? (
                              <img
                                src={preview}
                                alt="Aperçu"
                                className="w-20 h-20 rounded-lg object-cover border"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center border">
                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFieldValue("photo", file);
                                if (file) {
                                  setPreview(URL.createObjectURL(file));
                                } else {
                                  setPreview(null);
                                }
                              }}
                              className="block text-sm"
                              disabled={uploading}
                            />
                          </div>
                          {uploadError && (
                            <div className="text-xs text-red-500">
                              {uploadError}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(Math.max(1, step - 1))}
                          >
                            Précédent
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setStep(step + 1)}
                          >
                            Suivant
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Étape 4: Récapitulatif */}
                    {step === 4 && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-medium mb-3">Récapitulatif du signalement</h3>
                          <div className="space-y-2 text-sm">
                            <div><strong>Type:</strong> {values.type}</div>
                            <div><strong>Description:</strong> {values.description}</div>
                            <div><strong>Adresse:</strong> {values.adresse}</div>
                            <div><strong>Ville:</strong> {values.ville}</div>
                            {values.latitude && values.longitude && (
                              <div><strong>Coordonnées:</strong> {values.latitude}, {values.longitude}</div>
                            )}
                            <div><strong>Photo:</strong> {values.photo ? "Oui" : "Non"}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Boutons de navigation */}
                    <div className="flex justify-between pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                      >
                        Précédent
                      </Button>

                      {step < steps.length ? (
                        <Button
                          type="button"
                          onClick={async () => {
                            // Valider les champs de l'étape courante
                            const stepErrors = await validateForm();
                            const stepFields = step === 1 ? ['type', 'description'] :
                                             step === 2 ? ['adresse', 'ville'] :
                                             step === 3 ? [] : [];
                            
                            const hasStepErrors = stepFields.some(field => (stepErrors as any)[field]);
                            
                            if (!hasStepErrors) {
                              setStep(step + 1);
                            }
                          }}
                        >
                          Suivant
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={isSubmitting || uploading}
                        >
                          {isSubmitting ? "Envoi en cours..." : "Signaler"}
                        </Button>
                      )}
                    </div>
                  </Form>
                )}
              </Formik>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
