import {
  buildAddressSearchUrl,
  buildCollectionSearchUrl,
} from "../wasteCalendarApi";

describe("wasteCalendarApi", () => {
  describe("buildAddressSearchUrl", () => {
    it("encodes the postcode correctly", () => {
      expect(buildAddressSearchUrl("CB4 2DF")).toBe(
        "https://servicelayer3c.azure-api.net/wastecalendar/address/search?postcode=CB4%202DF"
      );
    });

    it("handles already-trimmed input as-is (caller decides trimming)", () => {
      expect(buildAddressSearchUrl("CB4")).toContain("postcode=CB4");
    });
  });

  describe("buildCollectionSearchUrl", () => {
    it("builds the default URL", () => {
      expect(buildCollectionSearchUrl("123")).toBe(
        "https://servicelayer3c.azure-api.net/wastecalendar/collection/search/123/?authority=CCC&numberOfCollections=12"
      );
    });

    it("supports overriding query params", () => {
      expect(
        buildCollectionSearchUrl("abc", {
          authority: "TEST",
          numberOfCollections: 6,
        })
      ).toBe(
        "https://servicelayer3c.azure-api.net/wastecalendar/collection/search/abc/?authority=TEST&numberOfCollections=6"
      );
    });
  });
});
