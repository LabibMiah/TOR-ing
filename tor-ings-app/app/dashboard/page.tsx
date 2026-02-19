import Link from "next/link";
import styles from "./dashboard.module.css";
import LogoutButton from "./logout-button";

export default function DashboardPage() {
  // Placeholder data for now (later you’ll pull from Supabase/session)
  const email = "c4011868@hallam.shu.ac.uk";
  const tier = "Tier 1";
  const status = "Active";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <h1 className={styles.brandTitle}>
              TORS Health Equipment Ordering Catalogue
            </h1>
            <p className={styles.brandSubtitle}>
              School of Healthcare - Sheffield Hallam University
            </p>
          </div>

          <div className={styles.topActions}>
            <Link className={styles.actionLink} href="/dashboard/account">
              Account
            </Link>
            <LogoutButton className={styles.logoutBtn} />
          </div>
        </div>

        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/about">About</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.shell}>
          <div className={styles.pageTitleRow}>
            <h2 className={styles.pageTitle}>Dashboard</h2>
            <span className={styles.badge}>Status: {status}</span>
          </div>

          <div className={styles.grid}>
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Welcome back!</h3>

              <div className={styles.kv}>
                <div>Email</div>
                <span>{email}</span>

                <div>Tier</div>
                <span>{tier}</span>

                <div>Status</div>
                <span>{status}</span>
              </div>
            </section>

            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Quick actions</h3>

              <div className={styles.kv}>
                <div>Account</div>
                <span>
                  <Link href="/dashboard/account">View</Link>
                </span>

                <div>Security</div>
                <span>
                  <Link href="/dashboard/account#password">Change password</Link>
                </span>

                <div>Recent orders</div>
              <span>
                <Link href="/dashboard/orders">View</Link>
              </span>


                <div>Help</div>
                <span>
                  <Link href="/contact">Contact</Link>
                </span>
              </div>
            </section>
          </div>

          <div className={styles.smallCards}>
            <div className={styles.smallCard}>
              <p className={styles.smallCardTitle}>Status</p>
              <p className={styles.smallCardValue}>{status}</p>
            </div>

            <div className={styles.smallCard}>
              <p className={styles.smallCardTitle}>Tier</p>
              <p className={styles.smallCardValue}>{tier}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>© 2026 My Website</footer>
    </div>
  );
}
