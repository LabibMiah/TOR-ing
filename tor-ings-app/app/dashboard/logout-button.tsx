"use client";

import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    
    // This will clear any of the session coookies so that once you logout, you cant simply enter the /dashboard in the url to get back to that pages
    await fetch("/api/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session: null }),
    });
    
    router.push("/login");
    router.refresh(); // This will force a refresh to clear any cached data
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "0.5rem 1rem",
        backgroundColor: "#d14ed1",
        color: "white",
        border: "none",
        borderRadius: "0.25rem",
        cursor: "pointer",
      }}
    >
      Logout
    </button>
  );
}