import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import styles from "./orders.module.css";

type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'expired';

type Booking = {
  booking_id: string;
  room_name: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  created_at: string;
  user_id?: string;
  user_name?: string;
  room_id?: number;
  updated_at?: string;
};

type BookingItem = {
  equipment_name: string;
  quantity: number;
};

type BookingWithItems = Booking & {
  items: BookingItem[];
};

export default async function OrdersPage() {
  const supabase = await createServerSupabase();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch user's real bookings from the database
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (bookingsError) {
    console.error("Error fetching bookings:", bookingsError);
  }

  // Fetch booking items for each booking and type properly
  const bookingsWithItems: BookingWithItems[] = await Promise.all(
    (bookings || []).map(async (booking: Booking) => {
      const { data: items } = await supabase
        .from('booking_items')
        .select('equipment_name, quantity')
        .eq('booking_id', booking.booking_id);
      
      return {
        ...booking,
        items: items as BookingItem[] || []
      };
    })
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    if (start === end) {
      return start;
    }
    return `${start} - ${end}`;
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusClass = (status: BookingStatus) => {
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

  const getStatusText = (status: BookingStatus) => {
    switch(status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'declined':
        return 'Declined';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  return (
    <div className={styles.pageContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentHeaderTitle}>Recent Orders</h1>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.shell}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>Your bookings</h2>
            <span className={styles.pill}>
              {bookingsWithItems.length} {bookingsWithItems.length === 1 ? 'booking' : 'bookings'}
            </span>
          </div>

          {bookingsWithItems.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven't made any bookings yet.</p>
              <Link href="/dashboard/booking" className={styles.browseBtn}>
                Browse Equipment
              </Link>
            </div>
          ) : (
            <div className={styles.list}>
              {bookingsWithItems.map((booking) => {
                const duration = calculateDuration(booking.start_date, booking.end_date);
                const totalItems = booking.items.reduce((sum: number, item: BookingItem) => sum + item.quantity, 0);
                const dateRange = formatDateRange(booking.start_date, booking.end_date);
                const isExpired = new Date(booking.end_date) < new Date();
                
                return (
                  <div key={booking.booking_id} className={styles.orderCard}>
                    <div className={styles.orderTop}>
                      <div>
                        <p className={styles.orderId}>
                          Booking #{booking.booking_id.slice(0, 8)}
                        </p>
                        <p className={styles.orderMeta}>
                          {dateRange} • {duration} day{duration !== 1 ? 's' : ''} • {totalItems} item{totalItems !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <span className={`${styles.status} ${getStatusClass(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.bookingDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Room:</span>
                        <span className={styles.detailValue}>{booking.room_name}</span>
                      </div>
                      
                      {booking.items.length > 0 && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Equipment:</span>
                          <div className={styles.equipmentList}>
                            {booking.items.map((item: BookingItem, idx: number) => (
                              <span key={idx} className={styles.equipmentTag}>
                                {item.equipment_name} x{item.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Booked on:</span>
                        <span className={styles.detailValue}>
                          {formatDate(booking.created_at)}
                        </span>
                      </div>

                      {isExpired && booking.status === 'confirmed' && (
                        <div className={styles.expiredNote}>
                          This booking has passed its end date
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2026 TORS Health Equipment - Sheffield Hallam University</p>
      </footer>
    </div>
  );
}