"use client";

import { useTransition } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action-result";

interface UseActionOptions<T, F extends FieldValues> {
  /** Pass your react-hook-form `form` to show server field errors inline. */
  form?: { setError: UseFormSetError<F> };
  /** Toast shown on success. Omit for no toast. */
  successMessage?: string | ((data: T) => string);
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

/**
 * Calls a Server Action with consistent UX: pending state, error toast,
 * inline field errors and an optional success toast.
 *
 *   const { execute, isPending } = useAction(updateTeam, { form, successMessage: "Saved" });
 *   <form onSubmit={form.handleSubmit(execute)}>
 */
export function useAction<I, T, F extends FieldValues = FieldValues>(
  action: (input: I) => Promise<ActionResult<T>>,
  options: UseActionOptions<T, F> = {},
) {
  const [isPending, startTransition] = useTransition();

  function execute(input: I) {
    startTransition(async () => {
      const result = await action(input);
      // An action that called redirect() navigates away and returns nothing.
      if (!result) return;

      if (!result.ok) {
        if (options.form && result.fieldErrors) {
          for (const [name, messages] of Object.entries(result.fieldErrors)) {
            if (messages?.[0]) options.form.setError(name as Path<F>, { message: messages[0] });
          }
        }
        toast.error(result.error);
        options.onError?.(result.error);
        return;
      }

      const message =
        typeof options.successMessage === "function"
          ? options.successMessage(result.data)
          : options.successMessage;
      if (message) toast.success(message);
      options.onSuccess?.(result.data);
    });
  }

  return { execute, isPending };
}
