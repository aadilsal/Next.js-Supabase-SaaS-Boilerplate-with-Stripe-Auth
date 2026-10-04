import { z } from "zod";

export const emailSchema = z.email("Enter a valid email address.").trim();

/** Keep the minimum in sync with supabase/config.toml (minimum_password_length). */
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.");

/** Where to go after signing in. Always passed through safeRedirectPath(). */
const next = z.string().optional();

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
  next,
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name.").max(100),
  email: emailSchema,
  password: passwordSchema,
  next,
});

export const magicLinkSchema = z.object({ email: emailSchema, next });

export const oauthSchema = z.object({ provider: z.enum(["google"]), next });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
