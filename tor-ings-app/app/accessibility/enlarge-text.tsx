"use client";

import { useState, useEffect } from "react";

export default function EnlargeText() {
  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("biggerText");
    if (saved === "true") {
      setIsLarge(true);
      applyBigText(true);
    }
  }, []);

  const applyBigText = (enable: boolean) => {
    const html = document.documentElement;
    if (enable) {
      html.classList.add("bigger-text");
      html.style.fontSize = "120%";
    } else {
      html.classList.remove("bigger-text");
      html.style.fontSize = "";
    }
  };

  const toggle = () => {
    const newValue = !isLarge;
    setIsLarge(newValue);
    localStorage.setItem("biggerText", String(newValue));
    applyBigText(newValue);
  };

  return (
    <button
      onClick={toggle}
      style={{
        padding: "8px 16px",
        backgroundColor: isLarge ? "#10b981" : "#e5e7eb",
        color: isLarge ? "white" : "#374151",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "14px"
      }}
    >
      {isLarge ? "🔍 big text: on" : "🔍 big text: off"}
    </button>
  );
}