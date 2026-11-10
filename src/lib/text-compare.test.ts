import { expect, test } from "bun:test";
import { compareText } from "./text-compare";

test("orders by code point, extension-plane kanji after BMP kanji", () => {
  const titles = ["𧻰日曆書", "郾城縣志", "郋園小學四種", "周易正義", "周易"];
  expect([...titles].sort(compareText)).toEqual(["周易", "周易正義", "郋園小學四種", "郾城縣志", "𧻰日曆書"]);
});

test("a prefix sorts first; the ideographic space sorts before kanji", () => {
  expect(compareText("周易", "周易正義")).toBeLessThan(0);
  expect(compareText("周易　十卷", "周易正義")).toBeLessThan(0);
  expect(compareText("周易", "周易")).toBe(0);
});

test("treats compatibility ideographs as their unified forms", () => {
  // U+F900 豈 is canonically equivalent to U+8C48 豈
  expect(compareText("豈", "豈")).toBe(0);
});
