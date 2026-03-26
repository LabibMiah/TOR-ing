import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("tier")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tierNumber = parseInt(account.tier.split(" ")[1]);
    let query = supabaseAdmin.from("restock_requests").select("*").order("created_at", { ascending: false });

    // Tier 2 can only see their own requests
    if (tierNumber === 2) {
      query = query.eq("requested_by", user.id);
    }

    const { data: requests, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error in restock API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("tier, forename")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tierNumber = parseInt(account.tier.split(" ")[1]);
    if (tierNumber < 2) {
      return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { equipment_id, equipment_name, requested_quantity, reason } = body;

    if (!equipment_id || !equipment_name || !requested_quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure status is exactly 'pending' (lowercase)
    const insertData = {
      equipment_id,
      equipment_name,
      requested_quantity,
      reason: reason || null,
      requested_by: user.id,
      requested_by_name: account.forename || user.email?.split("@")[0] || "User",
      status: "pending", // Must be exactly 'pending'
    };

    console.log("Inserting restock request:", insertData);

    const { data, error } = await supabaseAdmin
      .from("restock_requests")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ request: data });
  } catch (error) {
    console.error("Error in restock API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("tier, forename")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!account) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tierNumber = parseInt(account.tier.split(" ")[1]);
    if (tierNumber < 3) {
      return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { request_id, status, notes } = body;

    if (!request_id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure status is exactly one of the allowed values
    const allowedStatuses = ["pending", "confirmed", "declined"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}. Must be one of: ${allowedStatuses.join(", ")}` }, { status: 400 });
    }

    const updateData = {
      status,
      notes: notes || null,
      reviewed_by: user.id,
      reviewed_by_name: account.forename || user.email?.split("@")[0] || "User",
      reviewed_at: new Date().toISOString(),
    };

    console.log("Updating restock request:", { request_id, updateData });

    const { data, error } = await supabaseAdmin
      .from("restock_requests")
      .update(updateData)
      .eq("request_id", request_id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ request: data });
  } catch (error) {
    console.error("Error in restock API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}