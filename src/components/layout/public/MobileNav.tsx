"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeaderAuthActions from "./HeaderAuthActions";
import HeaderNav from "./HeaderNav";

/** Mobile drawer for the public header; closes itself on every route change. */
export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls="public-mobile-nav"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        className="size-9"
        onClick={() => setOpen((previous) => !previous)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open ? (
        <div
          id="public-mobile-nav"
          className="absolute inset-x-0 top-16 z-40 animate-in slide-in-from-top-2 border-b border-border bg-background px-4 pb-6 pt-2 shadow-lg md:hidden"
        >
          <HeaderNav variant="vertical" onNavigate={() => setOpen(false)} />
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <HeaderAuthActions stacked />
          </div>
        </div>
      ) : null}
    </>
  );
}