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

import type {
  CharacterProperties,
  ParagraphProperties,
  BorderProperties,
  ShadingProperties,
} from '../types/DocTypes';

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
  sprmCFRMarkDel: 0x08_00, // Deleted revision mark
  sprmCFRMarkIns: 0x08_01, // Inserted revision mark
  sprmCFFldVanish: 0x08_02, // Field vanish
  sprmCPicLocation: 0x6a_03, // Picture location
  sprmCIbstRMark: 0x48_04, // Revision mark author
  sprmCDttmRMark: 0x68_05, // Revision mark time
  sprmCFData: 0x08_06, // Data field
  sprmCIdslRMark: 0x48_07, // Revision mark language
  sprmCSymbol: 0x6a_09, // Symbol
  sprmCFOle2: 0x08_0a, // OLE2 object
  sprmCHighlight: 0x2a_0c, // Highlight color
  sprmCFWebHidden: 0x08_11, // Web hidden
  sprmCRsidProp: 0x68_15, // RSID property
  sprmCRsidText: 0x68_16, // RSID text
  sprmCRsidRMDel: 0x68_17, // RSID revision mark delete
  sprmCFSpecVanish: 0x08_18, // Special vanish
  sprmCFMathPr: 0xc8_1a, // Math properties
  sprmCIstd: 0x4a_30, // Style index
  sprmCIstdPermute: 0xca_31, // Style permutation
  sprmCPlain: 0x2a_33, // Plain (remove formatting)
  sprmCKcd: 0x2a_34, // Emphasis mark
  sprmCFBold: 0x08_35, // Bold
  sprmCFItalic: 0x08_36, // Italic
  sprmCFStrike: 0x08_37, // Strikethrough
  sprmCFOutline: 0x08_38, // Outline
  sprmCFShadow: 0x08_39, // Shadow
  sprmCFSmallCaps: 0x08_3a, // Small caps
  sprmCFCaps: 0x08_3b, // All caps
  sprmCFVanish: 0x08_3c, // Hidden
  sprmCKul: 0x2a_3e, // Underline type
  sprmCDxaSpace: 0x88_40, // Character spacing
  sprmCIco: 0x2a_42, // Color index (legacy)
  sprmCHps: 0x4a_43, // Font size (half-points)
  sprmCHpsPos: 0x48_45, // Position (half-points)
  sprmCMajority: 0xca_47, // Majority (complex)
  sprmCIss: 0x2a_48, // Subscript/superscript
  sprmCHpsKern: 0x48_4b, // Kerning threshold
  sprmCHresi: 0x48_4e, // Hyphenation
  sprmCRgFtc0: 0x4a_4f, // Font (ASCII)
  sprmCRgFtc1: 0x4a_50, // Font (East Asian)
  sprmCRgFtc2: 0x4a_51, // Font (non-East Asian)
  sprmCCharScale: 0x48_52, // Character scale (percentage)
  sprmCFDStrike: 0x2a_53, // Double strikethrough
  sprmCFImprint: 0x08_54, // Imprint (engrave)
  sprmCFSpec: 0x08_55, // Special character
  sprmCFObj: 0x08_56, // Object
  sprmCPropRMark90: 0xca_57, // Property revision mark
  sprmCFEmboss: 0x08_58, // Emboss
  sprmCSfxText: 0x28_59, // Text effect
  sprmCFBiDi: 0x08_5a, // BiDi
  sprmCFBoldBi: 0x08_5c, // Bold (complex script)
  sprmCFItalicBi: 0x08_5d, // Italic (complex script)
  sprmCFtcBi: 0x4a_5e, // Font (complex script)
  sprmCLidBi: 0x48_5f, // Language (complex script)
  sprmCIcoBi: 0x4a_60, // Color index (complex script)
  sprmCHpsBi: 0x4a_61, // Font size (complex script)
  sprmCDispFldRMark: 0xca_62, // Display field revision mark
  sprmCIbstRMarkDel: 0x48_63, // Revision mark author (delete)
  sprmCDttmRMarkDel: 0x68_64, // Revision mark time (delete)
  sprmCBrc80: 0x68_65, // Border (legacy)
  sprmCShd80: 0x48_66, // Shading (legacy)
  sprmCIdslRMarkDel: 0x48_67, // Revision mark language (delete)
  sprmCFUsePgsuSettings: 0x08_68, // Use PgSu settings
  sprmCRgLid0_80: 0x48_6d, // Language (legacy)
  sprmCRgLid1_80: 0x48_6e, // Language East Asian (legacy)
  sprmCIdctHint: 0x28_6f, // IDC hint
  sprmCCv: 0x68_70, // Color (RGB)
  sprmCShd: 0xca_71, // Shading
  sprmCBrc: 0xca_72, // Border
  sprmCRgLid0: 0x48_73, // Language
  sprmCRgLid1: 0x48_74, // Language East Asian
  sprmCFNoProof: 0x08_75, // No proofing
  sprmCFitText: 0xca_76, // Fit text
  sprmCCvUl: 0x68_77, // Underline color
  sprmCFELayout: 0xca_78, // East Asian layout
  sprmCLbcCRJ: 0x28_79, // Line break class
  sprmCFComplexScripts: 0x08_82, // Complex scripts
  sprmCWall: 0x2a_83, // Wall
  sprmCCnf: 0xca_85, // Conditional formatting
  sprmCNeedFontFixup: 0x2a_86, // Need font fixup
  sprmCPbiIBullet: 0x68_87, // Picture bullet
  sprmCPbiGrf: 0x48_88, // Picture bullet flags
  sprmCPropRMark: 0xca_89, // Property revision mark
  sprmCFSdtVanish: 0x08_90, // SDT vanish
} as const;

