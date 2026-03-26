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
    const { item_type, item_id, item_name, requested_quantity, reason, new_item_details } = body;

    if (!item_type || !requested_quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Handle new item requests differently
    if (item_type === "new_item") {
      // Format the new item details for storage
      const newItemInfo = new_item_details ? {
        name: item_name,
        category: new_item_details.category || null,
        type: new_item_details.type || null,
        size: new_item_details.size || null,
        quantity: requested_quantity,
        reason: reason,
        requested_by: account.forename || user.email?.split("@")[0] || "User"
      } : null;

      const insertData = {
        item_type: "new_item",
        item_id: null, // Null for new items
        item_name: item_name,
        requested_quantity: requested_quantity,
        reason: reason || null,
        requested_by: user.id,
        requested_by_name: account.forename || user.email?.split("@")[0] || "User",
        status: "pending",
        notes: newItemInfo ? JSON.stringify(newItemInfo) : null, // Store all details in notes
      };

      console.log("Inserting new item request:", insertData);

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
    }

    // Regular equipment or trolley requests
    if (!item_id || !item_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const insertData = {
      item_type,
      item_id,
      item_name,
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

    // If confirming a new item request, create the equipment
    if (status === "confirmed" && existingRequest.item_type === "new_item") {
      // Parse the new item details from notes
      let newItemDetails = {};
      try {
        newItemDetails = JSON.parse(existingRequest.notes || "{}");
      } catch (e) {
        console.error("Error parsing new item details:", e);
      }
      
      // Create the new equipment in the Equipment table
      const { data: newEquipment, error: createError } = await supabaseAdmin
        .from("Equipment")
        .insert({
          Name: existingRequest.item_name,
          Equipment_Catagory: newItemDetails.category || null,
          Type: newItemDetails.type || null,
          Size: newItemDetails.size || null,
          Quantity: existingRequest.requested_quantity,
        })
        .select()
        .single();
      
      if (createError) {
        console.error("Error creating new equipment:", createError);
        return NextResponse.json({ error: "Failed to create equipment: " + createError.message }, { status: 500 });
      }
      
      console.log("Created new equipment:", newEquipment);
      
      // Update the request with the new equipment ID
      const updateData = {
        status,
        notes: notes || null,
        reviewed_by: user.id,
        reviewed_by_name: account.forename || user.email?.split("@")[0] || "User",
        reviewed_at: new Date().toISOString(),
        item_id: newEquipment.Equipment_ID,
        item_type: "equipment", // Change type to equipment since it's now created
      };
      
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
    }
    
    // Regular equipment or trolley requests update
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

    // If confirmed, update the actual item quantity (only for existing items)
    if (status === "confirmed" && existingRequest.item_type !== "new_item") {
      if (existingRequest.item_type === "equipment") {
        // Update equipment quantity
        const { error: updateError } = await supabaseAdmin.rpc('increment_equipment_quantity', {
          p_equipment_id: existingRequest.item_id,
          p_amount: existingRequest.requested_quantity
        });
        
        if (updateError) {
          console.error("Error updating equipment:", updateError);
          // Don't return error here since the request was already updated
          // You might want to handle this differently based on your requirements
        }
      } else if (existingRequest.item_type === "trolley") {
        // Update trolley quantity
        const { error: updateError } = await supabaseAdmin.rpc('increment_trolley_quantity', {
          p_trolley_id: existingRequest.item_id,
          p_amount: existingRequest.requested_quantity
        });
        
        if (updateError) {
          console.error("Error updating trolley:", updateError);
          // Don't return error here since the request was already updated
        }
      }
    }

    return NextResponse.json({ request: data });
  } catch (error) {
    console.error("Error in restock API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}