"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import Link from "next/link";
import styles from "./login.module.css"; // Import the CSS module

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
      });// this awaits for the password and email to be checked against the database and then returns a session if successful or an error if not

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
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <h1>Welcome Back</h1>
            <p>School of Healthcare - Sheffield Hallam University</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <h2>Sign In</h2>
            <p>Please enter your credentials to access your account</p>

            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
              </div>

              <button 
                className={styles.loginBtn}
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </div>

            <div className={styles.links}>
              <Link href="/signup">Don't have an account? Sign up</Link>
              <button 
                onClick={() => window.location.href = '/'}
                className={styles.backBtn}
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2026 TORS Health Equipment Ordering System. Sheffield Hallam University.</p>
          <nav className={styles.footerNav}>
            <Link href="/">Home</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/about">About</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}