/**
 * Tests for cnfStyle Decoder Utility
 * Per ECMA-376 Part 1 Section 17.4.7
 */

import {
  decodeCnfStyle,
  encodeCnfStyle,
  getActiveConditionals,
  getActiveConditionalsInPriorityOrder,
  CnfStyleFlags,
  CNF_TO_CONDITIONAL_MAP,
  CONDITIONAL_PRIORITY_ORDER,
} from "../../src/utils/cnfStyleDecoder";

describe("cnfStyleDecoder", () => {
  describe("decodeCnfStyle", () => {
    it("should decode firstRow flag from position 0", () => {
      const flags = decodeCnfStyle("100000000000");
      expect(flags.firstRow).toBe(true);
      expect(flags.lastRow).toBe(false);
      expect(flags.firstCol).toBe(false);
      expect(flags.lastCol).toBe(false);
    });

    it("should decode lastRow flag from position 1", () => {
      const flags = decodeCnfStyle("010000000000");
      expect(flags.firstRow).toBe(false);
      expect(flags.lastRow).toBe(true);
    });

    it("should decode firstCol flag from position 2", () => {
      const flags = decodeCnfStyle("001000000000");
      expect(flags.firstCol).toBe(true);
    });

    it("should decode lastCol flag from position 3", () => {
      const flags = decodeCnfStyle("000100000000");
      expect(flags.lastCol).toBe(true);
    });

    it("should decode banding flags from positions 4-7", () => {
      // band1Vert (position 4)
      expect(decodeCnfStyle("000010000000").band1Vert).toBe(true);
      // band2Vert (position 5)
      expect(decodeCnfStyle("000001000000").band2Vert).toBe(true);
      // band1Horz (position 6)
      expect(decodeCnfStyle("000000100000").band1Horz).toBe(true);
      // band2Horz (position 7)
      expect(decodeCnfStyle("000000010000").band2Horz).toBe(true);
    });

    it("should decode corner cell flags from positions 8-11", () => {
      // neCell (position 8)
      expect(decodeCnfStyle("000000001000").neCell).toBe(true);
      // nwCell (position 9)
      expect(decodeCnfStyle("000000000100").nwCell).toBe(true);
      // seCell (position 10)
      expect(decodeCnfStyle("000000000010").seCell).toBe(true);
      // swCell (position 11)
      expect(decodeCnfStyle("000000000001").swCell).toBe(true);
    });

    it("should decode multiple flags at once", () => {
      // First row + last column
      const flags = decodeCnfStyle("100100000000");
      expect(flags.firstRow).toBe(true);
      expect(flags.lastCol).toBe(true);
      expect(flags.lastRow).toBe(false);
      expect(flags.firstCol).toBe(false);
    });

    it("should decode first row + nwCell (top-left corner)", () => {
      const flags = decodeCnfStyle("100000000100");
      expect(flags.firstRow).toBe(true);
      expect(flags.nwCell).toBe(true);
    });

    it("should handle short strings by padding with zeros", () => {
      // Just "1" should be interpreted as firstRow
      const flags = decodeCnfStyle("1");
      expect(flags.firstRow).toBe(true);
      expect(flags.lastRow).toBe(false);
    });

    it("should handle empty string", () => {
      const flags = decodeCnfStyle("");
      expect(flags.firstRow).toBe(false);
      expect(flags.lastRow).toBe(false);
      expect(flags.firstCol).toBe(false);
      expect(flags.lastCol).toBe(false);
    });

    it("should return all false for all zeros", () => {
      const flags = decodeCnfStyle("000000000000");
      expect(Object.values(flags).every((v) => v === false)).toBe(true);
    });

    it("should return all true for all ones", () => {
      const flags = decodeCnfStyle("111111111111");
      expect(Object.values(flags).every((v) => v === true)).toBe(true);
    });
  });

  describe("encodeCnfStyle", () => {
    it("should encode firstRow flag", () => {
      const result = encodeCnfStyle({ firstRow: true });
      expect(result).toBe("100000000000");
    });

    it("should encode multiple flags", () => {
      const result = encodeCnfStyle({ firstRow: true, lastCol: true });
      expect(result).toBe("100100000000");
    });

    it("should encode corner cells", () => {
      const result = encodeCnfStyle({ nwCell: true, seCell: true });
      expect(result).toBe("000000000110");
    });

    it("should encode banding flags", () => {
      const result = encodeCnfStyle({ band1Horz: true, band2Horz: true });
      expect(result).toBe("000000110000");
    });

    it("should return all zeros for empty object", () => {
      const result = encodeCnfStyle({});
      expect(result).toBe("000000000000");
    });

    it("should round-trip encode/decode", () => {
      const original: CnfStyleFlags = {
        firstRow: true,
        lastRow: false,
        firstCol: true,
        lastCol: false,
        band1Vert: true,
        band2Vert: false,
        band1Horz: true,
        band2Horz: false,
        neCell: true,
        nwCell: false,
        seCell: true,
        swCell: false,
      };

      const encoded = encodeCnfStyle(original);
      const decoded = decodeCnfStyle(encoded);

      expect(decoded).toEqual(original);
    });
  });

  describe("getActiveConditionals", () => {
    it("should return empty array for no active conditionals", () => {
      const result = getActiveConditionals("000000000000");
      expect(result).toHaveLength(0);
    });

    it("should return firstRow for 100000000000", () => {
      const result = getActiveConditionals("100000000000");
      expect(result).toContain("firstRow");
      expect(result).toHaveLength(1);
    });

    it("should return multiple conditionals", () => {
      const result = getActiveConditionals("110000000000");
      expect(result).toContain("firstRow");
      expect(result).toContain("lastRow");
      expect(result).toHaveLength(2);
    });

    it("should return corner cells correctly", () => {
      const result = getActiveConditionals("000000001111");
      expect(result).toContain("neCell");
      expect(result).toContain("nwCell");
      expect(result).toContain("seCell");
      expect(result).toContain("swCell");
      expect(result).toHaveLength(4);
    });
  });

  describe("getActiveConditionalsInPriorityOrder", () => {
    it("should return conditionals in priority order (corners first)", () => {
      // nwCell + firstRow - corner should come first
      const result = getActiveConditionalsInPriorityOrder("100000000100");
      expect(result[0]).toBe("nwCell"); // Corner first
      expect(result[1]).toBe("firstRow"); // Edge second
    });

    it("should order edges before banding", () => {
      // firstRow + band1Horz
      const result = getActiveConditionalsInPriorityOrder("100000100000");
      expect(result[0]).toBe("firstRow"); // Edge first
      expect(result[1]).toBe("band1Horz"); // Banding second
    });

    it("should match CONDITIONAL_PRIORITY_ORDER", () => {
      // All flags set - should return in priority order
      const result = getActiveConditionalsInPriorityOrder("111111111111");
      expect(result).toHaveLength(12);

      // Verify order matches CONDITIONAL_PRIORITY_ORDER
      for (let i = 0; i < CONDITIONAL_PRIORITY_ORDER.length; i++) {
        const flagName = CONDITIONAL_PRIORITY_ORDER[i]!;
        expect(result[i]).toBe(CNF_TO_CONDITIONAL_MAP[flagName]);
      }
    });
  });

  describe("CNF_TO_CONDITIONAL_MAP", () => {
    it("should map all flags to valid ConditionalFormattingType values", () => {
      expect(CNF_TO_CONDITIONAL_MAP.firstRow).toBe("firstRow");
      expect(CNF_TO_CONDITIONAL_MAP.lastRow).toBe("lastRow");
      expect(CNF_TO_CONDITIONAL_MAP.firstCol).toBe("firstCol");
      expect(CNF_TO_CONDITIONAL_MAP.lastCol).toBe("lastCol");
      expect(CNF_TO_CONDITIONAL_MAP.band1Vert).toBe("band1Vert");
      expect(CNF_TO_CONDITIONAL_MAP.band2Vert).toBe("band2Vert");
      expect(CNF_TO_CONDITIONAL_MAP.band1Horz).toBe("band1Horz");
      expect(CNF_TO_CONDITIONAL_MAP.band2Horz).toBe("band2Horz");
      expect(CNF_TO_CONDITIONAL_MAP.neCell).toBe("neCell");
      expect(CNF_TO_CONDITIONAL_MAP.nwCell).toBe("nwCell");
      expect(CNF_TO_CONDITIONAL_MAP.seCell).toBe("seCell");
      expect(CNF_TO_CONDITIONAL_MAP.swCell).toBe("swCell");
    });
  });
});
