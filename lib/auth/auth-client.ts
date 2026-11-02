import { createAuthClient } from "better-auth/react";

// No baseURL: requests go to the origin the page was loaded from, so it works
// from localhost or a LAN IP without cross-origin (CORS) failures.
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;