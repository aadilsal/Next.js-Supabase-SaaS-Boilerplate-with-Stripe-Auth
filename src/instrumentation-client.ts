import * as Sentry from "@sentry/nextjs";
import { observabilityConfig } from "@/config/observability";
import { sentryOptions } from "@/lib/sentry-options";

// Browser error tracking + navigation timing. Off until NEXT_PUBLIC_SENTRY_DSN is set.
Sentry.init({
  ...sentryOptions(),
  integrations: observabilityConfig.sentry.sessionReplay ? [Sentry.replayIntegration()] : [],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: observabilityConfig.sentry.sessionReplay ? 1 : 0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
