"use client";

import { signOut } from "@/lib/auth/auth-client";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export default function SignOutButton() {
  return (
    <DropdownMenuItem
      onClick={async () => {
        const { error } = await signOut();
        if (error) {
          alert("Error signing out");
          return;
        }
        // Full page load instead of router.push: it drops Next's client router
        // cache (which can hold a stale /sign-in -> /dashboard redirect from
        // while you were signed in) and the in-memory session state.
        window.location.assign("/sign-in");
      }}
    >
      Log Out
    </DropdownMenuItem>
  );
}
