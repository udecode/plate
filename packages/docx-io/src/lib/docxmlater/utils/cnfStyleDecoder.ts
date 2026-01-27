/**
 * cnfStyle Decoder - Decodes the conditional formatting style bitmask
 * Per ECMA-376 Part 1 Section 17.4.7 (w:cnfStyle)
 *
 * The cnfStyle is a 12-character string where each character is '0' or '1'
 * representing whether a particular conditional format applies.
 */

import { ConditionalFormattingType } from "../formatting/Style";

/**
 * Decoded cnfStyle flags
 * Each flag corresponds to a conditional formatting type that may apply to a cell
 */
export interface CnfStyleFlags {
  /** First row of table (header row) */
  firstRow: boolean;
  /** Last row of table */
  lastRow: boolean;
  /** First column of table */
  firstCol: boolean;
  /** Last column of table */
  lastCol: boolean;
  /** Odd vertical band (column banding) */
  band1Vert: boolean;
  /** Even vertical band (column banding) */
  band2Vert: boolean;
  /** Odd horizontal band (row banding) */
  band1Horz: boolean;
  /** Even horizontal band (row banding) */
  band2Horz: boolean;
  /** Northeast cell (top-right corner) */
  neCell: boolean;
  /** Northwest cell (top-left corner) */
  nwCell: boolean;
  /** Southeast cell (bottom-right corner) */
  seCell: boolean;
  /** Southwest cell (bottom-left corner) */
  swCell: boolean;
}

/**
 * Maps flag names to ConditionalFormattingType values
 */
export const CNF_TO_CONDITIONAL_MAP: Record<
  keyof CnfStyleFlags,
  ConditionalFormattingType
> = {
  firstRow: "firstRow",
  lastRow: "lastRow",
  firstCol: "firstCol",
  lastCol: "lastCol",
  band1Vert: "band1Vert",
  band2Vert: "band2Vert",
  band1Horz: "band1Horz",
  band2Horz: "band2Horz",
  neCell: "neCell",
  nwCell: "nwCell",
  seCell: "seCell",
  swCell: "swCell",
};

/**
 * Bit positions in the cnfStyle string (0-indexed from left)
 * Per ECMA-376 Part 1 Section 17.4.7
 */
const BIT_POSITIONS: Record<keyof CnfStyleFlags, number> = {
  firstRow: 0,
  lastRow: 1,
  firstCol: 2,
  lastCol: 3,
  band1Vert: 4,
  band2Vert: 5,
  band1Horz: 6,
  band2Horz: 7,
  neCell: 8,
  nwCell: 9,
  seCell: 10,
  swCell: 11,
};

/**
 * Priority order for conditional formatting resolution
 * More specific conditions (corners) override less specific (edges, banding)
 * Per ECMA-376, this is the order in which conditionals should be applied
 */
export const CONDITIONAL_PRIORITY_ORDER: (keyof CnfStyleFlags)[] = [
  // Corner cells (most specific)
  "nwCell",
  "neCell",
  "swCell",
  "seCell",
  // Edge rows/columns
  "firstRow",
  "lastRow",
  "firstCol",
  "lastCol",
  // Banding (least specific)
  "band1Horz",
  "band2Horz",
  "band1Vert",
  "band2Vert",
];

/**
 * Decodes a cnfStyle string into individual flags
 *
 * @param cnfStyle - 12-character binary string (e.g., "100000000000" for firstRow)
 * @returns Decoded flags object
 *
 * @example
 * ```typescript
 * const flags = decodeCnfStyle('100000000000');
 * console.log(flags.firstRow); // true
 * console.log(flags.lastRow);  // false
 * ```
 */
export function decodeCnfStyle(cnfStyle: string): CnfStyleFlags {
  // Pad to 12 characters if shorter (handles legacy or truncated values)
  // Use padEnd because the string represents left-to-right bit positions
  const normalized = cnfStyle.padEnd(12, "0");

  return {
    firstRow: normalized[BIT_POSITIONS.firstRow] === "1",
    lastRow: normalized[BIT_POSITIONS.lastRow] === "1",
    firstCol: normalized[BIT_POSITIONS.firstCol] === "1",
    lastCol: normalized[BIT_POSITIONS.lastCol] === "1",
    band1Vert: normalized[BIT_POSITIONS.band1Vert] === "1",
    band2Vert: normalized[BIT_POSITIONS.band2Vert] === "1",
    band1Horz: normalized[BIT_POSITIONS.band1Horz] === "1",
    band2Horz: normalized[BIT_POSITIONS.band2Horz] === "1",
    neCell: normalized[BIT_POSITIONS.neCell] === "1",
    nwCell: normalized[BIT_POSITIONS.nwCell] === "1",
    seCell: normalized[BIT_POSITIONS.seCell] === "1",
    swCell: normalized[BIT_POSITIONS.swCell] === "1",
  };
}

/**
 * Encodes CnfStyleFlags back to a binary string
 *
 * @param flags - Flags to encode
 * @returns 12-character binary string
 *
 * @example
 * ```typescript
 * const cnfStyle = encodeCnfStyle({ firstRow: true, lastCol: true });
 * console.log(cnfStyle); // '100100000000'
 * ```
 */
export function encodeCnfStyle(flags: Partial<CnfStyleFlags>): string {
  const bits = new Array(12).fill("0");

  for (const [key, position] of Object.entries(BIT_POSITIONS)) {
    if (flags[key as keyof CnfStyleFlags]) {
      bits[position] = "1";
    }
  }

  return bits.join("");
}

/**
 * Gets the active conditional formatting types from a cnfStyle
 *
 * @param cnfStyle - The cnfStyle string to decode
 * @returns Array of active ConditionalFormattingType values
 *
 * @example
 * ```typescript
 * const types = getActiveConditionals('110000000000');
 * console.log(types); // ['firstRow', 'lastRow']
 * ```
 */
export function getActiveConditionals(
  cnfStyle: string
): ConditionalFormattingType[] {
  const flags = decodeCnfStyle(cnfStyle);
  const active: ConditionalFormattingType[] = [];

  for (const [key, isActive] of Object.entries(flags)) {
    if (isActive) {
      active.push(CNF_TO_CONDITIONAL_MAP[key as keyof CnfStyleFlags]);
    }
  }

  return active;
}

/**
 * Gets the active conditional formatting types in priority order
 * More specific conditions come first (corners before edges before banding)
 *
 * @param cnfStyle - The cnfStyle string to decode
 * @returns Array of active ConditionalFormattingType values in priority order
 *
 * @example
 * ```typescript
 * // Cell is both in first row and is the nwCell (top-left corner)
 * const types = getActiveConditionalsInPriorityOrder('100000000100');
 * console.log(types); // ['nwCell', 'firstRow'] - corner takes priority
 * ```
 */
export function getActiveConditionalsInPriorityOrder(
  cnfStyle: string
): ConditionalFormattingType[] {
  const flags = decodeCnfStyle(cnfStyle);
  const active: ConditionalFormattingType[] = [];

  for (const flagName of CONDITIONAL_PRIORITY_ORDER) {
    if (flags[flagName]) {
      active.push(CNF_TO_CONDITIONAL_MAP[flagName]);
    }
  }

  return active;
}
