"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-store-v2";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Pencil, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AxiosError } from "axios";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose, DrawerDescription } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { useRef } from "react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

export default function UsersAdminPage() {
  const { user, isLoading } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  // Schéma de validation Yup
  const UserSchema = Yup.object().shape({
    nom: Yup.string().required("Le nom est requis"),
    email: Yup.string().email("Email invalide").required("L'email est requis"),
    password: Yup.string().min(6, "Au moins 6 caractères").when("isEdit", {
      is: false,
      then: (schema) => schema.required("Le mot de passe est requis"),
      otherwise: (schema) => schema.notRequired(),
    }),
    telephone: Yup.string().required("Le téléphone est requis"),
    adresse: Yup.string().required("L'adresse est requise"),
    role: Yup.string().oneOf(["USER", "COLLECTOR", "ADMIN"]).required("Le rôle est requis"),
    photoUrl: Yup.string().url("URL invalide").nullable(),
  });
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // SUPPRIMER la fonction handlePhotoChange qui utilise setFieldValue
  // const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   setUploading(true);
  //   try {
  //     const url = await uploadToCloudinary(file);
  //     setFieldValue("photoUrl", url);
  //     setPhotoPreview(url);
  //     toast.success("Photo téléchargée avec succès !");
  //   } catch (err: any) {
  //     toast.error(err.message || "Erreur lors de l'upload de la photo.");
  //   }
  //   setUploading(false);
  // };

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
    if (!res.ok) throw new Error(data.error?.message || "Erreur upload Cloudinary");
    return data.secure_url;
  }

  // SUPPRIMER la fonction onSubmit qui utilise resetForm
  // const onSubmit = async (values: any) => {
  //   try {
  //     let payload: any = {
  //       nom: values.nom,
  //       email: values.email,
  //       telephone: values.telephone,
  //       adresse: values.adresse,
  //       role: values.role,
  //       photoUrl: values.photoUrl || "",
  //     };
  //     if (!userToEdit && values.password) {
  //       payload.password = values.password;
  //     }
  //     if (userToEdit) {
  //       console.log("[DEBUG] Payload update user:", payload);
  //       await apiClient.put(`/api/users/${userToEdit.id}`, payload);
  //       toast.success("Utilisateur modifié avec succès !");
  //     } else {
  //       await apiClient.post("/api/users", payload);
  //       toast.success("Utilisateur créé avec succès !");
  //     }
  //     setDrawerOpen(false);
  //     resetForm();
  //     setUserToEdit(null);
  //     setPhotoPreview("");
  //     if (typeof window !== 'undefined') window.setTimeout(() => window.location.reload(), 500);
  //   } catch (err: any) {
  //     toast.error(err?.response?.data?.message || err?.message || "Erreur lors de l'opération.");
  //   }
  // };

  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/users/${userToDelete.id}`);
      toast.success("Utilisateur supprimé avec succès !");
      setUserToDelete(null);
      // Refetch la liste
      await refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAdmin, router]);

  const { data: users, isLoading: usersLoading, error, refetch } = useQuery({
    queryKey: ["users-admin-list"],
    queryFn: () => apiClient.get("/api/users").then(res => res.data),
  });

  // Génère un id unique pour ce formulaire à chaque ouverture
  const formIdRef = useRef<string | null>(null);
  if (!formIdRef.current) {
    formIdRef.current = Math.random().toString(36).slice(2, 10);
  }
  const id = formIdRef.current;

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96 text-foreground/60">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Initialisation…
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-foreground/60">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Vérification des droits…
      </div>
    );
  }
  if (!isAdmin) {
    return null;
  }

  const openEditDrawer = (user: any) => {
    setUserToEdit(user);
    setDrawerOpen(true);
    setPhotoPreview(user.photoUrl || "");
  };
  const openCreateDrawer = () => {
    setUserToEdit(null);
    setDrawerOpen(true);
    setPhotoPreview("");
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Gestion des utilisateurs</h1>
      <div className="mb-4 flex justify-end">
        <Button ref={createButtonRef} onClick={openCreateDrawer}>
          + Créer un utilisateur
        </Button>
        <Drawer
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
            if (!open) {
              setUserToEdit(null);
              setPhotoPreview("");
            }
          }}
          direction="right"
        >
          <DrawerContent className="max-w-md w-full" aria-describedby={undefined}>
            <DrawerHeader>
              <DrawerTitle>{userToEdit ? "Modifier l'utilisateur" : "Créer un utilisateur"}</DrawerTitle>
              <DrawerDescription>
                {userToEdit ? "Modifiez les informations de l'utilisateur." : "Créez un nouvel utilisateur."}
              </DrawerDescription>
            </DrawerHeader>
            <Formik
              initialValues={{
                nom: userToEdit?.nom || "",
                email: userToEdit?.email || "",
                password: "",
                telephone: userToEdit?.telephone || "",
                adresse: userToEdit?.adresse || "",
                role: userToEdit?.role || "USER",
                photoUrl: userToEdit?.photoUrl || "",
                isEdit: !!userToEdit,
              }}
              validationSchema={UserSchema}
              enableReinitialize
              onSubmit={async (values, { setSubmitting, resetForm, setFieldError }) => {
                try {
                  let payload: any = {
                    nom: values.nom,
                    email: values.email,
                    telephone: values.telephone,
                    adresse: values.adresse,
                    role: values.role,
                    photoUrl: values.photoUrl || "",
                  };
                  if (!userToEdit && values.password) {
                    payload.password = values.password;
                  }
                  if (userToEdit) {
                    console.log('[DEBUG] Payload update user:', payload);
                    await apiClient.put(`/api/users/${userToEdit.id}`, payload);
                    toast.success("Utilisateur modifié avec succès !");
                    await refetch();
                  } else {
                    console.log('[DEBUG] Payload create user:', payload);
                    await apiClient.post("/api/users", payload);
                    toast.success("Utilisateur créé avec succès !");
                    await refetch();
                  }
                  setDrawerOpen(false);
                  resetForm();
                  setUserToEdit(null);
                  setPhotoPreview("");
                } catch (err) {
                  const errorMsg = (err as any)?.response?.data?.message || (err as any)?.message || "Erreur lors de l'opération.";
                  setFieldError("email", errorMsg);
                  toast.error(errorMsg);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
                <Form className="space-y-4 px-4 pb-4">
                  {/* Nom */}
                  <div className="space-y-2">
                    <label htmlFor={`nom-${id}`} className="text-sm font-medium">Nom</label>
                    <Input
                      id={`nom-${id}`}
                      name="nom"
                      autoComplete="name"
                      required
                      value={values.nom}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.nom && touched.nom ? "border-red-500" : ""}
                    />
                    {errors.nom && touched.nom && typeof errors.nom === "string" && <div className="text-sm text-red-500">{errors.nom}</div>}
                  </div>
                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor={`email-${id}`} className="text-sm font-medium">Email</label>
                    <Input
                      id={`email-${id}`}
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={!!userToEdit}
                      className={errors.email && touched.email ? "border-red-500" : ""}
                    />
                    {errors.email && touched.email && typeof errors.email === "string" && <div className="text-sm text-red-500">{errors.email}</div>}
                  </div>
                  {/* Mot de passe (création uniquement) */}
                  {!userToEdit && (
                    <div className="space-y-2">
                      <label htmlFor={`password-${id}`} className="text-sm font-medium">Mot de passe</label>
                      <Input
                        id={`password-${id}`}
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        minLength={6}
                        className={errors.password && touched.password ? "border-red-500" : ""}
                      />
                      {errors.password && touched.password && typeof errors.password === "string" && <div className="text-sm text-red-500">{errors.password}</div>}
                    </div>
                  )}
                  {/* Téléphone */}
                  <div className="space-y-2">
                    <label htmlFor={`telephone-${id}`} className="text-sm font-medium">Téléphone</label>
                    <Input
                      id={`telephone-${id}`}
                      name="telephone"
                      autoComplete="tel"
                      required
                      value={values.telephone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.telephone && touched.telephone ? "border-red-500" : ""}
                    />
                    {errors.telephone && touched.telephone && typeof errors.telephone === "string" && <div className="text-sm text-red-500">{errors.telephone}</div>}
                  </div>
                  {/* Adresse (auto-complétion) */}
                  <div className="space-y-2">
                    <label htmlFor={`adresse-${id}`} className="text-sm font-medium">Adresse</label>
                    <AddressAutocomplete
                      id={`adresse-${id}`}
                      name="adresse"
                      value={values.adresse}
                      onChange={(val) => setFieldValue("adresse", val)}
                      placeholder="Ex : Douala, Akwa"
                      inputClassName={errors.adresse && touched.adresse ? "border-red-500" : ""}
                    />
                    {errors.adresse && touched.adresse && typeof errors.adresse === "string" && <div className="text-sm text-red-500">{errors.adresse}</div>}
                  </div>
                  {/* Rôle */}
                  <div className="space-y-2">
                    <label htmlFor={`role-${id}`} className="text-sm font-medium">Rôle</label>
                    <Select
                      value={values.role}
                      onValueChange={val => setFieldValue("role", val)}
                      name="role"
                    >
                      <SelectTrigger className={`w-full ${errors.role && touched.role ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Choisir un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Utilisateur</SelectItem>
                        <SelectItem value="COLLECTOR">Collecteur</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && touched.role && typeof errors.role === "string" && <div className="text-sm text-red-500">{errors.role}</div>}
                  </div>
                  {/* Photo (upload) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Photo</label>
                    <div className="flex items-center gap-4">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Aperçu" className="w-12 h-12 rounded-full object-cover border" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploading(true);
                          try {
                            const url = await uploadToCloudinary(file);
                            setFieldValue("photoUrl", url);
                            setPhotoPreview(url);
                            toast.success("Photo téléchargée avec succès !");
                          } catch (err) {
                            toast.error("Erreur lors de l'upload de la photo.");
                          }
                          setUploading(false);
                        }}
                        disabled={uploading}
                      />
                    </div>
                    {errors.photoUrl && touched.photoUrl && typeof errors.photoUrl === "string" && <div className="text-sm text-red-500">{errors.photoUrl}</div>}
                  </div>
                  <DrawerFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {userToEdit ? "Enregistrer" : "Créer"}
                    </Button>
                    <DrawerClose asChild>
                      <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
                        Annuler
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </Form>
              )}
            </Formik>
          </DrawerContent>
        </Drawer>
      </div>
      {usersLoading ? (
        <div className="flex items-center justify-center h-40 text-foreground/60">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Chargement…
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 text-red-500 py-8">
          <div>
            {(() => {
              const err = error as AxiosError;
              if (err?.response?.status === 403) {
                return <>Accès refusé : vous n'avez pas les droits administrateur.</>;
              } else if (err?.response?.status === 401) {
                return <>Session expirée ou non authentifié. Veuillez vous reconnecter.</>;
              } else {
                return <>Erreur lors du chargement des utilisateurs.</>;
              }
            })()}
          </div>
          <Button onClick={() => window.location.href = '/login'}>Se reconnecter</Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-xl bg-card">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Photo</th>
                <th className="px-4 py-2 text-left">Nom</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Rôle</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 ? (
                users.map((u: any) => {
                  const isMe = String(u.id) === String(user?.id);
                  return (
                    <tr key={u.id} className={`border-b last:border-b-0 ${isMe ? 'bg-accent/10' : ''}`}>
                      <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{u.id}</td>
                      <td className="px-4 py-2">
                        {u.photoUrl ? (
                          <img src={u.photoUrl} alt={u.nom || u.email} className="w-9 h-9 rounded-full object-cover border" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border">
                            <UserIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 flex items-center gap-2">
                        <span>{u.nom}</span>
                        {isMe && <Badge variant="default">Moi</Badge>}
                      </td>
                      <td className="px-4 py-2">{u.email}</td>
                      <td className="px-4 py-2 font-mono text-xs">{u.role}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Button size="icon" variant="ghost" title="Modifier" onClick={() => openEditDrawer(u)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    title="Supprimer"
                                    onClick={() => setUserToDelete(u)}
                                    disabled={isMe || u.role === "ADMIN"}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action est irréversible. Voulez-vous vraiment supprimer <span className="font-semibold">{userToDelete?.nom || userToDelete?.email}</span> ?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel disabled={deleting} onClick={() => setUserToDelete(null)}>Annuler</AlertDialogCancel>
                                    <AlertDialogAction disabled={deleting} onClick={handleDeleteUser} className="bg-destructive text-white hover:bg-destructive/90">
                                      {deleting ? "Suppression…" : "Supprimer"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isMe
                              ? "Vous ne pouvez pas supprimer votre propre compte."
                              : u.role === "ADMIN"
                                ? "Impossible de supprimer un autre administrateur."
                                : "Supprimer l'utilisateur"}
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-foreground/60 py-8">Aucun utilisateur trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 