"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./newstock.module.css";
import router from "next/dist/shared/lib/router/router";

type Equipment = {
  Equipment_ID: number;
  Name: string;
  Type: string | null;
  Size: string | null;
  Quantity: number | null;
  Equipment_Catagory: string | null;
};

export default function TestUploadPage() {
 const supabase = createClient();
 const router = useRouter();

 const [Equipment, setEquipment] = useState<Equipment[]>([]);
 const [loading, setLoading] = useState(false);

    useEffect(() => {
    async function loadEquipment(): Promise<void> {
        const{ data :{session}} = await supabase.auth.getSession();
        if (!session) {
            router.push("/login");
        }

        const{data} = await supabase
        .from('Equipment')
        .select('*')
        .order('Equipment_ID', { ascending: false });

    setEquipment((data as Equipment[] || []));
    loadEquipment();
    setLoading(false);
    } 

  }, [supabase, router]);

  const [formData, setFormData] = useState({
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

  /*pushes to database */
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
      return;
  }

  try {
      const { data: Equipment, error: EquipmentError } = await supabase
          .from('Equipment')
          .insert({
              Name: name,
              Type: type,
              Size: size,
              Quantity: quantity,
              Equipment_Catagory: category
          })
          .select()
          .single();
      
      if (EquipmentError) {
          console.error("Error inserting equipment:", EquipmentError);
          alert("error inserting form.");
          return;
      }
  } catch (error) {
      console.error("Error:", error);
      alert("Error submitting form.");
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

  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
        
      <h1>Add New Equipment</h1>

      <form onSubmit={handleNewStock}>
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

        <button type="submit">
            Submit
        </button>
      </form>
    </div>
  );
}