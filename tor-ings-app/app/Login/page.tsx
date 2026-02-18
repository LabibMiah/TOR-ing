"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      console.log("1. Attempting login with:", email);
      console.log("2. Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      // This will confirm if the client is properly initialized and is loading the correct enviroment vairbales
      console.log("3. Supabase client:", supabase ? "initialized" : "null");
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        console.error("4. Login error details:", {
          message: error.message,
          status: error.status,
          name: error.name
        });
        alert(`Login failed: ${error.message}`);
        return;
      }

      console.log("5. Login successful, session:", {
        exists: !!data.session,
        user: data.user?.email,
        accessToken: data.session?.access_token ? "present" : "missing"
      });

      if (!data.session) {
        alert("No session returned");
        return;
      }

      console.log("6. Sending session to API route");
      
      const res = await fetch("/api/set-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: data.session }),
      });

      console.log("7. API response status:", res.status);
      
      const json = await res.json();
      console.log("8. API response data:", json);
      
      if (!res.ok || !json.success) {
        alert("Failed to set cookies: " + (json.error || "Unknown"));
        return;
      }

      console.log("9. Cookies set successfully, redirecting...");
      
  
      await new Promise((r) => setTimeout(r, 100));
      
      // Use window.location for a full page reload to ensure middleware picks up the session
      window.location.href = "/dashboard";
      
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "300px", margin: "2rem auto" }}>
      <div style={{ fontSize: "0.8rem", color: "green" }}>Page has loaded</div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "0.5rem", fontSize: "1rem" }}
        disabled={isLoading}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "0.5rem", fontSize: "1rem" }}
        disabled={isLoading}
      />
      <button 
        onClick={handleLogin} 
        style={{ 
          padding: "0.5rem", 
          fontSize: "1rem",
          backgroundColor: isLoading ? "#ccc" : "#ea08ff",
          color: "white",
          border: "none",
          cursor: isLoading ? "not-allowed" : "pointer"
        }}
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Log In"}
      </button>
    </div>
  );
}