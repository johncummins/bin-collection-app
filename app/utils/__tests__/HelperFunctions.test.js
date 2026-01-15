import {
  getDateWithSuffix,
  getBinColour,
  getBinName,
  getBinColorName,
} from "../helperFunctions";

describe("HelperFunctions", () => {
  describe("getDateWithSuffix", () => {
    it("adds correct suffixes for common cases", () => {
      expect(getDateWithSuffix(new Date("2026-01-01"))).toBe("1st");
      expect(getDateWithSuffix(new Date("2026-01-02"))).toBe("2nd");
      expect(getDateWithSuffix(new Date("2026-01-03"))).toBe("3rd");
      expect(getDateWithSuffix(new Date("2026-01-04"))).toBe("4th");
    });

    it("handles teens as 'th'", () => {
      expect(getDateWithSuffix(new Date("2026-01-11"))).toBe("11th");
      expect(getDateWithSuffix(new Date("2026-01-12"))).toBe("12th");
      expect(getDateWithSuffix(new Date("2026-01-13"))).toBe("13th");
    });

    it("handles 21st/22nd/23rd/31st", () => {
      expect(getDateWithSuffix(new Date("2026-01-21"))).toBe("21st");
      expect(getDateWithSuffix(new Date("2026-01-22"))).toBe("22nd");
      expect(getDateWithSuffix(new Date("2026-01-23"))).toBe("23rd");
      expect(getDateWithSuffix(new Date("2026-01-31"))).toBe("31st");
    });
  });

  describe("bin helpers", () => {
    it("returns stable values (case-insensitive)", () => {
      expect(getBinName("DOMESTIC")).toBe("General Waste");
      expect(getBinName("organic")).toBe("Organic Waste");
      expect(getBinName("recycle")).toBe("Recyclables");
      expect(getBinName("FOOD")).toBe("Food Waste");

      expect(getBinColour("domestic")).toBe("#000000");
      expect(getBinColour("ORGANIC")).toBe("#026928");
      expect(getBinColour("Recycle")).toBe("#0D47A1");
      expect(getBinColour("food")).toBe("#6F4E37");

      expect(getBinColorName("domestic")).toBe("black");
      expect(getBinColorName("organic")).toBe("green");
      expect(getBinColorName("RECYCLE")).toBe("blue");
      expect(getBinColorName("FOOD")).toBe("brown");
    });

    it("returns empty string for missing input", () => {
      expect(getBinName()).toBe("");
      expect(getBinColour()).toBe("");
      expect(getBinColorName()).toBe("");
    });
  });
});
