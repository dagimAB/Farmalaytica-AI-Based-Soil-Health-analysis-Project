"use client";

import React from "react";

type Props = {
  visible: boolean;
  message?: string;
};

export default function SuccessToast({ visible, message = "Success" }: Props) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        background: "#0f172a",
        color: "#e6fffa",
        padding: "0.75rem 1rem",
        borderRadius: "0.5rem",
        boxShadow: "0 6px 18px rgba(2,6,23,0.4)",
        zIndex: 9999,
      }}
      role="status"
      aria-live="polite"
    >
      <strong style={{ display: "block", fontWeight: 700 }}>{message}</strong>
    </div>
  );
}
