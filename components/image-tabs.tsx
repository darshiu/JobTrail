"use client";

import Image from "next/image";
import { useState } from "react";

const TABS = [
  {
    id: "organize",
    label: "Organize Applications",
    src: "/hero-images/hero1.png",
  },
  { id: "hired", label: "Get Hired", src: "/hero-images/hero2.png" },
  { id: "boards", label: "Manage Boards", src: "/hero-images/hero3.png" },
] as const;

export default function ImageTabs() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>(
    "organize",
  );
  const active = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  return (
    <section className="pb-16 sm:pb-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Segmented tabs */}
          <div
            role="tablist"
            className="mx-auto mb-10 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-card p-1 shadow-sm"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Framed screenshot */}
          <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-card p-2 shadow-2xl shadow-foreground/10">
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <div className="flex items-center gap-1.5 border-b border-border bg-muted px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
              </div>
              <Image
                key={active.id}
                src={active.src}
                alt={active.label}
                width={1200}
                height={800}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
