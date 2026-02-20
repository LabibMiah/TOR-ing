"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import Link from "next/link";

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
      
      window.location.href = "/dashboard";
      
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        width: "400px",
        backgroundColor: "#F4CDD4",
        padding: "3rem 2rem",
        borderRadius: "12px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "1.2rem"
      }}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "1rem"
        }}>
          <h1 style={{
            fontSize: "2rem",
            color: "#672146",
            margin: "0 0 0.5rem 0",
            fontWeight: "bold"
          }}>
            Welcome Back
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "#666",
            margin: 0
          }}>
            Please sign in to your account
          </p>
        </div>

        {/* Email Input */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem"
        }}>
          <label style={{
            fontSize: "1rem",
            fontWeight: "bold",
            color: "#333"
          }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              padding: "1rem",
              fontSize: "1.1rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              outline: "none",
              transition: "border-color 0.2s",
              ...(isLoading ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {})
            }}
            disabled={isLoading}
          />
        </div>

        {/* Password Input */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem"
        }}>
          <label style={{
            fontSize: "1rem",
            fontWeight: "bold",
            color: "#333"
          }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              padding: "1rem",
              fontSize: "1.1rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              outline: "none",
              transition: "border-color 0.2s",
              ...(isLoading ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {})
            }}
            disabled={isLoading}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            padding: "1rem",
            fontSize: "1.2rem",
            fontWeight: "bold",
            backgroundColor: isLoading ? "#672146" : "#E31C79",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isLoading ? "not-allowed" : "pointer",
            marginTop: "0.5rem",
            transition: "background-color 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          {isLoading ? "LOGGING IN..." : "LOG IN"}
        </button>

        {/* Back Button */}
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: "0.8rem",
            fontSize: "1rem",
            backgroundColor: "#672146",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
        >
          ← Back
        </button>

        {/* Sign Up Link */}
        <div style={{
          textAlign: "center",
          marginTop: "0.5rem"
        }}>
          <Link 
            href="/signup" 
            style={{
              fontSize: "1rem",
              color: "#E31C79",
              textDecoration: "none",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Don't have an account? Sign Up
          </Link>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          marginTop: "1rem",
          fontSize: "0.9rem",
          color: "#666"
        }}>
          <p>School of Healthcare - Sheffield Hallam University</p>
        </div>
      </div>
    </div>
  );
}