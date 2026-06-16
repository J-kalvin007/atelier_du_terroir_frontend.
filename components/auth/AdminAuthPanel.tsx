"use client";

import { useState } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { cn } from "@/lib/utils";

type AdminAuthMode = "login" | "register";

export function AdminAuthPanel() {
  const [mode, setMode] = useState<AdminAuthMode>("login");

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-[#eadfce] bg-white p-1 shadow-sm">
        {(
          [
            { id: "login" as const, label: "Connexion" },
            { id: "register" as const, label: "Inscription" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition",
              mode === tab.id
                ? "bg-[#1f4d3f] text-white shadow-sm"
                : "text-slate-600 hover:bg-[#f8ecdf] hover:text-[#8b5e34]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "login" ? (
        <AuthForm
          redirectPath="/admin"
          onSwitchToRegister={() => setMode("register")}
        />
      ) : (
        <RegisterForm
          redirectPath="/admin"
          onSwitchToLogin={() => setMode("login")}
        />
      )}
    </div>
  );
}
