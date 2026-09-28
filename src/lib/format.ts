/**
 * Derive a human-facing display ID from the first 6 hex chars of a UUID.
 * Example: "7ac291aa-bbbb-…"  →  "PD-7AC291"
 */
export function createDisplayId(uuid: string): string {
  const hex = uuid.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `PD-${hex}`;
}

const SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/**
 * Human-readable file size (e.g. 438 KB, 1.2 MB).
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "Unknown size";
  if (bytes === 0) return "0 B";
  const i = Math.min(
    Math.floor(Math.log2(bytes) / 10),
    SIZE_UNITS.length - 1
  );
  const value = bytes / Math.pow(1024, i);
  return `${value % 1 === 0 ? value : value.toFixed(1)} ${SIZE_UNITS[i]}`;
}

/**
 * Format an ISO timestamp to a locale-friendly string.
 */
export function formatTimestamp(value: string): string {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
