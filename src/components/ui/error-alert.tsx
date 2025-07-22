"use client";

import { motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { ErrorHandler } from "@/lib/error-handler";

interface ErrorAlertProps {
  error: any;
  onClose?: () => void;
  className?: string;
}

export function ErrorAlert({ error, onClose, className = "" }: ErrorAlertProps) {
  if (!error) return null;

  const errorMessage = ErrorHandler.translateError(error);
  const errorType = ErrorHandler.getErrorType(error);
  const errorIcon = ErrorHandler.getErrorIcon(errorType);
  const errorColor = ErrorHandler.getErrorColor(errorType);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-lg border ${errorColor} ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-lg">{errorIcon}</div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{errorMessage}</p>
          
          {/* Informations supplémentaires pour le debug en développement */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer opacity-70 hover:opacity-100">
                Détails techniques
              </summary>
              <div className="mt-2 text-xs opacity-70">
                <p><strong>Statut:</strong> {error?.response?.status}</p>
                <p><strong>Message backend:</strong> {error?.response?.data?.message}</p>
                <p><strong>Type:</strong> {errorType}</p>
              </div>
            </details>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
} 