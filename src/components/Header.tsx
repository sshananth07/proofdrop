import { ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-blue-600" size={20} />
        <span className="font-semibold text-gray-900 tracking-wide text-sm uppercase">
          ProofDrop
        </span>
      </div>
      <span className="text-xs text-gray-500 font-medium tracking-widest uppercase">
        Local Processing
      </span>
    </header>
  );
}
