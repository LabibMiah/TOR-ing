"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import styles from "./account.module.css";

export default function AccountPage() {
  const supabase = createClient();

  const [email, setEmail] = useState<string>("Loading...");
  const [tier, setTier] = useState<string>("Tier 1");   
  const [status, setStatus] = useState<string>("Active"); 

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user?.email) {
        setEmail(data.user.email);
      } else {
        setEmail("Unknown");
      }
    };

    loadUser();
  }, [supabase]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    setNewPassword("");
    setConfirm("");
    setMessage("Password updated successfully ");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <h1>Account</h1>
            <p>Manage your details & security</p>
          </div>

          <div className={styles.topActions}>
            <Link className={styles.actionLink} href="/dashboard">
              Back to dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.shell}>
          <div className={styles.pageTitleRow}>
            <h2 className={styles.pageTitle}>Your details</h2>
            <div className={styles.badge}>Status: {status}</div>
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>Account information</h3>

              <div className={styles.kv}>
                <div>Email</div>
                <span>{email}</span>

                <div>Tier</div>
                <span>{tier}</span>

                <div>Status</div>
                <span>{status}</span>
              </div>
            </div>

            <div className={styles.card}>
              <h3>Change password</h3>

              <form onSubmit={handleChangePassword} className={styles.form}>
                <label className={styles.label}>
                  New password
                  <input
                    className={styles.input}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </label>

                <label className={styles.label}>
                  Confirm password
                  <input
                    className={styles.input}
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </label>

                <button className={styles.button} type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update password"}
                </button>

                {message ? <p className={styles.message}>{message}</p> : null}
              </form>

              <p className={styles.note}>
                ()
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>© 2026 My Website</footer>
    </div>
  );
}
