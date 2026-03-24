"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import styles from "./schedule.module.css";

type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'completed' | 'expired';

type BookingItem = {
  equipment_name: string;
  quantity: number;
  equipment_id: number;
};

type Booking = {
  booking_id: string;
  user_id: string;
  user_name: string;
  room_name: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  created_at: string;
  updated_at?: string;
  items: BookingItem[];
};

export default function SchedulePage() {
  const supabase = createClient();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userTier, setUserTier] = useState<string>("");

  useEffect(() => {
    async function checkAccessAndLoad() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: account } = await supabase
        .from('accounts')
        .select('tier')
        .eq('user_id', user.id)
        .single();

      if (!account) {
        router.push("/dashboard");
        return;
      }

      setUserTier(account.tier);

      const tierNumber = parseInt(account.tier.split(' ')[1]);
      if (tierNumber < 2) {
        router.push("/dashboard");
        return;
      }

      await loadSchedule();
    }
    checkAccessAndLoad();
  }, []);

  const loadSchedule = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        items:booking_items (
          equipment_name,
          quantity,
          equipment_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading schedule:", error);
    } else {
      setBookings(data || []);
    }
    
    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('booking_id', bookingId);

    if (error) {
      console.error("Error updating status:", error);
      alert("Failed to update booking status");
    } else {
      setBookings(prev => 
        prev.map(b => b.booking_id === bookingId ? { ...b, status: newStatus } : b)
      );
      alert(`Schedule status updated to ${newStatus}`);
    }
    
    setUpdatingId(null);
  };

  const checkAndCompleteExpiredBookings = async () => {
    try {
      const { data, error } = await supabase.rpc('check_all_bookings');
      if (error) throw error;
      alert(data || "Checked and completed expired bookings");
      await loadSchedule();
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to complete expired bookings");
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (filter !== "all" && booking.status !== filter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          booking.user_name?.toLowerCase().includes(term) ||
          booking.room_name?.toLowerCase().includes(term) ||
          booking.booking_id.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [bookings, filter, searchTerm]);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    declined: bookings.filter(b => b.status === 'declined').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    expired: bookings.filter(b => b.status === 'expired').length,
  }), [bookings]);

  const getStatusBadgeClass = (status: BookingStatus) => {
    switch(status) {
      case 'confirmed': return styles.statusConfirmed;
      case 'pending': return styles.statusPending;
      case 'declined': return styles.statusDeclined;
      case 'completed': return styles.statusCompleted;
      case 'expired': return styles.statusExpired;
      default: return styles.statusDefault;
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB');

  const isAdmin = userTier === "Tier 4";

  if (loading) return <div className={styles.loading}>Loading schedule...</div>;

  return (
    <div className={styles.pageContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentHeaderTitle}>Equipment Schedule</h1>
        <p className={styles.contentHeaderSubtitle}>Manage and track all equipment booking requests</p>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.shell}>
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total Bookings</div>
            </div>
            <div className={`${styles.statCard} ${styles.statPending}`}>
              <div className={styles.statValue}>{stats.pending}</div>
              <div className={styles.statLabel}>Pending</div>
            </div>
            <div className={`${styles.statCard} ${styles.statConfirmed}`}>
              <div className={styles.statValue}>{stats.confirmed}</div>
              <div className={styles.statLabel}>Confirmed</div>
            </div>
            <div className={`${styles.statCard} ${styles.statDeclined}`}>
              <div className={styles.statValue}>{stats.declined}</div>
              <div className={styles.statLabel}>Declined</div>
            </div>
            <div className={`${styles.statCard} ${styles.statExpired}`}>
              <div className={styles.statValue}>{stats.expired}</div>
              <div className={styles.statLabel}>Expired</div>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controlsBar}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search by user, room, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterContainer}>
              <label>Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="declined">Declined</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            {isAdmin && (
              <button onClick={checkAndCompleteExpiredBookings} className={styles.expireBtn}>
                Complete Expired
              </button>
            )}
            <button onClick={loadSchedule} className={styles.refreshBtn}>
              Refresh
            </button>
          </div>

          {/* Bookings Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Room</th>
                  <th>Dates</th>
                  <th>Equipment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.booking_id}>
                    <td className={styles.bookingId}>#{booking.booking_id.slice(0, 8)}</td>
                    <td className={styles.userName}>{booking.user_name}</td>
                    <td className={styles.roomName}>{booking.room_name}</td>
                    <td className={styles.dates}>
                      {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                    </td>
                    <td className={styles.equipment}>
                      {booking.items && booking.items.length > 0 ? (
                        <div className={styles.equipmentList}>
                          {booking.items.slice(0, 2).map((item, idx) => (
                            <span key={idx} className={styles.equipmentTag}>
                              {item.equipment_name} x{item.quantity}
                            </span>
                          ))}
                          {booking.items.length > 2 && (
                            <span className={styles.moreTag}>+{booking.items.length - 2} more</span>
                          )}
                        </div>
                      ) : (
                        <span className={styles.noEquipment}>No equipment</span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking.booking_id, 'confirmed')}
                            disabled={updatingId === booking.booking_id}
                            className={styles.confirmBtn}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.booking_id, 'declined')}
                            disabled={updatingId === booking.booking_id}
                            className={styles.declineBtn}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => updateBookingStatus(booking.booking_id, 'declined')}
                          disabled={updatingId === booking.booking_id}
                          className={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      )}
                      {booking.status === 'declined' && (
                        <button
                          onClick={() => updateBookingStatus(booking.booking_id, 'pending')}
                          disabled={updatingId === booking.booking_id}
                          className={styles.reopenBtn}
                        >
                          Reopen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className={styles.emptyState}>
              <p>No bookings found matching your criteria.</p>
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