/**
 * Paragraph property SPRMs (sprmP*)
 */
export const SPRM_PARAGRAPH = {
  sprmPIstd: 0x46_00, // Style index
  sprmPIstdPermute: 0xc6_01, // Style permutation
  sprmPIncLvl: 0x26_02, // Increment level
  sprmPJc80: 0x24_03, // Justification (legacy)
  sprmPFKeep: 0x24_05, // Keep lines together
  sprmPFKeepFollow: 0x24_06, // Keep with next
  sprmPFPageBreakBefore: 0x24_07, // Page break before
  sprmPIlvl: 0x26_0a, // List level
  sprmPIlfo: 0x46_0b, // List format override
  sprmPFNoLineNumb: 0x24_0c, // No line numbering
  sprmPChgTabsPapx: 0xc6_0d, // Tab stops (change)
  sprmPDxaRight80: 0x84_0e, // Right indent (legacy)
  sprmPDxaLeft80: 0x84_0f, // Left indent (legacy)
  sprmPNest80: 0x46_10, // Nest (legacy)
  sprmPDxaLeft180: 0x84_11, // First line indent (legacy)
  sprmPDyaLine: 0x64_12, // Line spacing
  sprmPDyaBefore: 0xa4_13, // Space before
  sprmPDyaAfter: 0xa4_14, // Space after
  sprmPChgTabs: 0xc6_15, // Tab stops
  sprmPFInTable: 0x24_16, // In table
  sprmPFTtp: 0x24_17, // Table terminating paragraph
  sprmPDxaAbs: 0x84_18, // Absolute position X
  sprmPDyaAbs: 0x84_19, // Absolute position Y
  sprmPDxaWidth: 0x84_1a, // Width
  sprmPPc: 0x26_1b, // Position code
  sprmPWr: 0x24_23, // Text wrapping
  sprmPBrcTop80: 0x64_24, // Top border (legacy)
  sprmPBrcLeft80: 0x64_25, // Left border (legacy)
  sprmPBrcBottom80: 0x64_26, // Bottom border (legacy)
  sprmPBrcRight80: 0x64_27, // Right border (legacy)
  sprmPBrcBetween80: 0x64_28, // Between border (legacy)
  sprmPBrcBar80: 0x66_29, // Bar border (legacy)
  sprmPFNoAutoHyph: 0x24_2a, // No auto hyphenation
  sprmPWHeightAbs: 0x44_2b, // Height (absolute)
  sprmPDcs: 0x44_2c, // Drop cap settings
  sprmPShd80: 0x44_2d, // Shading (legacy)
  sprmPDyaFromText: 0x84_2e, // Distance from text Y
  sprmPDxaFromText: 0x84_2f, // Distance from text X
  sprmPFLocked: 0x24_30, // Locked
  sprmPFWidowControl: 0x24_31, // Widow/orphan control
  sprmPFKinsoku: 0x24_33, // Kinsoku
  sprmPFWordWrap: 0x24_34, // Word wrap
  sprmPFOverflowPunct: 0x24_35, // Overflow punctuation
  sprmPFTopLinePunct: 0x24_36, // Top line punctuation
  sprmPFAutoSpaceDE: 0x24_37, // Auto space DE
  sprmPFAutoSpaceDN: 0x24_38, // Auto space DN
  sprmPWAlignFont: 0x44_39, // Font alignment
  sprmPFrameTextFlow: 0x44_3a, // Frame text flow
  sprmPOutLvl: 0x26_40, // Outline level
  sprmPFBiDi: 0x24_41, // BiDi paragraph
  sprmPFNumRMIns: 0x24_43, // Numbering revision mark insert
  sprmPNumRM: 0xc6_45, // Numbering revision mark
  sprmPHugePapx: 0x66_46, // Huge PAPX
  sprmPFUsePgsuSettings: 0x24_47, // Use PgSu settings
  sprmPFAdjustRight: 0x24_48, // Adjust right
  sprmPItap: 0x66_49, // Table depth
  sprmPDtap: 0x66_4a, // Table depth delta
  sprmPFInnerTableCell: 0x24_4b, // Inner table cell
  sprmPFInnerTtp: 0x24_4c, // Inner table terminating paragraph
  sprmPShd: 0xc6_4d, // Shading
  sprmPBrcTop: 0xc6_4e, // Top border
  sprmPBrcLeft: 0xc6_4f, // Left border
  sprmPBrcBottom: 0xc6_50, // Bottom border
  sprmPBrcRight: 0xc6_51, // Right border
  sprmPBrcBetween: 0xc6_52, // Between border
  sprmPBrcBar: 0xc6_53, // Bar border
  sprmPDxaRight: 0x84_5d, // Right indent
  sprmPDxaLeft: 0x84_5e, // Left indent
  sprmPNest: 0x46_5f, // Nest
  sprmPDxaLeft1: 0x84_60, // First line indent
  sprmPJc: 0x24_61, // Justification
  sprmPFNoAllowOverlap: 0x24_62, // No allow overlap
  sprmPWall: 0x26_64, // Wall
  sprmPIpgp: 0x64_65, // Paragraph group
  sprmPCnf: 0xc6_66, // Conditional formatting
  sprmPRsid: 0x64_67, // RSID
  sprmPIstdListPermute: 0xc6_69, // List style permutation
  sprmPTableProps: 0x64_6b, // Table properties
  sprmPTIstdInfo: 0xc6_6c, // Table istd info
  sprmPFContextualSpacing: 0x24_6d, // Contextual spacing
  sprmPPropRMark: 0xc6_6f, // Property revision mark
  sprmPFMirrorIndents: 0x24_70, // Mirror indents
  sprmPTtwo: 0x24_71, // Ttwo
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

  constructor(data: Uint8Array, offset = 0) {
    this.data = data;
    this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    this.offset = offset;
  }

  /**
   * Parse all SPRMs and return character properties
   */
  parseCharacterProperties(
    baseProps: CharacterProperties = {}
  ): CharacterProperties {
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
  parseParagraphProperties(
    baseProps: ParagraphProperties = {}
  ): ParagraphProperties {
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
    }
    if (this.offset + size > this.data.length) return null;
    const operand = this.data.slice(this.offset, this.offset + size);
    this.offset += size;
    return operand;
  }

  /**
   * Apply character SPRM to properties
   */
  private applyCharacterSprm(
    props: CharacterProperties,
    sprm: number,
    operand: Uint8Array
  ): void {
    const operandView = new DataView(
      operand.buffer,
      operand.byteOffset,
      operand.byteLength
    );
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
  private applyParagraphSprm(
    props: ParagraphProperties,
    sprm: number,
    operand: Uint8Array
  ): void {
    const operandView = new DataView(
      operand.buffer,
      operand.byteOffset,
      operand.byteLength
    );
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
    return [r, g, b]
      .map((x) => x.toString(16).padStart(2, '0').toUpperCase())
      .join('');
  }

  /**
   * Parse border from operand
   */
  private parseBorder(operand: Uint8Array): BorderProperties {
    if (operand.length < 4) return {};

    const view = new DataView(
      operand.buffer,
      operand.byteOffset,
      operand.byteLength
    );
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
