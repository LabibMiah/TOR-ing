import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import styles from "../admin.module.css";

export default async function NewPage() {
  const supabase = await createServerSupabase();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("tier")
    .eq("user_id", session.user.id)
    .single();

  if (account?.tier !== "Tier 4") {
    redirect("/dashboard");
  }

  return (
    <div className={styles.pageContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentHeaderTitle}>New Page</h1>
        <p className={styles.contentHeaderSubtitle}>
          Simple scaffold page
        </p>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Input Section</h2>

          <div style={{ display: "grid", gap: "16px", marginTop: "16px" }}>
            <input
              type="text"
              placeholder="Enter first value"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.12)",
                fontSize: "16px",
                backgroundColor: "#fff",
              }}
            />

            <input
              type="text"
              placeholder="Enter second value"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid rgba(0,0,0,0.12)",
                fontSize: "16px",
                backgroundColor: "#fff",
              }}
            />

            <button
              className={styles.actionBtn}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "12px 20px",
                width: "fit-content",
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2026 TORS Health Equipment - Sheffield Hallam University</p>
      </footer>
    </div>
  );
}