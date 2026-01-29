/**
 * SPRM (Single Property Modifier) Parser
 *
 * SPRMs are used throughout Word binary format to specify property changes.
 * Each SPRM consists of a 2-byte opcode and a variable-length operand.
 *
 * References:
 * - [MS-DOC] 2.6.1 Sprm
 * - [MS-DOC] 2.6.2 spra (Sprm Argument Type)
 */

import { CharacterProperties, ParagraphProperties, BorderProperties, ShadingProperties } from '../types/DocTypes';

/**
 * SPRM operand types (spra)
 */
export const SPRM_TYPES = {
  /** 1 byte operand */
  BYTE: 0,
  /** 1 byte operand (toggle) */
  TOGGLE: 1,
  /** 2 byte operand */
  WORD: 2,
  /** 4 byte operand */
  DWORD: 3,
  /** Variable length (first byte is length) */
  VARIABLE: 4,
  /** 3 byte operand */
  TRIBYTE: 5,
  /** Variable length (complex) */
  COMPLEX: 6,
  /** Variable length (special) */
  SPECIAL: 7,
} as const;

/**
 * SPRM categories (sgc)
 */
export const SPRM_CATEGORIES = {
  PARAGRAPH: 1,
  CHARACTER: 2,
  PICTURE: 3,
  SECTION: 4,
  TABLE: 5,
} as const;

/**
 * Character property SPRMs (sprmC*)
 */
