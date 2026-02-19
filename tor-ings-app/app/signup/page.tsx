"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function Signup() {
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [verifyPassword, setVerifyPassword] = useState("")

  const handleSignup = async () => {
    if (password !== verifyPassword) {
      alert("Passwords do not match")
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Check your email to confirm")
    }
  }

  return (
    <div style={{display: "flex", flexDirection: "column", gap: "0.5rem", width: "300px", margin: "2rem auto" }}>
      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder= "Password"onChange={(e) => setPassword(e.target.value)} />
      <input type="password" placeholder="Verify Password" onChange={(e) => setVerifyPassword(e.target.value)} />
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  )
}
