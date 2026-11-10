import { expect, test } from "bun:test";
import { kansekiDbUrl, splitTitle, viewerHref } from "./book-display";

test("splitTitle splits at the first ideographic space and loses nothing", () => {
  for (const title of ["周易正義　十四卷", "𧻰日曆書　不分卷　目錄　一卷", "郋園小學四種", "　頭", ""]) {
    const [main, rest] = splitTitle(title);
    expect(main + rest).toBe(title);
  }
  expect(splitTitle("周易正義　十四卷")).toEqual(["周易正義", "　十四卷"]);
  expect(splitTitle("𧻰日曆書　不分卷　目錄　一卷")).toEqual(["𧻰日曆書", "　不分卷　目錄　一卷"]);
  expect(splitTitle("郋園小學四種")).toEqual(["郋園小學四種", ""]);
  // a leading space is not a split point
  expect(splitTitle("　頭")).toEqual(["　頭", ""]);
});

test("link builders", () => {
  expect(kansekiDbUrl("0012345")).toBe(
    "http://kanji.zinbun.kyoto-u.ac.jp/kanseki?record=data/FA019705/tagged/0012345.dat&back=1"
  );
  expect(viewerHref("A029")).toBe("/viewer?book=A029");
});
