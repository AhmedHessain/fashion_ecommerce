"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientRedirect({ callbackUrl }) {
  const router = useRouter();

  useEffect(() => {
    // Set the error flag in localStorage
    localStorage.setItem("error", "true");

    // Redirect to the callback URL without adding to the history stack
    router.replace(callbackUrl);
  }, [callbackUrl, router]);

  return null;
}
