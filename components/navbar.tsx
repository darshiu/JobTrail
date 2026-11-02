"use client";
import Link from "next/link";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import SignOutButton from "./sign-out-btn";
import ThemeToggle from "./theme-toggle";
import { useSession } from "@/lib/auth/auth-client";

export default function Navbar() {
  const { data: session } = useSession();
  return (
    <nav className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:h-20">
        <Link
          href="/"
          className="font-heading flex items-center gap-2 sm:gap-3"
        >
          <img
            src="/hero-images/logo.jpg"
            alt="JobTrail Logo"
            width={548}
            height={501}
            className="h-10 w-auto sm:h-14 lg:h-16"
          />
          <span className="flex flex-col gap-0.5 text-base font-extrabold uppercase leading-[0.9] tracking-wide sm:text-2xl lg:text-3xl">
            <span className="text-[#14598f] dark:text-[#8ccbf0]">Job</span>
            <span className="text-emerald-600 dark:text-emerald-400">Trail</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          <ThemeToggle />
          {session?.user ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="rounded-full text-foreground/80 hover:text-foreground"
                >
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full p-0 transition-shadow hover:ring-2 hover:ring-primary"
                    />
                  }
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                      {session.user.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <SignOutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="hidden min-[400px]:block">
                <Button
                  variant="ghost"
                  className="rounded-full text-foreground/80 hover:text-foreground"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="rounded-full bg-primary px-4 font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:shadow-md">
                  Start for free
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}