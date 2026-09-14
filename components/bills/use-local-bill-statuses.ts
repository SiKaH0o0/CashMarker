"use client";

import { useSyncExternalStore } from "react";
import {
  getLocalBillStatusesServerSnapshot,
  getLocalBillStatusesSnapshot,
  subscribeToLocalBillStatuses,
} from "@/lib/finance/local-bill-statuses";

export function useLocalBillStatuses() {
  return useSyncExternalStore(
    subscribeToLocalBillStatuses,
    getLocalBillStatusesSnapshot,
    getLocalBillStatusesServerSnapshot,
  );
}
