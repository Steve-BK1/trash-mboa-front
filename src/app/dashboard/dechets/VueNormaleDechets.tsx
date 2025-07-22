import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Loader2,
  Image as ImageIcon,
  PlusCircle,
  MapPin,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Formik, Form } from "formik";
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
import { useAuth } from "@/store/auth-store-v2";
import { useCreateDechet, useUpdateDechet } from "@/hooks/use-dechets-api";
import { toast } from "sonner";
import * as Yup from "yup";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Label } from "@/components/ui/label";

const DechetSchema = Yup.object().shape({
  type: Yup.string()
    .oneOf(["PLASTIQUE", "PAPIER", "METAL", "VERRE", "DANGEREUX", "ORGANIQUE"])
    .required("Le type est requis"),
  quantite: Yup.number()
    .min(1, "La quantité doit être au moins 1")
    .required("La quantité est requise"),
  adresse: Yup.string().required("L'adresse est requise"),
  ville: Yup.string().required("La ville est requise"),
  photo: Yup.mixed().nullable(),
  latitude: Yup.number().nullable(),
  longitude: Yup.number().nullable(),
});

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

export default function VueNormaleDechets(props: any) {
  const {
    data,
    isLoadingList,
    errorList,
    refetch,
    deleteDechet,
    deleteStatus,
    updateDechet: _updateDechet,
    updateStatus: _updateStatus,
    isLoading,
    preview,
    setPreview,
    showForm,
    setShowForm,
    fileInputRef,
    step,
    setStep,
    editDechet,
    setEditDechet,
    selectedStatut,
    setSelectedStatut,
    dechetToDelete,
    setDechetToDelete,
    deleting,
    setDeleting,
    position,
    geoError,
    geoLoading,
    refreshGeo,
    handleNext,
    handleBack,
    handleDelete,
    confirmDelete,
    handleCancelDelete,
    handleEdit,
    steps,
    handleOpenForm,
    formIncomplet,
    groupByStatut,
    statutLabels,
    grouped,
    types,
  } = props;

  const { user } = useAuth();
  const { mutateAsync, isSuccess, error, reset, status } = useCreateDechet();
  const { mutateAsync: updateDechet } = useUpdateDechet();
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  // Filtrage des déchets pour n'afficher que ceux de l'utilisateur connecté
  const dataFiltree =
    data && user ? data.filter((dechet: any) => dechet.userId === user.id) : [];
  // On régénère grouped à partir de dataFiltree
  const groupedFiltree = groupByStatut ? groupByStatut(dataFiltree) : {};

  const handleFinalSubmit = async (values: any, { setSubmitting }: any) => {
    setUploadError(null);
    setSubmitSuccess(false);
    let photoUrl: string | undefined = undefined;
    if (values.photo && values.photo instanceof File) {
      setUploading(true);
      try {
        photoUrl = await uploadToCloudinary(values.photo);
      } catch (err: any) {
        setUploadError(err.message || "Erreur lors de l'upload de la photo.");
        setUploading(false);
        setSubmitting(false);
        return;
      }
      setUploading(false);
    } else if (typeof values.photo === "string") {
      photoUrl = values.photo;
    }
    const payload = {
      ...values,
      photo: photoUrl || undefined,
    };
    try {
      if (props.editDechet) {
        await updateDechet({ id: props.editDechet.id, data: payload });
        toast.success("Déchet modifié avec succès !");
      } else {
        await mutateAsync(payload);
        toast.success("Déchet signalé avec succès !");
      }
      setSubmitSuccess(true);
      setTimeout(() => props.setShowForm(false), 1200);
      if (props.setEditDechet) props.setEditDechet(null);
    } catch (err) {
      setUploadError("Erreur lors de la soumission du déchet.");
      toast.error("Erreur lors de la soumission du déchet.");
    }
    setSubmitting(false);
    if (props.refetch) props.refetch();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex items-center gap-4 mb-8"
      >
        <Trash2 className="w-8 h-8 text-accent" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Mes déchets signalés
        </h1>
      </motion.div>

      {/* Consignes */}
      <div className="bg-muted/60 border border-muted rounded-xl p-4 mb-6 text-foreground/70 text-sm">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Vous pouvez signaler un nouveau déchet en cliquant sur le bouton
            ci-dessous.
          </li>
          <li>Ajoutez une photo pour faciliter l’identification.</li>
          <li>Vos déchets signalés apparaissent dans la liste ci-dessous.</li>
        </ul>
      </div>

      {/* Bouton pour ouvrir le formulaire */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={handleOpenForm}
          variant="default"
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Signaler un déchet
        </Button>
      </div>

      {/* Filtres de statut optimisés */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedStatut === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatut("ALL")}
        >
          Tous
        </Button>
        {Object.entries(statutLabels).map(([statut, label]) => (
          <Button
            key={statut}
            variant={selectedStatut === statut ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatut(statut)}
          >
            {String(label)}
          </Button>
        ))}
      </div>
      {/* Liste des déchets signalés */}
      <div className="mb-10">
        {isLoadingList ? (
          <div className="text-center py-8 text-foreground/60">
            <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
            Chargement de vos déchets…
          </div>
        ) : errorList ? (
          <ErrorAlert error={errorList} />
        ) : dataFiltree && dataFiltree.length > 0 ? (
          <div className="space-y-8">
            {selectedStatut === "ALL" ? (
              Object.entries(statutLabels).map(
                ([statut, label]) =>
                  groupedFiltree[statut] &&
                  groupedFiltree[statut].length > 0 && (
                    <div key={statut}>
                      <h3 className="text-lg font-semibold mb-3 text-accent/80">
                        {String(label)}
                      </h3>
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
                        {groupedFiltree[statut].map((dechet: any) => (
                          <motion.li
                            key={dechet.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-card/80 border rounded-xl p-4 flex items-center gap-4 shadow-sm"
                          >
                            {dechet.photo ? (
                              <img
                                src={dechet.photo}
                                alt={dechet.type}
                                className="w-16 h-16 object-cover rounded-lg border"
                              />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg border">
                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-foreground truncate">
                                {dechet.nom || dechet.type}
                              </div>
                              <div className="text-xs text-foreground/60 mt-1">
                                Type : {dechet.type} • Quantité :{" "}
                                {dechet.quantite}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEdit(dechet)}
                                title="Éditer"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleDelete(dechet)}
                                title="Supprimer"
                                disabled={isLoading || uploading || deleting}
                              >
                                {deleting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </div>
                  )
              )
            ) : groupedFiltree[selectedStatut] &&
              groupedFiltree[selectedStatut].length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-accent/80">
                  {String(statutLabels[selectedStatut])}
                </h3>
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
                  {groupedFiltree[selectedStatut].map((dechet: any) => (
                    <motion.li
                      key={dechet.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="bg-card/80 border rounded-xl p-4 flex items-center gap-4 shadow-sm"
                    >
                      {dechet.photo ? (
                        <img
                          src={dechet.photo}
                          alt={dechet.type}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg border">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">
                          {dechet.nom || dechet.type}
                        </div>
                        <div className="text-xs text-foreground/60 mt-1">
                          Type : {dechet.type} • Quantité : {dechet.quantite}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(dechet)}
                          title="Éditer"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDelete(dechet)}
                          title="Supprimer"
                          disabled={isLoading || uploading || deleting}
                        >
                          {deleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            ) : (
              <div className="text-center text-foreground/60 py-8">
                Aucun déchet pour ce statut.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-foreground/60 py-8">
            Aucun déchet signalé pour le moment.
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
              aria-label="Formulaire de signalement de déchet"
            >
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="absolute top-3 right-3 text-foreground/60 hover:text-foreground"
                aria-label="Fermer"
              >
                ×
              </button>
              {editDechet && (
                <div className="mb-2 text-xs text-accent font-semibold">
                  Édition du déchet
                </div>
              )}
              <h2 className="text-xl font-semibold mb-2">Signaler un déchet</h2>
              {/* Barre de progression */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  {steps.map((stepLabel: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step > index + 1
                            ? "bg-green-500 text-white"
                            : step === index + 1
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {step > index + 1 ? "✓" : index + 1}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-16 h-1 mx-2 ${
                            step > index + 1 ? "bg-green-500" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">{steps[step - 1]}</p>
              </div>

              <ErrorAlert error={error} onClose={reset} />
              <Formik
                initialValues={{
                  type: editDechet?.type || "PLASTIQUE",
                  quantite: editDechet?.quantite || 1,
                  adresse: editDechet?.adresse || "",
                  ville: editDechet?.ville || "",
                  photo: editDechet?.photo || null,
                  latitude:
                    editDechet?.latitude || position?.coords.latitude || null,
                  longitude:
                    editDechet?.longitude || position?.coords.longitude || null,
                }}
                validationSchema={DechetSchema}
                enableReinitialize
                onSubmit={handleFinalSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  setFieldValue,
                  isSubmitting,
                }) => (
                  <Form className="space-y-4">
                    {/* Étape 1 : Informations générales */}
                    {step === 1 && (
                      <div className="mb-4">
                        <h2 className="text-lg font-bold mb-2">
                          Informations générales
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <label
                              htmlFor="type"
                              className="text-sm font-medium text-foreground"
                            >
                              Type
                            </label>
                            <Select
                              value={values.type}
                              onValueChange={(val) =>
                                setFieldValue("type", val)
                              }
                              name="type"
                            >
                              <SelectTrigger
                                className={`w-full ${
                                  errors.type && touched.type
                                    ? "border-red-500"
                                    : ""
                                }`}
                              >
                                <SelectValue placeholder="Choisir un type" />
                              </SelectTrigger>
                              <SelectContent>
                                {types.map((t: any) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.type &&
                              touched.type &&
                              typeof errors.type === "string" && (
                                <div
                                  id="error-type"
                                  className="text-xs text-red-500 mt-1"
                                >
                                  {errors.type}
                                </div>
                              )}
                          </div>
                          <div className="flex-1">
                            <label
                              htmlFor="quantite"
                              className="text-sm font-medium text-foreground"
                            >
                              Quantité
                            </label>
                            <Input
                              type="number"
                              id="quantite"
                              name="quantite"
                              min={1}
                              value={values.quantite}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              required
                              aria-invalid={
                                !!(errors.quantite && touched.quantite)
                              }
                              aria-describedby="error-quantite"
                              className={
                                errors.quantite && touched.quantite
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                            {errors.quantite &&
                              touched.quantite &&
                              typeof errors.quantite === "string" && (
                                <div
                                  id="error-quantite"
                                  className="text-xs text-red-500 mt-1"
                                >
                                  {errors.quantite}
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="flex justify-end mt-6">
                          <Button
                            type="button"
                            onClick={handleNext}
                            variant="default"
                            disabled={isSubmitting || uploading}
                            aria-disabled={isSubmitting || uploading}
                          >
                            Suivant
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Étape 2 : Localisation */}
                    {step === 2 && (
                      <div className="mb-4">
                        <h2 className="text-lg font-bold mb-2">Localisation</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1">
                            <Label
                              htmlFor="adresse"
                              className="text-sm font-medium text-foreground"
                            >
                              Adresse
                            </Label>
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
                                    const ville =
                                      addressData.city ||
                                      addressData.town ||
                                      addressData.village ||
                                      addressData.municipality ||
                                      addressData.county ||
                                      "";
                                    if (ville) {
                                      setFieldValue("ville", ville);
                                    }
                                  }
                                }
                              }}
                              placeholder="Ex : Rue des Lilas, Douala"
                              className="w-full"
                            />
                            {errors.adresse &&
                              touched.adresse &&
                              typeof errors.adresse === "string" && (
                                <div
                                  id="error-adresse"
                                  className="text-xs text-red-500 mt-1"
                                >
                                  {errors.adresse}
                                </div>
                              )}
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
                        <div className="flex justify-between mt-6">
                          <Button
                            type="button"
                            onClick={handleBack}
                            variant="outline"
                            disabled={isSubmitting || uploading}
                            aria-disabled={isSubmitting || uploading}
                          >
                            Précédent
                          </Button>
                          <Button
                            type="button"
                            onClick={handleNext}
                            variant="default"
                            disabled={isSubmitting || uploading}
                            aria-disabled={isSubmitting || uploading}
                          >
                            Suivant
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Étape 3 : Photo */}
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
                            onClick={handleBack}
                            variant="outline"
                            disabled={isSubmitting || uploading}
                            aria-disabled={isSubmitting || uploading}
                          >
                            Précédent
                          </Button>
                          <Button
                            type="button"
                            onClick={handleNext}
                            variant="default"
                            disabled={isSubmitting || uploading}
                            aria-disabled={isSubmitting || uploading}
                          >
                            Suivant
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Étape 4 : Récapitulatif */}
                    {step === 4 && (
                      <div className="mb-4">
                        <h2 className="text-lg font-bold mb-2">
                          Récapitulatif
                        </h2>
                        <div className="space-y-3 text-sm">
                          <div>
                            <strong>Type :</strong>{" "}
                            {
                              types.find((t: any) => t.value === values.type)
                                ?.label
                            }
                          </div>
                          <div>
                            <strong>Quantité :</strong> {values.quantite}
                          </div>
                          <div>
                            <strong>Ville :</strong> {values.ville}
                          </div>
                          {values.latitude && values.longitude && (
                            <div>
                              <strong>Position :</strong>{" "}
                              {values.latitude.toFixed(6)},{" "}
                              {values.longitude.toFixed(6)}
                            </div>
                          )}
                          {preview && (
                            <div>
                              <strong>Photo :</strong> Ajoutée
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between mt-6">
                          <Button
                            type="button"
                            onClick={handleBack}
                            variant="outline"
                            disabled={isSubmitting || uploading}
                            aria-disabled={isSubmitting || uploading}
                          >
                            Précédent
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting || uploading}
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            ) : null}
                            {editDechet ? "Modifier" : "Signaler"}
                          </Button>
                        </div>
                      </div>
                    )}
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
