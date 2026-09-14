"use client";

import { useSyncExternalStore } from "react";
import {
  getLocalTagsServerSnapshot,
  getLocalTagsSnapshot,
  subscribeToLocalTags,
} from "@/lib/finance/local-tags";

export function useLocalTags() {
  return useSyncExternalStore(subscribeToLocalTags, getLocalTagsSnapshot, getLocalTagsServerSnapshot);
}