export const SPRM_CHARACTER = {
  // Common character properties
  sprmCFRMarkDel: 0x0800, // Deleted revision mark
  sprmCFRMarkIns: 0x0801, // Inserted revision mark
  sprmCFFldVanish: 0x0802, // Field vanish
  sprmCPicLocation: 0x6a03, // Picture location
  sprmCIbstRMark: 0x4804, // Revision mark author
  sprmCDttmRMark: 0x6805, // Revision mark time
  sprmCFData: 0x0806, // Data field
  sprmCIdslRMark: 0x4807, // Revision mark language
  sprmCSymbol: 0x6a09, // Symbol
  sprmCFOle2: 0x080a, // OLE2 object
  sprmCHighlight: 0x2a0c, // Highlight color
  sprmCFWebHidden: 0x0811, // Web hidden
  sprmCRsidProp: 0x6815, // RSID property
  sprmCRsidText: 0x6816, // RSID text
  sprmCRsidRMDel: 0x6817, // RSID revision mark delete
  sprmCFSpecVanish: 0x0818, // Special vanish
  sprmCFMathPr: 0xc81a, // Math properties
  sprmCIstd: 0x4a30, // Style index
  sprmCIstdPermute: 0xca31, // Style permutation
  sprmCPlain: 0x2a33, // Plain (remove formatting)
  sprmCKcd: 0x2a34, // Emphasis mark
  sprmCFBold: 0x0835, // Bold
  sprmCFItalic: 0x0836, // Italic
  sprmCFStrike: 0x0837, // Strikethrough
  sprmCFOutline: 0x0838, // Outline
  sprmCFShadow: 0x0839, // Shadow
  sprmCFSmallCaps: 0x083a, // Small caps
  sprmCFCaps: 0x083b, // All caps
  sprmCFVanish: 0x083c, // Hidden
  sprmCKul: 0x2a3e, // Underline type
  sprmCDxaSpace: 0x8840, // Character spacing
  sprmCIco: 0x2a42, // Color index (legacy)
  sprmCHps: 0x4a43, // Font size (half-points)
  sprmCHpsPos: 0x4845, // Position (half-points)
  sprmCMajority: 0xca47, // Majority (complex)
  sprmCIss: 0x2a48, // Subscript/superscript
  sprmCHpsKern: 0x484b, // Kerning threshold
  sprmCHresi: 0x484e, // Hyphenation
  sprmCRgFtc0: 0x4a4f, // Font (ASCII)
  sprmCRgFtc1: 0x4a50, // Font (East Asian)
  sprmCRgFtc2: 0x4a51, // Font (non-East Asian)
  sprmCCharScale: 0x4852, // Character scale (percentage)
  sprmCFDStrike: 0x2a53, // Double strikethrough
  sprmCFImprint: 0x0854, // Imprint (engrave)
  sprmCFSpec: 0x0855, // Special character
  sprmCFObj: 0x0856, // Object
  sprmCPropRMark90: 0xca57, // Property revision mark
  sprmCFEmboss: 0x0858, // Emboss
  sprmCSfxText: 0x2859, // Text effect
  sprmCFBiDi: 0x085a, // BiDi
  sprmCFBoldBi: 0x085c, // Bold (complex script)
  sprmCFItalicBi: 0x085d, // Italic (complex script)
  sprmCFtcBi: 0x4a5e, // Font (complex script)
  sprmCLidBi: 0x485f, // Language (complex script)
  sprmCIcoBi: 0x4a60, // Color index (complex script)
  sprmCHpsBi: 0x4a61, // Font size (complex script)
  sprmCDispFldRMark: 0xca62, // Display field revision mark
  sprmCIbstRMarkDel: 0x4863, // Revision mark author (delete)
  sprmCDttmRMarkDel: 0x6864, // Revision mark time (delete)
  sprmCBrc80: 0x6865, // Border (legacy)
  sprmCShd80: 0x4866, // Shading (legacy)
  sprmCIdslRMarkDel: 0x4867, // Revision mark language (delete)
  sprmCFUsePgsuSettings: 0x0868, // Use PgSu settings
  sprmCRgLid0_80: 0x486d, // Language (legacy)
  sprmCRgLid1_80: 0x486e, // Language East Asian (legacy)
  sprmCIdctHint: 0x286f, // IDC hint
  sprmCCv: 0x6870, // Color (RGB)
  sprmCShd: 0xca71, // Shading
  sprmCBrc: 0xca72, // Border
  sprmCRgLid0: 0x4873, // Language
  sprmCRgLid1: 0x4874, // Language East Asian
  sprmCFNoProof: 0x0875, // No proofing
  sprmCFitText: 0xca76, // Fit text
  sprmCCvUl: 0x6877, // Underline color
  sprmCFELayout: 0xca78, // East Asian layout
  sprmCLbcCRJ: 0x2879, // Line break class
  sprmCFComplexScripts: 0x0882, // Complex scripts
  sprmCWall: 0x2a83, // Wall
  sprmCCnf: 0xca85, // Conditional formatting
  sprmCNeedFontFixup: 0x2a86, // Need font fixup
  sprmCPbiIBullet: 0x6887, // Picture bullet
  sprmCPbiGrf: 0x4888, // Picture bullet flags
  sprmCPropRMark: 0xca89, // Property revision mark
  sprmCFSdtVanish: 0x0890, // SDT vanish
} as const;

/**
 * Paragraph property SPRMs (sprmP*)
 */
