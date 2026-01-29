/**
 * Section Parser
 *
 * Parses section descriptors (SED) and section properties (SEP) from MS-DOC files.
 * Sections define page layout, margins, and header/footer references.
 *
 * References:
 * - [MS-DOC] 2.8.26 PlcfSed
 * - [MS-DOC] 2.9.229 Sed
 * - [MS-DOC] 2.9.228 Sep
 */

import type { SectionProperties } from '../types/DocTypes';
import { SPECIAL_CHARS } from '../types/Constants';

/**
 * Error thrown when section parsing fails
 */
export class SectionParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SectionParseError';
  }
}

/**
 * Section descriptor (SED)
 */
interface SectionDescriptor {
  /** Section number (0-based) */
  index: number;
  /** Starting character position */
  cpStart: number;
  /** Ending character position */
  cpEnd: number;
  /** File offset to SEPX */
  fcSepx: number;
}

/**
 * Parsed section with properties
 */
export interface ParsedSection {
  /** Section index */
  index: number;
  /** Start CP */
  cpStart: number;
  /** End CP */
  cpEnd: number;
  /** Section properties */
  properties: SectionProperties;
}

/**
 * Parse sections from PlcfSed data
 */
export class SectionParser {
  private plcfSedData: Uint8Array;
  private view: DataView;
  private wordDocumentStream: Uint8Array;
  private tableStream: Uint8Array;

  constructor(
    plcfSedData: Uint8Array,
    wordDocumentStream: Uint8Array,
    tableStream: Uint8Array
  ) {
    this.plcfSedData = plcfSedData;
    this.view = new DataView(
      this.plcfSedData.buffer,
      this.plcfSedData.byteOffset,
      this.plcfSedData.byteLength
    );
    this.wordDocumentStream = wordDocumentStream;
    this.tableStream = tableStream;
  }

  /**
   * Parse all sections
   */
  parse(): ParsedSection[] {
    const sections: ParsedSection[] = [];
    const descriptors = this.parsePlcfSed();

    for (const descriptor of descriptors) {
      const properties = this.parseSEP(descriptor);
      sections.push({
        index: descriptor.index,
        cpStart: descriptor.cpStart,
        cpEnd: descriptor.cpEnd,
        properties,
      });
    }

    return sections;
  }

  /**
   * Parse PlcfSed structure
   *
   * PlcfSed contains (n+1) CPs followed by n SED structures (12 bytes each)
   */
  private parsePlcfSed(): SectionDescriptor[] {
    const SED_SIZE = 12;
    const descriptors: SectionDescriptor[] = [];

    if (this.plcfSedData.length < 4) {
      return descriptors;
    }

    // Calculate number of sections
    // length = (n+1) * 4 + n * 12 = 4n + 4 + 12n = 16n + 4
    // n = (length - 4) / 16
    const numSections = (this.plcfSedData.length - 4) / 16;

    if (!Number.isInteger(numSections) || numSections <= 0) {
      return descriptors;
    }

    // Read CPs
    const cps: number[] = [];
    for (let i = 0; i <= numSections; i++) {
      cps.push(this.view.getUint32(i * 4, true));
    }

    // Read SEDs
    const sedOffset = (numSections + 1) * 4;
    for (let i = 0; i < numSections; i++) {
      const offset = sedOffset + i * SED_SIZE;

      // SED structure:
      // 2 bytes: fn (unused)
      // 4 bytes: fcSepx (file offset to SEPX in WordDocument stream)
      // 2 bytes: fnMpr (unused)
      // 4 bytes: fcMpr (unused)
      const fcSepx = this.view.getInt32(offset + 2, true);

      descriptors.push({
        index: i,
        cpStart: cps[i] ?? 0,
        cpEnd: cps[i + 1] ?? 0,
        fcSepx,
      });
    }

    return descriptors;
  }

  /**
   * Parse SEP (Section Properties) from SEPX
   */
  private parseSEP(descriptor: SectionDescriptor): SectionProperties {
    const properties: SectionProperties = {
      // Default values (per MS-DOC spec)
      pageWidth: 12_240, // 8.5 inches in twips
      pageHeight: 15_840, // 11 inches in twips
      marginLeft: 1800, // 1.25 inches
      marginRight: 1800,
      marginTop: 1440, // 1 inch
      marginBottom: 1440,
      orientation: 'portrait',
      columns: 1,
    };

    // If fcSepx is -1 or 0, use default properties
    if (descriptor.fcSepx <= 0) {
      return properties;
    }

    // Read SEPX from WordDocument stream
    if (descriptor.fcSepx + 2 > this.wordDocumentStream.length) {
      return properties;
    }

    const sepxView = new DataView(
      this.wordDocumentStream.buffer,
      this.wordDocumentStream.byteOffset + descriptor.fcSepx,
      Math.min(this.wordDocumentStream.length - descriptor.fcSepx, 512)
    );

    // SEPX structure:
    // 2 bytes: cb (count of bytes)
    const cb = sepxView.getUint16(0, true);

    if (
      cb === 0 ||
      cb + 2 > this.wordDocumentStream.length - descriptor.fcSepx
    ) {
      return properties;
    }

    // Parse SPRMs in the SEPX
    this.parseSectionSPRMs(sepxView, 2, cb, properties);

    return properties;
  }

