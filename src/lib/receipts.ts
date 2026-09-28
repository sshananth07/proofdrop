import type { EvidenceReceipt, VerificationResult } from "../types/receipt";

const STORAGE_KEY = "proofdrop.receipts.v1";

export function getReceipts(): EvidenceReceipt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as EvidenceReceipt[];
  } catch {
    return [];
  }
}

function persist(receipts: EvidenceReceipt[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
    return true;
  } catch {
    return false;
  }
}

export function saveReceipt(
  receipt: EvidenceReceipt
): { receipts: EvidenceReceipt[]; persisted: boolean } {
  const existing = getReceipts();
  const receipts = [receipt, ...existing.filter((r) => r.id !== receipt.id)];
  const persisted = persist(receipts);
  return { receipts, persisted };
}

export function updateVerificationResult(
  id: string,
  result: VerificationResult,
  verifiedAt: string
): { receipts: EvidenceReceipt[]; persisted: boolean } {
  const existing = getReceipts();
  const receipts = existing.map((r) =>
    r.id === id
      ? { ...r, lastVerificationResult: result, lastVerifiedAt: verifiedAt }
      : r
  );
  const persisted = persist(receipts);
  return { receipts, persisted };
}
