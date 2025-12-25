"use client";

import React, { useEffect, useState } from "react";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(0);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (res.ok && data.success) setItems(data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async () => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantityKg: qty }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setName("");
        setQty(0);
        fetchItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateQty = async (id: string, newQty: number) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantityKg: newQty }),
      });
      const data = await res.json();
      if (res.ok && data.success) fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ flex: 1, padding: "2.5rem" }}>
      <div className="card">
        <h2 className="card-title">Stock List</h2>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <input
            className="form-input"
            placeholder="Fertilizer name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="form-input"
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />
          <button className="button-primary" onClick={addItem}>
            Add
          </button>
        </div>

        {loading && <div>Loading...</div>}

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {items.length === 0 && (
            <li style={{ color: "var(--color-text-muted)" }}>No items yet</li>
          )}
          {items.map((item) => (
            <li
              key={item._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem",
                borderRadius: 8,
                background:
                  item.quantityKg < 10
                    ? "rgba(239,68,68,0.06)"
                    : "rgba(255,255,255,0.01)",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>
                  {item.quantityKg < 10 && <span className="pulse" />}
                  {item.name}
                </div>
                <div
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.9rem",
                  }}
                >
                  {item.quantityKg} kg{" "}
                  {item.quantityKg < 10 && (
                    <span style={{ color: "#ef4444", fontWeight: 700 }}>
                      {" "}
                      - Low stock
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="button-primary"
                  onClick={() => updateQty(item._id, item.quantityKg - 1)}
                >
                  -1kg
                </button>
                <button
                  className="button-primary"
                  onClick={() => updateQty(item._id, item.quantityKg + 1)}
                >
                  +1kg
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
