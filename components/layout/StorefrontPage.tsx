"use client";

import { usePathname } from "next/navigation";
import { LegacyFooter } from "@/components/home/LegacyFooter";
import { LegacyHeader } from "@/components/home/LegacyHeader";

export function StorefrontPage({
  children,
  hideFooter,
  hideHeader,
  mainClassName,
}: {
  children: React.ReactNode;
  hideFooter?: boolean;
  hideHeader?: boolean;
  mainClassName?: string;
}) {
  const pathname = usePathname();
  const shouldHideFooter = hideFooter ?? pathname === "/contact";

  return (
    <>
      {!hideHeader ? <LegacyHeader /> : null}
      <main
        className={
          mainClassName ??
          "min-h-screen bg-gradient-to-br from-[#f7f3eb] via-white to-[#eef6ea]"
        }
      >
        {children}
      </main>
      {!shouldHideFooter ? <LegacyFooter /> : null}
    </>
  );
}
