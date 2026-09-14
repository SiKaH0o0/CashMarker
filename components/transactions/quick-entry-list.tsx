"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { useLocalTags } from "@/components/transactions/use-local-tags";
import { useLocalTransactions } from "@/components/transactions/use-local-transactions";
import { appendLocalTag } from "@/lib/finance/local-tags";
import { setLocalTransactionForTagOnDate } from "@/lib/finance/local-transactions";

type QuickTag = {
  id: string;
  name: string;
};

export function QuickEntryList({ tags, date }: { tags: QuickTag[]; date: string }) {
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [composerOpen, setComposerOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagError, setNewTagError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const customTags = useLocalTags();
  const transactions = useLocalTransactions();
  const allTags = useMemo(() => [...tags, ...customTags], [customTags, tags]);
  const savedAmounts = useMemo(() => {
    const totals = new Map<string, number>();

    for (const transaction of transactions) {
      if (transaction.occurredOn === date) {
        totals.set(transaction.tagId, (totals.get(transaction.tagId) ?? 0) + transaction.amountFen);
      }
    }

    return Object.fromEntries([...totals].map(([tagId, amountFen]) => [tagId, String(amountFen / 100)]));
  }, [date, transactions]);
  const hasEditedAmount = Object.keys(amounts).length > 0;

  function saveEntries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const enteredEntries = allTags
      .filter((tag) => Object.hasOwn(amounts, tag.id))
      .map((tag) => ({ tag, raw: (amounts[tag.id] ?? "").trim() }));

    if (enteredEntries.length === 0) {
      return;
    }

    const parsedEntries = enteredEntries.map(({ tag, raw }) => ({
      tag,
      amountFen: Math.round(Number(raw) * 100),
    }));

    if (parsedEntries.some(({ amountFen }) => !Number.isFinite(amountFen) || amountFen < 0)) {
      setSaveMessage("");
      setSaveError("请检查金额，修改的每一项都不能小于 0 元。");
      return;
    }

    for (const { tag, amountFen } of parsedEntries) {
      setLocalTransactionForTagOnDate({
        tagId: tag.id,
        tagName: tag.name,
        amountFen,
        occurredOn: date,
      });
    }

    setAmounts({});
    setSaveError("");
    setSaveMessage(`已保存 ${parsedEntries.length} 笔账目`);
  }

  function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const addedTag = appendLocalTag(newTagName, allTags);
    if (!addedTag) {
      setNewTagError(newTagName.trim() ? "这个条目已经存在。" : "请输入条目名称。");
      return;
    }

    setNewTagName("");
    setNewTagError("");
    setComposerOpen(false);
  }

  function closeComposer() {
    setComposerOpen(false);
    setNewTagName("");
    setNewTagError("");
  }

  return (
    <div>
      <form className="quick-entry-form" noValidate onSubmit={saveEntries}>
        <div className="entry-list">
          {allTags.map((tag) => (
            <div className="entry-row" key={tag.id}>
              <span className="tag-dot" aria-hidden="true" />
              <div className="entry-label">
                <strong>{tag.name}</strong>
              </div>
              <label className="amount-field">
                <span className="currency-prefix">¥</span>
                <input
                  aria-label={`${tag.name}金额`}
                  inputMode="decimal"
                  min="0"
                  step="1"
                  type="number"
                  value={amounts[tag.id] ?? savedAmounts[tag.id] ?? ""}
                  onChange={(event) => {
                    setAmounts((current) => ({ ...current, [tag.id]: event.target.value }));
                    setSaveMessage("");
                    setSaveError("");
                  }}
                />
              </label>
            </div>
          ))}
        </div>

        <div className="entry-save-bar">
          <div className="entry-save-feedback" aria-live="polite">
            {saveMessage ? (
              <span className="entry-save-success"><Check aria-hidden="true" size={18} />{saveMessage}</span>
            ) : null}
            {saveError ? <span className="entry-save-error">{saveError}</span> : null}
          </div>
          <button className="primary-button entry-save-button" type="submit" disabled={!hasEditedAmount}>
            保存账目
          </button>
        </div>
      </form>

      <button
        className="floating-add-button"
        type="button"
        aria-label="新建条目"
        onClick={() => setComposerOpen(true)}
      >
        <Plus aria-hidden="true" size={28} />
      </button>

      {composerOpen ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeComposer();
          }
        }}>
          <section
            className="new-entry-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-entry-title"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                closeComposer();
              }
            }}
          >
            <div className="dialog-heading">
              <h2 id="new-entry-title">新建条目</h2>
              <button className="dialog-close-button" type="button" aria-label="关闭" onClick={closeComposer}>
                <X aria-hidden="true" size={20} />
              </button>
            </div>
            <form className="new-entry-form" onSubmit={addEntry}>
              <label>
                <span>条目名称</span>
                <input
                  autoFocus
                  maxLength={24}
                  placeholder="例如：交通"
                  value={newTagName}
                  onChange={(event) => {
                    setNewTagName(event.target.value);
                    setNewTagError("");
                  }}
                />
              </label>
              {newTagError ? <p className="form-error">{newTagError}</p> : null}
              <div className="dialog-actions">
                <button className="secondary-button" type="button" onClick={closeComposer}>取消</button>
                <button className="primary-button" type="submit">创建</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
