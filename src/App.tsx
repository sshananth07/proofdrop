import { useState, useEffect } from "react";
import type { EvidenceReceipt, VerificationResult } from "./types/receipt";
import { sha256 } from "./lib/hash";
import { createDisplayId } from "./lib/format";
import {
  getReceipts,
  saveReceipt,
  updateVerificationResult,
} from "./lib/receipts";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { FileDropZone } from "./components/FileDropZone";
import { ReceiptCard } from "./components/ReceiptCard";
import { RecentReceipts } from "./components/RecentReceipts";
import { VerificationPanel } from "./components/VerificationPanel";
import { VerificationResultView } from "./components/VerificationResult";
import { PrivacyBadge } from "./components/PrivacyBadge";

type AppState =
  | "home"
  | "processing"
  | "registered"
  | "verifying"
  | "verified"
  | "mismatch";

interface VerificationState {
  candidateFileName: string;
  candidateHash: string;
  result: VerificationResult;
  verifiedAt: string;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>("home");
  const [receipts, setReceipts] = useState<EvidenceReceipt[]>([]);
  const [currentReceipt, setCurrentReceipt] = useState<EvidenceReceipt | null>(
    null
  );
  const [verificationState, setVerificationState] =
    useState<VerificationState | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const [hashError, setHashError] = useState(false);
  const [largeFileWarning, setLargeFileWarning] = useState(false);

  // Load receipts from localStorage on mount
  useEffect(() => {
    setReceipts(getReceipts());
  }, []);

  async function handleRegisterFile(file: File) {
    setAppState("processing");
    setHashError(false);
    setLargeFileWarning(file.size > 250 * 1024 * 1024);
    try {
      const hash = await sha256(file);
      const id = crypto.randomUUID();
      const displayId = createDisplayId(id);
      const receipt: EvidenceReceipt = {
        id,
        displayId,
        fileName: file.name,
        mimeType: file.type || "",
        sizeBytes: file.size,
        sha256: hash,
        registeredAt: new Date().toISOString(),
      };
      const { receipts: updated, persisted } = saveReceipt(receipt);
      setReceipts(updated);
      setCurrentReceipt(receipt);
      setStorageWarning(!persisted);
      setAppState("registered");
    } catch {
      setHashError(true);
      setAppState("home");
    }
  }

  async function handleVerifyFile(file: File) {
    if (!currentReceipt) return;
    setAppState("verifying");
    try {
      const candidateHash = await sha256(file);
      const result: VerificationResult =
        candidateHash === currentReceipt.sha256 ? "match" : "mismatch";
      const verifiedAt = new Date().toISOString();
      const vs: VerificationState = {
        candidateFileName: file.name,
        candidateHash,
        result,
        verifiedAt,
      };
      setVerificationState(vs);

      // Update persistence and in-memory receipts
      const { receipts: updated } = updateVerificationResult(
        currentReceipt.id,
        result,
        verifiedAt
      );
      setReceipts(updated);
      setCurrentReceipt((prev) =>
        prev
          ? {
              ...prev,
              lastVerificationResult: result,
              lastVerifiedAt: verifiedAt,
            }
          : prev
      );

      setAppState(result === "match" ? "verified" : "mismatch");
    } catch {
      setHashError(true);
      setAppState("registered");
    }
  }

  function handleSelectReceipt(receipt: EvidenceReceipt) {
    setCurrentReceipt(receipt);
    setVerificationState(null);
    setStorageWarning(false);
    setAppState("registered");
  }

  function handleStartOver() {
    setCurrentReceipt(null);
    setVerificationState(null);
    setStorageWarning(false);
    setHashError(false);
    setLargeFileWarning(false);
    setAppState("home");
  }

  function handleVerifyAnother() {
    setVerificationState(null);
    setAppState("registered");
  }

  function handleDone() {
    setAppState("registered");
  }

  const showHome = appState === "home" || appState === "processing";
  const showRegistered = appState === "registered";
  const showVerifying = appState === "verifying";
  const showResult =
    appState === "verified" || appState === "mismatch";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 py-8 space-y-6">
        {/* Home / Registration flow */}
        {showHome && (
          <>
            <Hero />
            <FileDropZone
              onFile={handleRegisterFile}
              processing={appState === "processing"}
            />
            <PrivacyBadge />
            {hashError && (
              <p className="text-center text-xs text-red-600 px-4">
                ProofDrop couldn&apos;t generate a fingerprint for this file.
                Please try another file.
              </p>
            )}
            {receipts.length > 0 && (
              <RecentReceipts receipts={receipts} onSelect={handleSelectReceipt} />
            )}
          </>
        )}

        {/* Receipt view */}
        {showRegistered && currentReceipt && (
          <div className="space-y-6 pt-4">
            {largeFileWarning && (
              <p className="w-full max-w-xl mx-auto px-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                Large files may take longer to process in your browser.
              </p>
            )}
            <ReceiptCard
              receipt={currentReceipt}
              onVerify={() => setAppState("verifying")}
              onStartOver={handleStartOver}
              storageWarning={storageWarning}
            />
            {receipts.length > 0 && (
              <RecentReceipts
                receipts={receipts}
                onSelect={handleSelectReceipt}
              />
            )}
          </div>
        )}

        {/* Verification candidate drop */}
        {showVerifying && currentReceipt && (
          <div className="pt-4">
            <VerificationPanel
              receipt={currentReceipt}
              processing={true}
              onFile={handleVerifyFile}
              onCancel={() => setAppState("registered")}
            />
          </div>
        )}

        {/* Verification result */}
        {showResult && currentReceipt && verificationState && (
          <div className="pt-4">
            <VerificationResultView
              receipt={currentReceipt}
              candidateFileName={verificationState.candidateFileName}
              candidateHash={verificationState.candidateHash}
              result={verificationState.result}
              verifiedAt={verificationState.verifiedAt}
              onDone={handleDone}
              onVerifyAnother={handleVerifyAnother}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-5 text-center">
        <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
          ProofDrop verifies whether two files have identical SHA-256
          fingerprints. It does not establish ownership, authorship, intent, or
          a complete legal chain of custody.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          ProofDrop stores the fingerprint, not the original file.
        </p>
      </footer>
    </div>
  );
}
