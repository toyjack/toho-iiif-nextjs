import { describe, expect, test } from "bun:test";
import { compareDynasty, dynastyRank, isKnownDynasty } from "./dynasty";

describe("compareDynasty", () => {
  test("orders the dynasties in the data chronologically", () => {
    const data = ["淸", "宋", "明", "唐", "元", "漢", "晉", "魏", "隋", "金", "民國", "清"];
    expect([...data].sort(compareDynasty)).toEqual(["漢", "魏", "晉", "隋", "唐", "宋", "金", "元", "明", "淸", "清", "民國"]);
  });

  test("variant spellings share a rank", () => {
    expect(dynastyRank("淸")).toBe(dynastyRank("清"));
  });

  test("unknown dynasties follow the known ones", () => {
    expect(isKnownDynasty("某")).toBe(false);
    expect(["某", "民國", "漢"].sort(compareDynasty)).toEqual(["漢", "民國", "某"]);
  });
});
