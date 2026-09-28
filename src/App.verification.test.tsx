import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";

// Mock sha256 - controls what hash is returned for which file
const mockSha256 = vi.fn();
vi.mock("./lib/hash", () => ({
  sha256: (...args: unknown[]) => mockSha256(...args),
}));

const mockSaveReceipt = vi.fn();
const mockGetReceipts = vi.fn();
const mockUpdateVerification = vi.fn();
vi.mock("./lib/receipts", () => ({
  getReceipts: (...args: unknown[]) => mockGetReceipts(...args),
  saveReceipt: (...args: unknown[]) => mockSaveReceipt(...args),
  updateVerificationResult: (...args: unknown[]) =>
    mockUpdateVerification(...args),
}));

vi.mock("./lib/exportReceipt", () => ({
  downloadReceipt: vi.fn(),
  buildReceiptExport: vi.fn(),
}));

const ORIGINAL_HASH = "b".repeat(64);
const DIFFERENT_HASH = "c".repeat(64);

function makeReceipt(overrides = {}) {
  return {
    id: "test-uuid-1234",
    displayId: "PD-TESTU",
    fileName: "quotation.pdf",
    mimeType: "application/pdf",
    sizeBytes: 1024,
    sha256: ORIGINAL_HASH,
    registeredAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetReceipts.mockReturnValue([]);
  mockSaveReceipt.mockImplementation((r) => ({ receipts: [r], persisted: true }));
  mockUpdateVerification.mockImplementation((_id, result, verifiedAt) => ({
    receipts: [makeReceipt({ lastVerificationResult: result, lastVerifiedAt: verifiedAt })],
    persisted: true,
  }));
});

async function registerFile(hash = ORIGINAL_HASH, fileName = "quotation.pdf") {
  const receipt = makeReceipt({ sha256: hash, fileName });
  mockSha256.mockResolvedValue(hash);
  mockSaveReceipt.mockReturnValue({ receipts: [receipt], persisted: true });

  render(<App />);

  const dropZone = screen.getByRole("button", { name: /file drop zone/i });
  const file = new File(["content"], fileName, { type: "application/pdf" });
  fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

  await waitFor(() => {
    expect(screen.getByText("ProofDrop Receipt")).toBeInTheDocument();
  });

  return receipt;
}

