"use client";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import GoogleAuthProvider from "./google-auth.provider";
import QueryProvider from "./query.provider";
import ThemeProvider from "./theme.provider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <GoogleAuthProvider>
        <QueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryProvider>
      </GoogleAuthProvider>
    </ThemeProvider>
  );
}
