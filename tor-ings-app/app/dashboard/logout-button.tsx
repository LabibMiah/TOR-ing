"use client";

import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton({ className }: { className?: string }) {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();

      await fetch("/api/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: null }),
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <button onClick={handleLogout} className={className}>
      Logout
    </button>
  );
}