describe("App - Verification", () => {
  it("clicking Verify artifact opens the candidate-file drop state", async () => {
    await registerFile();
    const verifyBtn = screen.getByRole("button", { name: /verify artifact/i });
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(screen.getByText(/Verify Artifact/i)).toBeInTheDocument();
      expect(screen.getByText(/quotation.pdf/)).toBeInTheDocument();
    });
  });

  it("identical bytes produce INTEGRITY VERIFIED heading", async () => {
    await registerFile(ORIGINAL_HASH, "quotation.pdf");
    fireEvent.click(screen.getByRole("button", { name: /verify artifact/i }));

    await waitFor(() => {
      expect(screen.getByText(/Verify Artifact/i)).toBeInTheDocument();
    });

    // Candidate drop zone
    const candidateDropZone = screen.getAllByRole("button", {
      name: /file drop zone/i,
    })[0];
    mockSha256.mockResolvedValue(ORIGINAL_HASH);
    const candidateFile = new File(["content"], "quotation.pdf", {
      type: "application/pdf",
    });
    fireEvent.drop(candidateDropZone, { dataTransfer: { files: [candidateFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Integrity Verified/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Exact byte-for-byte match/i)).toBeInTheDocument();
  });

  it("different bytes produce INTEGRITY MISMATCH heading", async () => {
    await registerFile(ORIGINAL_HASH, "quotation.pdf");
    fireEvent.click(screen.getByRole("button", { name: /verify artifact/i }));

    await waitFor(() => {
      expect(screen.getByText(/Verify Artifact/i)).toBeInTheDocument();
    });

    const candidateDropZone = screen.getAllByRole("button", {
      name: /file drop zone/i,
    })[0];
    mockSha256.mockResolvedValue(DIFFERENT_HASH);
    const modifiedFile = new File(["changed"], "quotation.pdf", {
      type: "application/pdf",
    });
    fireEvent.drop(candidateDropZone, {
      dataTransfer: { files: [modifiedFile] },
    });

    await waitFor(() => {
      expect(screen.getByText(/Integrity Mismatch/i)).toBeInTheDocument();
    });
    expect(
      screen.getByText(/The files are not byte-for-byte identical/i)
    ).toBeInTheDocument();
  });

  it("renamed identical file still verifies", async () => {
    await registerFile(ORIGINAL_HASH, "quotation.pdf");
    fireEvent.click(screen.getByRole("button", { name: /verify artifact/i }));

    await waitFor(() => {
      expect(screen.getByText(/Verify Artifact/i)).toBeInTheDocument();
    });

    const candidateDropZone = screen.getAllByRole("button", {
      name: /file drop zone/i,
    })[0];
    // Same bytes, different name
    mockSha256.mockResolvedValue(ORIGINAL_HASH);
    const renamedFile = new File(["content"], "renamed.pdf", {
      type: "application/pdf",
    });
    fireEvent.drop(candidateDropZone, {
      dataTransfer: { files: [renamedFile] },
    });

    await waitFor(() => {
      expect(screen.getByText(/Integrity Verified/i)).toBeInTheDocument();
    });
  });

  it("shows both hashes in the result", async () => {
    await registerFile(ORIGINAL_HASH, "quotation.pdf");
    fireEvent.click(screen.getByRole("button", { name: /verify artifact/i }));

    await waitFor(() =>
      expect(screen.getByText(/Verify Artifact/i)).toBeInTheDocument()
    );

    const candidateDropZone = screen.getAllByRole("button", {
      name: /file drop zone/i,
    })[0];
    mockSha256.mockResolvedValue(DIFFERENT_HASH);
    const modifiedFile = new File(["changed"], "quotation.pdf", {
      type: "application/pdf",
    });
    fireEvent.drop(candidateDropZone, {
      dataTransfer: { files: [modifiedFile] },
    });

    await waitFor(() =>
      expect(screen.getByText(/Integrity Mismatch/i)).toBeInTheDocument()
    );

    // Both hashes should appear on screen
    const hashEls = screen.getAllByText(new RegExp(ORIGINAL_HASH.slice(0, 8)));
    expect(hashEls.length).toBeGreaterThanOrEqual(1);
  });

  it("mismatch says The files are not byte-for-byte identical", async () => {
    await registerFile(ORIGINAL_HASH, "quotation.pdf");
    fireEvent.click(screen.getByRole("button", { name: /verify artifact/i }));

    await waitFor(() =>
      expect(screen.getByText(/Verify Artifact/i)).toBeInTheDocument()
    );

    const candidateDropZone = screen.getAllByRole("button", {
      name: /file drop zone/i,
    })[0];
    mockSha256.mockResolvedValue(DIFFERENT_HASH);
    const modifiedFile = new File(["changed"], "quotation.pdf");
    fireEvent.drop(candidateDropZone, {
      dataTransfer: { files: [modifiedFile] },
    });

    await waitFor(() =>
      expect(screen.getByText(/Integrity Mismatch/i)).toBeInTheDocument()
    );
    expect(
      screen.getByText(/The files are not byte-for-byte identical/i)
    ).toBeInTheDocument();
  });

  it("does not claim malicious tampering or legal chain of custody", async () => {
    await registerFile(ORIGINAL_HASH, "quotation.pdf");
    fireEvent.click(screen.getByRole("button", { name: /verify artifact/i }));

    await waitFor(() =>
      expect(screen.getByText(/Verify Artifact/i)).toBeInTheDocument()
    );

    const candidateDropZone = screen.getAllByRole("button", {
      name: /file drop zone/i,
    })[0];
    mockSha256.mockResolvedValue(DIFFERENT_HASH);
    const modifiedFile = new File(["changed"], "quotation.pdf");
    fireEvent.drop(candidateDropZone, {
      dataTransfer: { files: [modifiedFile] },
    });

    await waitFor(() =>
      expect(screen.getByText(/Integrity Mismatch/i)).toBeInTheDocument()
    );

    const bodyText = document.body.innerText || document.body.textContent || "";
    expect(bodyText).not.toMatch(/maliciously/i);
    expect(bodyText).not.toMatch(/military-grade/i);
    expect(bodyText).not.toMatch(/legally admissible/i);
    expect(bodyText).not.toMatch(/impossible to forge/i);
  });
});
