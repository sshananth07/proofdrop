import { CheckCircle2, XCircle } from "lucide-react";
import type { EvidenceReceipt, VerificationResult } from "../types/receipt";
import { formatTimestamp } from "../lib/format";

interface VerificationResultViewProps {
  receipt: EvidenceReceipt;
  candidateFileName: string;
  candidateHash: string;
  result: VerificationResult;
  verifiedAt: string;
  onDone: () => void;
  onVerifyAnother: () => void;
}

export function VerificationResultView({
  receipt,
  candidateFileName,
  candidateHash,
  result,
  verifiedAt,
  onDone,
  onVerifyAnother,
}: VerificationResultViewProps) {
  const isMatch = result === "match";

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div
        className={`bg-white border rounded-xl shadow-sm p-6 ${
          isMatch ? "border-green-300" : "border-red-300"
        }`}
      >
        {/* Heading */}
        <div className="flex items-center gap-3 mb-4">
          {isMatch ? (
            <CheckCircle2 size={28} className="text-green-600 shrink-0" />
          ) : (
            <XCircle size={28} className="text-red-600 shrink-0" />
          )}
          <div>
            <h2
              className={`text-base font-bold uppercase tracking-wider ${
                isMatch ? "text-green-800" : "text-red-800"
              }`}
            >
              {isMatch ? "Integrity Verified" : "Integrity Mismatch"}
            </h2>
            <p
              className={`text-sm mt-0.5 ${
                isMatch ? "text-green-700" : "text-red-700"
              }`}
            >
              {isMatch
                ? "Exact byte-for-byte match."
                : "The presented file does not match the registered artifact."}
            </p>
          </div>
        </div>

        {/* Hash comparison */}
        <div className="space-y-3 mt-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">
              Registered ({receipt.displayId}) — {receipt.fileName}
            </label>
            <code className="block font-mono text-xs text-gray-700 mt-1 bg-gray-50 border border-gray-200 rounded p-2 break-all">
              {receipt.sha256}
            </code>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">
              Presented — {candidateFileName}
            </label>
            <code
              className={`block font-mono text-xs mt-1 rounded p-2 break-all border ${
                isMatch
                  ? "text-green-800 bg-green-50 border-green-200"
                  : "text-red-800 bg-red-50 border-red-200"
              }`}
            >
              {candidateHash}
            </code>
          </div>
        </div>

        {/* Additional context */}
        <div className="mt-4 text-sm text-gray-600">
          {isMatch ? (
            <p>
              The presented file matches receipt{" "}
              <span className="font-mono font-semibold">{receipt.displayId}</span>.
            </p>
          ) : (
            <p>The files are not byte-for-byte identical.</p>
          )}
        </div>

        {/* Timestamps */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
          <div>
            <span className="uppercase tracking-wide text-gray-400">
              Registered
            </span>
            <br />
            {formatTimestamp(receipt.registeredAt)}
          </div>
          <div>
            <span className="uppercase tracking-wide text-gray-400">
              Verified
            </span>
            <br />
            {formatTimestamp(verifiedAt)}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={onVerifyAnother}
            className="flex-1 min-w-[140px] border border-blue-500 text-blue-600 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Verify another file
          </button>
          <button
            onClick={onDone}
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
