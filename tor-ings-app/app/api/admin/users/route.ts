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
    
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (!account || account.tier !== 'Tier 4') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }
    
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
    
    const { data: accountsData, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('*')
    
    const accountsMap = new Map()
    accountsData?.forEach((account: any) => {
      accountsMap.set(account.user_id, account)
    })
    
    const allUsers = authUsers.map((authUser: any) => {
      const account = accountsMap.get(authUser.id)
      return {
        user_id: authUser.id,
        email: authUser.email,
        tier: account?.tier || 'Tier 1',
        forename: account?.forename || null,
        account_type: account?.account_type || 'Students',
        created_at: authUser.created_at || account?.created_at || new Date().toISOString(),
      }
    })
    
    allUsers.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    
    return NextResponse.json({ users: allUsers })
    
  } catch (error) {
    console.error('Error in admin users API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newPassword, newTier } = body
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: adminAccount, error: adminError } = await supabaseAdmin
      .from('accounts')
      .select('tier')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (!adminAccount || adminAccount.tier !== 'Tier 4') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }
    
    // Update password if provided
    if (newPassword) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      )
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }
    
    // Update tier if provided
    if (newTier) {
      const { error: updateError } = await supabaseAdmin
        .from('accounts')
        .update({ tier: newTier })
        .eq('user_id', userId)
      
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error in admin users API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}