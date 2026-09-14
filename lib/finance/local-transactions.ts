import { z } from "zod";

const STORAGE_KEY = "cashmarker.transactions.v1";
const CHANGE_EVENT = "cashmarker:transactions-changed";

const localTransactionSchema = z.object({
  id: z.string(),
  tagId: z.string(),
  tagName: z.string(),
  amountFen: z.number().int().nonnegative(),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.string(),
  kind: z.literal("expense"),
  source: z.literal("manual"),
});

const localTransactionListSchema = z.array(localTransactionSchema);

export type LocalTransaction = z.infer<typeof localTransactionSchema>;

const EMPTY_TRANSACTIONS: LocalTransaction[] = [];
let cachedRaw: string | null | undefined;
let cachedTransactions = EMPTY_TRANSACTIONS;

export function getLocalTransactionsSnapshot(): LocalTransaction[] {
  if (typeof window === "undefined") {
    return EMPTY_TRANSACTIONS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedTransactions;
  }

  cachedRaw = raw;
  if (!raw) {
    cachedTransactions = EMPTY_TRANSACTIONS;
    return cachedTransactions;
  }

  try {
    const parsed = localTransactionListSchema.safeParse(JSON.parse(raw));
    cachedTransactions = parsed.success ? parsed.data : EMPTY_TRANSACTIONS;
  } catch {
    cachedTransactions = EMPTY_TRANSACTIONS;
  }

  return cachedTransactions;
}

export function getLocalTransactionsServerSnapshot(): LocalTransaction[] {
  return EMPTY_TRANSACTIONS;
}

export function subscribeToLocalTransactions(onStoreChange: () => void): () => void {
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

export function appendLocalTransaction(input: {
  tagId: string;
  tagName: string;
  amountFen: number;
  occurredOn: string;
}): void {
  const transaction: LocalTransaction = {
    id: window.crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
    kind: "expense",
    source: "manual",
  };

  const nextTransactions = [...getLocalTransactionsSnapshot(), transaction];
  const raw = JSON.stringify(nextTransactions);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedTransactions = nextTransactions;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function setLocalTransactionForTagOnDate(input: {
  tagId: string;
  tagName: string;
  amountFen: number;
  occurredOn: string;
}): void {
  const currentTransactions = getLocalTransactionsSnapshot();
  const existingTransaction = currentTransactions.find(
    (transaction) => transaction.tagId === input.tagId && transaction.occurredOn === input.occurredOn,
  );
  const transaction: LocalTransaction = {
    id: existingTransaction?.id ?? window.crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
    kind: "expense",
    source: "manual",
  };
  const nextTransactions = [
    ...currentTransactions.filter(
      (item) => item.tagId !== input.tagId || item.occurredOn !== input.occurredOn,
    ),
    transaction,
  ];
  const raw = JSON.stringify(nextTransactions);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedTransactions = nextTransactions;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
