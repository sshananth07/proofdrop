import { Clock, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import type { EvidenceReceipt } from "../types/receipt";
import { formatTimestamp } from "../lib/format";

interface RecentReceiptsProps {
  receipts: EvidenceReceipt[];
  onSelect: (receipt: EvidenceReceipt) => void;
}

function StatusBadge({
  result,
}: {
  result: EvidenceReceipt["lastVerificationResult"];
}) {
  if (result === "match") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
        <CheckCircle size={12} />
        Verified
      </span>
    );
  }
  if (result === "mismatch") {
    return (
      <span className="flex items-center gap-1 text-xs text-red-700 font-medium">
        <XCircle size={12} />
        Mismatch
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
      <MinusCircle size={12} />
      Not verified
    </span>
  );
}

export function RecentReceipts({ receipts, onSelect }: RecentReceiptsProps) {
  if (receipts.length === 0) return null;

  const recent = receipts.slice(0, 3);

  return (
    <div className="w-full max-w-xl mx-auto px-4 mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
        Recent Receipts
      </h2>
      <div className="space-y-2">
        {recent.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className="w-full text-left bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <code className="font-mono text-xs font-semibold text-blue-700 shrink-0">
                {r.displayId}
              </code>
              <span className="text-sm text-gray-800 truncate">
                {r.fileName}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                <Clock size={11} />
                {formatTimestamp(r.registeredAt)}
              </span>
              <StatusBadge result={r.lastVerificationResult} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
