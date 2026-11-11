import { createInternalNeonAuth } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

const authUrl =
  import.meta.env.VITE_NEON_AUTH_URL ||
  "https://ep-calm-dust-batn2ylp.neonauth.c-8.eu-central-1.aws.neon.tech/ctrltech/auth";

const neonAuth = createInternalNeonAuth(authUrl, {
  adapter: BetterAuthReactAdapter(),
});

export const authClient = neonAuth.adapter;
export const getAuthToken = () => neonAuth.getJWTToken();
