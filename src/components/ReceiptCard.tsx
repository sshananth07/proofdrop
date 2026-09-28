import { useState } from "react";
import { Copy, Check, Download, ShieldCheck } from "lucide-react";
import type { EvidenceReceipt } from "../types/receipt";
import { formatBytes, formatTimestamp } from "../lib/format";
import { downloadReceipt } from "../lib/exportReceipt";

interface ReceiptCardProps {
  receipt: EvidenceReceipt;
  onVerify: () => void;
  onStartOver: () => void;
  storageWarning?: boolean;
}

export function ReceiptCard({
  receipt,
  onVerify,
  onStartOver,
  storageWarning = false,
}: ReceiptCardProps) {
  const [copied, setCopied] = useState(false);
  const [exportError, setExportError] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(receipt.sha256);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail — hash is visible on screen
    }
  }

  function handleExport() {
    try {
      downloadReceipt(receipt);
    } catch {
      setExportError(true);
    }
  }

  const mimeDisplay = receipt.mimeType || "Unknown type";

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            ProofDrop Receipt
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">
              Receipt ID
            </label>
            <p className="font-mono text-sm font-semibold text-gray-900 mt-0.5">
              {receipt.displayId}
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">
              Filename
            </label>
            <p className="text-sm text-gray-900 mt-0.5 break-all">
              {receipt.fileName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">
                Size
              </label>
              <p className="text-sm text-gray-900 mt-0.5">
                {formatBytes(receipt.sizeBytes)}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wide">
                Type
              </label>
              <p className="text-sm text-gray-900 mt-0.5 truncate">
                {mimeDisplay}
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">
              Registered
            </label>
            <p className="text-sm text-gray-900 mt-0.5">
              {formatTimestamp(receipt.registeredAt)}
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide">
              SHA-256 Fingerprint
            </label>
            <p className="text-xs text-gray-500 mt-1">
              This fingerprint represents the exact contents of the registered
              file.
            </p>
            <div className="mt-1.5 bg-gray-50 border border-gray-200 rounded p-3 flex items-start justify-between gap-2">
              <code className="font-mono text-xs text-gray-800 break-all leading-relaxed">
                {receipt.sha256}
              </code>
              <button
                onClick={handleCopy}
                title="Copy hash"
                className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="Copy hash"
              >
                {copied ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1">Copied to clipboard</p>
            )}
          </div>
        </div>

        {storageWarning && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            Receipt created, but browser storage is unavailable. Export the
            receipt to preserve it.
          </div>
        )}

        {exportError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
            Receipt export failed. Please try again.
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={onVerify}
            className="flex-1 min-w-[140px] bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Verify artifact
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download size={14} />
            Export JSON
          </button>
          <button
            onClick={onStartOver}
            className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2.5 transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}
