import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { initializeUserBoard } from "../init-user-board";


const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();
export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.BETTER_AUTH_URL,
  ].filter((origin): origin is string => Boolean(origin)),
  database: mongodbAdapter(db, {
    client,
  }),
  session: {
    // Sliding timeout: a session expires after 1 hour without being refreshed,
    // and is pushed back another hour whenever it is used after `updateAge`.
    expiresIn: 60 * 60,
    updateAge: 5 * 60,
    cookieCache: {
      enabled: true,
      // Keep this short: a cached session skips the database, so an expired or
      // revoked session would otherwise still look valid until the cache ends.
      maxAge: 5 * 60,
    },
  },
  emailAndPassword: { 
    enabled: true, 
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.id) {
            await initializeUserBoard(user.id);
          }
        },
      },
    },
  },
});

export async function getSession() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  return result;

}

export async function signOut() {
  const result = await auth.api.signOut({
    headers: await headers(),
  });

  if (result.success) {
    redirect("/sign-in");
  }
}
