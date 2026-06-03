"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Mail, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_LOCALE, getCopy, Locale } from "@/lib/i18n/copy";

export function MaintenanceNotificationForm({
  locale = DEFAULT_LOCALE
}: {
  locale?: Locale;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const t = getCopy(locale);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/maintenance/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setError(
          locale === "ko"
            ? data.error ?? t.maintenanceNotification.requestFailed
            : t.maintenanceNotification.requestFailed
        );
        return;
      }

      setMessage(t.maintenanceNotification.success);
      setEmail("");
    } catch {
      setError(t.maintenanceNotification.networkFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        className="mt-6 h-12 w-full rounded-full bg-[#1a1a1a] text-[14px] font-extrabold text-white shadow-none hover:translate-y-0 hover:bg-[#1a1a1a]"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Mail className="mr-2 h-4 w-4" />
        {t.maintenanceNotification.button}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1c1b1b]/24 px-8"
          onClick={() => setOpen(false)}
        >
          <section
            className="w-full max-w-[330px] rounded-[24px] border border-[#e1dbd8] bg-[#fcf8f7] px-6 py-6 text-left shadow-[0_24px_60px_rgba(28,27,27,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-extrabold tracking-[-0.05em] text-[#1c1b1b]">
                  {t.maintenanceNotification.title}
                </h2>
                <p className="mt-2 text-[13px] font-semibold leading-[1.45] tracking-[-0.03em] text-[#5f5e5e]">
                  {t.maintenanceNotification.description}
                </p>
              </div>
              <button
                aria-label={t.common.close}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#77716e]"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
              <Input
                autoComplete="email"
                className="h-12 rounded-2xl border-[#ded7d4] bg-white/72 px-4 text-[14px]"
                inputMode="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.maintenanceNotification.emailPlaceholder}
                type="email"
                value={email}
              />
              <Button
                className="h-12 w-full rounded-full bg-[#1a1a1a] text-[14px] font-bold text-white shadow-none hover:translate-y-0 hover:bg-[#1a1a1a]"
                disabled={loading}
                type="submit"
              >
                {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t.maintenanceNotification.submit}
              </Button>
            </form>

            {message ? (
              <p className="mt-3 text-center text-[13px] font-semibold text-[#2f7b57]">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="mt-3 text-center text-[13px] font-semibold text-[#ba1a1a]">
                {error}
              </p>
            ) : null}

            <p className="mt-4 text-[11px] leading-[1.5] text-[#8b8581]">
              {t.maintenanceNotification.privacy}
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}
