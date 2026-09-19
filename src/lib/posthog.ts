import posthogClient from "posthog-js";
import { isKbMode } from "../services/runtimeMode";

const apiKey = import.meta.env.VITE_POSTHOG_API_KEY as string | undefined;
const host =
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://us.i.posthog.com";

if (!isKbMode && apiKey) {
  posthogClient.init(apiKey, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
  });
}

export const posthog = {
  capture(event: string, properties?: Record<string, unknown>): void {
    if (!isKbMode) posthogClient.capture(event, properties);
  },
  get_session_id(): string | undefined {
    return isKbMode ? undefined : posthogClient.get_session_id?.();
  },
};

/**
 * Capture a PropSim platform-level event (not a firm tenant event).
 * Always injects { event_group: "platform", platform: "propsim" } so these
 * events are trivially separable from firm funnel events in PostHog dashboards.
 */
export function capturePlatform(event: string, properties?: Record<string, unknown>): void {
  if (isKbMode) return;
  posthogClient.capture(event, {
    event_group: "platform",
    platform: "propsim",
    ...properties,
  });
}
