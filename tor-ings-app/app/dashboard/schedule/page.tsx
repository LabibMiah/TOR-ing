"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./schedule.module.css";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "completed"
  | "expired";

type BookingItem = {
  equipment_name: string;
  quantity: number;
  equipment_id: number;
};

type Room = {
  Room_ID: number;
  Room: string;
  Type: string | null;
  Building: string | null;
  Letter: string | null;
};

type Booking = {
  booking_id: string;
  user_id: string;
  user_name: string;
  room_id: number;
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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userTier, setUserTier] = useState("");
  
  // Edit modal state
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editRoomId, setEditRoomId] = useState<number>(0);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editDateError, setEditDateError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    async function checkAccessAndLoad() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: account } = await supabase
        .from("accounts")
        .select("tier")
        .eq("user_id", user.id)
        .single();

      if (!account) {
        router.push("/dashboard");
        return;
      }

      setUserTier(account.tier);

      const tierNumber = parseInt(account.tier.split(" ")[1]);
      if (tierNumber < 2) {
        router.push("/dashboard");
        return;
      }

      await loadSchedule();
      await loadRooms();
    }
    checkAccessAndLoad();
  }, []);

  const loadRooms = async () => {
    const { data } = await supabase
      .from("Rooms")
      .select("Room_ID, Room, Type, Building, Letter")
      .order("Room", { ascending: true });
    
    if (data) {
      setRooms(data);
    }
  };

  const loadSchedule = async () => {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Please log in again");
      }

      const response = await fetch("/api/schedule", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load schedule");
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error loading schedule:", error);
      alert(error instanceof Error ? error.message : "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = useCallback(async () => {
    setExporting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Please log in again");
      }

      const url = `/api/schedule?export=csv&filter=${filter}&search=${encodeURIComponent(searchTerm)}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export schedule");
      }

      const blob = await response.blob();
      const url_blob = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url_blob;

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `schedule_export_${new Date().toISOString().split("T")[0]}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url_blob);
    } catch (error) {
      console.error("Error exporting schedule:", error);
      alert("Failed to export schedule");
    } finally {
      setExporting(false);
    }
  }, [filter, searchTerm]);

  const updateBookingStatus = async (
    bookingId: string,
    newStatus: BookingStatus,
  ) => {
    setUpdatingId(bookingId);

    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("booking_id", bookingId);

    if (!error) {
      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === bookingId ? { ...b, status: newStatus } : b,
        ),
      );
      alert(`Booking status updated to ${newStatus}`);
    } else {
      console.error("Error updating status:", error);
      alert("Failed to update booking status");
    }

    setUpdatingId(null);
  };

  const checkAndCompleteExpiredBookings = async () => {
    try {
      const { data, error } = await supabase.rpc("check_all_bookings");
      if (error) throw error;
      alert(data || "Checked and completed expired bookings");
      await loadSchedule();
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to complete expired bookings");
    }
  };

  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    setEditRoomId(booking.room_id);
    setEditStartDate(booking.start_date);
    setEditEndDate(booking.end_date);
    setEditDateError("");
  };

  const closeEditModal = () => {
    setEditingBooking(null);
    setEditRoomId(0);
    setEditStartDate("");
    setEditEndDate("");
    setEditDateError("");
  };

  const validateEditDates = (start: string, end: string): boolean => {
    if (start && end) {
      if (new Date(start) > new Date(end)) {
        setEditDateError("Start date cannot be after end date");
        return false;
      }
      setEditDateError("");
      return true;
    }
    return true;
  };

  const handleEditStartDateChange = (value: string) => {
    setEditStartDate(value);
    if (editEndDate) {
      validateEditDates(value, editEndDate);
    }
  };

  const handleEditEndDateChange = (value: string) => {
    setEditEndDate(value);
    if (editStartDate) {
      validateEditDates(editStartDate, value);
    }
  };

  const saveBookingEdit = async () => {
  if (!editingBooking) return;
  
  if (editDateError) {
    alert("Please fix the date issue before saving");
    return;
  }
  
  if (!editStartDate || !editEndDate) {
    alert("Please select both start and end dates");
    return;
  }

  setSavingEdit(true);

  try {
    // Find the selected room with all its details
    const selectedRoom = rooms.find(r => r.Room_ID === editRoomId);
    
    if (!selectedRoom) {
      alert("Selected room not found");
      return;
    }
    
    // Format the full room name with building and type
    const letter = selectedRoom.Letter || '';
    const roomNumber = selectedRoom.Room || '';
    const building = selectedRoom.Building || '';
    const roomCode = letter && roomNumber ? `${letter}${roomNumber}` : roomNumber || 'Unknown';
    const fullRoomName = `${roomCode} - ${building}${selectedRoom.Type ? ` (${selectedRoom.Type})` : ''}`;
    
    // If the booking was confirmed, set it back to pending after edit
    const newStatus = editingBooking.status === "confirmed" ? "pending" : editingBooking.status;
    
    const { error } = await supabase
      .from("bookings")
      .update({
        room_id: editRoomId,
        room_name: fullRoomName,
        start_date: editStartDate,
        end_date: editEndDate,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("booking_id", editingBooking.booking_id);

    if (error) throw error;

    const message = editingBooking.status === "confirmed" 
      ? "Booking updated and set back to pending for re-confirmation"
      : "Booking updated successfully";
    
    alert(message);
    await loadSchedule();
    closeEditModal();
  } catch (error) {
    console.error("Error updating booking:", error);
    alert("Failed to update booking");
  } finally {
    setSavingEdit(false);
  }
};

  const formatRoomDisplay = (room: Room) => {
    const letter = room.Letter || '';
    const roomNumber = room.Room || '';
    const building = room.Building || '';
    const roomCode = letter && roomNumber ? `${letter}${roomNumber}` : roomNumber || 'Unknown';
    return `${roomCode} - ${building}`;
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
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

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      declined: bookings.filter((b) => b.status === "declined").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      expired: bookings.filter((b) => b.status === "expired").length,
    }),
    [bookings],
  );

  const getStatusBadgeClass = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return styles.statusConfirmed;
      case "pending":
        return styles.statusPending;
      case "declined":
        return styles.statusDeclined;
      case "completed":
        return styles.statusCompleted;
      case "expired":
        return styles.statusExpired;
      default:
        return styles.statusDefault;
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB");

  const isAdmin = userTier === "Tier 4";
  const canEdit = userTier === "Tier 3" || userTier === "Tier 4";

  // Determine if edit button should be shown
  const shouldShowEdit = (status: BookingStatus): boolean => {
    return canEdit && (status === "pending" || status === "confirmed");
  };

  if (loading) return <div className={styles.loading}>Loading schedule...</div>;

  return (
    <div className={styles.pageContent}>
      <div className={styles.contentHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.contentHeaderTitle}>Equipment Schedule</h1>
          <div className={styles.headerButtons}></div>
        </div>
        <p className={styles.contentHeaderSubtitle}>
          Manage and track all equipment booking requests
        </p>
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
                <option value="expired">Expired</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className={styles.rightControls}>
              {isAdmin && (
                <button
                  onClick={checkAndCompleteExpiredBookings}
                  className={styles.expireBtn}
                >
                  Complete Expired
                </button>
              )}
              <button onClick={loadSchedule} className={styles.refreshBtn}>
                Refresh
              </button>
              <button
                onClick={exportToCSV}
                disabled={exporting || bookings.length === 0}
                className={styles.exportBtn}
              >
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>
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
                    <td className={styles.bookingId}>
                      #{booking.booking_id.slice(0, 8)}
                    </td>
                    <td className={styles.userName}>{booking.user_name}</td>
                    <td className={styles.roomName}>{booking.room_name}</td>
                    <td className={styles.dates}>
                      {formatDate(booking.start_date)} -{" "}
                      {formatDate(booking.end_date)}
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
                            <span className={styles.moreTag}>
                              +{booking.items.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className={styles.noEquipment}>No equipment</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${getStatusBadgeClass(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              updateBookingStatus(
                                booking.booking_id,
                                "confirmed",
                              )
                            }
                            disabled={updatingId === booking.booking_id}
                            className={styles.confirmBtn}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() =>
                              updateBookingStatus(
                                booking.booking_id,
                                "declined",
                              )
                            }
                            disabled={updatingId === booking.booking_id}
                            className={styles.declineBtn}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <>
                          <button
                            onClick={() =>
                              updateBookingStatus(booking.booking_id, "declined")
                            }
                            disabled={updatingId === booking.booking_id}
                            className={styles.cancelBtn}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === "declined" && (
                        <button
                          onClick={() =>
                            updateBookingStatus(booking.booking_id, "pending")
                          }
                          disabled={updatingId === booking.booking_id}
                          className={styles.reopenBtn}
                        >
                          Reopen
                        </button>
                      )}
                      {shouldShowEdit(booking.status) && (
                        <button
                          onClick={() => openEditModal(booking)}
                          className={styles.editBtn}
                        >
                          Edit
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

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Booking</h2>
              <button className={styles.modalClose} onClick={closeEditModal}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                <strong>User:</strong> {editingBooking.user_name}
              </p>
              <p>
                <strong>Current Status:</strong> {editingBooking.status}
              </p>
              {editingBooking.status === "confirmed" && (
                <p className={styles.warningNote}>
                  ! Editing a confirmed booking will set it back to pending for re-approval
                </p>
              )}

              <div className={styles.formGroup}>
                <label>Room *</label>
                <select
                  value={editRoomId}
                  onChange={(e) => setEditRoomId(parseInt(e.target.value))}
                  className={styles.select}
                >
                  {rooms.map((room) => (
                    <option key={room.Room_ID} value={room.Room_ID}>
                      {formatRoomDisplay(room)} {room.Type ? `(${room.Type})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Start Date *</label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => handleEditStartDateChange(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>End Date *</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => handleEditEndDateChange(e.target.value)}
                  className={styles.input}
                />
              </div>

              {editDateError && (
                <div className={styles.dateError}>
                  ! {editDateError}
                </div>
              )}

              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelBtn}
                  onClick={closeEditModal}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  className={styles.saveBtn}
                  onClick={saveBookingEdit}
                  disabled={savingEdit || !!editDateError}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <p>© 2026 TORS Health Equipment - Sheffield Hallam University</p>
      </footer>
    </div>
  );
}