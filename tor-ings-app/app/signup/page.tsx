"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./signup.module.css";

const accountTypes = [
  { name: "Students", display: "Student", tier: "Tier 1" },
  { name: "Advanced Practice", display: "Advanced Practice", tier: "Tier 1" },
  { name: "AHP - Diagnostic Radiograthy", display: "Diagnostic Radiography", tier: "Tier 1" },
  { name: "AHP - Occupational Therapy", display: "Occupational Therapy", tier: "Tier 1" },
  { name: "AHP - Operating Department Practioner", display: "Operating Department Practitioner", tier: "Tier 1" },
  { name: "AHP - Paramedics", display: "Paramedics", tier: "Tier 1" },
  { name: "AHP - Physiotherapy", display: "Physiotherapy", tier: "Tier 1" },
  { name: "AHP - Radiotherapy and Oncology", display: "Radiotherapy and Oncology", tier: "Tier 1" },
  { name: "Art Therapy", display: "Art Therapy", tier: "Tier 1" },
  { name: "Independant Pharmacy Perscribing", display: "Independent Pharmacy Prescribing", tier: "Tier 1" },
  { name: "Midwifery", display: "Midwifery", tier: "Tier 1" },
  { name: "Nursing - Adult", display: "Adult Nursing", tier: "Tier 1" },
  { name: "Nursing - Childrens", display: "Children's Nursing", tier: "Tier 1" },
  { name: "Nursing - Community Nursing", display: "Community Nursing", tier: "Tier 1" },
  { name: "Nursing - Learning Disability's and Social Work", display: "Learning Disability & Social Work", tier: "Tier 1" },
  { name: "Nursing - Mental Health", display: "Mental Health Nursing", tier: "Tier 1" },
  { name: "Physician Associate", display: "Physician Associate", tier: "Tier 1" },
];

export default function Signup() {
  const supabase = createClient();
  const router = useRouter();

  const [forename, setForename] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState("Tier 1");

  const handleAccountTypeChange = (accountName: string) => {
    setSelectedAccountType(accountName);
    const account = accountTypes.find(a => a.name === accountName);
    if (account) {
      setSelectedTier(account.tier);
    }
  };

  const handleSignup = async () => {
    if (!forename.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!selectedAccountType) {
      alert("Please select your account type");
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

    try {
      // Step 1: Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            forename: forename,
            account_type: selectedAccountType,
            tier: selectedTier
          }
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user returned");

      console.log("Auth user created:", data.user.id);

      // Step 2: Insert into Users table FIRST (because accounts has FK to Users)
      const { error: usersError } = await supabase
        .from('Users')
        .insert({
          user_id: data.user.id,
          Account: selectedAccountType,
          Tier: selectedTier,
          created_at: new Date().toISOString()
        });

      if (usersError) {
        console.error("Users insert error:", usersError);
        alert(`Users table error: ${usersError.message}`);
        throw usersError;
      }
      console.log("Users insert successful");

      // Step 3: Insert into accounts table (now the FK constraint will be satisfied)
      const { error: accountError } = await supabase
        .from('accounts')
        .insert({
          user_id: data.user.id,
          account: email,
          tier: selectedTier,
          forename: forename,
          created_at: new Date().toISOString(),
          account_type: selectedAccountType
        });

      if (accountError) {
        console.error("Accounts insert error:", accountError);
        alert(`Accounts table error: ${accountError.message}`);
      } else {
        console.log("Accounts insert successful");
      }

      alert("✓ Account created! Please check your email to confirm your account.");
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err: any) {
      console.error("Signup error:", err);
      alert(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
                <label htmlFor="accountType">Account Type *</label>
                <select
                  id="accountType"
                  className={styles.select}
                  value={selectedAccountType}
                  onChange={(e) => handleAccountTypeChange(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select your account type</option>
                  {accountTypes.map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.display}
                    </option>
                  ))}
                </select>
                <p className={styles.hint}>
                  Your access level will be based on your account type
                </p>
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