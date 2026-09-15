"use client";

import { useState, useEffect, useCallback } from "react";

export type Element = "coin" | "bindCoin" | "crystal";

export interface Branch {
  id: string;
  name: string;
  createdAt: number;
}

export interface ExpenseRecord {
  id: string;
  branchId: string;
  amount: number;
  type: "income" | "expense";
  element: Element;
  category: string;
  note: string;
  date: string;
  createdAt: number;
}

export interface Summary {
  coinTotal: number;
  bindCoinTotal: number;
  crystalTotal: number;
}

const RECORDS_KEY = "element-poem-records";
const BRANCHES_KEY = "element-poem-branches";
const ACTIVE_BRANCH_KEY = "element-poem-active-branch";

const DEFAULT_BRANCH: Branch = {
  id: "default",
  name: "默认分支",
  createdAt: Date.now(),
};

export const ELEMENT_CONFIG: Record<
  Element,
  {
    label: string;
    symbol: string;
    color: string;
    bgColor: string;
  }
> = {
  coin: {
    label: "流通赫勒",
    symbol: "💰",
    color: "var(--element-coin)",
    bgColor: "var(--element-coin-light)",
  },
  bindCoin: {
    label: "绑定赫勒",
    symbol: "🔗",
    color: "var(--element-bind-coin)",
    bgColor: "var(--element-bind-coin-light)",
  },
  crystal: {
    label: "水晶",
    symbol: "💎",
    color: "var(--element-crystal)",
    bgColor: "var(--element-crystal-light)",
  },
};

/* ─── LocalStorage helpers ─── */
function loadBranches(): Branch[] {
  if (typeof window === "undefined") return [DEFAULT_BRANCH];
  try {
    const data = localStorage.getItem(BRANCHES_KEY);
    if (!data) return [DEFAULT_BRANCH];
    const parsed: Branch[] = JSON.parse(data);
    return parsed.length > 0 ? parsed : [DEFAULT_BRANCH];
  } catch {
    return [DEFAULT_BRANCH];
  }
}

function saveBranches(branches: Branch[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BRANCHES_KEY, JSON.stringify(branches));
}

function loadActiveBranchId(): string {
  if (typeof window === "undefined") return DEFAULT_BRANCH.id;
  return localStorage.getItem(ACTIVE_BRANCH_KEY) || DEFAULT_BRANCH.id;
}

function saveActiveBranchId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_BRANCH_KEY, id);
}

function loadRecords(): ExpenseRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: ExpenseRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

/* ─── Store Hook ─── */
export function useExpenseStore() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>(DEFAULT_BRANCH.id);
  const [allRecords, setAllRecords] = useState<ExpenseRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadedBranches = loadBranches();
    setBranches(loadedBranches);
    const savedActiveId = loadActiveBranchId();
    const validActiveId = loadedBranches.some((b) => b.id === savedActiveId)
      ? savedActiveId
      : loadedBranches[0].id;
    setActiveBranchId(validActiveId);
    setAllRecords(loadRecords());
    setIsLoaded(true);
  }, []);

  /* Branch CRUD */
  const addBranch = useCallback((name: string) => {
    const newBranch: Branch = {
      id: crypto.randomUUID(),
      name: name.trim() || "未命名分支",
      createdAt: Date.now(),
    };
    setBranches((prev) => {
      const next = [...prev, newBranch];
      saveBranches(next);
      return next;
    });
    setActiveBranchId(newBranch.id);
    saveActiveBranchId(newBranch.id);
    return newBranch;
  }, []);

  const renameBranch = useCallback((id: string, name: string) => {
    if (id === DEFAULT_BRANCH.id) return;
    setBranches((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, name: name.trim() || b.name } : b));
      saveBranches(next);
      return next;
    });
  }, []);

  const deleteBranch = useCallback(
    (id: string) => {
      if (id === DEFAULT_BRANCH.id) return;
      setBranches((prev) => {
        const next = prev.filter((b) => b.id !== id);
        saveBranches(next);
        return next;
      });
      setAllRecords((prev) => {
        const next = prev.filter((r) => r.branchId !== id);
        saveRecords(next);
        return next;
      });
      setActiveBranchId((currentActive) => {
        if (currentActive === id) {
          const fallback = DEFAULT_BRANCH.id;
          saveActiveBranchId(fallback);
          return fallback;
        }
        return currentActive;
      });
    },
    []
  );

  const switchBranch = useCallback((id: string) => {
    setActiveBranchId(id);
    saveActiveBranchId(id);
  }, []);

  /* Record CRUD */
  const addRecord = useCallback(
    (record: Omit<ExpenseRecord, "id" | "createdAt" | "branchId">) => {
      const newRecord: ExpenseRecord = {
        ...record,
        branchId: activeBranchId,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      setAllRecords((prev) => {
        const next = [newRecord, ...prev];
        saveRecords(next);
        return next;
      });
    },
    [activeBranchId]
  );

  const deleteRecord = useCallback((id: string) => {
    setAllRecords((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveRecords(next);
      return next;
    });
  }, []);

  /* Derived: records for active branch (only valid currency types) */
  const validElements: Element[] = ["coin", "bindCoin", "crystal"];
  const records = allRecords.filter(
    (r) => r.branchId === activeBranchId && validElements.includes(r.element as Element)
  );

  /* Derived: summary for active branch (net per currency) */
  const summary: Summary = records.reduce(
    (acc, r) => {
      const delta = r.type === "income" ? r.amount : -r.amount;
      if (r.element === "coin") acc.coinTotal += delta;
      if (r.element === "bindCoin") acc.bindCoinTotal += delta;
      if (r.element === "crystal") acc.crystalTotal += delta;
      return acc;
    },
    {
      coinTotal: 0,
      bindCoinTotal: 0,
      crystalTotal: 0,
    }
  );

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  return {
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
  };
}
