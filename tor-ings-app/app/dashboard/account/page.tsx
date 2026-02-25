"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import styles from "./account.module.css";

type Booking = {
  booking_id: string;
  room_name: string;
  booking_date: string;
  duration_days: number;
  status: string;
  created_at: string;
};

type BookingItem = {
  equipment_name: string;
  quantity: number;
};

export default function AccountPage() {
  const supabase = createClient();

  const [email, setEmail] = useState<string>("Loading...");
  const [tier, setTier] = useState<string>("Tier 1");   
  const [status, setStatus] = useState<string>("Active"); 
  const [forename, setForename] = useState<string>("");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // New state for bookings
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingItems, setBookingItems] = useState<Record<string, BookingItem[]>>({});
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
        
        // Fetch account details
        const { data: account } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (account) {
          setTier(account.tier || "Tier 1");
          setForename(account.forename || "");
        }

        // Fetch user's bookings
        const { data: userBookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (bookingsError) {
          console.error("Error fetching bookings:", bookingsError);
        } else {
          setBookings(userBookings || []);
          
          // Fetch items for each booking
          if (userBookings && userBookings.length > 0) {
            const itemsMap: Record<string, BookingItem[]> = {};
            
            for (const booking of userBookings) {
              const { data: items } = await supabase
                .from('booking_items')
                .select('equipment_name, quantity')
                .eq('booking_id', booking.booking_id);
              
              if (items) {
                itemsMap[booking.booking_id] = items;
              }
            }
            
            setBookingItems(itemsMap);
          }
        }
        
        setLoadingBookings(false);
      }
    };

    loadUser();
  }, [supabase]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    setNewPassword("");
    setConfirm("");
    setMessage("Password updated successfully ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadgeStyle = (status: string) => {
    switch(status) {
      case 'confirmed':
        return { backgroundColor: '#10b981', color: 'white' };
      case 'pending':
        return { backgroundColor: '#f59e0b', color: 'white' };
      case 'cancelled':
        return { backgroundColor: '#ef4444', color: 'white' };
      default:
        return { backgroundColor: '#6b7280', color: 'white' };
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <h1>Account</h1>
            <p>Manage your details & security</p>
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
          <div className={styles.pageTitleRow}>
            <h2 className={styles.pageTitle}>Your details</h2>
            <div className={styles.badge}>Status: {status}</div>
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>Account information</h3>

              <div className={styles.kv}>
                <div>Name</div>
                <span>{forename || "Not set"}</span>

                <div>Email</div>
                <span>{email}</span>

                <div>Tier</div>
                <span>{tier}</span>

                <div>Status</div>
                <span>{status}</span>
              </div>
            </div>

            <div className={styles.card}>
              <h3>Change password</h3>

              <form onSubmit={handleChangePassword} className={styles.form}>
                <label className={styles.label}>
                  New password
                  <input
                    className={styles.input}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </label>

                <label className={styles.label}>
                  Confirm password
                  <input
                    className={styles.input}
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </label>

                <button className={styles.button} type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update password"}
                </button>

                {message ? <p className={styles.message}>{message}</p> : null}
              </form>
            </div>
          </div>

          {/* Order History Section */}
          <div style={{ marginTop: '30px' }}>
            <h2 className={styles.pageTitle}>Order History</h2>
            
            {loadingBookings ? (
              <p>Loading your bookings...</p>
            ) : bookings.length === 0 ? (
              <div className={styles.card} style={{ textAlign: 'center', padding: '30px' }}>
                <p>You haven't made any bookings yet.</p>
                <Link href="/dashboard/booking" className={styles.button} style={{ marginTop: '10px', display: 'inline-block' }}>
                  Browse Equipment
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {bookings.map((booking) => (
                  <div key={booking.booking_id} className={styles.card} style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px' }}>Booking #{booking.booking_id.slice(0, 8)}</h3>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px',
                        fontWeight: 'bold',
                        ...getStatusBadgeStyle(booking.status)
                      }}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>Room</p>
                        <p style={{ margin: '4px 0 0', fontWeight: 'bold' }}>{booking.room_name}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>Date</p>
                        <p style={{ margin: '4px 0 0', fontWeight: 'bold' }}>{formatDate(booking.booking_date)}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>Duration</p>
                        <p style={{ margin: '4px 0 0', fontWeight: 'bold' }}>{booking.duration_days} day{booking.duration_days !== 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>Booked on</p>
                        <p style={{ margin: '4px 0 0', fontWeight: 'bold' }}>{formatDate(booking.created_at)}</p>
                      </div>
                    </div>

                    {bookingItems[booking.booking_id] && bookingItems[booking.booking_id].length > 0 && (
                      <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                        <p style={{ margin: '0 0 8px', fontWeight: 'bold', fontSize: '14px' }}>Equipment:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {bookingItems[booking.booking_id].map((item, idx) => (
                            <span key={idx} style={{
                              background: '#f0f0f0',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '13px'
                            }}>
                              {item.equipment_name} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>© 2026 TOR-ingS Website</footer>
    </div>
  );
}