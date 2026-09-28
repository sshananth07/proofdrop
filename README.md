# ProofDrop

> **Know exactly which file was submitted.**

ProofDrop creates cryptographic receipts for important files so you can later verify whether a presented artifact is exactly the same file that was originally registered — byte for byte.

---

## What it does

When you register a file, ProofDrop computes a **SHA-256 fingerprint** of the actual file bytes using the browser's native Web Crypto API and stores a receipt locally. Later, you can drop any candidate file against that receipt — ProofDrop will tell you whether the two files are an exact byte-for-byte match.

**ProofDrop only establishes one condition:**

```
SHA256(original) === SHA256(candidate)
```

It does not establish authorship, ownership, intent, or a legal chain of custody.

---

## Primary demo scenario — Supplier Quotation Dispute

1. Create `quotation.txt` with:
   ```
   Quotation Total: RM 12,500
   Payment Terms: 30 Days
   ```
2. Register it in ProofDrop → a receipt is created with the SHA-256 fingerprint.
3. Edit the file to:
   ```
   Quotation Total: RM 18,500
   Payment Terms: 30 Days
   ```
4. Verify the changed file against the original receipt.
5. ProofDrop reports **INTEGRITY MISMATCH** — the bytes differ.
6. Verify the original unmodified file (or a renamed copy) → **INTEGRITY VERIFIED**.

---

## Key features

| Feature | Detail |
|---|---|
| File registration | Drag-and-drop or file picker |
| Hashing | SHA-256 via Web Crypto API — real cryptographic hash |
| Receipts | Human-readable IDs (`PD-7AC291`) + full hash display |
| Verification | Drop any candidate file — filename is irrelevant, only bytes matter |
| Persistence | Receipts stored in `localStorage` under `proofdrop.receipts.v1` |
| Export | Download receipt as structured JSON |
| Privacy | Files are never uploaded — all processing happens in your browser |
| Recent receipts | Last 3 receipts shown on the home screen |

---

## Tech stack

- **Vite** — build tool and dev server
- **React 18** — UI
- **TypeScript** — type safety
- **Tailwind CSS** — styling
- **Lucide React** — icons
- **Vitest + Testing Library** — unit and component tests
- **Native browser APIs** — File API, Web Crypto, localStorage, Blob

No backend. No database. No authentication. No third-party file upload.

---

## Getting started

### Prerequisites

- Node.js 18+ and npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run tests

```bash
npm test -- --run
```

### Build for production

```bash
npm run build
```

Output is in `dist/`. Serve it with any static file host.

### Preview the production build locally

```bash
npm run preview
```

---

## Project structure

```
src/
  components/
    Header.tsx          # Top navigation bar
    Hero.tsx            # Heading and subheading
    FileDropZone.tsx    # Drag-and-drop / file picker zone
    ReceiptCard.tsx     # Registered receipt display + actions
    RecentReceipts.tsx  # Last 3 receipts on home screen
    VerificationPanel.tsx   # Candidate file drop for verification
    VerificationResult.tsx  # VERIFIED / MISMATCH result display
    PrivacyBadge.tsx    # "Files processed locally" notice
  lib/
    hash.ts             # sha256() using Web Crypto API
    receipts.ts         # localStorage persistence helpers
    exportReceipt.ts    # JSON receipt export and download
    format.ts           # createDisplayId(), formatBytes(), formatTimestamp()
  types/
    receipt.ts          # EvidenceReceipt and VerificationResult types
  App.tsx               # State machine and top-level orchestration
  main.tsx              # React entry point
  index.css             # Tailwind base styles
```

---

## Privacy and disclaimer

- Files are processed locally in your browser.
- ProofDrop stores the fingerprint, not the original file.
- Original file bytes are never written to `localStorage` and never sent over the network.
- ProofDrop verifies whether two files have identical SHA-256 fingerprints. It does not establish ownership, authorship, intent, or a complete legal chain of custody.
