import { z } from "zod";
import { resetPasswordSchema } from "@/features/auth/schemas";

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name.").max(100),
});

export const changePasswordSchema = resetPasswordSchema;

export const deleteAccountSchema = z.object({
  confirm: z.literal("DELETE", { message: "Type DELETE to confirm." }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
