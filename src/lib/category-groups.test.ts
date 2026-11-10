import { expect, test } from "bun:test";
import { groupCategories } from "./category-groups";

test("splits classes from 文庫, keeps order, counts books", () => {
  const groups = groupCategories(
    ["經部", "史部", "村本文庫", "新學部", "松本文庫"],
    ["經部", "經部", "松本文庫", "新學部", "史部", "松本文庫"]
  );
  expect(groups).toEqual([
    {
      title: "分類",
      items: [
        { name: "經部", count: 2 },
        { name: "史部", count: 1 },
        { name: "新學部", count: 1 },
      ],
    },
    {
      title: "文庫",
      items: [
        { name: "村本文庫", count: 0 },
        { name: "松本文庫", count: 2 },
      ],
    },
  ]);
});

test("drops an empty group", () => {
  expect(groupCategories(["經部"], ["經部"])).toEqual([{ title: "分類", items: [{ name: "經部", count: 1 }] }]);
});
