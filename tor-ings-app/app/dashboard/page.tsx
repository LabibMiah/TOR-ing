import { createServerSupabase } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";

type Booking = {
  booking_id: string;
  room_name: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
};

type BookingItem = {
  equipment_name: string;
  quantity: number;
  equipment_id: number;
  category: string;
};

type Equipment = {
  Equipment_ID: number;
  Name: string;
  Type: string | null;
  Size: string | null;
  Quantity: number | null;
  Equipment_Catagory: string | null;
};

type OrderAgainItem = {
  equipment_id: number;
  equipment_name: string;
  type: string | null;
  size: string | null;
  category: string | null;
  last_ordered: string;
  quantity: number;
};

export default async function DashboardPage() {
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
  const status = "active";
  const tier = account?.tier || "Tier 1";

  // Fetch recent bookings
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  // Fetch booking items for recent bookings
  let recentItems: BookingItem[] = [];
  let lastCategory: string | null = null;

  if (recentBookings && recentBookings.length > 0) {
    const bookingIds = recentBookings.map(b => b.booking_id);
    const { data: items } = await supabase
      .from('booking_items')
      .select('equipment_name, quantity, equipment_id')
      .in('booking_id', bookingIds);
    
    if (items) {
      recentItems = items.map(item => ({
        ...item,
        category: ''
      }));
    }

    const lastBookingId = recentBookings[0].booking_id;
    const { data: lastBookingItems } = await supabase
      .from('booking_items')
      .select('equipment_id')
      .eq('booking_id', lastBookingId)
      .limit(1);
    
    if (lastBookingItems && lastBookingItems.length > 0) {
      const { data: equipment } = await supabase
        .from('Equipment')
        .select('Equipment_Catagory')
        .eq('Equipment_ID', lastBookingItems[0].equipment_id)
        .single();
      
      if (equipment) {
        lastCategory = equipment.Equipment_Catagory;
      }
    }
  }

  // Get order again items
  const orderAgainItems = new Map<number, OrderAgainItem>();
  
  if (recentItems && recentItems.length > 0) {
    const uniqueEquipmentIds = [...new Set(recentItems.map(item => item.equipment_id))];
    
    const { data: equipmentDetails } = await supabase
      .from('Equipment')
      .select('*')
      .in('Equipment_ID', uniqueEquipmentIds);
    
    if (equipmentDetails) {
      const detailsMap = new Map();
      equipmentDetails.forEach(eq => {
        detailsMap.set(eq.Equipment_ID, eq);
      });
      
      recentItems.forEach(item => {
        const details = detailsMap.get(item.equipment_id);
        
        if (details) {
          orderAgainItems.set(item.equipment_id, {
            equipment_id: item.equipment_id,
            equipment_name: item.equipment_name,
            type: details.Type,
            size: details.Size,
            category: details.Equipment_Catagory,
            last_ordered: recentBookings && recentBookings.length > 0 
              ? recentBookings[0].created_at 
              : new Date().toISOString(),
            quantity: item.quantity
          });
        }
      });
    }
  }
  
  const orderAgainList = Array.from(orderAgainItems.values()).slice(0, 6);

  // Get recommendations
  let recommendations: Equipment[] = [];
  if (lastCategory) {
    const { data: recs } = await supabase
      .from('Equipment')
      .select('*')
      .eq('Equipment_Catagory', lastCategory)
      .limit(4);
    
    recommendations = recs || [];
  } else {
    const { data: defaultRecs } = await supabase
      .from('Equipment')
      .select('*')
      .limit(4);
    
    recommendations = defaultRecs || [];
  }

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
        <h1 className={styles.contentHeaderTitle}>Dashboard</h1>
      </div>

      <div className={styles.contentArea}>
        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <h2 className={styles.welcomeTitle}>Welcome back, {displayName}!</h2>
          <p className={styles.welcomeSubtitle}>Here's your account overview</p>
        </div>

        {/* Info Cards */}
        <div className={styles.infoCards}>
          <div className={styles.infoCard}>
            <div className={styles.infoCardContent}>
              <p className={styles.infoLabel}>Email</p>
              <p className={styles.infoValue}>{session.user.email}</p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoCardContent}>
              <p className={styles.infoLabel}>Tier</p>
              <p className={styles.infoValue}>{tier}</p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoCardContent}>
              <p className={styles.infoLabel}>Status</p>
              <p className={styles.infoValue}>{status}</p>
            </div>
          </div>
        </div>

        {/* Order Again Section */}
        {orderAgainList.length > 0 && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Order Again</h3>
              <Link href="/dashboard/booking" className={styles.viewAllLink}>
                Browse all →
              </Link>
            </div>
            
            <div className={styles.orderAgainGrid}>
              {orderAgainList.map((item) => (
                
                // In dashboard page, update the Order Again links:
                <Link 
                key={item.equipment_id} 
                href={`/dashboard/booking?equipment=${item.equipment_id}`}
                className={styles.orderAgainCard}
>
                  <div className={styles.orderAgainContent}>
                    <h4 className={styles.orderAgainName}>{item.equipment_name}</h4>
                    <div className={styles.orderAgainDetails}>
                      {item.type && <span className={styles.orderAgainType}>{item.type}</span>}
                      {item.size && <span className={styles.orderAgainSize}>{item.size}</span>}
                    </div>
                    <div className={styles.orderAgainFooter}>
                      <span className={styles.orderAgainQuantity}>Previously ordered: {item.quantity}</span>
                      <span className={styles.orderAgainLink}>Order again →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Recommendations Section */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              {lastCategory ? `You might also like (${lastCategory})` : "Recommended for you"}
            </h3>
            <Link href="/dashboard/booking" className={styles.viewAllLink}>
              Browse all →
            </Link>
          </div>
          
          <div className={styles.recommendationsGrid}>
            {recommendations.map((item) => (
              <Link 
                key={item.Equipment_ID} 
                href="/dashboard/booking"
                className={styles.recommendationCard}
              >
                <h4 className={styles.recommendationName}>{item.Name}</h4>
                <p className={styles.recommendationType}>{item.Type || 'Equipment'}</p>
                <div className={styles.recommendationFooter}>
                  <span className={item.Quantity && item.Quantity > 0 ? styles.inStock : styles.outOfStock}>
                    {item.Quantity && item.Quantity > 0 ? `In stock (${item.Quantity})` : 'Out of stock'}
                  </span>
                  <span className={styles.recommendationLink}>View →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Orders</h3>
            <Link href="/dashboard/orders" className={styles.viewAllLink}>
              View all →
            </Link>
          </div>
          
          {recentBookings && recentBookings.length > 0 ? (
            <div className={styles.recentOrdersList}>
              {recentBookings.map((booking) => (
                <div key={booking.booking_id} className={styles.recentOrderCard}>
                  <div className={styles.recentOrderHeader}>
                    <span className={styles.recentOrderId}>
                      Booking #{booking.booking_id.slice(0, 8)}
                    </span>
                    <span className={`${styles.recentOrderStatus} ${styles[`status${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`] || ''}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className={styles.recentOrderDetails}>
                    <span> {formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
                    <span> {booking.room_name}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyMessage}>No recent orders. Start browsing equipment!</p>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2026 TORS Health Equipment - Sheffield Hallam University</p>
      </footer>
    </div>
  );
}