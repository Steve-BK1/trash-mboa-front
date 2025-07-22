"use client";
import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-2 py-8 sm:px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:underline mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>
        <div className="p-4 sm:p-8 bg-card rounded-2xl shadow-md">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
} 