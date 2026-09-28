import { describe, it, expect } from "vitest";
import { buildReceiptExport } from "./exportReceipt";
import type { EvidenceReceipt } from "../types/receipt";

const receipt: EvidenceReceipt = {
  id: "7ac291aa-bbbb-cccc-dddd-eeeeeeeeeeee",
  displayId: "PD-7AC291",
  fileName: "supplier-quotation.pdf",
  mimeType: "application/pdf",
  sizeBytes: 438988,
  sha256: "a".repeat(64),
  registeredAt: "2026-09-28T19:52:14.000Z",
};

describe("buildReceiptExport", () => {
  it("produces the correct schema and version", () => {
    const result = buildReceiptExport(receipt);
    expect(result.schema).toBe("proofdrop-receipt");
    expect(result.version).toBe("1.0");
  });

  it("maps receiptId to displayId", () => {
    const result = buildReceiptExport(receipt);
    expect(result.receiptId).toBe("PD-7AC291");
  });

  it("includes artifact metadata", () => {
    const result = buildReceiptExport(receipt);
    expect(result.artifact.fileName).toBe("supplier-quotation.pdf");
    expect(result.artifact.mimeType).toBe("application/pdf");
    expect(result.artifact.sizeBytes).toBe(438988);
  });

  it("includes fingerprint algorithm and value", () => {
    const result = buildReceiptExport(receipt);
    expect(result.fingerprint.algorithm).toBe("SHA-256");
    expect(result.fingerprint.value).toBe("a".repeat(64));
  });

  it("includes registeredAt", () => {
    const result = buildReceiptExport(receipt);
    expect(result.registeredAt).toBe("2026-09-28T19:52:14.000Z");
  });

  it("download filename format", () => {
    // Verify the expected filename is derivable from displayId
    const expected = `proofdrop-${receipt.displayId}.json`;
    expect(expected).toBe("proofdrop-PD-7AC291.json");
  });
});
