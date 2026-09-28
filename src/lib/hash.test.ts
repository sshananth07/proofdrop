import { describe, it, expect } from "vitest";
import { sha256 } from "./hash";

// jsdom's File does not implement arrayBuffer(). Polyfill it so the real
// sha256 implementation can be tested without a browser.
function patchFileArrayBuffer() {
  if (!File.prototype.arrayBuffer) {
    File.prototype.arrayBuffer = function () {
      return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(this);
      });
    };
  }
}
patchFileArrayBuffer();

describe("sha256", () => {
  it("produces the same hash for identical bytes regardless of filename", async () => {
    const h1 = await sha256(new File(["ABC"], "a.txt"));
    const h2 = await sha256(new File(["ABC"], "renamed.txt"));
    expect(h1).toBe(h2);
  });

  it("produces different hashes for different bytes", async () => {
    const h1 = await sha256(new File(["ABC"], "a.txt"));
    const h2 = await sha256(new File(["ABD"], "a.txt"));
    expect(h1).not.toBe(h2);
  });

  it("returns a 64-character lowercase hex string", async () => {
    const h = await sha256(new File(["hello"], "test.txt"));
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("known SHA-256: empty file", async () => {
    const h = await sha256(new File([], "empty.txt"));
    expect(h).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });
});
