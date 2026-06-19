"use client";

import { useEffect } from "react";

import { getOrCreateSessionId } from "@/lib/session";

const PAGE_VIEW_EVENT_PREFIX = "bydegrees:page-view";
const ATTRIBUTION_PARAMS = ["ref", "geo_redirect", "utm_source", "utm_medium", "utm_campaign"];

export function PageViewTracker({
  metadata = {}
}: {
  metadata?: Record<string, unknown>;
}) {
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    const searchParams = new URLSearchParams(window.location.search);
    const attributionKey = ATTRIBUTION_PARAMS.map((key) => `${key}:${searchParams.get(key) ?? ""}`).join("|");
    const eventKey = `${PAGE_VIEW_EVENT_PREFIX}:${window.location.pathname}:${attributionKey}`;

    try {
      if (window.sessionStorage.getItem(eventKey)) {
        return;
      }
      window.sessionStorage.setItem(eventKey, "1");
    } catch {
      // Ignore storage failures and still send the event.
    }

    const pageMetadata = {
      path: window.location.pathname,
      ref: searchParams.get("ref") ?? undefined,
      geo_redirect: searchParams.get("geo_redirect") === "1" ? true : undefined,
      utm_source: searchParams.get("utm_source") ?? undefined,
      utm_medium: searchParams.get("utm_medium") ?? undefined,
      utm_campaign: searchParams.get("utm_campaign") ?? undefined
    };
    const body = JSON.stringify({
      eventType: "page_view",
      sessionId,
      metadata: {
        ...pageMetadata,
        ...metadata
      }
    });

    if (navigator.sendBeacon) {
      const queued = navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));

      if (queued) {
        return;
      }
    }

    fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body,
      keepalive: true
    }).catch(() => null);
  }, [metadata]);

  return null;
}
