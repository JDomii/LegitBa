"use client";

import React, { useSyncExternalStore } from "react";

function subscribeRole(callback: () => void) {
  window.addEventListener("demo_role_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("demo_role_change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getRoleSnapshot(): "public" | "official" {
  if (typeof window === "undefined") return "public";
  const r = localStorage.getItem("demo_role");
  return r === "official" ? "official" : "public";
}

function getServerSnapshot(): "public" | "official" {
  return "public";
}

export function useDemoRole(): "public" | "official" {
  return useSyncExternalStore(subscribeRole, getRoleSnapshot, getServerSnapshot);
}

export function RoleToggle() {
  const role = useDemoRole();
  const isOfficial = role === "official";

  const toggleRole = () => {
    const next = isOfficial ? "public" : "official";
    localStorage.setItem("demo_role", next);
    window.dispatchEvent(new Event("demo_role_change"));
  };

  return (
    <div className="flex items-center justify-between gap-3 md:justify-end">
      <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">
        Demo mode:{" "}
        <span className="font-bold text-navy-900">
          {isOfficial ? "Official" : "Public"}
        </span>
      </span>
      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-bold transition-colors duration-300 ${
            isOfficial ? "text-navy-500" : "text-maroon-700"
          }`}
        >
          Public
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isOfficial}
          aria-label={isOfficial ? "Switch to Public" : "Switch to Official"}
          title={isOfficial ? "Switch to Public" : "Switch to Official"}
          onClick={toggleRole}
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-300 ${
            isOfficial ? "bg-maroon-700" : "bg-navy-500/40"
          }`}
        >
          <span
            aria-hidden="true"
            className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ease-out ${
              isOfficial ? "translate-x-6" : "translate-x-0"
            }`}
          />
          <span className="sr-only">
            {isOfficial ? "Switch to Public" : "Switch to Official"}
          </span>
        </button>
        <span
          className={`text-sm font-bold transition-colors duration-300 ${
            isOfficial ? "text-maroon-700" : "text-navy-500"
          }`}
        >
          Official
        </span>
      </div>
    </div>
  );
}
