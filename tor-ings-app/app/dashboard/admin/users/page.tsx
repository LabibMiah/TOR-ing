import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "../../../../lib/supabase/server";
import baseStyles from "../../dashboard.module.css";
import styles from "../admin.module.css";
import { userRecords } from "../admin-data";

export default async function AdminUsersPage() {
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
            <h1 className={baseStyles.brandTitle}>TORS Admin Users</h1>
            <p className={baseStyles.brandSubtitle}>
              Dummy user directory for the future backend-powered admin flow
            </p>
          </div>

          <div className={baseStyles.topActions}>
            <Link href="/dashboard/admin" className={baseStyles.actionLink}>
              Back to admin
            </Link>
            <Link href="/dashboard" className={baseStyles.actionLink}>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className={baseStyles.main}>
        <div className={baseStyles.shell}>
          <div className={baseStyles.pageTitleRow}>
            <h2 className={baseStyles.pageTitle}>View users</h2>
            <span className={baseStyles.badge}>{userRecords.length} dummy users</span>
          </div>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Supposed users</h3>
                <p className={styles.panelText}>
                  This table is filled with placeholder users so you can finish the frontend before
                  the real API is connected.
                </p>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Requests this month</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userRecords.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                        <span className={styles.rowMeta}>{user.id}</span>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.department}</td>
                      <td>{user.role}</td>
                      <td>{user.requestsThisMonth}</td>
                      <td>
                        <span className={styles[`status${user.accountStatus}`]}>
                          {user.accountStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <footer className={baseStyles.footer}>© 2026 TORS Health Equipment Ordering System</footer>
    </div>
  );
}
