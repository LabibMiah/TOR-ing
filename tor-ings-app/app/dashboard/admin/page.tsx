import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./admin.module.css";

type Account = {
  user_id: string;
  account: string;
  tier: string;
  forename: string | null;
  created_at: string;
};

type Booking = {
  booking_id: string;
  user_name: string;
  room_name: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
};

type Equipment = {
  Equipment_ID: number;
  Name: string;
  Type: string | null;
  Quantity: number | null;
  Equipment_Catagory: string | null;
};

export default async function AdminPage() {
  const supabase = await createServerSupabase();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Check if user is Tier 4
  const { data: account } = await supabase
    .from('accounts')
    .select('tier')
    .eq('user_id', session.user.id)
    .single();

  if (account?.tier !== "Tier 4") {
    redirect("/dashboard");
  }

  // Fetch all users
  const { data: users } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch all bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch equipment stats
  const { data: equipment } = await supabase
    .from('Equipment')
    .select('*');

  // Calculate statistics
  const totalUsers = users?.length || 0;
  const totalBookings = bookings?.length || 0;
  const totalEquipment = equipment?.length || 0;
  const lowStockItems = equipment?.filter(item => (item.Quantity || 0) < 5) || [];
  const outOfStockItems = equipment?.filter(item => (item.Quantity || 0) === 0) || [];

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'pending':
        return styles.statusPending;
      case 'declined':
        return styles.statusDeclined;
      case 'expired':
        return styles.statusExpired;
      default:
        return styles.statusDefault;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.pageContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentHeaderTitle}>Admin Panel</h1>
        <p className={styles.contentHeaderSubtitle}>System Management Dashboard</p>
      </div>

      <div className={styles.contentArea}>
        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}></div>
            <div className={styles.statInfo}>
              <p className={styles.statValue}>{totalUsers}</p>
              <p className={styles.statLabel}>Total Users</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}></div>
            <div className={styles.statInfo}>
              <p className={styles.statValue}>{totalBookings}</p>
              <p className={styles.statLabel}>Total Bookings</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}></div>
            <div className={styles.statInfo}>
              <p className={styles.statValue}>{totalEquipment}</p>
              <p className={styles.statLabel}>Equipment Items</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}></div>
            <div className={styles.statInfo}>
              <p className={styles.statValue}>{lowStockItems.length}</p>
              <p className={styles.statLabel}>Low Stock Items</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.quickActions}>
            <Link href="/dashboard/admin/users" className={styles.actionBtn}>
              <span>👥</span> Manage Users
            </Link>
            <Link href="/dashboard/admin/equipment" className={styles.actionBtn}>
              <span></span> Manage Equipment
            </Link>
            <Link href="/dashboard/admin/bookings" className={styles.actionBtn}>
              <span></span> Manage Bookings
            </Link>
            <Link href="/dashboard/admin/rooms" className={styles.actionBtn}>
              <span></span> Manage Rooms
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Recent Bookings</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Room</th>
                  <th>Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(bookings || []).map((booking: Booking) => (
                  <tr key={booking.booking_id}>
                    <td>{booking.user_name}</td>
                    <td>{booking.room_name}</td>
                    <td>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!bookings || bookings.length === 0) && (
                  <tr>
                    <td colSpan={4} className={styles.emptyTable}>No bookings found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>⚠️ Low Stock Alerts</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item: Equipment) => (
                    <tr key={item.Equipment_ID}>
                      <td>{item.Name}</td>
                      <td>{item.Equipment_Catagory || 'N/A'}</td>
                      <td className={item.Quantity === 0 ? styles.outOfStock : styles.lowStock}>
                        {item.Quantity || 0}
                      </td>
                      <td>
                        <span className={item.Quantity === 0 ? styles.outOfStockBadge : styles.lowStockBadge}>
                          {item.Quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <p>© 2026 TORS Health Equipment - Sheffield Hallam University</p>
      </footer>
    </div>
  );
}