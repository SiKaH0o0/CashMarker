import { z } from "zod";

const STORAGE_KEY = "cashmarker.custom-tags.v1";
const CHANGE_EVENT = "cashmarker:custom-tags-changed";

const localTagSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(24),
});

const localTagListSchema = z.array(localTagSchema);

export type LocalTag = z.infer<typeof localTagSchema>;

const EMPTY_TAGS: LocalTag[] = [];
let cachedRaw: string | null | undefined;
let cachedTags = EMPTY_TAGS;

export function getLocalTagsSnapshot(): LocalTag[] {
  if (typeof window === "undefined") {
    return EMPTY_TAGS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedTags;
  }

  cachedRaw = raw;
  if (!raw) {
    cachedTags = EMPTY_TAGS;
    return cachedTags;
  }

  try {
    const parsed = localTagListSchema.safeParse(JSON.parse(raw));
    cachedTags = parsed.success ? parsed.data : EMPTY_TAGS;
  } catch {
    cachedTags = EMPTY_TAGS;
  }

  return cachedTags;
}

export function getLocalTagsServerSnapshot(): LocalTag[] {
  return EMPTY_TAGS;
}

export function subscribeToLocalTags(onStoreChange: () => void): () => void {
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

export function appendLocalTag(name: string, existingTags: LocalTag[]): LocalTag | null {
  const normalizedName = name.trim();
  if (!normalizedName || existingTags.some((tag) => tag.name === normalizedName)) {
    return null;
  }

  const tag: LocalTag = {
    id: `custom-${window.crypto.randomUUID()}`,
    name: normalizedName,
  };
  const nextTags = [...getLocalTagsSnapshot(), tag];
  const raw = JSON.stringify(nextTags);
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedTags = nextTags;
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return tag;
}
