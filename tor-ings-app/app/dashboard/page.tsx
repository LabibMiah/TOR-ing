import { createServerSupabase } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button"; // We'll create this

export default async function DashboardPage() {
  const supabase = await createServerSupabase();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  return (
    <div style={{ 
      maxWidth: "600px", 
      margin: "2rem auto", 
      padding: "1rem",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
        padding: "1rem",
        backgroundColor: "#f0f0f0",
        borderRadius: "8px"
      }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", color: "#333" }}>
          Dashboard
        </h1>
        <LogoutButton />
      </div>

      <div style={{
        padding: "1rem",
        backgroundColor: "#e0e0e0",
        borderRadius: "8px",
        marginBottom: "1rem"
      }}>
        <h2 style={{ marginTop: 0, fontSize: "1.2rem" }}>
          Welcome back, {session.user.email}!
        </h2>
        
        {account ? (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ margin: "0.5rem 0" }}>
              <strong>Email:</strong> {account.account}
            </p>
            <p style={{ margin: "0.5rem 0" }}>
              <strong>Tier:</strong> 
              <span style={{
                marginLeft: "0.5rem",
                padding: "0.25rem 0.5rem",
                backgroundColor: account.tier === "Tier 4" ? "purple" : 
                                 account.tier === "Tier 1" ? "green" : "blue",
                color: "white",
                borderRadius: "4px",
                fontSize: "0.9rem"
              }}>
                {account.tier}
              </span>
            </p>
          </div>
        ) : (
          <p>Loading account info...</p>
        )}
      </div>

      {/* Simple stats section */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem"
      }}>
        <div style={{
          padding: "1rem",
          backgroundColor: "#d0d0d0",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "0.9rem", color: "#666" }}>Status</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Active</div>
        </div>
        
        <div style={{
          padding: "1rem",
          backgroundColor: "#d0d0d0",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "0.9rem", color: "#666" }}>Tier</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {account?.tier || "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}