export const SPRM_PARAGRAPH = {
  sprmPIstd: 0x4600, // Style index
  sprmPIstdPermute: 0xc601, // Style permutation
  sprmPIncLvl: 0x2602, // Increment level
  sprmPJc80: 0x2403, // Justification (legacy)
  sprmPFKeep: 0x2405, // Keep lines together
  sprmPFKeepFollow: 0x2406, // Keep with next
  sprmPFPageBreakBefore: 0x2407, // Page break before
  sprmPIlvl: 0x260a, // List level
  sprmPIlfo: 0x460b, // List format override
  sprmPFNoLineNumb: 0x240c, // No line numbering
  sprmPChgTabsPapx: 0xc60d, // Tab stops (change)
  sprmPDxaRight80: 0x840e, // Right indent (legacy)
  sprmPDxaLeft80: 0x840f, // Left indent (legacy)
  sprmPNest80: 0x4610, // Nest (legacy)
  sprmPDxaLeft180: 0x8411, // First line indent (legacy)
  sprmPDyaLine: 0x6412, // Line spacing
  sprmPDyaBefore: 0xa413, // Space before
  sprmPDyaAfter: 0xa414, // Space after
  sprmPChgTabs: 0xc615, // Tab stops
  sprmPFInTable: 0x2416, // In table
  sprmPFTtp: 0x2417, // Table terminating paragraph
  sprmPDxaAbs: 0x8418, // Absolute position X
  sprmPDyaAbs: 0x8419, // Absolute position Y
  sprmPDxaWidth: 0x841a, // Width
  sprmPPc: 0x261b, // Position code
  sprmPWr: 0x2423, // Text wrapping
  sprmPBrcTop80: 0x6424, // Top border (legacy)
  sprmPBrcLeft80: 0x6425, // Left border (legacy)
  sprmPBrcBottom80: 0x6426, // Bottom border (legacy)
  sprmPBrcRight80: 0x6427, // Right border (legacy)
  sprmPBrcBetween80: 0x6428, // Between border (legacy)
  sprmPBrcBar80: 0x6629, // Bar border (legacy)
  sprmPFNoAutoHyph: 0x242a, // No auto hyphenation
  sprmPWHeightAbs: 0x442b, // Height (absolute)
  sprmPDcs: 0x442c, // Drop cap settings
  sprmPShd80: 0x442d, // Shading (legacy)
  sprmPDyaFromText: 0x842e, // Distance from text Y
  sprmPDxaFromText: 0x842f, // Distance from text X
  sprmPFLocked: 0x2430, // Locked
  sprmPFWidowControl: 0x2431, // Widow/orphan control
  sprmPFKinsoku: 0x2433, // Kinsoku
  sprmPFWordWrap: 0x2434, // Word wrap
  sprmPFOverflowPunct: 0x2435, // Overflow punctuation
  sprmPFTopLinePunct: 0x2436, // Top line punctuation
  sprmPFAutoSpaceDE: 0x2437, // Auto space DE
  sprmPFAutoSpaceDN: 0x2438, // Auto space DN
  sprmPWAlignFont: 0x4439, // Font alignment
  sprmPFrameTextFlow: 0x443a, // Frame text flow
  sprmPOutLvl: 0x2640, // Outline level
  sprmPFBiDi: 0x2441, // BiDi paragraph
  sprmPFNumRMIns: 0x2443, // Numbering revision mark insert
  sprmPNumRM: 0xc645, // Numbering revision mark
  sprmPHugePapx: 0x6646, // Huge PAPX
  sprmPFUsePgsuSettings: 0x2447, // Use PgSu settings
  sprmPFAdjustRight: 0x2448, // Adjust right
  sprmPItap: 0x6649, // Table depth
  sprmPDtap: 0x664a, // Table depth delta
  sprmPFInnerTableCell: 0x244b, // Inner table cell
  sprmPFInnerTtp: 0x244c, // Inner table terminating paragraph
  sprmPShd: 0xc64d, // Shading
  sprmPBrcTop: 0xc64e, // Top border
  sprmPBrcLeft: 0xc64f, // Left border
  sprmPBrcBottom: 0xc650, // Bottom border
  sprmPBrcRight: 0xc651, // Right border
  sprmPBrcBetween: 0xc652, // Between border
  sprmPBrcBar: 0xc653, // Bar border
  sprmPDxaRight: 0x845d, // Right indent
  sprmPDxaLeft: 0x845e, // Left indent
  sprmPNest: 0x465f, // Nest
  sprmPDxaLeft1: 0x8460, // First line indent
  sprmPJc: 0x2461, // Justification
  sprmPFNoAllowOverlap: 0x2462, // No allow overlap
  sprmPWall: 0x2664, // Wall
  sprmPIpgp: 0x6465, // Paragraph group
  sprmPCnf: 0xc666, // Conditional formatting
  sprmPRsid: 0x6467, // RSID
  sprmPIstdListPermute: 0xc669, // List style permutation
  sprmPTableProps: 0x646b, // Table properties
  sprmPTIstdInfo: 0xc66c, // Table istd info
  sprmPFContextualSpacing: 0x246d, // Contextual spacing
  sprmPPropRMark: 0xc66f, // Property revision mark
  sprmPFMirrorIndents: 0x2470, // Mirror indents
  sprmPTtwo: 0x2471, // Ttwo
} as const;

