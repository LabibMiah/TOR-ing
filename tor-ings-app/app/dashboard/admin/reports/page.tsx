"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import styles from "./reports.module.css";

type Booking = {
  booking_id: string;
  user_id: string;
  user_name: string;
  room_name: string;
  room_id: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  items: BookingItem[];
};

type BookingItem = {
  equipment_name: string;
  quantity: number;
  equipment_id: number;
};

type UserStats = {
  user_id: string;
  user_name: string;
  total_bookings: number;
  confirmed_bookings: number;
  pending_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_items: number;
};

type RoomStats = {
  room_name: string;
  room_id: number;
  total_bookings: number;
  total_days: number;
  confirmed_bookings: number;
};

type EquipmentStats = {
  equipment_name: string;
  equipment_id: number;
  total_quantity: number;
  times_ordered: number;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export default function ReportsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");

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

      if (tierNumber < 3) {
        router.push("/dashboard");
        return;
      }

      await loadData();
    }
    checkAccessAndLoad();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/schedule', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    if (selectedPeriod === "all") return bookings;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (selectedPeriod) {
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return bookings;
    }
    
    return bookings.filter(b => new Date(b.created_at) >= filterDate);
  }, [bookings, selectedPeriod]);

  const userStats = useMemo(() => {
    const statsMap = new Map<string, UserStats>();
    
    filteredBookings.forEach(booking => {
      if (!statsMap.has(booking.user_id)) {
        statsMap.set(booking.user_id, {
          user_id: booking.user_id,
          user_name: booking.user_name,
          total_bookings: 0,
          confirmed_bookings: 0,
          pending_bookings: 0,
          completed_bookings: 0,
          cancelled_bookings: 0,
          total_items: 0,
        });
      }
      
      const stats = statsMap.get(booking.user_id)!;
      stats.total_bookings++;
      
      switch (booking.status) {
        case 'confirmed':
          stats.confirmed_bookings++;
          break;
        case 'pending':
          stats.pending_bookings++;
          break;
        case 'completed':
          stats.completed_bookings++;
          break;
        case 'declined':
          stats.cancelled_bookings++;
          break;
      }
      
      booking.items.forEach(item => {
        stats.total_items += item.quantity;
      });
    });
    
    return Array.from(statsMap.values()).sort((a, b) => b.total_bookings - a.total_bookings);
  }, [filteredBookings]);

  const roomStats = useMemo(() => {
    const statsMap = new Map<number, RoomStats>();
    
    filteredBookings.forEach(booking => {
      if (!statsMap.has(booking.room_id)) {
        statsMap.set(booking.room_id, {
          room_name: booking.room_name,
          room_id: booking.room_id,
          total_bookings: 0,
          total_days: 0,
          confirmed_bookings: 0,
        });
      }
      
      const stats = statsMap.get(booking.room_id)!;
      stats.total_bookings++;
      
      if (booking.status === 'confirmed') {
        stats.confirmed_bookings++;
      }
      
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      stats.total_days += days;
    });
    
    return Array.from(statsMap.values()).sort((a, b) => b.total_bookings - a.total_bookings);
  }, [filteredBookings]);

  const equipmentStats = useMemo(() => {
    const statsMap = new Map<string, EquipmentStats>();
    
    filteredBookings.forEach(booking => {
      booking.items.forEach(item => {
        if (!statsMap.has(item.equipment_name)) {
          statsMap.set(item.equipment_name, {
            equipment_name: item.equipment_name,
            equipment_id: item.equipment_id,
            total_quantity: 0,
            times_ordered: 0,
          });
        }
        
        const stats = statsMap.get(item.equipment_name)!;
        stats.total_quantity += item.quantity;
        stats.times_ordered++;
      });
    });
    
    return Array.from(statsMap.values())
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 10);
  }, [filteredBookings]);

  const userBookingData = useMemo(() => {
    const topUsers = userStats.slice(0, 8);
    const others = userStats.slice(8);
    const othersTotal = others.reduce((sum, u) => sum + u.total_bookings, 0);
    
    const data = topUsers.map(u => ({
      name: u.user_name,
      value: u.total_bookings,
      user_id: u.user_id,
    }));
    
    if (othersTotal > 0) {
      data.push({ name: 'Others', value: othersTotal, user_id: 'others' });
    }
    
    return data;
  }, [userStats]);

  const statusData = useMemo(() => {
    const statusCount = {
      confirmed: 0,
      pending: 0,
      completed: 0,
      declined: 0,
    };
    
    filteredBookings.forEach(booking => {
      switch (booking.status) {
        case 'confirmed':
          statusCount.confirmed++;
          break;
        case 'pending':
          statusCount.pending++;
          break;
        case 'completed':
          statusCount.completed++;
          break;
        case 'declined':
          statusCount.declined++;
          break;
      }
    });
    
    return [
      { name: 'Confirmed', value: statusCount.confirmed, color: '#10b981' },
      { name: 'Pending', value: statusCount.pending, color: '#f59e0b' },
      { name: 'Completed', value: statusCount.completed, color: '#3b82f6' },
      { name: 'Declined', value: statusCount.declined, color: '#ef4444' },
    ].filter(s => s.value > 0);
  }, [filteredBookings]);

  const monthlyTrends = useMemo(() => {
    const trends = new Map<string, { month: string; count: number; confirmed: number }>();
    
    filteredBookings.forEach(booking => {
      const date = new Date(booking.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      
      if (!trends.has(monthKey)) {
        trends.set(monthKey, { month: monthName, count: 0, confirmed: 0 });
      }
      
      const trend = trends.get(monthKey)!;
      trend.count++;
      if (booking.status === 'confirmed') {
        trend.confirmed++;
      }
    });
    
    return Array.from(trends.values()).sort((a, b) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
  }, [filteredBookings]);

  interface TooltipPayload {
    name: string;
    value: number;
  }

  interface TooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
  }

  interface PieTooltipPayload {
    payload: {
      name: string;
      value: number;
      user_id?: string;
    };
  }

  interface PieTooltipProps {
    active?: boolean;
    payload?: PieTooltipPayload[];
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          {payload.map((p: TooltipPayload, idx: number) => (
            <p key={idx} className={styles.tooltipValue}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: PieTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{data.name}</p>
          <p className={styles.tooltipValue}>Bookings: {data.value}</p>
          {data.user_id !== 'others' && (
            <p className={styles.tooltipSubtext}>Click to view details</p>
          )}
        </div>
      );
    }
    return null;
  };

  const handlePieClick = (data: { user_id?: string; name?: string; value: number }, _index: number, _event: React.MouseEvent) => {
    if (data.user_id && data.user_id !== 'others') {
      const user = userStats.find(u => u.user_id === data.user_id);
      if (user) {
        alert(`${user.user_name}\nTotal Bookings: ${user.total_bookings}\nConfirmed: ${user.confirmed_bookings}\nPending: ${user.pending_bookings}\nCompleted: ${user.completed_bookings}\nItems Ordered: ${user.total_items}`);
      }
    }
  };

  const isAdmin = userTier === "Tier 4";

  if (loading) return <div className={styles.loading}>Loading reports...</div>;

  return (
    <div className={styles.pageContent}>
      <div className={styles.contentHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.contentHeaderTitle}>Analytics & Reports</h1>
          <div className={styles.headerButtons}>
            <Link href="/dashboard/admin" className={styles.backToAdminBtn}>
              ← Back to Admin Panel
            </Link>
          </div>
        </div>
        <p className={styles.contentHeaderSubtitle}>Equipment booking analytics and insights</p>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.shell}>
          {/* Period Filter */}
          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              <label>Time Period:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className={styles.periodSelect}
              >
                <option value="all">All Time</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            <div className={styles.statsSummary}>
              <span>Total Bookings: {filteredBookings.length}</span>
              <span>Active Users: {userStats.length}</span>
              <span>Rooms Used: {roomStats.length}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{filteredBookings.length}</div>
              <div className={styles.statLabel}>Total Bookings</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {filteredBookings.filter(b => b.status === 'confirmed').length}
              </div>
              <div className={styles.statLabel}>Confirmed Bookings</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                {filteredBookings.reduce((sum, b) => sum + b.items.reduce((s, i) => s + i.quantity, 0), 0)}
              </div>
              <div className={styles.statLabel}>Total Items Ordered</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{userStats.length}</div>
              <div className={styles.statLabel}>Active Users</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className={styles.chartsRow}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Bookings by User</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userBookingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={handlePieClick}
                      cursor="pointer"
                    >
                      {userBookingData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className={styles.chartNote}>Click on a segment to see user details</p>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Booking Status Distribution</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Monthly Trends Line Chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Booking Trends Over Time</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" name="Total Bookings" />
                  <Line type="monotone" dataKey="confirmed" stroke="#82ca9d" name="Confirmed Bookings" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

         {/* Most Ordered Equipment Bar Chart - FIXED SPACING */}
<div className={styles.chartCard}>
  <h3 className={styles.chartTitle}>Top 10 Most Ordered Equipment</h3>
  <div className={styles.chartContainer} style={{ height: '500px', minHeight: '500px' }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={equipmentStats}
        layout="vertical"
        margin={{ 
          top: 20, 
          right: 30, 
          left: 140,  // Increased left margin for longer equipment names
          bottom: 20 
        }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis 
          type="number" 
          tick={{ fontSize: 12 }}
          label={{ value: 'Quantity / Times Ordered', position: 'bottom', offset: 10 }}
        />
        <YAxis 
          type="category" 
          dataKey="equipment_name" 
          width={130}
          tick={{ 
            fontSize: 12, 
            fontWeight: 500,
            fill: '#374151'
          }}
          interval={0}
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
        />
        <Legend 
          verticalAlign="top" 
          height={36}
          wrapperStyle={{ paddingBottom: '10px' }}
        />
        <Bar 
          dataKey="total_quantity" 
          fill="#8884d8" 
          name="Total Quantity"
          radius={[0, 4, 4, 0]}
          barSize={20}
        />
        <Bar 
          dataKey="times_ordered" 
          fill="#82ca9d" 
          name="Times Ordered"
          radius={[0, 4, 4, 0]}
          barSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
  <p className={styles.chartNote}>
    Equipment ranked by total quantity ordered. Hover over bars to see exact numbers.
  </p>
</div>

          {/* Most Used Rooms */}
          <div className={styles.tableCard}>
            <h3 className={styles.chartTitle}>Most Used Rooms</h3>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Total Bookings</th>
                    <th>Confirmed Bookings</th>
                    <th>Total Days Used</th>
                    </tr>
                  </thead>
                <tbody>
                  {roomStats.slice(0, 10).map((room) => (
                    <tr key={`room-${room.room_id}`}>
                      <td className={styles.roomCell}>{room.room_name}</td>
                      <td>{room.total_bookings}</td>
                      <td>{room.confirmed_bookings}</td>
                      <td>{room.total_days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Users Table */}
          <div className={styles.tableCard}>
            <h3 className={styles.chartTitle}>Top Active Users</h3>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Total Bookings</th>
                    <th>Confirmed</th>
                    <th>Pending</th>
                    <th>Completed</th>
                    <th>Items Ordered</th>
                    </tr>
                  </thead>
                <tbody>
                  {userStats.slice(0, 10).map((user) => (
                    <tr key={`user-${user.user_id}`}>
                      <td className={styles.userCell}>{user.user_name}</td>
                      <td>{user.total_bookings}</td>
                      <td>{user.confirmed_bookings}</td>
                      <td>{user.pending_bookings}</td>
                      <td>{user.completed_bookings}</td>
                      <td>{user.total_items}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2026 TORS Health Equipment - Sheffield Hallam University</p>
      </footer>
    </div>
  );
}