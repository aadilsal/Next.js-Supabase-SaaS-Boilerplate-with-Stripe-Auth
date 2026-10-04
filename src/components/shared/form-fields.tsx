"use client";

import type { ComponentProps, ReactNode } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type InputProps = Omit<ComponentProps<typeof Input>, "name" | "value" | "defaultValue" | "onChange" | "onBlur">;

/**
 * A labelled text input wired to react-hook-form, with inline errors.
 *
 *   <TextField control={form.control} name="email" label="Email" type="email" />
 */
export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  labelAction,
  ...inputProps
}: InputProps & {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: ReactNode;
  /** Shown to the right of the label, e.g. a "Forgot password?" link. */
  labelAction?: ReactNode;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {labelAction}
          </div>
          <Input
            {...inputProps}
            {...field}
            value={field.value ?? ""}
            id={field.name}
            aria-invalid={fieldState.invalid}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
