"use client";

import { useState, useEffect, useRef } from "react";
import { useExpenseStore, ELEMENT_CONFIG, type Element, type Branch } from "@/hooks/use-expense-store";
import { cn } from "@/lib/utils";

/* ─── Currency Icon ─── */
function CurrencyIcon({ element, size = "md" }: { element: Element; size?: "sm" | "md" | "lg" }) {
  const config = ELEMENT_CONFIG[element];
  const sizeMap = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };
  return (
    <span className={cn("inline-block animate-breathe", sizeMap[size])} role="img" aria-label={config.label}>
      {config.symbol}
    </span>
  );
}

/* ─── Branch Selector ─── */
function BranchSelector({
  branches,
  activeBranchId,
  onSwitch,
  onAdd,
  onRename,
  onDelete,
}: {
  branches: Branch[];
  activeBranchId: string;
  onSwitch: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName("");
      setIsAdding(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      onRename(id, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  };

  const handleStartEdit = (branch: Branch) => {
    setEditingId(branch.id);
    setEditName(branch.name);
    setShowMenu(null);
  };

  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {branches.map((branch) => {
          const isActive = branch.id === activeBranchId;
          const isDefault = branch.id === "default";
          const isEditing = editingId === branch.id;

          return (
            <div key={branch.id} className="relative shrink-0">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(branch.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-ring"
                    maxLength={20}
                  />
                  <button
                    onClick={() => handleRename(branch.id)}
                    className="rounded-md px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50"
                  >
                    确认
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onSwitch(branch.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-300",
                    isActive
                      ? "bg-card shadow-sm border border-border/60"
                      : "text-muted-foreground hover:bg-card/60 border border-transparent"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-muted-foreground/30")} />
                  <span className="max-w-[80px] truncate">{branch.name}</span>
                  {!isDefault && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(showMenu === branch.id ? null : branch.id);
                      }}
                      className="ml-0.5 flex h-4 w-4 items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </span>
                  )}
                </button>
              )}

              {showMenu === branch.id && (
                <div className="absolute left-0 top-full z-20 mt-1 w-28 rounded-xl border border-border/50 bg-card p-1 shadow-lg animate-float-in">
                  <button
                    onClick={() => handleStartEdit(branch)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                    重命名
                  </button>
                  <button
                    onClick={() => {
                      onDelete(branch.id);
                      setShowMenu(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-50"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    删除分支
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {isAdding ? (
          <div className="flex shrink-0 items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewName("");
                }
              }}
              onBlur={() => {
                if (!newName.trim()) {
                  setIsAdding(false);
                }
              }}
              placeholder="分支名称..."
              className="w-28 rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-ring"
              maxLength={20}
            />
            <button
              onClick={handleAdd}
              className="rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
            >
              创建
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex shrink-0 items-center gap-1 rounded-xl border border-dashed border-border/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            新分支
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Summary Card ─── */
function SummaryCard({
  element,
  amount,
}: {
  element: Element;
  amount: number;
}) {
  const config = ELEMENT_CONFIG[element];
  return (
    <div
      className="group relative flex flex-col items-center gap-2 rounded-2xl border border-border/50 px-3 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      style={{ backgroundColor: config.bgColor }}
    >
      <CurrencyIcon element={element} size="md" />
      <span className="text-[10px] font-medium tracking-wide" style={{ color: config.color }}>
        {config.label}
      </span>
      <span className={cn("font-mono text-base font-semibold", amount >= 0 ? "" : "")} style={{ color: config.color }}>
        {amount >= 0 ? "+" : ""}{amount.toFixed(2)}
      </span>
    </div>
  );
}

/* ─── Add Record Form ─── */
function AddRecordForm({
  onAdd,
}: {
  onAdd: (record: { amount: number; type: "income" | "expense"; element: Element; category: string; note: string; date: string }) => void;
}) {
  const [selectedElement, setSelectedElement] = useState<Element>("coin");
  const [txType, setTxType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    onAdd({
      amount: numAmount,
      type: txType,
      element: selectedElement,
      category: "",
      note: note.trim(),
      date,
    });
    setAmount("");
    setNote("");
  };

  const currencies = Object.keys(ELEMENT_CONFIG) as Element[];

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-300">
      {/* Currency Type Selector */}
      <div className="mb-3 flex items-center gap-2">
        {currencies.map((el) => {
          const config = ELEMENT_CONFIG[el];
          const isActive = selectedElement === el;
          return (
            <button
              key={el}
              onClick={() => setSelectedElement(el)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2.5 transition-all duration-300",
                isActive ? "scale-[1.02] shadow-sm" : "opacity-60 hover:opacity-90"
              )}
              style={{
                backgroundColor: isActive ? config.bgColor : "transparent",
                borderWidth: 1,
                borderColor: isActive ? config.color : "transparent",
              }}
            >
              <span className={cn("text-xl transition-transform duration-300", isActive && "animate-breathe")}>
                {config.symbol}
              </span>
              <span className="text-[10px] font-medium" style={{ color: isActive ? config.color : "var(--muted-foreground)" }}>
                {config.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Income / Expense Toggle */}
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setTxType("income")}
          className={cn(
            "flex-1 rounded-xl py-2 text-sm font-medium transition-all duration-300",
            txType === "income"
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
          )}
        >
          收入
        </button>
        <button
          onClick={() => setTxType("expense")}
          className={cn(
            "flex-1 rounded-xl py-2 text-sm font-medium transition-all duration-300",
            txType === "expense"
              ? "bg-rose-500 text-white shadow-sm"
              : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
          )}
        >
          支出
        </button>
      </div>

      {/* Amount Input */}
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-2xl font-light" style={{ color: ELEMENT_CONFIG[selectedElement].color }}>
          #
        </span>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="输入数量"
          className="flex-1 border-none bg-transparent font-mono text-2xl font-light outline-none placeholder:text-muted-foreground/40"
          min="0"
          step="0.01"
        />
      </div>

      {/* Note */}
      <div className="mb-3">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="备注（如：买材料、卖材料、充值...）"
          className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-border"
        />
      </div>

      {/* Date */}
      <div className="mb-1">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-border"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!amount || parseFloat(amount) <= 0}
        className={cn(
          "mt-4 w-full rounded-xl py-3 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:shadow-md disabled:opacity-40 disabled:shadow-none",
          txType === "income" ? "bg-emerald-500" : "bg-rose-500"
        )}
      >
        记录这笔{txType === "income" ? "收入" : "支出"}
      </button>
    </div>
  );
}

/* ─── Record Item ─── */
function RecordItem({
  record,
  onDelete,
}: {
  record: { id: string; amount: number; type: string; element: Element; category: string; note: string; date: string };
  onDelete: (id: string) => void;
}) {
  const config = ELEMENT_CONFIG[record.element];
  const isIncome = record.type === "income";

  return (
    <div className="group animate-float-in flex items-center gap-3 rounded-xl border border-border/30 bg-card/80 px-4 py-3 transition-all duration-300 hover:-translate-y-px hover:shadow-sm">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: config.bgColor }}
      >
        <span className="text-lg">{config.symbol}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {record.note || config.label}
          </span>
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-muted-foreground/60">{record.date}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className={cn("font-mono text-base font-semibold", isIncome ? "text-emerald-600" : "text-rose-500")}>
          {isIncome ? "+" : "-"}{record.amount.toFixed(2)}
        </span>
        <button
          onClick={() => onDelete(record.id)}
          className="rounded-lg p-1.5 text-muted-foreground/40 opacity-0 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          aria-label="删除"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const {
    branches,
    activeBranchId,
    activeBranch,
    records,
    isLoaded,
    summary,
    addBranch,
    renameBranch,
    deleteBranch,
    switchBranch,
    addRecord,
    deleteRecord,
  } = useExpenseStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-breathe text-4xl">💰🔗💎</span>
          <p className="font-serif text-sm text-muted-foreground">元素之诗，正在苏醒...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 pb-8 pt-6">
        {/* Header */}
        <header className="mb-5 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="animate-breathe text-xl">💰</span>
            <span className="animate-breathe text-xl" style={{ animationDelay: "0.5s" }}>🔗</span>
            <span className="animate-breathe text-xl" style={{ animationDelay: "1s" }}>💎</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold tracking-wide text-foreground">
            元素之诗
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            快去挖矿
          </p>
        </header>

        {/* Branch Selector */}
        <BranchSelector
          branches={branches}
          activeBranchId={activeBranchId}
          onSwitch={switchBranch}
          onAdd={addBranch}
          onRename={renameBranch}
          onDelete={deleteBranch}
        />

        {/* Currency Balance Cards */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          <SummaryCard element="coin" amount={summary.coinTotal} />
          <SummaryCard element="bindCoin" amount={summary.bindCoinTotal} />
          <SummaryCard element="crystal" amount={summary.crystalTotal} />
        </div>

        {/* Add Record Form */}
        <div className="mb-6">
          <AddRecordForm onAdd={addRecord} />
        </div>

        {/* Record List */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-base font-semibold text-foreground">
              {activeBranch?.name || "记录"} · 清单
            </h2>
            <span className="text-xs text-muted-foreground">
              共 {records.length} 笔
            </span>
          </div>

          {records.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/50 py-12 text-center">
              <span className="text-3xl opacity-40">📜</span>
              <p className="text-sm text-muted-foreground">此分支尚无记录</p>
              <p className="text-xs text-muted-foreground/60">
                选择一种货币类型，开始记录你的收支
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <RecordItem key={record.id} record={record} onDelete={deleteRecord} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
