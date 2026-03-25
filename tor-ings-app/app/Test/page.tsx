"use client";

import { useState } from "react";


export default function TestUploadPage() {
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
  };






  return (
    <div style={{ padding: "20px", maxWidth: "400px" }}>
        
      <h1>Testing Equipment Upload</h1>

      <form onSubmit={handleSubmit}>

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

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}