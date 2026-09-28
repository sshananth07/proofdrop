export type VerificationResult = "match" | "mismatch";

export interface EvidenceReceipt {
  id: string;
  displayId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  registeredAt: string;
  lastVerifiedAt?: string;
  lastVerificationResult?: VerificationResult;
}
