"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {
  const supabase = createClient();
  const router = useRouter();

  const [forename, setForename] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!forename.trim()) {
      alert("Please enter your name");
      return;
    }

    if (password !== verifyPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/Login`,
    data: {
      forename: forename,  
    }
  },
});

    if (error) {
      alert(error.message);
      setIsLoading(false);
      return;
    }

    
    if (data.user) {
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ Forename: forename })
        .eq('user_id', data.user.id);

      if (updateError) {
        console.error("Error updating forename:", updateError);
        // Don't alert the user, as auth still worked
      }
    }

    setIsLoading(false);
    alert("✓ Check your email to confirm your account!");
    
    // Redirect to login after successful signup
    setTimeout(() => {
      router.push("/Login");
    }, 2000);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSignup();
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        width: "400px",
        backgroundColor: "#F4CDD4",
        padding: "3rem 2rem",
        borderRadius: "12px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "1.2rem"
      }}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "0.5rem"
        }}>
          <h1 style={{
            fontSize: "2rem",
            color: "#672146",
            margin: "0 0 0.5rem 0",
            fontWeight: "bold"
          }}>
            Create Account
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "#666",
            margin: 0
          }}>
            Join TORS Health Equipment
          </p>
        </div>

        {/* Name Input - NEW FIELD */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem"
        }}>
          <label style={{
            fontSize: "1rem",
            fontWeight: "bold",
            color: "#333"
          }}>
            Your Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={forename}
            onChange={(e) => setForename(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              padding: "1rem",
              fontSize: "1.1rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              outline: "none",
              transition: "border-color 0.2s",
              ...(isLoading ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {})
            }}
            disabled={isLoading}
          />
        </div>

        {/* Email Input */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem"
        }}>
          <label style={{
            fontSize: "1rem",
            fontWeight: "bold",
            color: "#333"
          }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              padding: "1rem",
              fontSize: "1.1rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              outline: "none",
              transition: "border-color 0.2s",
              ...(isLoading ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {})
            }}
            disabled={isLoading}
          />
        </div>

        {/* Password Input */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem"
        }}>
          <label style={{
            fontSize: "1rem",
            fontWeight: "bold",
            color: "#333"
          }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Create a password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              padding: "1rem",
              fontSize: "1.1rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              outline: "none",
              transition: "border-color 0.2s",
              ...(isLoading ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {})
            }}
            disabled={isLoading}
          />
        </div>

        {/* Verify Password Input */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem"
        }}>
          <label style={{
            fontSize: "1rem",
            fontWeight: "bold",
            color: "#333"
          }}>
            Verify Password
          </label>
          <input
            type="password"
            placeholder="Re-enter your password"
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              padding: "1rem",
              fontSize: "1.1rem",
              border: "1px solid #ccc",
              borderRadius: "6px",
              outline: "none",
              transition: "border-color 0.2s",
              ...(isLoading ? { backgroundColor: "#f0f0f0", cursor: "not-allowed" } : {})
            }}
            disabled={isLoading}
          />
        </div>


        {/* Sign Up Button */}
        <button
          onClick={handleSignup}
          disabled={isLoading}
          style={{
            padding: "1rem",
            fontSize: "1.2rem",
            fontWeight: "bold",
            backgroundColor: isLoading ? "#672146" : "#E31C79",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isLoading ? "not-allowed" : "pointer",
            marginTop: "0.5rem",
            transition: "background-color 0.2s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          {isLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
        </button>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          style={{
            padding: "0.8rem",
            fontSize: "1rem",
            backgroundColor: "#672146",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
        >
          ← Back
        </button>

        {/* Login Link */}
        <div style={{
          textAlign: "center",
          marginTop: "0.5rem"
        }}>
          <Link 
            href="/Login" 
            style={{
              fontSize: "1rem",
              color: "#E31C79",
              textDecoration: "none",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Already have an account? Log In
          </Link>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          marginTop: "1rem",
          fontSize: "0.9rem",
          color: "#666"
        }}>
          <p>School of Healthcare - Sheffield Hallam University</p>
        </div>
      </div>
    </div>
  );
}