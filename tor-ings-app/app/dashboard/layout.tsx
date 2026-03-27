import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";
import LogoutButton from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/Login");
  }

  // Fetch user data for tier-based permissions
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  const displayName = account?.forename || session.user.email?.split('@')[0] || "User";
  const tier = account?.tier || "Tier 1";
  const isTier4 = tier === "Tier 4";

  // Navigation items with tier-based visibility
  const navItems = [
    { name: "Dashboard", href: "/dashboard", tiers: ["Tier 1", "Tier 2", "Tier 3", "Tier 4"] },
    { name: "My Cart", href: "/dashboard/cart", tiers: ["Tier 1", "Tier 2", "Tier 3", "Tier 4"] },
    { name: "Equipment Catalogue", href: "/dashboard/booking", tiers: ["Tier 1", "Tier 2", "Tier 3", "Tier 4"] },
    { name: "My Bookings", href: "/dashboard/orders", tiers: ["Tier 1", "Tier 2", "Tier 3", "Tier 4"] },
    //Tier 2 features and above
    { name: "Schedule", href: "/dashboard/schedule", tiers: ["Tier 2", "Tier 3", "Tier 4"] },
    { name: "Restock", href: "/dashboard/restock", tiers: ["Tier 2", "Tier 3", "Tier 4"] },
    // Admin Panel - ONLY for Tier 4
    { name: "Admin Panel", href: "/dashboard/admin", tiers: ["Tier 4"] },
    { name: "Account Settings", href: "/dashboard/account", tiers: ["Tier 1", "Tier 2", "Tier 3", "Tier 4"] },
  ];

  // Filter navigation based on user's tier
  const filteredNavItems = navItems.filter(item => item.tiers.includes(tier));

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>TOR-ingS</h2>
          <p className={styles.sidebarSubtitle}>Health Equipment</p>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userDetails}>
            <p className={styles.userName}>{displayName}</p>
            <p className={styles.userTier}>{tier}</p>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {filteredNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={styles.navLink}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <LogoutButton className={styles.logoutButton} />
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}