import { z } from "zod";

const STORAGE_KEY = "cashmarker.bill-statuses.v1";
const CHANGE_EVENT = "cashmarker:bill-statuses-changed";

const billStatusSchema = z.record(z.string(), z.enum(["confirmed", "skipped"]));

export type LocalBillStatus = "confirmed" | "skipped";
export type LocalBillStatuses = Record<string, LocalBillStatus>;

const EMPTY_STATUSES: LocalBillStatuses = {};
let cachedRaw: string | null | undefined;
let cachedStatuses = EMPTY_STATUSES;

export function getLocalBillStatusesSnapshot(): LocalBillStatuses {
  if (typeof window === "undefined") {
    return EMPTY_STATUSES;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedStatuses;
  }

  cachedRaw = raw;
  if (!raw) {
    cachedStatuses = EMPTY_STATUSES;
    return cachedStatuses;
  }

  try {
    const parsed = billStatusSchema.safeParse(JSON.parse(raw));
    cachedStatuses = parsed.success ? parsed.data : EMPTY_STATUSES;
  } catch {
    cachedStatuses = EMPTY_STATUSES;
  }

  return cachedStatuses;
}

export function getLocalBillStatusesServerSnapshot(): LocalBillStatuses {
  return EMPTY_STATUSES;
}

export function subscribeToLocalBillStatuses(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
  };
}

export function setLocalBillStatus(period: string, billId: string, status: LocalBillStatus): void {
  const nextStatuses = {
    ...getLocalBillStatusesSnapshot(),
    [`${period}:${billId}`]: status,
  };
  const raw = JSON.stringify(nextStatuses);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedStatuses = nextStatuses;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
