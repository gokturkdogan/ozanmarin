"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, Trash2, Edit, Plus } from "lucide-react"

interface AdminConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "delete" | "warning" | "info"
  isLoading?: boolean
  icon?: React.ReactNode
}

export function AdminConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Onayla",
  cancelText = "İptal",
  variant = "info",
  isLoading = false,
  icon,
}: AdminConfirmationModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "delete":
        return {
          icon: <Trash2 className="h-6 w-6 text-red-600" />,
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
          titleColor: "text-red-900",
        }
      case "warning":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
          titleColor: "text-yellow-900",
        }
      default:
        return {
          icon: <Edit className="h-6 w-6 text-blue-600" />,
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
          titleColor: "text-blue-900",
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {icon || styles.icon}
            </div>
            <div>
              <AlertDialogTitle className={styles.titleColor}>
                {title}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="mt-3 text-gray-600">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={isLoading}>
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              className={styles.confirmButton}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Preset modals for common admin actions
export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isLoading = false,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
  isLoading?: boolean
}) {
  return (
    <AdminConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`${itemName} Silinsin mi?`}
      description={`Bu ${itemName.toLowerCase()} kalıcı olarak silinecektir. Bu işlem geri alınamaz.`}
      confirmText="Sil"
      variant="delete"
      isLoading={isLoading}
    />
  )
}

export function WarningConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  isLoading?: boolean
}) {
  return (
    <AdminConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText="Devam Et"
      variant="warning"
      isLoading={isLoading}
    />
  )
}
