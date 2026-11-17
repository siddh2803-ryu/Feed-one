import { describe, it, expect } from "vitest";

function checkOptimisticLock(expectedVersion: number, currentVersion: number) {
  if (expectedVersion !== currentVersion) {
    throw new Error("CONCURRENT_MODIFICATION_ERROR");
  }
  return currentVersion + 1;
}

describe("Optimistic Version Guard", () => {
  it("increments version on match", () => {
    expect(checkOptimisticLock(1, 1)).toBe(2);
  });

  it("throws CONCURRENT_MODIFICATION_ERROR on version mismatch", () => {
    expect(() => checkOptimisticLock(1, 2)).toThrow("CONCURRENT_MODIFICATION_ERROR");
  });
});
