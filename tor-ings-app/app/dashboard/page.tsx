import { createServerSupabase } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const supabase = await createServerSupabase();

  // FIX: Use getUser() instead of getSession() - this is secure!
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Fetch user data from accounts table
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (accountError) {
    console.error("Error fetching account:", accountError);
  }

  // Use name if available, otherwise fallback to email or default
  const displayName = account?.forename || user.email?.split('@')[0] || "User";
  const status = "Active";
  const tier = account?.tier || "Tier 1";

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
            <Link href="/dashboard/booking" className={styles.actionLink}>
              Booking
            </Link>
            <Link href="/dashboard/cart" className={styles.actionLink}>
              Cart
            </Link>  
            <Link className={styles.actionLink} href="/dashboard/account">
              Account
            </Link>
            <LogoutButton className={styles.logoutBtn} />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.shell}>
          <div className={styles.pageTitleRow}>
            <h2 className={styles.pageTitle}>Dashboard</h2>
            <span className={styles.badge}>Status: {status}</span>
          </div>

          <div className={styles.grid}>
            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Welcome back, {displayName}!</h3>

              <div className={styles.kv}>
                <div>Email</div>
                <span>{user.email}</span>

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

                <div>Cart</div>
                <span>
                  <Link href="/dashboard/cart">View Cart</Link>
                </span>

                <div>Booking</div>
                <span>
                  <Link href="/dashboard/booking">Book Equipment</Link>
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

      <footer className={styles.footer}>
  <div className={styles.footerContent}>
    <p>© 2026 TORS Health Equipment Ordering System. Sheffield Hallam University.</p>
    <nav className={styles.footerNav}>
      <Link href="/contact">Contact</Link>
      <Link href="/about">About</Link>
      <Link href="https://www.shu.ac.uk/myhallam/support-at-hallam/tors" target="_blank" rel="noopener noreferrer">
        TORS Info
      </Link>
      <Link href="https://www.shu.ac.uk/myhallam/support-at-hallam/tors" target="_blank" rel="noopener noreferrer">
        Privacy
      </Link>
      <Link href="https://www.shu.ac.uk/myhallam/support-at-hallam/tors" target="_blank" rel="noopener noreferrer">
        Terms
      </Link>
    </nav>
  </div>
</footer>
    </div>
  );
}