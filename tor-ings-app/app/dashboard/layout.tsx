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
    redirect("/login");
  }

  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  const displayName = account?.forename || session.user.email?.split('@')[0] || "User";
  const tier = account?.tier || "Tier 1";

  const navItems = [
    { name: "Dashboard", href: "/dashboard", tiers: ["Tier 1", "Tier 2", "Tier 3", "Tier 4"] },
    { name: "Equipment Catalogue", href: "/dashboard/booking", tiers: ["Tier 1", "Tier 2", "Tier 3", "Tier 4"] },
    { name: "My cart", href: "/dashboard/cart", tiers: ["Tier 1", "Tier 2", "Tier 3", "Tier 4"] },
    { name: "My bookings", href: "/dashboard/orders", tiers: ["Tier 1", "Tier 2", "Tier 3", "Tier 4"] },
    { name: "Rooms", href: "/dashboard/rooms", tiers: ["Tier 1", "Tier 2", "Tier 3", "Tier 4"] },
    { name: "Account settings", href: "/dashboard/account", tiers: ["Tier 1", "Tier 2", "Tier 3", "Tier 4"] },
  ];

  const filteredNavItems = navItems.filter(item => item.tiers.includes(tier));

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Tor-ingS</h2>
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

      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}