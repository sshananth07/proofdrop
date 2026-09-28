import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

const LARGE_FILE_THRESHOLD = 250 * 1024 * 1024;

interface FileDropZoneProps {
  onFile: (file: File) => void;
  processing: boolean;
  label?: string;
  subLabel?: string;
}

export function FileDropZone({
  onFile,
  processing,
  label = "Register an artifact",
  subLabel = "Drop a file here or browse",
}: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [largeFileWarning, setLargeFileWarning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setLargeFileWarning(file.size > LARGE_FILE_THRESHOLD);
    onFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="File drop zone"
        onClick={() => !processing && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !processing)
            inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center gap-3
          border-2 rounded-xl px-8 py-14 cursor-pointer select-none
          transition-colors duration-150
          ${
            dragging
              ? "border-blue-500 bg-blue-50"
              : "border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40"
          }
          ${processing ? "cursor-not-allowed opacity-70" : ""}
        `}
      >
        {processing ? (
          <>
            <Loader2 size={32} className="text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-blue-700">
              Creating cryptographic fingerprint…
            </p>
          </>
        ) : (
          <>
            <UploadCloud
              size={32}
              className={dragging ? "text-blue-500" : "text-gray-400"}
            />
            <div className="text-center">
              <p className="font-semibold text-gray-800 text-sm">{label}</p>
              <p className="text-sm text-gray-500 mt-1">{subLabel}</p>
            </div>
            <span className="text-xs text-gray-400 mt-1">
              Processed locally using SHA-256
            </span>
          </>
        )}
      </div>

      {largeFileWarning && !processing && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          Large files may take longer to process in your browser.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        aria-hidden="true"
      />
    </div>
  );
}