/**
 * Parse SPRM operand based on type
 */
function getSprmOperandSize(sprm: number): number {
  const spra = (sprm >> 13) & 0x07; // bits 13-15

  switch (spra) {
    case SPRM_TYPES.BYTE:
    case SPRM_TYPES.TOGGLE:
      return 1;
    case SPRM_TYPES.WORD:
      return 2;
    case SPRM_TYPES.DWORD:
      return 4;
    case SPRM_TYPES.TRIBYTE:
      return 3;
    case SPRM_TYPES.VARIABLE:
    case SPRM_TYPES.COMPLEX:
    case SPRM_TYPES.SPECIAL:
      return -1; // Variable length
    default:
      return 1;
  }
}

/**
 * SPRM parser for property extraction
 */
export class SPRMParser {
  private data: Uint8Array;
  private view: DataView;
  private offset: number;

  constructor(data: Uint8Array, offset: number = 0) {
    this.data = data;
    this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    this.offset = offset;
  }

  /**
   * Parse all SPRMs and return character properties
   */
  parseCharacterProperties(baseProps: CharacterProperties = {}): CharacterProperties {
    const props = { ...baseProps };

    while (this.offset < this.data.length - 1) {
      const sprm = this.view.getUint16(this.offset, true);
      this.offset += 2;

      const operand = this.readOperand(sprm);
      if (operand === null) break;

      this.applyCharacterSprm(props, sprm, operand);
    }

    return props;
  }

  /**
   * Parse all SPRMs and return paragraph properties
   */
  parseParagraphProperties(baseProps: ParagraphProperties = {}): ParagraphProperties {
    const props = { ...baseProps };

    while (this.offset < this.data.length - 1) {
      const sprm = this.view.getUint16(this.offset, true);
      this.offset += 2;

      const operand = this.readOperand(sprm);
      if (operand === null) break;

      this.applyParagraphSprm(props, sprm, operand);
    }

    return props;
  }

  /**
   * Read operand based on SPRM type
   */
  private readOperand(sprm: number): Uint8Array | null {
    const size = getSprmOperandSize(sprm);

    if (size === -1) {
      // Variable length - first byte is length
      if (this.offset >= this.data.length) return null;
      const len = this.data[this.offset] ?? 0;
      this.offset++;

      if (this.offset + len > this.data.length) return null;
      const operand = this.data.slice(this.offset, this.offset + len);
      this.offset += len;
      return operand;
    } else {
      if (this.offset + size > this.data.length) return null;
      const operand = this.data.slice(this.offset, this.offset + size);
      this.offset += size;
      return operand;
    }
  }

