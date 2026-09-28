# How ProofDrop was built with IBM Bob

ProofDrop was built entirely inside **IBM Bob** — a developer-facing AI agent — in a single 40-minute session, starting from a specification and implementation plan and finishing with a working, tested, production-buildable application.

---

## What IBM Bob is

IBM Bob is an AI software engineer that lives inside your editor. It reads your codebase, writes and edits files, runs commands, tracks a to-do list, and iterates until the work is correct — all without switching context. It has access to tools for reading and writing files, executing shell commands, running tests, and searching the codebase.

---

## How the session worked

### Input documents

Two documents were provided at the start of the session:

- **`docs/superpowers/specs/2026-09-28-proofdrop-design.md`** — a 26-section product specification covering the problem statement, product boundary, domain model, storage contract, cryptographic requirements, UI states, error handling, privacy copy, and acceptance criteria.
- **`docs/superpowers/plans/2026-09-28-proofdrop.md`** — a 5-task implementation plan with step-by-step instructions, file boundaries, interface contracts, and test assertions.

The spec was treated as the source of truth. The implementation plan defined the execution order.

### What Bob did

Bob read both documents in full before touching any files, then executed the implementation plan task by task:

| Task | What was built |
|---|---|
| **Task 1** | Scaffolded the Vite + React + TypeScript + Tailwind project, defined `EvidenceReceipt` and `VerificationResult` types, implemented `sha256()` using Web Crypto, wrote `createDisplayId()`, `formatBytes()`, `formatTimestamp()`, and their unit tests |
| **Task 2** | Built `receipts.ts` (localStorage persistence with corrupt-JSON resilience and quota-failure handling), `exportReceipt.ts` (JSON receipt builder and download trigger), and tests for both |
| **Task 3** | Built all eight UI components (`Header`, `Hero`, `FileDropZone`, `ReceiptCard`, `RecentReceipts`, `VerificationPanel`, `VerificationResult`, `PrivacyBadge`), wired them into `App.tsx` as a state machine, and wrote registration flow tests |
| **Task 4** | Implemented the full verification flow — candidate file hashing, SHA-256 comparison, VERIFIED/MISMATCH result states, persistence updates — and wrote verification tests |
| **Task 5** | Fixed TypeScript errors surfaced by `tsc --noEmit`, corrected a test assertion (wrong expected value), polyfilled `File.arrayBuffer()` for jsdom, and wired up the final visual system |

### How Bob iterated

When the first test run returned 6 failures, Bob read the error output, identified three root causes, and fixed all of them in the same response:

1. **jsdom `File.arrayBuffer()` missing** — patched with a `FileReader`-based polyfill in the test file.
2. **Wrong expected value in a `formatBytes` test** — corrected the test assertion.
3. **Large-file warning only rendered in `FileDropZone`** — which got unmounted after registration completed. Bob moved the warning into `App`-level state so it persisted into the receipt view.

After fixes, all **41 tests passed** and TypeScript reported zero errors.

### Tools Bob used

| Tool | Purpose |
|---|---|
| `read_file` | Read spec and plan documents before starting |
| `write_file` | Create every source file from scratch |
| `apply_diff` | Make surgical edits after test failures |
| `execute_command` | Run `npm install`, `npm test`, `npx tsc --noEmit` |
| `update_todo_list` | Track task progress across the 5-task plan |

---

## What the spec drove

Everything in the codebase traces directly to the specification:

- The `EvidenceReceipt` interface is copied verbatim from spec section 7.
- The `proofdrop.receipts.v1` storage key is from spec section 8.
- The `sha256()` implementation signature and algorithm are from spec section 9.
- Receipt IDs (`PD-` + first 6 hex chars of UUID) are from spec section 7.
- The export schema is from spec section 15.
- All UI copy — headings, privacy statements, disclaimer — comes directly from spec sections 2, 12–14, and 22.
- The prohibition on phrases like "maliciously modified", "military-grade", or "legally admissible" is from spec section 3, and a test asserts their absence.

---

## Outcome

A fully working browser-only application was produced with:

- Real SHA-256 hashing via `crypto.subtle.digest`
- File registration with drag-and-drop and file picker
- Receipt persistence and corruption resilience
- Candidate file verification with correct match/mismatch logic
- JSON receipt export
- 41 passing unit and component tests
- Zero TypeScript errors
- A clean production build
