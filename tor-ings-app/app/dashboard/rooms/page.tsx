"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./rooms.module.css";

type Room = {
  Room_ID: number;
  Room: string;
  Type: string | null;
  Building: string | null;
  Beds: string | null;
  Plinth: string | null;
  "O2 Outlets": string | null;
  "HTC Vive 2 Headset": number | null;
  Letter: string | null;
};

type CartItem = {
  id: number;
  quantity: number;
  name: string;
  type: string | null;
  size: string | null;
  category: string | null;
};

export default function RoomsPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [availabilityStatus, setAvailabilityStatus] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Get user name
      const { data: account } = await supabase
        .from('accounts')
        .select('forename')
        .eq('user_id', session.user.id)
        .single();
      
      setUserName(account?.forename || session.user.email?.split('@')[0] || "User");

      // Load cart
      const savedCart = localStorage.getItem('cart');
      if (!savedCart || JSON.parse(savedCart).length === 0) {
        router.push("/dashboard/booking");
        return;
      }
      setCartItems(JSON.parse(savedCart));

      // Load rooms
      const { data } = await supabase
        .from('Rooms')
        .select('*')
        .order('Room', { ascending: true });
      
      if (data) {
        setRooms(data);
        setFilteredRooms(data);
        
        // Get unique room types
        const types = [...new Set(data.map(room => room.Type).filter(Boolean))] as string[];
        setRoomTypes(types);
      }
    }

    loadData();
  }, []);

  // Filter rooms when type changes
  useEffect(() => {
    if (selectedType) {
      const filtered = rooms.filter(room => room.Type === selectedType);
      setFilteredRooms(filtered);
      setSelectedRoom(null);
    } else {
      setFilteredRooms(rooms);
    }
  }, [selectedType, rooms]);

  // Check availability when dates or room changes
  useEffect(() => {
    async function checkAvailability() {
      if (!selectedRoom || !startDate || !endDate) {
        setAvailabilityStatus(null);
        return;
      }

      setCheckingAvailability(true);
      
      const { data, error } = await supabase
        .rpc('is_room_available', {
          p_room_id: selectedRoom,
          p_start_date: startDate,
          p_end_date: endDate
        });
      
      if (!error) {
        setAvailabilityStatus(data);
      } else {
        console.error("Availability check error:", error);
      }
      
      setCheckingAvailability(false);
    }

    checkAvailability();
  }, [selectedRoom, startDate, endDate]);

  // Format room display
  const formatRoomDisplay = (room: Room) => {
    const letter = room.Letter || '';
    const roomNumber = room.Room || '';
    const building = room.Building || '';
    const roomCode = letter && roomNumber ? `${letter}${roomNumber}` : roomNumber || 'Unknown';
    return `${roomCode} - ${building}`;
  };

  // Get min and max dates for date picker
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const max = new Date();
    max.setMonth(max.getMonth() + 6);
    return max.toISOString().split('T')[0];
  };

  const calculateDuration = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoom) {
      alert("Please select a room");
      return;
    }
    if (!startDate) {
      alert("Please select a start date");
      return;
    }
    if (!endDate) {
      alert("Please select an end date");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("End date must be after start date");
      return;
    }
    if (!availabilityStatus) {
      alert("Room is not available for the selected dates");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const selectedRoomData = rooms.find(r => r.Room_ID === selectedRoom);
      const roomDisplay = formatRoomDisplay(selectedRoomData!);
      const durationDays = calculateDuration();

      // Create booking with start and end dates
      const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      user_id: session.user.id,
      user_name: userName,
      room_id: selectedRoom,
      room_name: roomDisplay,
      start_date: startDate,
      end_date: endDate,
      status: 'pending'  // This should be lowercase to match the enum
    })
    .select()
    .single();

      if (bookingError) {
        console.error("Booking error details:", bookingError);
        throw bookingError;
      }

      // Create booking items
      const bookingItems = cartItems.map(item => ({
        booking_id: booking.booking_id,
        equipment_id: item.id,
        equipment_name: item.name,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('booking_items')
        .insert(bookingItems);

      if (itemsError) throw itemsError;

      // Clear cart
      localStorage.removeItem('cart');
      
      alert(`Booking confirmed for ${durationDays} days!`);
      router.push("/dashboard/orders");
      
    } catch (error) {
      console.error("Booking error:", error);
      alert(`Failed to create booking: ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const durationDays = calculateDuration();

  return (
    <div className={styles.pageContent}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentHeaderTitle}>Room Booking</h1>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.shell}>
          <div className={styles.bookingSummary}>
            <h2>Booking Summary</h2>
            <p><strong>Items to book:</strong> {cartItems.length} items</p>
            <p><strong>Total quantity:</strong> {cartItems.reduce((sum, i) => sum + i.quantity, 0)}</p>
            {durationDays > 0 && (
              <p><strong>Duration:</strong> {durationDays} day{durationDays !== 1 ? 's' : ''}</p>
            )}
          </div>

          <div className={styles.bookingDetails}>
            {/* Room Type Filter */}
            <div className={styles.formGroup}>
              <label>Filter by Room Type</label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className={styles.select}
              >
                <option value="">All Room Types</option>
                {roomTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Room Selection */}
            <div className={styles.formGroup}>
              <label>Select Room *</label>
              <select 
                value={selectedRoom ?? ''} 
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedRoom(value ? parseInt(value) : null);
                  setAvailabilityStatus(null);
                }}
                className={styles.select}
              >
                <option value="">-- Choose a room --</option>
                {filteredRooms.map(room => (
                  <option key={room.Room_ID} value={room.Room_ID}>
                    {formatRoomDisplay(room)} {room.Type ? `(${room.Type})` : ''}
                  </option>
                ))}
              </select>
              {filteredRooms.length === 0 && selectedType && (
                <p className={styles.noRooms}>No rooms found for this type</p>
              )}
            </div>

            {/* Start Date */}
            <div className={styles.formGroup}>
              <label>Start Date *</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setAvailabilityStatus(null);
                }}
                min={getMinDate()}
                max={getMaxDate()}
                className={styles.input}
              />
            </div>

            {/* End Date */}
            <div className={styles.formGroup}>
              <label>End Date *</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setAvailabilityStatus(null);
                }}
                min={startDate || getMinDate()}
                max={getMaxDate()}
                className={styles.input}
              />
            </div>

            {/* Duration Display */}
            {durationDays > 0 && (
              <div className={styles.durationDisplay}>
                <strong>Duration:</strong> {durationDays} day{durationDays !== 1 ? 's' : ''}
              </div>
            )}

            {/* Availability Status */}
            {selectedRoom && startDate && endDate && (
              <div className={styles.availabilityStatus}>
                {checkingAvailability ? (
                  <p className={styles.checking}>Checking availability...</p>
                ) : availabilityStatus === true ? (
                  <p className={styles.available}>✓ Room is available for these dates</p>
                ) : availabilityStatus === false ? (
                  <p className={styles.unavailable}>✗ Room is not available for these dates</p>
                ) : null}
              </div>
            )}

            <button 
              onClick={handleConfirmBooking}
              disabled={loading || !availabilityStatus}
              className={styles.confirmBtn}
            >
              {loading ? "Processing..." : "Confirm Booking"}
            </button>
          </div>

          {selectedRoom && (
            <div className={styles.roomDetails}>
              <h3>Room Details</h3>
              {rooms.find(r => r.Room_ID === selectedRoom)?.Type && (
                <p><strong>Type:</strong> {rooms.find(r => r.Room_ID === selectedRoom)?.Type}</p>
              )}
              {rooms.find(r => r.Room_ID === selectedRoom)?.Beds && (
                <p><strong>Beds:</strong> {rooms.find(r => r.Room_ID === selectedRoom)?.Beds}</p>
              )}
              {rooms.find(r => r.Room_ID === selectedRoom)?.Plinth && (
                <p><strong>Plinth:</strong> {rooms.find(r => r.Room_ID === selectedRoom)?.Plinth}</p>
              )}
              {rooms.find(r => r.Room_ID === selectedRoom)?.["O2 Outlets"] && (
                <p><strong>O2 Outlets:</strong> {rooms.find(r => r.Room_ID === selectedRoom)?.["O2 Outlets"]}</p>
              )}
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