import { z } from "zod";

export const checkoutSchema = z.object({
  teamSlug: z.string().min(1),
  priceId: z.string().min(1),
});

export const portalSchema = z.object({ teamSlug: z.string().min(1) });
