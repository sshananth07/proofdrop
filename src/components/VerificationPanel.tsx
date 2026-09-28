import { FileDropZone } from "./FileDropZone";
import type { EvidenceReceipt } from "../types/receipt";

interface VerificationPanelProps {
  receipt: EvidenceReceipt;
  processing: boolean;
  onFile: (file: File) => void;
  onCancel: () => void;
}

export function VerificationPanel({
  receipt,
  processing,
  onFile,
  onCancel,
}: VerificationPanelProps) {
  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Verify Artifact
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-medium">Registered artifact:</span>{" "}
            {receipt.fileName}
          </p>
        </div>

        <FileDropZone
          onFile={onFile}
          processing={processing}
          label="Drop the file to verify"
          subLabel="Drop the file you want to compare against this receipt"
        />

        <button
          onClick={onCancel}
          className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to receipt
        </button>
      </div>
    </div>
  );
}
