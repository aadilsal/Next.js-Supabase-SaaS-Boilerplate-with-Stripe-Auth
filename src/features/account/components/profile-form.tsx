"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/shared/form-fields";
import { SubmitButton } from "@/components/shared/submit-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAction } from "@/hooks/use-action";
import { updateProfile } from "../actions";
import { updateProfileSchema, type UpdateProfileInput } from "../schemas";

export function ProfileForm({ fullName, email }: { fullName: string; email: string }) {
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName },
  });
  const { execute, isPending } = useAction(updateProfile, { form, successMessage: "Profile updated" });

  return (
    <Card>
      <form onSubmit={form.handleSubmit(execute)} noValidate>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear to your teammates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 py-6">
          <TextField control={form.control} name="fullName" label="Name" autoComplete="name" />
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" value={email} readOnly disabled />
            <FieldDescription>Contact support to change your email address.</FieldDescription>
          </Field>
        </CardContent>
        <CardFooter className="justify-end">
          <SubmitButton pending={isPending}>Save changes</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