  /**
   * Apply character SPRM to properties
   */
  private applyCharacterSprm(props: CharacterProperties, sprm: number, operand: Uint8Array): void {
    const operandView = new DataView(operand.buffer, operand.byteOffset, operand.byteLength);
    const byte0 = operand[0] ?? 0;

    switch (sprm) {
      case SPRM_CHARACTER.sprmCFBold:
        props.bold = byte0 !== 0;
        break;
      case SPRM_CHARACTER.sprmCFItalic:
        props.italic = byte0 !== 0;
        break;
      case SPRM_CHARACTER.sprmCFStrike:
        props.strikethrough = byte0 !== 0;
        break;
      case SPRM_CHARACTER.sprmCFDStrike:
        props.doubleStrikethrough = byte0 !== 0;
        break;
      case SPRM_CHARACTER.sprmCFSmallCaps:
        props.smallCaps = byte0 !== 0;
        break;
      case SPRM_CHARACTER.sprmCFCaps:
        props.allCaps = byte0 !== 0;
        break;
      case SPRM_CHARACTER.sprmCFVanish:
        props.hidden = byte0 !== 0;
        break;
      case SPRM_CHARACTER.sprmCKul:
        props.underline = this.getUnderlineType(byte0);
        break;
      case SPRM_CHARACTER.sprmCHps:
        if (operand.length >= 2) {
          props.fontSize = operandView.getUint16(0, true);
        }
        break;
      case SPRM_CHARACTER.sprmCIss:
        if (byte0 === 1) {
          props.superscript = true;
          props.subscript = false;
        } else if (byte0 === 2) {
          props.subscript = true;
          props.superscript = false;
        } else {
          props.superscript = false;
          props.subscript = false;
        }
        break;
      case SPRM_CHARACTER.sprmCIco:
        props.color = this.getColorFromIndex(byte0);
        break;
      case SPRM_CHARACTER.sprmCCv:
        if (operand.length >= 4) {
          const r = operand[0] ?? 0;
          const g = operand[1] ?? 0;
          const b = operand[2] ?? 0;
          props.color = this.rgbToHex(r, g, b);
        }
        break;
      case SPRM_CHARACTER.sprmCHighlight:
        props.highlight = this.getHighlightColor(byte0);
        break;
      case SPRM_CHARACTER.sprmCDxaSpace:
        if (operand.length >= 2) {
          props.spacing = operandView.getInt16(0, true);
        }
        break;
      case SPRM_CHARACTER.sprmCHpsPos:
        if (operand.length >= 2) {
          props.position = operandView.getInt16(0, true);
        }
        break;
      case SPRM_CHARACTER.sprmCIstd:
        if (operand.length >= 2) {
          props.styleIndex = operandView.getUint16(0, true);
        }
        break;
      case SPRM_CHARACTER.sprmCFEmboss:
        // Emboss - not directly mapped but tracked
        break;
      case SPRM_CHARACTER.sprmCFImprint:
        // Imprint/engrave - not directly mapped but tracked
        break;
    }
  }

  /**
   * Apply paragraph SPRM to properties
   */
  private applyParagraphSprm(props: ParagraphProperties, sprm: number, operand: Uint8Array): void {
    const operandView = new DataView(operand.buffer, operand.byteOffset, operand.byteLength);
    const byte0 = operand[0] ?? 0;

    switch (sprm) {
      case SPRM_PARAGRAPH.sprmPIstd:
        if (operand.length >= 2) {
          props.styleIndex = operandView.getUint16(0, true);
        }
        break;
      case SPRM_PARAGRAPH.sprmPJc:
      case SPRM_PARAGRAPH.sprmPJc80:
        props.justification = this.getJustification(byte0);
        break;
      case SPRM_PARAGRAPH.sprmPFKeep:
        props.keepTogether = byte0 !== 0;
        break;
      case SPRM_PARAGRAPH.sprmPFKeepFollow:
        props.keepWithNext = byte0 !== 0;
        break;
      case SPRM_PARAGRAPH.sprmPFPageBreakBefore:
        props.pageBreakBefore = byte0 !== 0;
        break;
      case SPRM_PARAGRAPH.sprmPFWidowControl:
        props.widowControl = byte0 !== 0;
        break;
      case SPRM_PARAGRAPH.sprmPDxaLeft:
      case SPRM_PARAGRAPH.sprmPDxaLeft80:
        if (operand.length >= 2) {
          props.indentLeft = operandView.getInt16(0, true);
        }
        break;
      case SPRM_PARAGRAPH.sprmPDxaRight:
      case SPRM_PARAGRAPH.sprmPDxaRight80:
        if (operand.length >= 2) {
          props.indentRight = operandView.getInt16(0, true);
        }
        break;
      case SPRM_PARAGRAPH.sprmPDxaLeft1:
      case SPRM_PARAGRAPH.sprmPDxaLeft180:
        if (operand.length >= 2) {
          props.indentFirstLine = operandView.getInt16(0, true);
        }
        break;
      case SPRM_PARAGRAPH.sprmPDyaBefore:
        if (operand.length >= 2) {
          props.spaceBefore = operandView.getUint16(0, true);
        }
        break;
      case SPRM_PARAGRAPH.sprmPDyaAfter:
        if (operand.length >= 2) {
          props.spaceAfter = operandView.getUint16(0, true);
        }
        break;
      case SPRM_PARAGRAPH.sprmPDyaLine:
        if (operand.length >= 4) {
          const dyaLine = operandView.getInt16(0, true);
          const fMultLinespace = operandView.getInt16(2, true);
          props.lineSpacing = Math.abs(dyaLine);
          if (dyaLine < 0) {
            props.lineSpacingType = 'exact';
          } else if (fMultLinespace === 1) {
            props.lineSpacingType = 'auto';
          } else {
            props.lineSpacingType = 'atLeast';
          }
        }
        break;
      case SPRM_PARAGRAPH.sprmPIlvl:
        if (!props.listInfo) props.listInfo = {};
        props.listInfo.ilvl = byte0;
        break;
      case SPRM_PARAGRAPH.sprmPIlfo:
        if (operand.length >= 2) {
          if (!props.listInfo) props.listInfo = {};
          props.listInfo.ilfo = operandView.getUint16(0, true);
        }
        break;
      case SPRM_PARAGRAPH.sprmPOutLvl:
        props.outlineLevel = byte0;
        break;
      case SPRM_PARAGRAPH.sprmPFContextualSpacing:
        // Contextual spacing - handled but not directly mapped
        break;
      case SPRM_PARAGRAPH.sprmPShd:
      case SPRM_PARAGRAPH.sprmPShd80:
        props.shading = this.parseShading(operand);
        break;
      case SPRM_PARAGRAPH.sprmPBrcTop:
      case SPRM_PARAGRAPH.sprmPBrcTop80:
        props.borderTop = this.parseBorder(operand);
        break;
      case SPRM_PARAGRAPH.sprmPBrcBottom:
      case SPRM_PARAGRAPH.sprmPBrcBottom80:
        props.borderBottom = this.parseBorder(operand);
        break;
      case SPRM_PARAGRAPH.sprmPBrcLeft:
      case SPRM_PARAGRAPH.sprmPBrcLeft80:
        props.borderLeft = this.parseBorder(operand);
        break;
      case SPRM_PARAGRAPH.sprmPBrcRight:
      case SPRM_PARAGRAPH.sprmPBrcRight80:
        props.borderRight = this.parseBorder(operand);
        break;
    }
  }

