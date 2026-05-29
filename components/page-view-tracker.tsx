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

    fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        eventType: "page_view",
        sessionId,
        metadata
      })
    }).catch(() => null);
  }, [metadata]);

  return null;
}
