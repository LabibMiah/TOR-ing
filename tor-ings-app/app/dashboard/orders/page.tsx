import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import styles from "./orders.module.css";

export default async function OrdersPage() {
  const supabase = await createServerSupabase();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Fake placeholder orders just for UI purposes right now
  const placeholderOrders = [
    { id: "ORD-1024", date: "19 Feb 2026", items: 3, status: "Processing" },
    { id: "ORD-1019", date: "12 Feb 2026", items: 1, status: "Completed" },
    { id: "ORD-1012", date: "03 Feb 2026", items: 5, status: "Completed" },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <h1>Recent Orders</h1>
            <p>View your latest equipment requests</p>
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
          <div className={styles.titleRow}>
            <h2 className={styles.title}>Your recent orders</h2>
            <span className={styles.pill}>Coming soon</span>
          </div>

          <p className={styles.lead}>
            This page will show your latest equipment orders and their status once ordering is connected.
          </p>

          <div className={styles.list}>
            {placeholderOrders.map((o) => (
              <div key={o.id} className={styles.orderCard}>
                <div className={styles.orderTop}>
                  <div>
                    <p className={styles.orderId}>{o.id}</p>
                    <p className={styles.orderMeta}>
                      {o.date} • {o.items} item{o.items === 1 ? "" : "s"}
                    </p>
                  </div>

                  <span className={styles.status}>{o.status}</span>
                </div>

                <div className={styles.divider} />

                <p className={styles.note}>
                  Order details and downloadable setup sheets will appear here in a future update.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>© 2026 My Website</footer>
    </div>
  );
}