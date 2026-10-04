/**
 * The shape every Server Action returns. Safe to import in Client Components.
 *
 *   const result = await someAction(values);
 *   if (!result.ok) toast.error(result.error);
 */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: string;
      /** Per-field validation messages, keyed by form field name. */
      fieldErrors?: Record<string, string[] | undefined>;
    };
