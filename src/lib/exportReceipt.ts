import type { EvidenceReceipt } from "../types/receipt";

export interface ProofDropReceiptExport {
  schema: "proofdrop-receipt";
  version: "1.0";
  receiptId: string;
  artifact: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  };
  fingerprint: {
    algorithm: "SHA-256";
    value: string;
  };
  registeredAt: string;
}

export function buildReceiptExport(
  receipt: EvidenceReceipt
): ProofDropReceiptExport {
  return {
    schema: "proofdrop-receipt",
    version: "1.0",
    receiptId: receipt.displayId,
    artifact: {
      fileName: receipt.fileName,
      mimeType: receipt.mimeType,
      sizeBytes: receipt.sizeBytes,
    },
    fingerprint: {
      algorithm: "SHA-256",
      value: receipt.sha256,
    },
    registeredAt: receipt.registeredAt,
  };
}

export function downloadReceipt(receipt: EvidenceReceipt): void {
  const data = buildReceiptExport(receipt);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `proofdrop-${receipt.displayId}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
