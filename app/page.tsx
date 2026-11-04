"use client";

import ImageTabs from "@/components/image-tabs";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/auth-client";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const HIGHLIGHTS = ["Free forever", "No credit card", "Set up in a minute"];

export default function Home() {
  const { data: session, isPending } = useSession();
  return (
    <div className="flex min-h-[calc(100dvh-var(--nav-h))] flex-col bg-background">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-128 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent)]"
          />
          <div className="container mx-auto px-4 pb-16 pt-20 sm:pb-24 sm:pt-32 lg:pt-40">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-brand">
                Your job search, organized
              </span>
              <h1 className="mb-6 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                A better way to track your{" "}
                <span className="text-brand">job applications.</span>
              </h1>
              <p className="mx-auto mb-10 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Capture, organize, and manage your job search in one place — from
                wish list to offer.
              </p>
              {!isPending && !session?.user ? (<div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-full px-8 text-base font-medium shadow-lg sm:w-auto shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:shadow-xl hover:shadow-primary/40"
                  >
                    Start for free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full rounded-full px-8 text-base font-medium transition-all sm:w-auto duration-200 hover:-translate-y-0.5"
                  >
                    Log in
                  </Button>
                </Link>
              </div>) : null }
              {!isPending && !session?.user ? (<ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>) : null }
            </div>
          </div>
        </section>

        {/* Hero Images Section with Tabs */}
        <ImageTabs />
      </main>
    </div>
  );
}
