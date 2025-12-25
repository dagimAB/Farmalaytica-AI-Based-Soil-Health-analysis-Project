"use client";

import Link from "next/link";
import React from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const toggle = () => {
    const ev = new CustomEvent("toggle-sidebar");
    window.dispatchEvent(ev);
  };

  return (
    <nav
      style={{
        background: "var(--color-bg-alt)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "0.5rem 1rem",
        }}
      >
        <button
          aria-label="Open sidebar"
          onClick={toggle}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-text)",
            fontSize: "1.2rem",
            cursor: "pointer",
            marginRight: "0.5rem",
          }}
        >
          ☰
        </button>

        <div
          style={{
            fontWeight: 800,
            color: "var(--color-primary)",
            fontSize: "1.15rem",
          }}
        >
          Farmalytica
        </div>

        <div style={{ marginLeft: "auto" }}>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
