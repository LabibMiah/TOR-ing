import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user has access (Tier 2 or above)
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('tier')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (!account) {
      return NextResponse.json({ error: 'Forbidden - Access required' }, { status: 403 })
    }
    
    const tierNumber = parseInt(account.tier.split(' ')[1])
    if (tierNumber < 2) {
      return NextResponse.json({ error: 'Forbidden - Access required' }, { status: 403 })
    }
    
    // Get filter parameters
    const filter = request.nextUrl.searchParams.get('filter') || 'all'
    const searchTerm = request.nextUrl.searchParams.get('search') || ''
    const isExport = request.nextUrl.searchParams.get('export') === 'csv'
    
    // Fetch all bookings with items
    const { data: bookingsData, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        items:booking_items (
          equipment_name,
          quantity,
          equipment_id
        )
      `)
      .order('created_at', { ascending: false })
    
    if (bookingsError) {
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }
    
    // Apply filters
    let filteredBookings = bookingsData || []
    
    if (filter !== 'all') {
      filteredBookings = filteredBookings.filter((booking: any) => booking.status === filter)
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredBookings = filteredBookings.filter((booking: any) => {
        const userName = booking.user_name?.toLowerCase() || ''
        const roomName = booking.room_name?.toLowerCase() || ''
        const bookingId = booking.booking_id.toLowerCase()
        return userName.includes(term) || roomName.includes(term) || bookingId.includes(term)
      })
    }
    
    // Format bookings for response
    const formattedBookings = filteredBookings.map((booking: any) => ({
      booking_id: booking.booking_id,
      user_name: booking.user_name,
      room_name: booking.room_name,
      start_date: booking.start_date,
      end_date: booking.end_date,
      status: booking.status,
      created_at: booking.created_at,
      items: booking.items || []
    }))
    
    // Check if this is a CSV export request
    if (isExport) {
      // Generate CSV
      const csvHeaders = ['Booking ID', 'User', 'Room', 'Start Date', 'End Date', 'Status', 'Equipment', 'Quantity', 'Created At']
      const csvRows: string[][] = []
      
      formattedBookings.forEach((booking: any) => {
        if (booking.items && booking.items.length > 0) {
          booking.items.forEach((item: any) => {
            csvRows.push([
              booking.booking_id.slice(0, 8),
              booking.user_name,
              booking.room_name,
              new Date(booking.start_date).toLocaleDateString('en-GB'),
              new Date(booking.end_date).toLocaleDateString('en-GB'),
              booking.status,
              item.equipment_name,
              item.quantity.toString(),
              new Date(booking.created_at).toLocaleDateString('en-GB')
            ])
          })
        } else {
          csvRows.push([
            booking.booking_id.slice(0, 8),
            booking.user_name,
            booking.room_name,
            new Date(booking.start_date).toLocaleDateString('en-GB'),
            new Date(booking.end_date).toLocaleDateString('en-GB'),
            booking.status,
            'No equipment',
            '0',
            new Date(booking.created_at).toLocaleDateString('en-GB')
          ])
        }
      })
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')
      
      const filterText = filter !== 'all' ? `_${filter}` : ''
      const searchText = searchTerm ? `_search` : ''
      const filename = `schedule_export${filterText}${searchText}_${new Date().toISOString().split('T')[0]}.csv`
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      })
    }
    
    return NextResponse.json({ bookings: formattedBookings })
    
  } catch (error) {
    console.error('Error in schedule API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}