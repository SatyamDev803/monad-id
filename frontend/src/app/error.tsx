"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm text-destructive">Error</p>
      <h1 className="mt-2 text-4xl font-bold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset} className="mt-8 rounded-full px-8">
        Try Again
      </Button>
    </div>
  );
}