  /**
   * Get underline type from code
   */
  private getUnderlineType(code: number): string {
    const types: { [key: number]: string } = {
      0: 'none',
      1: 'single',
      2: 'words',
      3: 'double',
      4: 'dotted',
      6: 'thick',
      7: 'dash',
      9: 'dotDash',
      10: 'dotDotDash',
      11: 'wave',
      20: 'dottedHeavy',
      23: 'dashedHeavy',
      25: 'dashDotHeavy',
      26: 'dashDotDotHeavy',
      27: 'wavyHeavy',
      39: 'dashLong',
      43: 'wavyDouble',
      55: 'dashLongHeavy',
    };
    return types[code] ?? 'single';
  }

  /**
   * Get color from legacy color index
   */
  private getColorFromIndex(index: number): string {
    const colors: { [key: number]: string } = {
      0: '000000', // Auto/Black
      1: '0000FF', // Blue
      2: '00FFFF', // Cyan
      3: '00FF00', // Green
      4: 'FF00FF', // Magenta
      5: 'FF0000', // Red
      6: 'FFFF00', // Yellow
      7: 'FFFFFF', // White
      8: '000080', // Dark Blue
      9: '008080', // Dark Cyan
      10: '008000', // Dark Green
      11: '800080', // Dark Magenta
      12: '800000', // Dark Red
      13: '808000', // Dark Yellow
      14: '808080', // Dark Gray
      15: 'C0C0C0', // Light Gray
    };
    return colors[index] ?? '000000';
  }

