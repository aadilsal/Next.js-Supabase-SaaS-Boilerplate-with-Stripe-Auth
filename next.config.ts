import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

/**
 * Sentry build integration. Source maps are uploaded only when
 * SENTRY_AUTH_TOKEN, SENTRY_ORG and SENTRY_PROJECT are set (see .env.example).
 * Runtime error tracking is controlled separately by NEXT_PUBLIC_SENTRY_DSN.
 */
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  widenClientFileUpload: true,
  silent: !process.env.CI,
  telemetry: false,
});
