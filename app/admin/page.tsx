import type { Metadata } from "next";
import { Suspense } from "react";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Chargement du dashboard admin...</div>}>
        <AdminDashboard />
    </Suspense>
  );
}
