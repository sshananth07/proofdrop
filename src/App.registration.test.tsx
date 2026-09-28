import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

// Mock sha256 to avoid crypto.subtle issues in jsdom
vi.mock("./lib/hash", () => ({
  sha256: vi.fn().mockResolvedValue("a".repeat(64)),
}));

// Mock receipts module
vi.mock("./lib/receipts", () => ({
  getReceipts: vi.fn().mockReturnValue([]),
  saveReceipt: vi.fn().mockReturnValue({ receipts: [], persisted: true }),
  updateVerificationResult: vi
    .fn()
    .mockReturnValue({ receipts: [], persisted: true }),
}));

// Mock exportReceipt
vi.mock("./lib/exportReceipt", () => ({
  downloadReceipt: vi.fn(),
  buildReceiptExport: vi.fn(),
}));

import { sha256 } from "./lib/hash";
import { saveReceipt, getReceipts } from "./lib/receipts";

const mockSha256 = vi.mocked(sha256);
const mockSaveReceipt = vi.mocked(saveReceipt);
const mockGetReceipts = vi.mocked(getReceipts);

beforeEach(() => {
  vi.clearAllMocks();
  mockSha256.mockResolvedValue("a".repeat(64));
  mockSaveReceipt.mockReturnValue({ receipts: [], persisted: true });
  mockGetReceipts.mockReturnValue([]);
});

function makeReceipt(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    displayId: "PD-AABBCC",
    fileName: "test.pdf",
    mimeType: "application/pdf",
    sizeBytes: 2048,
    sha256: "a".repeat(64),
    registeredAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("App - Registration", () => {
  it("shows initial heading", () => {
    render(<App />);
    expect(
      screen.getByText("Know exactly which file was submitted.")
    ).toBeInTheDocument();
  });

  it("registers a file and shows receipt", async () => {
    const receipt = makeReceipt();
    mockSaveReceipt.mockReturnValue({
      receipts: [receipt],
      persisted: true,
    });

    render(<App />);
    const dropZone = screen.getByRole("button", { name: /file drop zone/i });
    const file = new File(["content"], "supplier-quotation.pdf", {
      type: "application/pdf",
    });

    // Simulate drop
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText("ProofDrop Receipt")).toBeInTheDocument();
    });
  });

  it("shows Unknown type when MIME type is empty", async () => {
    const receipt = makeReceipt({ mimeType: "" });
    mockSaveReceipt.mockReturnValue({ receipts: [receipt], persisted: true });

    render(<App />);
    const dropZone = screen.getByRole("button", { name: /file drop zone/i });
    const file = new File(["content"], "file.bin", { type: "" });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText("Unknown type")).toBeInTheDocument();
    });
  });

  it("shows large file warning for files over 250 MB", async () => {
    render(<App />);
    const dropZone = screen.getByRole("button", { name: /file drop zone/i });

    // Create a file-like object with a large size
    const file = new File(["x"], "big.bin", { type: "application/octet-stream" });
    Object.defineProperty(file, "size", { value: 251 * 1024 * 1024 });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          /Large files may take longer to process in your browser/
        )
      ).toBeInTheDocument();
    });
  });

  it("shows storage warning when persistence fails", async () => {
    const receipt = makeReceipt();
    mockSaveReceipt.mockReturnValue({ receipts: [receipt], persisted: false });

    render(<App />);
    const dropZone = screen.getByRole("button", { name: /file drop zone/i });
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          /Receipt created, but browser storage is unavailable/
        )
      ).toBeInTheDocument();
    });
  });

  it("shows up to 3 recent receipts", async () => {
    const r1 = makeReceipt({ id: "id-1", displayId: "PD-111111", fileName: "a.pdf" });
    const r2 = makeReceipt({ id: "id-2", displayId: "PD-222222", fileName: "b.pdf" });
    const r3 = makeReceipt({ id: "id-3", displayId: "PD-333333", fileName: "c.pdf" });
    const r4 = makeReceipt({ id: "id-4", displayId: "PD-444444", fileName: "d.pdf" });

    mockGetReceipts.mockReturnValue([r1, r2, r3, r4]);

    render(<App />);

    expect(screen.getByText("PD-111111")).toBeInTheDocument();
    expect(screen.getByText("PD-222222")).toBeInTheDocument();
    expect(screen.getByText("PD-333333")).toBeInTheDocument();
    expect(screen.queryByText("PD-444444")).not.toBeInTheDocument();
  });

  it("clicking a recent receipt opens its detail", async () => {
    const receipt = makeReceipt({
      id: "id-1",
      displayId: "PD-ABCDEF",
      fileName: "contract.pdf",
    });
    mockGetReceipts.mockReturnValue([receipt]);

    render(<App />);

    const receiptButton = screen.getByText("PD-ABCDEF");
    fireEvent.click(receiptButton);

    await waitFor(() => {
      expect(screen.getByText("ProofDrop Receipt")).toBeInTheDocument();
    });
  });
});
