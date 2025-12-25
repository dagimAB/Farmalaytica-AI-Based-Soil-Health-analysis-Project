"use client";

import React, { useEffect, useState } from "react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (res.ok && data.success) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error("Failed to load tasks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTasks((t) => t.map((task) => (task._id === id ? data.task : task)));
      }
    } catch (e) {
      console.error("Failed to update task", e);
    }
  };

  return (
    <div style={{ flex: 1, padding: "2.5rem" }}>
      <div className="card">
        <h2 className="card-title">Tasks & Scheduler</h2>
        <div style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
          Create, schedule, and track treatment tasks here.
        </div>

        {loading && <div>Loading...</div>}

        {!loading && (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {tasks.length === 0 && (
              <li style={{ color: "var(--color-text-muted)" }}>
                No tasks yet.
              </li>
            )}
            {tasks.map((task) => (
              <li
                key={task._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.01)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    {task.category === "fertilizer"
                      ? "🧪"
                      : task.category === "irrigation"
                      ? "💧"
                      : "📝"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{task.title}</div>
                    {task.description && (
                      <div
                        style={{
                          color: "var(--color-text-muted)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {task.description}
                      </div>
                    )}
                    <div
                      style={{
                        color: "var(--color-text-muted)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {task.createdFrom || "Manual"}
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => toggleStatus(task._id, task.status)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      borderRadius: 8,
                      border: "none",
                      background:
                        task.status === "completed"
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(255,255,255,0.02)",
                      color:
                        task.status === "completed"
                          ? "#16a34a"
                          : "var(--color-text)",
                      cursor: "pointer",
                    }}
                  >
                    {task.status === "completed" ? "✓ Done" : "⏳ Pending"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
