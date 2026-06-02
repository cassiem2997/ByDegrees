import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SPOTIFY_CLIENT_ID: z.string().min(1, "SPOTIFY_CLIENT_ID is required"),
  SPOTIFY_CLIENT_SECRET: z.string().min(1, "SPOTIFY_CLIENT_SECRET is required"),
  ADMIN_PASSCODE: z.string().min(1, "ADMIN_PASSCODE is required"),
  ADMIN_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_SITE_NAME: z.string().default("By Degrees"),
  NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY: z.string().optional(),
  DISCORD_ALERT_WEBHOOK_URL: z.string().url().optional(),
  ALERT_COOLDOWN_SECONDS: z.coerce.number().int().positive().optional()
});

const parsed = envSchema.safeParse(process.env);

export const env = parsed.success
  ? parsed.data
  : ({
      NEXT_PUBLIC_SITE_NAME: "By Degrees"
    } as z.infer<typeof envSchema>);

export function assertServerEnv() {
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((issue) => issue.message).join(", ")
    );
  }

  return parsed.data;
}
