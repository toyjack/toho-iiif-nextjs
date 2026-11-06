import { expect, test } from "bun:test";
import { sample } from "./random";

test("returns distinct items without modifying the input", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8];
  const picked = sample(items, 6);
  expect(picked).toHaveLength(6);
  expect(new Set(picked).size).toBe(6);
  expect(items).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(sample(items, 20)).toHaveLength(8);
});

test("is roughly uniform", () => {
  const counts = new Map<number, number>();
  for (let i = 0; i < 20000; i++) {
    const [first] = sample([0, 1, 2, 3, 4], 1);
    counts.set(first, (counts.get(first) ?? 0) + 1);
  }
  for (const c of counts.values()) expect(Math.abs(c - 4000)).toBeLessThan(400);
});
