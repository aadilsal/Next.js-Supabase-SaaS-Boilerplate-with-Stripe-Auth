"use client";

import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Confirmation for destructive actions. Pass `confirmText` to make the user
 * type a word (e.g. the team name) before the button unlocks.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  confirmText,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  confirmText?: string;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState("");
  const locked = confirmText !== undefined && typed !== confirmText;

  return (
    <AlertDialog onOpenChange={(open) => !open && setTyped("")}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {confirmText !== undefined && (
          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-sm font-normal">
              Type <span className="font-semibold">{confirmText}</span> to confirm
            </Label>
            <Input
              id="confirm-text"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              autoComplete="off"
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive" : "default"}
            disabled={locked}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
