"use client";

import { useSyncExternalStore } from "react";
import {
  getLocalTransactionsServerSnapshot,
  getLocalTransactionsSnapshot,
  subscribeToLocalTransactions,
} from "@/lib/finance/local-transactions";

export function useLocalTransactions() {
  return useSyncExternalStore(
    subscribeToLocalTransactions,
    getLocalTransactionsSnapshot,
    getLocalTransactionsServerSnapshot,
  );
}
