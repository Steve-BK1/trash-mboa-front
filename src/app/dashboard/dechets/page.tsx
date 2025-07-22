"use client";
import { Trash2, Loader2, Image as ImageIcon, CheckCircle2, PlusCircle, MapPin, Pencil } from "lucide-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateDechet, useUserDechets, useDeleteDechet, useUpdateDechet } from "@/hooks/use-dechets-api";
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
  SelectItem
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
import React from "react";
import { useUserRole } from '@/store/auth-store-v2';
import { useDechetsProximite } from "@/hooks/use-dechets-proximite";
import { useValiderCollecte } from "@/hooks/use-collectes-api";
import VueNormaleDechets from "./VueNormaleDechets";
import VueMissionsCollecteur from "./VueMissionsCollecteur";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold mb-2 text-accent/80">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

const types = [
  { value: "PLASTIQUE", label: "Plastique" },
  { value: "PAPIER", label: "Papier" },
  { value: "METAL", label: "Métal" },
  { value: "VERRE", label: "Verre" },
  { value: "DANGEREUX", label: "Dangereux" },
  { value: "ORGANIQUE", label: "Organique" },
];

// SUPPRESSION de la fonction uploadToCloudinary
// SUPPRESSION de la fonction handleFinalSubmit
// SUPPRESSION des états liés à l'upload (uploading, setUploading, uploadError, setUploadError, submitSuccess, setSubmitSuccess)
// SUPPRESSION du passage de ces props à VueNormaleDechets

// Schéma de validation Yup pour les déchets
const DechetSchema = Yup.object().shape({
  type: Yup.string().oneOf(["PLASTIQUE", "PAPIER", "METAL", "VERRE", "DANGEREUX", "ORGANIQUE"]).required("Le type est requis"),
  quantite: Yup.number().min(1, "La quantité doit être au moins 1").required("La quantité est requise"),
  adresse: Yup.string().required("L'adresse est requise"),
  ville: Yup.string().required("La ville est requise"),
  photo: Yup.mixed().nullable(),
  latitude: Yup.number().nullable(),
  longitude: Yup.number().nullable(),
});

