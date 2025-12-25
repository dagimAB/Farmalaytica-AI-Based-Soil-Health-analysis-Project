"use client";

import React from "react";

// Very small markdown renderer: supports headings '##', bold with **, and lists (- or *)
export default function MarkdownRenderer({ md }: { md: string }) {
  // Escape HTML
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = md.split(/\r?\n/);
  let html = "";
  let inList = false;
  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (line === "") {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += "<p></p>";
      continue;
    }
    // Heading
    if (line.startsWith("### ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h3 class="text-slate-900 dark:text-slate-100 font-semibold">${esc(
        line.slice(4)
      ).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</h3>`;
      continue;
    }
    if (line.startsWith("## ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h2 class="text-slate-900 dark:text-slate-100 font-semibold">${esc(
        line.slice(3)
      ).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</h2>`;
      continue;
    }
    if (line.startsWith("# ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h1 class="text-slate-900 dark:text-slate-100 font-bold">${esc(
        line.slice(2)
      ).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</h1>`;
      continue;
    }
    // List
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        html += '<ul class="ml-4 space-y-1">';
        inList = true;
      }
      html += `<li class="text-slate-900 dark:text-slate-100">${esc(
        line.slice(2)
      ).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</li>`;
      continue;
    }
    // normal paragraph
    if (inList) {
      html += "</ul>";
      inList = false;
    }
    html += `<p class="text-slate-900 dark:text-slate-100">${esc(line).replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    )}</p>`;
  }
  if (inList) html += "</ul>";

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