  /**
   * Get highlight color from code
   */
  private getHighlightColor(code: number): string {
    const colors: { [key: number]: string } = {
      0: 'none',
      1: 'black',
      2: 'blue',
      3: 'cyan',
      4: 'green',
      5: 'magenta',
      6: 'red',
      7: 'yellow',
      8: 'white',
      9: 'darkBlue',
      10: 'darkCyan',
      11: 'darkGreen',
      12: 'darkMagenta',
      13: 'darkRed',
      14: 'darkYellow',
      15: 'darkGray',
      16: 'lightGray',
    };
    return colors[code] ?? 'none';
  }

  /**
   * Get justification from code
   */
  private getJustification(code: number): 'left' | 'center' | 'right' | 'both' {
    switch (code) {
      case 0:
        return 'left';
      case 1:
        return 'center';
      case 2:
        return 'right';
      case 3:
        return 'both';
      default:
        return 'left';
    }
  }

  /**
   * Convert RGB to hex string
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return [r, g, b].map((x) => x.toString(16).padStart(2, '0').toUpperCase()).join('');
  }

  /**
   * Parse border from operand
   */
  private parseBorder(operand: Uint8Array): BorderProperties {
    if (operand.length < 4) return {};

    const view = new DataView(operand.buffer, operand.byteOffset, operand.byteLength);
    const dptLineWidth = operand[0] ?? 0; // Width in 1/8 points
    const brcType = operand[1] ?? 0; // Border type
    const ico = operand[2] ?? 0; // Color index
    const dptSpace = operand[3] ?? 0; // Space in points

    return {
      width: dptLineWidth,
      style: this.getBorderStyle(brcType),
      color: this.getColorFromIndex(ico),
      space: dptSpace * 20, // Convert to twips
    };
  }

  /**
   * Get border style from code
   */
  private getBorderStyle(code: number): string {
    const styles: { [key: number]: string } = {
      0: 'none',
      1: 'single',
      2: 'thick',
      3: 'double',
      5: 'hairline',
      6: 'dotted',
      7: 'dashed',
      8: 'dotDash',
      9: 'dotDotDash',
      10: 'triple',
      11: 'thinThickSmallGap',
      12: 'thickThinSmallGap',
      13: 'thinThickThinSmallGap',
      14: 'thinThickMediumGap',
      15: 'thickThinMediumGap',
      16: 'thinThickThinMediumGap',
      17: 'thinThickLargeGap',
      18: 'thickThinLargeGap',
      19: 'thinThickThinLargeGap',
      20: 'wave',
      21: 'doubleWave',
      22: 'dashSmallGap',
      23: 'dashDotStroked',
      24: 'threeDEmboss',
      25: 'threeDEngrave',
      26: 'outset',
      27: 'inset',
    };
    return styles[code] ?? 'single';
  }

  /**
   * Parse shading from operand
   */
  private parseShading(operand: Uint8Array): ShadingProperties {
    if (operand.length < 2) return {};

    const pattern = operand[0] ?? 0;
    const colors = operand[1] ?? 0;
    const foreColor = colors & 0x0f;
    const backColor = (colors >> 4) & 0x0f;

    return {
      pattern: this.getShadingPattern(pattern),
      foregroundColor: this.getColorFromIndex(foreColor),
      backgroundColor: this.getColorFromIndex(backColor),
    };
  }

  /**
   * Get shading pattern from code
   */
  private getShadingPattern(code: number): string {
    const patterns: { [key: number]: string } = {
      0: 'clear',
      1: 'solid',
      2: 'pct5',
      3: 'pct10',
      4: 'pct20',
      5: 'pct25',
      6: 'pct30',
      7: 'pct40',
      8: 'pct50',
      9: 'pct60',
      10: 'pct70',
      11: 'pct75',
      12: 'pct80',
      13: 'pct90',
      14: 'horzStripe',
      15: 'vertStripe',
      16: 'reverseDiagStripe',
      17: 'diagStripe',
      18: 'horzCross',
      19: 'diagCross',
      20: 'thinHorzStripe',
      21: 'thinVertStripe',
      22: 'thinReverseDiagStripe',
      23: 'thinDiagStripe',
      24: 'thinHorzCross',
      25: 'thinDiagCross',
    };
    return patterns[code] ?? 'clear';
  }
}
