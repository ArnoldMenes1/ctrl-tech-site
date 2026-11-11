import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

const authUrl =
  import.meta.env.VITE_NEON_AUTH_URL ||
  "https://ep-calm-dust-batn2ylp.neonauth.c-8.eu-central-1.aws.neon.tech/ctrltech/auth";

export const authClient = createAuthClient(authUrl, {
  adapter: BetterAuthReactAdapter(),
});
