"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./newstock.module.css";
import router from "next/dist/shared/lib/router/router";
import { setEngine } from "crypto";



export default function TestUploadPage() {
 const supabase = createClient();
 const router = useRouter();

 const [loading, setLoading] = useState(false);

    useEffect(() => {
    async function loadEquipment() {
        const{data:{session}} = await supabase.auth.getSession();
        if (!session) {
            router.push("/login");
        }

        const{data} = await supabase
        .from('Equipment')
        .select('*');
    }
    
    loadEquipment();
  }, [supabase, router]);


  const [formData, setFormData] = useState({
    name: "",
    type: "",
    size: "",
    quantity: "",
    category: ""

  });
    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitted Data:", formData);

    alert("Form submitted");


    setFormData({
      name: "",
      type: "",
      size: "",
      quantity: "",
      category: ""

    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value
    });
  };

  const handleNewStock = async() => {
    const { name, type, size, quantity, category } = formData;
    if (!name || !quantity) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);

    const{data: {session}} = await supabase.auth.getSession();
    if (!session) {
        router.push("/login");

        try {
            const { data: Equipment, error } = await supabase
            .from('Equipment')
            .insert({
                Name : name,
                Type: type,
                Size: size,
                Quantity: quantity,
                Category: category
            });
        } catch (error) {
            console.error("Error inserting equipment:", error);
            alert("Error submitting form.");
        }
  }

    console.log("Submitted Data:", formData);

    alert("Form submitted");

    setFormData({
      name: "",
      type: "",
      size: "",
      quantity: "",
      category: ""

    });
  };
return(
<div style={{ padding: "20px", maxWidth: "400px" }}>
    <h1>Add New Stock</h1>
      <form onSubmit={handleSubmit}>
        
      <h1>Testing Equipment Upload</h1>
        <div>
          <label>Name</label><br />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Type</label><br />
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Size</label><br />
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Quantity</label><br />
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Category</label><br />
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>

        <br />

        <button type="submit"
        onClick={handleNewStock}
        >
            Submit
        </button>

        </form>
    </div>
)
}
}