  /**
   * Parse section SPRMs
   */
  private parseSectionSPRMs(
    view: DataView,
    offset: number,
    length: number,
    props: SectionProperties
  ): void {
    const endOffset = offset + length;
    let pos = offset;

    while (pos + 2 <= endOffset) {
      const sprm = view.getUint16(pos, true);
      pos += 2;

      // Parse SPRM based on opcode
      const opcode = sprm & 0x01_ff;
      const spra = (sprm >> 13) & 0x07; // operand size indicator

      // Calculate operand size
      let operandSize = 0;
      switch (spra) {
        case 0:
        case 1:
          operandSize = 1;
          break;
        case 2:
        case 4:
        case 5:
          operandSize = 2;
          break;
        case 3:
          operandSize = 4;
          break;
        case 6:
          // Variable length - first byte is length
          if (pos < endOffset) {
            operandSize = view.getUint8(pos) + 1;
          }
          break;
        case 7:
          operandSize = 3;
          break;
      }

      if (pos + operandSize > endOffset) {
        break;
      }

      // Apply section property
      this.applySectionSPRM(sprm, view, pos, props);
      pos += operandSize;
    }
  }

  /**
   * Apply a section SPRM to properties
   */
  private applySectionSPRM(
    sprm: number,
    view: DataView,
    offset: number,
    props: SectionProperties
  ): void {
    switch (sprm) {
      // sprmSBkc - Section break type
      case 0x30_09:
        {
          const bkc = view.getUint8(offset);
          switch (bkc) {
            case 0:
              props.breakType = 'continuous';
              break;
            case 1:
              props.breakType = 'nextColumn';
              break;
            case 2:
              props.breakType = 'nextPage';
              break;
            case 3:
              props.breakType = 'evenPage';
              break;
            case 4:
              props.breakType = 'oddPage';
              break;
          }
        }
        break;

      // sprmSFTitlePage - Has different first page header/footer
      case 0x30_0a:
        props.titlePage = view.getUint8(offset) !== 0;
        break;

      // sprmSCcolumns - Number of columns
      case 0x50_0b:
        props.columns = view.getUint16(offset, true) + 1;
        break;

      // sprmSDxaColumns - Column spacing
      case 0x90_0c:
        props.columnSpacing = view.getUint16(offset, true);
        break;

      // sprmSXaPage - Page width
      case 0xb0_1f:
        props.pageWidth = view.getUint16(offset, true);
        break;

      // sprmSYaPage - Page height
      case 0xb0_20:
        props.pageHeight = view.getUint16(offset, true);
        break;

      // sprmSDxaLeft - Left margin
      case 0xb0_21:
        props.marginLeft = view.getUint16(offset, true);
        break;

      // sprmSDxaRight - Right margin
      case 0xb0_22:
        props.marginRight = view.getUint16(offset, true);
        break;

      // sprmSDyaTop - Top margin
      case 0x90_23:
        props.marginTop = view.getInt16(offset, true);
        break;

      // sprmSDyaBottom - Bottom margin
      case 0x90_24:
        props.marginBottom = view.getInt16(offset, true);
        break;

      // sprmSDyaHdrTop - Header margin
      case 0xb0_17:
        props.marginHeader = view.getUint16(offset, true);
        break;

      // sprmSDyaHdrBottom - Footer margin
      case 0xb0_18:
        props.marginFooter = view.getUint16(offset, true);
        break;

      // sprmSPgnStart - Starting page number
      case 0x50_1c:
        props.pageNumberStart = view.getUint16(offset, true);
        break;

      // sprmSBOrientation - Page orientation
      case 0x30_1d:
        props.orientation =
          view.getUint8(offset) === 2 ? 'landscape' : 'portrait';
        break;

      // sprmSDxaGutter - Gutter margin
      case 0xb0_25:
        props.marginGutter = view.getUint16(offset, true);
        break;

      // sprmSFEvenlySpaced - Evenly spaced columns
      // sprmSFProtected - Section is protected
      // And many more section SPRMs...
    }
  }

  /**
   * Detect section breaks in text
   */
  static findSectionBreaks(text: string): number[] {
    const breaks: number[] = [];
    const sectionBreak = String.fromCharCode(SPECIAL_CHARS.SECTION_BREAK);

    let pos = 0;
    while (pos < text.length) {
      const idx = text.indexOf(sectionBreak, pos);
      if (idx === -1) break;
      breaks.push(idx);
      pos = idx + 1;
    }

    return breaks;
  }

  /**
   * Static method to parse sections
   */
  static parse(
    plcfSedData: Uint8Array,
    wordDocumentStream: Uint8Array,
    tableStream: Uint8Array
  ): ParsedSection[] {
    const parser = new SectionParser(
      plcfSedData,
      wordDocumentStream,
      tableStream
    );
    return parser.parse();
  }
}
