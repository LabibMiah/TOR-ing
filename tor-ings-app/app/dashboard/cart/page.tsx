// app/dashboard/cart/page.tsx
import Link from "next/link";
import { createServerSupabase } from "../../../lib/supabase/server"; 
import { redirect } from "next/navigation";
import LogoutButton from "../logout-button"; 
import styles from "./cart.module.css";

export default async function CartPage() {
  const supabase = await createServerSupabase();

  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/Login");
  }

  // Fetch user data for personalization
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  const displayName = account?.forename || session.user.email?.split('@')[0] || "User";

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
            <Link href="/dashboard" className={styles.dashboardLink}>
              ← Dashboard
            </Link>
            <LogoutButton className={styles.logoutBtn} />
          </div>
        </div>
        
        {/* Removed the nav section with Home, Contact, About links */}
      </header>

      <main className={styles.main}>
        <div className={styles.shell}>
          <div className={styles.pageTitleRow}>
            <h2 className={styles.pageTitle}>Your Shopping Cart</h2>
            <span className={styles.userBadge}>{displayName}</span>
          </div>

          <div className={styles.cartContainer}>
            {/* Empty cart message */}
            <div className={styles.emptyCart}>
              <div className={styles.emptyCartIcon}>🛒</div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added any equipment yet.</p>
              <Link href="/equipment" className={styles.browseBtn}>
                Browse Equipment
              </Link>
            </div>

            {/* Simple cart info box */}
            <div className={styles.infoBox}>
              <p>
                <strong>Need help?</strong> Contact our equipment team at 
                <Link href="/contact"> equipment@shu.ac.uk</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2026 TORS Health Equipment Ordering System. Sheffield Hallam University.</p>
        </div>
      </footer>
    </div>
  );
}