// Composant optimisé pour les boutons de suppression
const DeleteButton = React.memo(({ 
  dechet, 
  onDelete, 
  onEdit, 
  isLoading, 
  uploading, 
  deleteStatus,
  deleting,
  onConfirmDelete,
  onCancelDelete
}: {
  dechet: any;
  onDelete: (id: number) => void;
  onEdit: (dechet: any) => void;
  isLoading: boolean;
  uploading: boolean;
  deleteStatus: string;
  deleting: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) => {
  const handleDelete = useCallback(() => {
    onDelete(dechet.id);
  }, [dechet.id, onDelete]);

  const handleEdit = useCallback(() => {
    onEdit(dechet);
  }, [dechet, onEdit]);

  return (
    <div className="flex flex-col gap-2 items-end">
      {/* Desktop : boutons texte */}
      <div className="hidden sm:flex flex-col gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleEdit} 
          disabled={isLoading || uploading || deleteStatus === 'pending'}
        >
          Modifier
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              aria-label="Supprimer"
              disabled={isLoading || uploading || deleteStatus === 'pending'}
            >
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le déchet ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Voulez-vous vraiment supprimer ce déchet ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting} onClick={onCancelDelete}>Annuler</AlertDialogCancel>
              <AlertDialogAction disabled={deleting} onClick={onConfirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
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
          onClick={handleEdit}
          aria-label="Modifier"
          disabled={isLoading || uploading || deleteStatus === 'pending'}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="destructive"
              onClick={handleDelete}
              aria-label="Supprimer"
              disabled={isLoading || uploading || deleteStatus === 'pending'}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le déchet ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Voulez-vous vraiment supprimer ce déchet ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting} onClick={onCancelDelete}>Annuler</AlertDialogCancel>
              <AlertDialogAction disabled={deleting} onClick={onConfirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
                {deleting ? "Suppression…" : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
});

DeleteButton.displayName = 'DeleteButton';

export default function DechetsPage() {
  const role = useUserRole();

  // Hooks partagés (toujours appelés)
  const { position, error: geoError, loading: geoLoading, refresh: refreshGeo } = useGeolocation({ enableHighAccuracy: true, maximumAge: 60000 });
  const { data: missionsData, isLoading: isLoadingMissions, error: errorMissions, refetch: refetchMissions } = useDechetsProximite(position?.coords.latitude, position?.coords.longitude, 5, 'all');
  const missions = missionsData?.dechets || [];
  const signalementsProximite = missionsData?.signalements || [];
  const { mutateAsync: validerCollecte, status: validationStatus } = useValiderCollecte();
  const isValidating = validationStatus === 'pending';
  const [selectedMission, setSelectedMission] = useState<any | null>(null);

  const { data, isLoading: isLoadingList, error: errorList, refetch } = useUserDechets();
  const { mutateAsync, isSuccess, error, reset, status } = useCreateDechet();
  const { mutateAsync: deleteDechet, status: deleteStatus } = useDeleteDechet();
  const { mutateAsync: updateDechet, status: updateStatus } = useUpdateDechet();
  const isLoading = status === "pending";
  const [preview, setPreview] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [editDechet, setEditDechet] = useState<any | null>(null);
  const [selectedStatut, setSelectedStatut] = useState<string>("ALL");
  const [dechetToDelete, setDechetToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Quand la position change, on la met dans le form state
  useEffect(() => {
    if (position) {
      // setForm((f) => ({ ...f, latitude: position.coords.latitude, longitude: position.coords.longitude })); // Remplacé par Formik
    }
  }, [position]);

  // Suppression de la géolocalisation automatique pour respecter les règles de sécurité
  // La géolocalisation ne sera demandée que sur interaction utilisateur

  // Remplacer handleChange par Formik
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value, type } = e.target;
  //   setForm((f) => ({
  //     ...f,
  //     [name]: type === "number" ? Number(value) : value,
  //   }));
  // };

  // Remplacer handleFile par Formik
  // const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0] || null;
  //   setForm((f) => ({ ...f, photo: file }));
  //   if (file) {
  //     setPreview(URL.createObjectURL(file));
  //   } else {
  //     setPreview(null);
  //   }
  // };

  // Remplacer validateStep par validation Yup
  // const validateStep = () => {
  //   const errors: { [k: string]: string } = {};
  //   if (step === 1) {
  //     if (!form.type) errors.type = "Le type est requis.";
  //     if (!form.quantite) errors.quantite = "La quantité est requise.";
  //   }
  //   if (step === 2) {
  //     if (!form.ville) errors.ville = "La ville est requise.";
  //   }
  //   setFormErrors(errors);
  //   return Object.keys(errors).length === 0;
  // };

  // Navigation optimisée avec useCallback
  const handleNext = useCallback(() => {
    setStep((s) => s + 1);
  }, []);
  
  const handleBack = useCallback(() => {
    setStep((s) => s - 1);
  }, []);

  // Remplacer handleFinalSubmit par onSubmit de Formik
  // const handleFinalSubmit = async (values: any) => {
  //   console.log('SUBMIT', values);
  //   setUploadError(null);
  //   setSubmitSuccess(false);
  //   let photoUrl: string | undefined = undefined;
  //   if (values.photo && values.photo instanceof File) {
  //     setUploading(true);
  //     try {
  //       photoUrl = await uploadToCloudinary(values.photo);
  //       console.log('UPLOAD PHOTO OK', photoUrl);
  //     } catch (err: any) {
  //       setUploadError(err.message || "Erreur lors de l'upload de la photo.");
  //       setUploading(false);
  //       console.error('UPLOAD PHOTO ERROR', err);
  //       return;
  //     }
  //     setUploading(false);
  //   } else if (typeof values.photo === "string") {
  //     photoUrl = values.photo;
  //   }
  //   const payload = {
  //     ...values,
  //     photo: photoUrl || undefined,
  //   };
  //   console.log('APPEL API', payload);
  //   try {
  //     if (editDechet) {
  //       const res = await updateDechet({ id: editDechet.id, data: payload });
  //       console.log('API UPDATE REPONSE', res);
  //       toast.success("Déchet modifié avec succès !");
  //     } else {
  //       const res = await mutateAsync(payload);
  //       console.log('API CREATE REPONSE', res);
  //       toast.success("Déchet signalé avec succès !");
  //     }
  //     setSubmitSuccess(true);
  //     setTimeout(() => setShowForm(false), 1200);
  //     setEditDechet(null);
  //   } catch (err) {
  //     setUploadError("Erreur lors de la soumission du déchet.");
  //     toast.error("Erreur lors de la soumission du déchet.");
  //     console.error('API ERROR', err);
  //   }
  //   refetch();
  // };

  // Handler suppression optimisé avec useCallback
  const handleDelete = useCallback(async (id: number) => {
    const dechet = data?.find((d: any) => d.id === id);
    if (dechet) {
      setDechetToDelete(dechet);
    }
  }, [data]);

  const confirmDelete = useCallback(async () => {
    if (!dechetToDelete) return;
    setDeleting(true);
    try {
      await deleteDechet(dechetToDelete.id);
      toast.success("Déchet supprimé avec succès !");
      setDechetToDelete(null);
    } catch (e) {
      toast.error("Erreur lors de la suppression du déchet.");
    } finally {
      setDeleting(false);
    }
  }, [dechetToDelete, deleteDechet]);

  // Handler optimisé pour annuler la suppression
  const handleCancelDelete = useCallback(() => {
    setDechetToDelete(null);
  }, []);

  // Fonction handleEdit optimisée avec useCallback
  const handleEdit = useCallback((dechet: any) => {
    setEditDechet(dechet);
    setShowForm(true);
    setPreview(dechet.photo || null);
    setStep(1);
  }, []);

  // Barre de progression simple
  const steps = [
    "Informations générales",
    "Localisation",
    "Photo",
    "Récapitulatif"
  ];

  // Fonction handleOpenForm optimisée avec useCallback
  const handleOpenForm = useCallback(() => {
    setShowForm(true);
    reset();
    setPreview(null);
    setStep(1); // Reset step to 1 when opening form
  }, [reset]);

  const formIncomplet = !position?.coords.latitude || !position?.coords.longitude;

  // Fonction utilitaire pour grouper par statut optimisée avec useMemo
  const groupByStatut = useCallback((dechets: any[] = []) => {
    return dechets.reduce((acc, dechet) => {
      const statut = dechet.statut || "EN_ATTENTE";
      if (!acc[statut]) acc[statut] = [];
      acc[statut].push(dechet);
      return acc;
    }, {} as Record<string, any[]>);
  }, []);

  const statutLabels: Record<string, string> = {
    EN_ATTENTE: "En attente",
    COLLECTE: "Collecté",
    TRAITE: "Traité",
  };

  const grouped = useMemo(() => groupByStatut(data || []), [groupByStatut, data]);

  // Loader si le rôle n'est pas encore chargé
  if (role === undefined || role === null) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-foreground/60">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        Chargement du profil…
      </div>
    );
  }

  if (role === 'COLLECTOR') {
    const handleValider = async (id: number) => {
      try {
        await validerCollecte(id);
        toast.success('Collecte validée avec succès !', { duration: 3500 });
        refetchMissions();
      } catch (e: any) {
        toast.error("Erreur lors de la validation de la collecte : " + (e?.message || 'Erreur inconnue'));
      }
    };
    return (
      <VueMissionsCollecteur
        geoLoading={geoLoading}
        geoError={geoError}
        position={position}
        refreshGeo={refreshGeo}
        isLoadingMissions={isLoadingMissions}
        errorMissions={errorMissions}
        missions={missions}
        signalements={signalementsProximite}
        isValidating={isValidating}
        handleValider={handleValider}
        setSelectedMission={setSelectedMission}
      />
    );
  }

  // Props pour la vue normale (user/admin)
  return (
    <VueNormaleDechets
      data={data}
      isLoadingList={isLoadingList}
      errorList={errorList}
      refetch={refetch}
      mutateAsync={mutateAsync}
      isSuccess={isSuccess}
      error={error}
      reset={reset}
      status={status}
      deleteDechet={deleteDechet}
      deleteStatus={deleteStatus}
      updateDechet={updateDechet}
      updateStatus={updateStatus}
      isLoading={isLoading}
      preview={preview}
      setPreview={setPreview}
      showForm={showForm}
      setShowForm={setShowForm}
      fileInputRef={fileInputRef}
      step={step}
      setStep={setStep}
      editDechet={editDechet}
      setEditDechet={setEditDechet}
      selectedStatut={selectedStatut}
      setSelectedStatut={setSelectedStatut}
      dechetToDelete={dechetToDelete}
      setDechetToDelete={setDechetToDelete}
      deleting={deleting}
      setDeleting={setDeleting}
      position={position}
      geoError={geoError}
      geoLoading={geoLoading}
      refreshGeo={refreshGeo}
      handleNext={handleNext}
      handleBack={handleBack}
      handleEdit={handleEdit}
      steps={steps}
      handleOpenForm={handleOpenForm}
      formIncomplet={formIncomplet}
      groupByStatut={groupByStatut}
      statutLabels={statutLabels}
      grouped={grouped}
      types={types}
      DechetSchema={DechetSchema}
    />
  );
} 