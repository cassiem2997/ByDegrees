import { neon } from "@neondatabase/serverless";
import { cache } from "react";

import { assertServerEnv } from "@/lib/config";

export const getSql = cache(() => {
  const { DATABASE_URL } = assertServerEnv();
  return neon(DATABASE_URL);
});
