"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./signup.module.css"; // Import the CSS module

export default function Signup() {
  const supabase = createClient();
  const router = useRouter();

  const [forename, setForename] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!forename.trim()) {
      alert("Please enter your name");
      return;
    }

    if (password !== verifyPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          forename: forename,  
        }
      },
    });

    if (error) {
      alert(error.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ forename: forename })
        .eq('user_id', data.user.id);

      if (updateError) {
        console.error("Error updating forename:", updateError);
      }
    }

    setIsLoading(false);
    alert("✓ Check your email to confirm your account!");
    
    // Redirect to login after successful signup
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSignup();
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <h1>Create Account</h1>
            <p>School of Healthcare - Sheffield Hallam University</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.signupContainer}>
          <div className={styles.signupCard}>
            <h2>Join TORS Health Equipment</h2>
            <p>Create your account to start booking equipment</p>

            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Your Name</label>
                <input
                  id="name"
                  type="text"
                  className={styles.input}
                  placeholder="Enter your full name"
                  value={forename}
                  onChange={(e) => setForename(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
              </div>

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
                  placeholder="Create a password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="verify">Verify Password</label>
                <input
                  id="verify"
                  type="password"
                  className={styles.input}
                  placeholder="Re-enter your password"
                  value={verifyPassword}
                  onChange={(e) => setVerifyPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
              </div>

              {password && verifyPassword && (
                <div className={`${styles.passwordMatch} ${
                  password === verifyPassword ? styles.matchSuccess : styles.matchError
                }`}>
                  {password === verifyPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </div>
              )}

              <button 
                className={styles.signupBtn}
                onClick={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
              </button>
            </div>

            <div className={styles.links}>
              <Link href="/login">Already have an account? Log In</Link>
              <button 
                onClick={() => window.history.back()}
                className={styles.backBtn}
              >
                ← Back
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