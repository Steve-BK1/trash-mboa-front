"use client";

import { User, LogOut, Save, KeyRound } from "lucide-react";
import { useCurrentUser, useLogout, useChangePassword, useUpdateUser } from "@/hooks/use-auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ErrorAlert } from "@/components/ui/error-alert";
import React from "react";
import { toast } from "sonner";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

// Fonction d'upload Cloudinary (identique à celle des déchets)
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

export default function ProfilPage() {
  // TOUS les hooks d'abord
  const { data: user, isLoading, error, refetch } = useCurrentUser();
  const logoutMutation = useLogout();
  const changePasswordMutation = useChangePassword();
  const updateUserMutation = useUpdateUser();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    photoUrl: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  React.useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom || "",
        email: user.email || "",
        telephone: user.telephone || "",
        adresse: user.adresse || "",
        photoUrl: user.photoUrl || "",
        latitude: user.latitude,
        longitude: user.longitude,
      });
      setPhotoPreview(user.photoUrl || null);
    }
  }, [user]);
  if (!mounted) return null;

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((f) => ({ ...f, [name]: value }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(f => ({ ...f, photoUrl: url }));
      setPhotoPreview(url);
      toast.success("Photo téléchargée avec succès !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'upload de la photo.");
    }
    setUploading(false);
  };

  // Placeholder pour la sauvegarde (à brancher sur l'API plus tard)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateUserMutation.mutateAsync({ id: user.id, data: form });
      await refetch();
      toast.success("Profil mis à jour avec succès !");
      setEditMode(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Erreur lors de la mise à jour du profil.");
    }
  };

  // Placeholder pour le changement de mot de passe (à brancher sur l'API plus tard)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        ancienPassword: passwordForm.oldPassword,
        nouveauPassword: passwordForm.newPassword,
      });
      setPasswordSuccess("Mot de passe changé avec succès !");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || err?.message || "Erreur lors du changement de mot de passe.");
    }
  };

  // Déconnexion
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-8">
        <User className="w-8 h-8 text-accent" />
        <h1 className="text-2xl sm:text-3xl font-bold">Mon profil</h1>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={handleLogout} disabled={logoutMutation.isPending}>
            <LogOut className="w-4 h-4 mr-1" /> Déconnexion
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="text-center text-foreground/60 py-8">Chargement…</div>
      ) : error ? (
        <ErrorAlert error={error} />
      ) : user ? (
        <div className="space-y-8">
          {/* Affichage ou édition des infos */}
          <div className="bg-card/80 border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              {editMode ? (
                <div className="relative group">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt={form.nom || form.email}
                      className="w-16 h-16 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    aria-label="Changer la photo"
                  >
                    <span className="text-xs text-white font-semibold">{uploading ? "Upload…" : "Changer"}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                    disabled={uploading}
                  />
                </div>
              ) : (
                user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.nom || user.email}
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )
              )}
              <div className="flex-1 text-lg font-semibold text-accent">Informations personnelles</div>
              <Button variant="outline" size="sm" onClick={() => setEditMode((v) => !v)}>
                {editMode ? "Annuler" : "Modifier"}
              </Button>
            </div>
            {editMode ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Nom</label>
                    <Input name="nom" value={form.nom} onChange={handleChange} required />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">Téléphone</label>
                    <Input name="telephone" value={form.telephone} onChange={handleChange} />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Email</label>
                    <Input name="email" value={form.email} onChange={handleChange} required type="email" />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="adresse" className="text-sm font-medium">Adresse</label>
                    <AddressAutocomplete
                      id="adresse"
                      name="adresse"
                      value={form.adresse}
                      onChange={(val, coords) => {
                        setForm(f => ({
                          ...f,
                          adresse: val,
                          latitude: coords?.lat ?? f.latitude,
                          longitude: coords?.lon ?? f.longitude,
                        }));
                      }}
                      placeholder="Ex : Douala, Akwa"
                      inputClassName="w-full rounded-md border px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
                    />
                  </div>
                </div>
                {/* Champ caché pour la photoUrl, pour la sauvegarde */}
                <input type="hidden" name="photoUrl" value={form.photoUrl} />
                <div className="flex justify-end">
                  <Button type="submit" variant="default" disabled={uploading || updateUserMutation.isPending} aria-disabled={uploading || updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? (
                      <span className="flex items-center"><Save className="w-4 h-4 mr-1 animate-spin" /> Sauvegarde…</span>
                    ) : (
                      <><Save className="w-4 h-4 mr-1" /> Enregistrer</>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-foreground/60">Nom</div>
                  <div className="font-medium">{user.nom}</div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60">Téléphone</div>
                  <div className="font-medium">{user.telephone || <span className="text-foreground/40">Non renseigné</span>}</div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60">Email</div>
                  <div className="font-medium">{user.email}</div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60">Adresse</div>
                  <div className="font-medium">{user.adresse || <span className="text-foreground/40">Non renseignée</span>}</div>
                </div>
                <div>
                  <div className="text-xs text-foreground/60">Rôle</div>
                  <div className="font-medium uppercase">{user.role}</div>
                </div>
              </div>
            )}
          </div>
          {/* Changement de mot de passe */}
          <div className="bg-card/80 border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <KeyRound className="w-5 h-5 text-accent" />
              <div className="flex-1 text-lg font-semibold text-accent">Changer mon mot de passe</div>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div>
                <label htmlFor="oldPassword" className="text-sm font-medium">Mot de passe actuel</label>
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  required
                  autoComplete="current-password"
                  placeholder="Votre mot de passe actuel"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="text-sm font-medium">Nouveau mot de passe</label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  autoComplete="new-password"
                  placeholder="Nouveau mot de passe"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  autoComplete="new-password"
                  placeholder="Confirmez le nouveau mot de passe"
                />
              </div>
              {passwordError && <div className="text-xs text-red-500">{passwordError}</div>}
              {passwordSuccess && <div className="text-xs text-green-600">{passwordSuccess}</div>}
              <div className="flex justify-end">
                <Button type="submit" variant="default">
                  <Save className="w-4 h-4 mr-1" /> Changer le mot de passe
                </Button>
              </div>
            </form>
          </div>
      </div>
      ) : null}
    </div>
  );
} 