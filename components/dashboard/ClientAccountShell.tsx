"use client";

import { ClientAccountSidebar } from "@/components/dashboard/ClientAccountSidebar";
import { StorefrontPage } from "@/components/layout/StorefrontPage";

export function ClientAccountShell({ children }: { children: React.ReactNode }) {
  return (
    <StorefrontPage
      hideFooter
      hideHeader
      mainClassName="min-h-screen bg-gradient-to-br from-[#f7f3eb] via-white to-[#eef6ea]"
    >
      <div className="flex min-h-screen flex-col lg:flex-row">
        <ClientAccountSidebar />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </StorefrontPage>
  );
}
