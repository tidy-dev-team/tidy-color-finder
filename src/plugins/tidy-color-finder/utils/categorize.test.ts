import { describe, it, expect } from "vitest";
import { roleFor, roundOpacity } from "./categorize";

describe("roleFor", () => {
  it("maps any stroke to border, regardless of node type", () => {
    expect(roleFor("TEXT", "stroke")).toBe("border");
    expect(roleFor("FRAME", "stroke")).toBe("border");
    expect(roleFor("RECTANGLE", "stroke")).toBe("border");
  });

  it("maps a fill on a TEXT node to text", () => {
    expect(roleFor("TEXT", "fill")).toBe("text");
  });

  it("maps any other fill to background", () => {
    expect(roleFor("FRAME", "fill")).toBe("background");
    expect(roleFor("RECTANGLE", "fill")).toBe("background");
    expect(roleFor("INSTANCE", "fill")).toBe("background");
  });
});

describe("roundOpacity", () => {
  it("rounds float noise to a stable precision so colors don't split", () => {
    expect(roundOpacity(0.6000000001)).toBe(roundOpacity(0.6));
    expect(roundOpacity(0.6)).toBe(0.6);
  });

  it("leaves clean values intact", () => {
    expect(roundOpacity(1)).toBe(1);
    expect(roundOpacity(0)).toBe(0);
    expect(roundOpacity(0.5)).toBe(0.5);
  });
});
