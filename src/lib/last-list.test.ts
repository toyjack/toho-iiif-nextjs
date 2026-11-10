import { expect, test } from "bun:test";
import { isListUrl, recallListUrl, rememberListUrl } from "./last-list";

test("only /books paths count as list URLs", () => {
  expect(isListUrl("/books")).toBe(true);
  expect(isListUrl("/books?q=zhouyi&p=2")).toBe(true);
  expect(isListUrl("/booksx")).toBe(false);
  expect(isListUrl("https://example.com/books")).toBe(false);
  expect(isListUrl("//example.com/books")).toBe(false);
});

test("falls back to null when storage is unavailable", () => {
  // no window in the test runtime: both calls must swallow the error
  expect(() => rememberListUrl("/books?q=a")).not.toThrow();
  expect(recallListUrl()).toBeNull();
});
