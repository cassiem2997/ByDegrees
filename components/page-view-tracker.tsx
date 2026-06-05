"use client";

import { useEffect } from "react";

import { getOrCreateSessionId } from "@/lib/session";

export function PageViewTracker({
  metadata = {}
}: {
  metadata?: Record<string, unknown>;
}) {
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    const searchParams = new URLSearchParams(window.location.search);
    const pageMetadata = {
      path: window.location.pathname,
      ref: searchParams.get("ref") ?? undefined,
      geo_redirect: searchParams.get("geo_redirect") === "1" ? true : undefined,
      utm_source: searchParams.get("utm_source") ?? undefined,
      utm_medium: searchParams.get("utm_medium") ?? undefined,
      utm_campaign: searchParams.get("utm_campaign") ?? undefined
    };

    fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        eventType: "page_view",
        sessionId,
        metadata: {
          ...pageMetadata,
          ...metadata
        }
      })
    }).catch(() => null);
  }, [metadata]);

  return null;
}
