"use client";

import Link from "next/link";
import { ClerkProvider, SignedIn, SignedOut, SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

function MaintenancePageContent() {
  const { user } = useUser();
  const activeAccountLabel =
    user?.primaryEmailAddress?.emailAddress || user?.fullName || user?.username || 'the current account';

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 text-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">We&rsquo;re under maintenance</h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            Light Is For Everyone is temporarily unavailable while we perform updates. Please check back soon.
          </p>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">
            Admin and dev users can still sign in to review the site while maintenance mode is active.
          </p>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">Try again</Link>
          </Button>

          <SignedOut>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/sign-in?redirect_url=%2Fadmin">Admin / Dev sign in</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            <p className="text-xs sm:text-sm text-gray-500">
              You are signed in as {activeAccountLabel}. If this is not your admin or dev account, sign out first and then sign in with the correct account.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <SignOutButton>
                <Button variant="outline" className="w-full sm:w-auto">Sign out current account</Button>
              </SignOutButton>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/">Try current account</Link>
              </Button>
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <ClerkProvider>
      <MaintenancePageContent />
    </ClerkProvider>
  );
}
