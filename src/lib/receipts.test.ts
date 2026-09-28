import { describe, it, expect, beforeEach, vi } from "vitest";
import { getReceipts, saveReceipt, updateVerificationResult } from "./receipts";
import type { EvidenceReceipt } from "../types/receipt";

const STORAGE_KEY = "proofdrop.receipts.v1";

function makeReceipt(overrides: Partial<EvidenceReceipt> = {}): EvidenceReceipt {
  return {
    id: crypto.randomUUID(),
    displayId: "PD-AABBCC",
    fileName: "test.pdf",
    mimeType: "application/pdf",
    sizeBytes: 1024,
    sha256: "a".repeat(64),
    registeredAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("getReceipts", () => {
  it("returns [] when storage is empty", () => {
    expect(getReceipts()).toEqual([]);
  });

  it("returns [] for corrupt JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not-json{{");
    expect(getReceipts()).toEqual([]);
  });

  it("returns [] when stored value is not an array", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: "x" }));
    expect(getReceipts()).toEqual([]);
  });
});

describe("saveReceipt", () => {
  it("prepends the newest receipt", () => {
    const r1 = makeReceipt({ id: "id-1" });
    const r2 = makeReceipt({ id: "id-2" });
    saveReceipt(r1);
    const { receipts } = saveReceipt(r2);
    expect(receipts[0].id).toBe("id-2");
    expect(receipts[1].id).toBe("id-1");
  });

  it("uses the correct storage key", () => {
    const r = makeReceipt();
    saveReceipt(r);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it("returns persisted: false when localStorage.setItem throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    const { persisted } = saveReceipt(makeReceipt());
    expect(persisted).toBe(false);
  });
});

describe("updateVerificationResult", () => {
  it("updates only the matching receipt", () => {
    const r1 = makeReceipt({ id: "id-1" });
    const r2 = makeReceipt({ id: "id-2" });
    saveReceipt(r1);
    saveReceipt(r2);
    const now = new Date().toISOString();
    const { receipts } = updateVerificationResult("id-1", "match", now);
    const updated = receipts.find((r) => r.id === "id-1")!;
    const other = receipts.find((r) => r.id === "id-2")!;
    expect(updated.lastVerificationResult).toBe("match");
    expect(updated.lastVerifiedAt).toBe(now);
    expect(other.lastVerificationResult).toBeUndefined();
  });
});
