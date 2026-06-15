"use client";

import { useSyncExternalStore } from "react";
import { readSession, subscribeToSession } from "@/lib/auth";

export function useAuthSession() {
  return useSyncExternalStore(subscribeToSession, readSession, () => null);
}
