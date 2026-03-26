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
    const { item_type, item_id, item_name, requested_quantity, reason } = body;

    if (!item_type || !item_id || !item_name || !requested_quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }


const insertData = {
  item_type,           // 'equipment' or 'trolley'
  item_id,             // equipment_id or trolley_id
  item_name,           // equipment name or trolley name
  requested_quantity,
  reason: reason || null,
  requested_by: user.id,
  requested_by_name: account.forename || user.email?.split("@")[0] || "User",
  status: "pending",
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

    const allowedStatuses = ["pending", "confirmed", "declined"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
    }

    // First, get the request to know what item type it is
    const { data: existingRequest } = await supabaseAdmin
      .from("restock_requests")
      .select("*")
      .eq("request_id", request_id)
      .single();

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
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

    // If confirmed, update the actual item quantity
    if (status === "confirmed") {
      if (existingRequest.item_type === "equipment") {
        // Update equipment quantity
        const { error: updateError } = await supabaseAdmin
          .from("Equipment")
          .update({ 
            Quantity: supabaseAdmin.rpc('increment', { row_id: existingRequest.item_id, amount: existingRequest.requested_quantity })
          })
          .eq("Equipment_ID", existingRequest.item_id);
        
        if (updateError) {
          console.error("Error updating equipment:", updateError);
        }
      } else if (existingRequest.item_type === "trolley") {
        // Update trolley quantity
        const { error: updateError } = await supabaseAdmin
          .from("Trolleys")
          .update({ 
            quantity: supabaseAdmin.rpc('increment', { row_id: existingRequest.item_id, amount: existingRequest.requested_quantity })
          })
          .eq("trolley_id", existingRequest.item_id);
        
        if (updateError) {
          console.error("Error updating trolley:", updateError);
        }
      }
    }

    return NextResponse.json({ request: data });
  } catch (error) {
    console.error("Error in restock API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}