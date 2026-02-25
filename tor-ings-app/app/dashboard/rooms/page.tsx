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
  const [bookingDate, setBookingDate] = useState("");
  const [duration, setDuration] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [roomTypes, setRoomTypes] = useState<string[]>([]);

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
      setSelectedRoom(null); // Reset selected room when type changes
    } else {
      setFilteredRooms(rooms);
    }
  }, [selectedType, rooms]);

  // Format room display with building letter and room number
  const formatRoomDisplay = (room: Room) => {
    const letter = room.Letter || '';
    const roomNumber = room.Room || '';
    const building = room.Building || '';
    
    // Combine letter and room number (e.g., "F100")
    const roomCode = letter && roomNumber ? `${letter}${roomNumber}` : roomNumber || 'Unknown';
    
    return `${roomCode} - ${building}${room.Type ? ` (${room.Type})` : ''}`;
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoom) {
      alert("Please select a room");
      return;
    }
    if (!bookingDate) {
      alert("Please select a booking date");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const selectedRoomData = rooms.find(r => r.Room_ID === selectedRoom);
      const roomDisplay = formatRoomDisplay(selectedRoomData!);

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: session.user.id,
          user_name: userName,
          room_id: selectedRoom,
          room_name: roomDisplay,
          booking_date: bookingDate,
          duration_days: duration,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

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
      
      alert("Booking confirmed successfully!");
      router.push("/dashboard/orders");
      
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <h1>Select a Room</h1>
            <p>Choose where you need the equipment</p>
          </div>

          <div className={styles.topActions}>
            <Link href="/dashboard/cart" className={styles.backBtn}>
              ← Back to Cart
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.shell}>
          <div className={styles.bookingSummary}>
            <h2>Booking Summary</h2>
            <p><strong>Items to book:</strong> {cartItems.length} items</p>
            <p><strong>Total quantity:</strong> {cartItems.reduce((sum, i) => sum + i.quantity, 0)}</p>
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
                }}
                className={styles.select}
              >
                <option value="">-- Choose a room --</option>
                {filteredRooms.map(room => (
                  <option key={room.Room_ID} value={room.Room_ID}>
                    {formatRoomDisplay(room)}
                  </option>
                ))}
              </select>
              {filteredRooms.length === 0 && selectedType && (
                <p className={styles.noRooms}>No rooms found for this type</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Booking Date *</label>
              <input 
                type="date" 
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Duration (days) *</label>
              <input 
                type="number" 
                min="1" 
                max="30"
                value={duration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setDuration(1);
                  } else {
                    const num = parseInt(value);
                    if (!isNaN(num) && num >= 1 && num <= 30) {
                      setDuration(num);
                    }
                  }
                }}
                className={styles.input}
              />
            </div>

            <button 
              onClick={handleConfirmBooking}
              disabled={loading}
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
      </main>

      <footer className={styles.footer}>© 2026 TOR-ingS Website</footer>
    </div>
  );
}