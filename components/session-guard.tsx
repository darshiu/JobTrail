"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { authClient, useSession } from "@/lib/auth/auth-client";

// Must match `session.expiresIn` in lib/auth/auth.ts.
const IDLE_LIMIT_MS = 60 * 60 * 1000;
// While the user is active, tell the server now and then so it extends the
// session (it only refreshes sessions older than `updateAge`, 5 minutes).
const PING_EVERY_MS = 5 * 60 * 1000;
const CHECK_EVERY_MS = 30 * 1000;
const PROTECTED_PATHS = ["/dashboard"];
const ACTIVITY_EVENTS = [
  "pointerdown",
  "pointermove",
  "keydown",
  "scroll",
  "touchstart",
] as const;

export default function SessionGuard() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const isSignedIn = Boolean(session?.user);
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const lastActivity = useRef(0);
  const lastPing = useRef(0);

  // The session is gone (expired, or signed out in another tab): leave the page.
  useEffect(() => {
    if (isProtected && !isPending && !isSignedIn) {
      window.location.assign("/sign-in");
    }
  }, [isProtected, isPending, isSignedIn]);

  // Idle timeout, plus keep-alive pings while the user is active.
  useEffect(() => {
    if (!isSignedIn) return;

    lastActivity.current = Date.now();
    lastPing.current = Date.now();

    function onActivity() {
      const now = Date.now();
      lastActivity.current = now;
      if (now - lastPing.current >= PING_EVERY_MS) {
        lastPing.current = now;
        // Skip the cookie cache so the request reaches the database and the
        // server can extend the session.
        authClient.getSession({ query: { disableCookieCache: true } });
      }
    }

    const timer = setInterval(async () => {
      if (Date.now() - lastActivity.current < IDLE_LIMIT_MS) return;
      clearInterval(timer);
      await authClient.signOut();
      window.location.assign(isProtected ? "/sign-in" : "/");
    }, CHECK_EVERY_MS);

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true }),
    );

    return () => {
      clearInterval(timer);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, onActivity),
      );
    };
  }, [isSignedIn, isProtected]);

  return null;
}
