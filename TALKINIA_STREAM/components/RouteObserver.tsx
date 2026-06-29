"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RouteObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.parent !== window) {
      // Send the current route path to the parent window (PILOT)
      window.parent.postMessage({ type: "talkinia_route", path: pathname }, "*");
    }
  }, [pathname]);

  return null;
}
