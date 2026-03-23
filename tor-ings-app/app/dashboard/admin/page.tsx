import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "../../../lib/supabase/server";
import baseStyles from "../dashboard.module.css";
import styles from "./admin.module.css";
import AdminClient from "./admin-client";

export default async function AdminPage() {
  const supabase = await createServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/Login");
  }

  return (
    <div className={baseStyles.page}>
      <header className={baseStyles.header}>
        <div className={baseStyles.headerInner}>
          <div className={baseStyles.brand}>
            <h1 className={baseStyles.brandTitle}>TORS Admin Panel</h1>
            <p className={baseStyles.brandSubtitle}>
              Reports, account controls, and schedule management
            </p>
          </div>

          <div className={baseStyles.topActions}>
            <Link href="/dashboard" className={baseStyles.actionLink}>
              Dashboard
            </Link>
            <Link href="/dashboard/account" className={baseStyles.actionLink}>
              Account
            </Link>
            <Link href="/dashboard/admin/users" className={baseStyles.actionLink}>
              View users
            </Link>
          </div>
        </div>
      </header>

      <main className={baseStyles.main}>
        <div className={baseStyles.shell}>
          <div className={baseStyles.pageTitleRow}>
            <h2 className={baseStyles.pageTitle}>Admin controls</h2>
            
          </div>

        

          <AdminClient />
        </div>
      </main>

      <footer className={baseStyles.footer}>© 2026 TORS Health Equipment Ordering System</footer>
    </div>
  );
}
