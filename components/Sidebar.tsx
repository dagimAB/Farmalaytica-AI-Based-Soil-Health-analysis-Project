"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

function Icon({ name, className = "" }: { name: string; className?: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as any;

  switch (name) {
    case "home":
      return (
        <svg {...common} className={className}>
          <path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common} className={className}>
          <path d="M3 3v18h18" />
          <path d="M9 13v6" />
          <path d="M13 9v10" />
          <path d="M17 5v14" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} className={className}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "package":
      return (
        <svg {...common} className={className}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common} className={className}>
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 1-1.95-.43L12 18.5l-1.13 1.3a1.65 1.65 0 0 1-1.95.43 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 1-.43-1.95L5.5 12l-1.3-1.13a1.65 1.65 0 0 1 .43-1.95 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 0 1 6.1 3.5l.06.06c.44.35 1.01.4 1.5.12.53-.31 1.13-.52 1.77-.62L12 5.5l1.13-1.3c.64.1 1.24.31 1.77.62.49.28 1.06.23 1.5-.12l.06-.06A2 2 0 0 1 20.5 6.1l-.06.06c-.35.44-.4 1.01-.12 1.5.31.53.52 1.13.62 1.77L18.5 12l1.3 1.13c-.1.64-.31 1.24-.62 1.77-.28.49-.23 1.06.12 1.5z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onToggle = () => setOpen((s) => !s);
    const onClose = () => setOpen(false);
    window.addEventListener("toggle-sidebar", onToggle as EventListener);
    window.addEventListener("close-sidebar", onClose as EventListener);
    return () => {
      window.removeEventListener("toggle-sidebar", onToggle as any);
      window.removeEventListener("close-sidebar", onClose as any);
    };
  }, []);

  const links = [
    { href: "/", label: "Dashboard", icon: "home" },
    { href: "/analysis", label: "Analysis", icon: "chart" },
    { href: "/tasks", label: "Tasks", icon: "check" },
    { href: "/inventory", label: "Inventory", icon: "package" },
    { href: "/farm-settings", label: "Settings", icon: "settings" },
  ];

  return (
    <>
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div className="sidebar-title">Farmalytica</div>
          <div style={{ marginLeft: "auto" }}>
            <ThemeToggle />
          </div>
        </div>
        <div className="sidebar-subtitle">Professional Agri-ERP</div>

        <nav
          style={{
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="sidebar-link">
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                }}
              >
                <Icon name={l.icon} />
                <span>{l.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: "auto" }}>
          <button
            className="button-primary"
            onClick={() => {
              if (open) setOpen(false);
              // close overlay on mobile
              const ev = new CustomEvent("close-sidebar");
              window.dispatchEvent(ev);
            }}
          >
            Close
          </button>
        </div>
      </aside>

      {open && (
        <button
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
          className="sidebar-overlay"
        />
      )}
    </>
  );
}
