"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DatePicker from "react-datepicker";
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

type TrolleyItem = {
  trolleyitem_id: number;
  contents: string;
  weight: string | null;
  colour: string | null;
  name: string;
};

type CartItem = {
  id: number;
  quantity: number;
  name: string;
  type: string | null;
  size: string | null;
  category: string | null;
  isTrolley?: boolean;
  trolleyItems?: TrolleyItem[];
};

type BookedDate = {
  start_date: string;
  end_date: string;
};

const MAX_BOOKING_DAYS = 5;

export default function RoomsPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [dateError, setDateError] = useState<string>("");
  const [durationError, setDurationError] = useState<string>("");
  const [bookedRanges, setBookedRanges] = useState<Map<number, BookedDate[]>>(new Map());
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
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

      const { data: account } = await supabase
        .from('accounts')
        .select('forename')
        .eq('user_id', session.user.id)
        .single();
      
      setUserName(account?.forename || session.user.email?.split('@')[0] || "User");

      const savedCart = localStorage.getItem('cart');
      if (!savedCart || JSON.parse(savedCart).length === 0) {
        router.push("/dashboard/booking");
        return;
      }
      setCartItems(JSON.parse(savedCart));

      const { data } = await supabase
        .from('Rooms')
        .select('*')
        .order('Room', { ascending: true });
      
      if (data) {
        setRooms(data);
        setFilteredRooms(data);
        
        const types = [...new Set(data.map(room => room.Type).filter(Boolean))] as string[];
        setRoomTypes(types);
      }

      // Load all confirmed and pending bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('room_id, start_date, end_date')
        .in('status', ['confirmed', 'pending']);
      
      if (bookings) {
        const bookedMap = new Map<number, BookedDate[]>();
        bookings.forEach((booking: any) => {
          if (!bookedMap.has(booking.room_id)) {
            bookedMap.set(booking.room_id, []);
          }
          bookedMap.get(booking.room_id)!.push({
            start_date: booking.start_date,
            end_date: booking.end_date,
          });
        });
        setBookedRanges(bookedMap);
        console.log("Loaded bookings:", bookedMap);
      }
    }

    loadData();
  }, []);

  // Update unavailable dates when selected room changes
  useEffect(() => {
    if (!selectedRoom) {
      setUnavailableDates(new Set());
      return;
    }
    
    const roomBookings = bookedRanges.get(selectedRoom) || [];
    console.log(`Room ${selectedRoom} has ${roomBookings.length} booking ranges:`, roomBookings);
    
    const unavailable = new Set<string>();
    
    roomBookings.forEach(booking => {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      
      console.log(`Adding dates from ${booking.start_date} to ${booking.end_date}`);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        unavailable.add(dateStr);
        console.log(`  Added: ${dateStr}`);
      }
    });
    
    console.log(`Total unavailable dates for room ${selectedRoom}: ${unavailable.size}`);
    console.log("Unavailable dates:", Array.from(unavailable));
    setUnavailableDates(unavailable);
  }, [selectedRoom, bookedRanges]);

  // Filter rooms when type changes
  useEffect(() => {
    if (selectedType) {
      const filtered = rooms.filter(room => room.Type === selectedType);
      setFilteredRooms(filtered);
      setSelectedRoom(null);
      setStartDate(null);
      setEndDate(null);
      setAvailabilityStatus(null);
    } else {
      setFilteredRooms(rooms);
    }
  }, [selectedType, rooms]);

  // Validate dates and duration whenever they change
  useEffect(() => {
    setDateError("");
    setDurationError("");
    
    if (startDate && endDate) {
      if (startDate > endDate) {
        setDateError("Start date cannot be after end date");
      }
      
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays > MAX_BOOKING_DAYS) {
        setDurationError(`Maximum booking duration is ${MAX_BOOKING_DAYS} days (you selected ${diffDays} days)`);
      }
    }
  }, [startDate, endDate]);

  // Check availability when dates or room changes
  useEffect(() => {
    async function checkAvailability() {
      if (!selectedRoom || !startDate || !endDate || dateError || durationError) {
        setAvailabilityStatus(null);
        return;
      }

      setCheckingAvailability(true);
      
      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .rpc('is_room_available', {
          p_room_id: selectedRoom,
          p_start_date: start,
          p_end_date: end
        });
      
      if (!error) {
        setAvailabilityStatus(data);
      } else {
        console.error("Availability check error:", error);
      }
      
      setCheckingAvailability(false);
    }

    checkAvailability();
  }, [selectedRoom, startDate, endDate, dateError, durationError]);

  // Filter function for date picker - disables booked dates
  const isDateDisabled = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    const isDisabled = unavailableDates.has(dateStr);
    if (isDisabled && selectedRoom) {
      console.log(`Date ${dateStr} is DISABLED for room ${selectedRoom}`);
    }
    return isDisabled;
  };

  const filterStartDate = (date: Date): boolean => {
    const disabled = isDateDisabled(date);
    return !disabled;
  };

  const filterEndDate = (date: Date): boolean => {
    if (!startDate) return filterStartDate(date);
    if (date < startDate) return false;
    
    const diffTime = Math.abs(date.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > MAX_BOOKING_DAYS) return false;
    
    const disabled = isDateDisabled(date);
    return !disabled;
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setEndDate(null);
    setAvailabilityStatus(null);
  };

  const formatRoomDisplay = (room: Room) => {
    const letter = room.Letter || '';
    const roomNumber = room.Room || '';
    const building = room.Building || '';
    const roomCode = letter && roomNumber ? `${letter}${roomNumber}` : roomNumber || 'Unknown';
    return `${roomCode} - ${building}`;
  };

  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getMaxDate = () => {
    const max = new Date();
    max.setMonth(max.getMonth() + 6);
    return max;
  };

  const durationDays = useMemo(() => {
    if (startDate && endDate && !dateError) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  }, [startDate, endDate, dateError]);

  const handleConfirmBooking = async () => {
    if (!selectedRoom) {
      alert("Please select a room");
      return;
    }
    if (!startDate || !endDate) {
      alert("Please select dates");
      return;
    }
    
    if (dateError) {
      alert(dateError);
      return;
    }
    
    if (durationError) {
      alert(durationError);
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
      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: session.user.id,
          user_name: userName,
          room_id: selectedRoom,
          room_name: roomDisplay,
          start_date: start,
          end_date: end,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create booking items - handle both equipment and trolleys
      const bookingItems = [
        ...cartItems.filter(item => !item.isTrolley).map(item => ({
          booking_id: booking.booking_id,
          equipment_id: item.id,
          equipment_name: item.name,
          quantity: item.quantity
        })),
        ...cartItems.filter(item => item.isTrolley).map(item => ({
          booking_id: booking.booking_id,
          equipment_id: item.id,
          equipment_name: `${item.name} (Trolley)`,
          quantity: item.quantity
        }))
      ];

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

  const isFormValid = selectedRoom && startDate && endDate && !dateError && !durationError && availabilityStatus === true;

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
            <p className={styles.limitInfo}>⚠️ Maximum booking: {MAX_BOOKING_DAYS} days</p>
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
                  setStartDate(null);
                  setEndDate(null);
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
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                minDate={getMinDate()}
                maxDate={getMaxDate()}
                filterDate={filterStartDate}
                placeholderText="Select start date"
                className={styles.datePicker}
                dateFormat="dd/MM/yyyy"
              />
              {selectedRoom && unavailableDates.size > 0 && (
                <div className={styles.bookedInfo}>
                  <span className={styles.bookedIcon}>📅</span>
                  <span>This room has {unavailableDates.size} unavailable date(s) (grayed out in calendar)</span>
                </div>
              )}
            </div>

            {/* End Date */}
            <div className={styles.formGroup}>
              <label>End Date *</label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || getMinDate()}
                maxDate={getMaxDate()}
                filterDate={filterEndDate}
                placeholderText="Select end date"
                className={styles.datePicker}
                dateFormat="dd/MM/yyyy"
                disabled={!startDate}
              />
            </div>

            {/* Date Error Message */}
            {dateError && (
              <div className={styles.dateError}>
                ⚠️ {dateError}
              </div>
            )}

            {/* Duration Error Message */}
            {durationError && (
              <div className={styles.durationError}>
                ⚠️ {durationError}
              </div>
            )}

            {/* Duration Display */}
            {durationDays > 0 && !dateError && !durationError && (
              <div className={styles.durationDisplay}>
                <strong>Duration:</strong> {durationDays} day{durationDays !== 1 ? 's' : ''}
              </div>
            )}

            {/* Availability Status */}
            {selectedRoom && startDate && endDate && !dateError && !durationError && (
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
              disabled={loading || !isFormValid}
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