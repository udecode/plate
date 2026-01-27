/**
 * StyleSheet Parser
 *
 * Parses the STSH (Style Sheet) structure from MS-DOC files.
 * The style sheet contains all style definitions used in the document.
 *
 * References:
 * - [MS-DOC] 2.9.271 STSH
 * - [MS-DOC] 2.9.260 STD
 * - [MS-DOC] 2.9.258 StdfBase
 * - [MS-DOC] 2.9.259 StdfPost2000
 */

import { StyleDefinition, StyleType, CharacterProperties, ParagraphProperties } from '../types/DocTypes';
import { SPRMParser } from '../properties/SPRM';

/**
 * Error thrown when style sheet parsing fails
 */
export class StyleSheetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StyleSheetError';
  }
}

/**
 * Style type constants per MS-DOC spec
 */
const STYLE_TYPES = {
  PARAGRAPH: 1,
  CHARACTER: 2,
  TABLE: 3,
  LIST: 4,
} as const;

/**
 * Built-in style IDs (sti values)
 */
const BUILT_IN_STYLES: { [key: number]: string } = {
  0: 'Normal',
  1: 'Heading1',
  2: 'Heading2',
  3: 'Heading3',
  4: 'Heading4',
  5: 'Heading5',
  6: 'Heading6',
  7: 'Heading7',
  8: 'Heading8',
  9: 'Heading9',
  10: 'Index1',
  65: 'TOC1',
  66: 'TOC2',
  67: 'TOC3',
  68: 'TOC4',
  69: 'TOC5',
  70: 'TOC6',
  71: 'TOC7',
  72: 'TOC8',
  73: 'TOC9',
  74: 'NormalIndent',
  75: 'FootnoteText',
  76: 'CommentText',
  77: 'Header',
  78: 'Footer',
  79: 'IndexHeading',
  80: 'Caption',
  81: 'TableOfFigures',
  82: 'EnvelopeAddress',
  83: 'EnvelopeReturn',
  84: 'FootnoteReference',
  85: 'CommentReference',
  86: 'LineNumber',
  87: 'PageNumber',
  88: 'EndnoteReference',
  89: 'EndnoteText',
  90: 'TableOfAuthorities',
  91: 'MacroText',
  94: 'Title',
  95: 'ClosingSignature',
  96: 'DefaultParagraphFont',
  97: 'Subtitle',
  98: 'Salutation',
  99: 'Date',
  100: 'BodyTextFirstIndent',
  101: 'BodyTextFirstIndent2',
  102: 'NoteHeading',
  103: 'BodyText',
  104: 'BodyTextIndent',
  105: 'ListContinue',
  106: 'ListContinue2',
  107: 'ListContinue3',
  108: 'ListContinue4',
  109: 'ListContinue5',
  110: 'MessageHeader',
  111: 'BodyText2',
  112: 'BodyText3',
  113: 'BodyTextIndent2',
  114: 'BodyTextIndent3',
  115: 'BlockQuotation',
  116: 'Hyperlink',
  117: 'FollowedHyperlink',
  118: 'Strong',
  119: 'Emphasis',
  120: 'PlainText',
  122: 'HTMLCode',
  136: 'HTMLDefinition',
  137: 'HTMLKeyboard',
  138: 'HTMLPreformatted',
  139: 'HTMLSample',
  140: 'HTMLTypewriter',
  141: 'HTMLVariable',
  152: 'Normal(Table)',
  154: 'ListBullet',
  155: 'ListBullet2',
  156: 'ListBullet3',
  157: 'ListBullet4',
  158: 'ListBullet5',
  159: 'ListNumber',
  160: 'ListNumber2',
  161: 'ListNumber3',
  162: 'ListNumber4',
  163: 'ListNumber5',
};

/**
 * Parsed style sheet
 */
export interface ParsedStyleSheet {
  /** All style definitions by style index */
  styles: Map<number, StyleDefinition>;
  /** Style names to indices */
  stylesByName: Map<string, number>;
  /** Base style (typically Normal) */
  baseStyle?: StyleDefinition;
  /** Total number of styles */
  count: number;
}

/**
 * Parse style sheet from STSH data
 */
export class StyleSheetParser {
  private data: Uint8Array;
  private view: DataView;
  private offset: number = 0;

  constructor(stshData: Uint8Array) {
    this.data = stshData;
    this.view = new DataView(this.data.buffer, this.data.byteOffset, this.data.byteLength);
  }

  /**
   * Parse the complete style sheet
   */
  parse(): ParsedStyleSheet {
    const styles = new Map<number, StyleDefinition>();
    const stylesByName = new Map<string, number>();

    if (this.data.length < 4) {
      throw new StyleSheetError('STSH data too short');
    }

    // Read Stshi (Style Sheet Information)
    const cbStshi = this.view.getUint16(0, true);
    this.offset = 2;

    // Parse Stshi structure
    const stshi = this.parseStshi(cbStshi);
    this.offset = 2 + cbStshi;

    // Read style count
    const cstd = this.view.getUint16(this.offset, true);
    this.offset += 2;

    // Read cbSTDBaseInFile (size of each STD base)
    const cbSTDBaseInFile = this.view.getUint16(this.offset, true);
    this.offset += 2;

    // Parse each style definition
    for (let i = 0; i < cstd && this.offset < this.data.length; i++) {
      // Check if we have enough data for the length field
      if (this.offset + 2 > this.data.length) {
        break;
      }

      // Each STD is prefixed with its length
      const cbStd = this.view.getUint16(this.offset, true);
      this.offset += 2;

      if (cbStd === 0) {
        // Empty/undefined style slot
        continue;
      }

      if (this.offset + cbStd > this.data.length) {
        // Truncated data, stop parsing
        break;
      }

      try {
        const std = this.parseSTD(i, cbStd, cbSTDBaseInFile);
        if (std) {
          styles.set(i, std);
          if (std.name) {
            stylesByName.set(std.name, i);
          }
        }
      } catch {
        // Skip malformed style definitions
      }

      this.offset += cbStd;
    }

    return {
      styles,
      stylesByName,
      baseStyle: styles.get(0),
      count: styles.size,
    };
  }

  /**
   * Parse Stshi (Style Sheet Information) structure
   */
  private parseStshi(cbStshi: number): {
    cstd: number;
    cbSTDBaseInFile: number;
    fStdStylenamesWritten: boolean;
    stiMaxWhenSaved: number;
    istdMaxFixedWhenSaved: number;
    nVerBuiltInNamesWhenSaved: number;
  } {
    if (cbStshi < 18) {
      // Minimum size check
      return {
        cstd: 0,
        cbSTDBaseInFile: 0,
        fStdStylenamesWritten: false,
        stiMaxWhenSaved: 0,
        istdMaxFixedWhenSaved: 0,
        nVerBuiltInNamesWhenSaved: 0,
      };
    }

    const offset = this.offset;

    return {
      cstd: this.view.getUint16(offset, true),
      cbSTDBaseInFile: this.view.getUint16(offset + 2, true),
      fStdStylenamesWritten: (this.view.getUint16(offset + 4, true) & 1) !== 0,
      stiMaxWhenSaved: this.view.getUint16(offset + 6, true),
      istdMaxFixedWhenSaved: this.view.getUint16(offset + 8, true),
      nVerBuiltInNamesWhenSaved: this.view.getUint16(offset + 10, true),
    };
  }

  /**
   * Parse STD (Style Definition) structure
   */
  private parseSTD(index: number, cbStd: number, cbSTDBaseInFile: number): StyleDefinition | null {
    const startOffset = this.offset;

    // Parse StdfBase (required)
    if (cbSTDBaseInFile < 10) {
      return null;
    }

    // StdfBase structure
    const stdfBaseData = this.view.getUint16(startOffset, true);
    const sti = stdfBaseData & 0x0fff; // Built-in style identifier (12 bits)
    const fScratch = (stdfBaseData & 0x1000) !== 0; // Scratch style
    const fInvalHeight = (stdfBaseData & 0x2000) !== 0;
    const fHasUpe = (stdfBaseData & 0x4000) !== 0;
    const fMassCopy = (stdfBaseData & 0x8000) !== 0;

    const stdfBaseData2 = this.view.getUint16(startOffset + 2, true);
    const stk = stdfBaseData2 & 0x000f; // Style type (4 bits)
    const istdBase = (stdfBaseData2 >> 4) & 0x0fff; // Base style index (12 bits)

    const stdfBaseData3 = this.view.getUint16(startOffset + 4, true);
    const cupx = stdfBaseData3 & 0x000f; // Number of UPX entries (4 bits)
    const istdNext = (stdfBaseData3 >> 4) & 0x0fff; // Next style index (12 bits)

    const bchUpe = this.view.getUint16(startOffset + 6, true); // Size of UPE data

    // Skip grfstd flags
    const grfstd = this.view.getUint16(startOffset + 8, true);

    // Determine style type
    let styleType: StyleType = 'paragraph';
    switch (stk) {
      case STYLE_TYPES.PARAGRAPH:
        styleType = 'paragraph';
        break;
      case STYLE_TYPES.CHARACTER:
        styleType = 'character';
        break;
      case STYLE_TYPES.TABLE:
        styleType = 'table';
        break;
      case STYLE_TYPES.LIST:
        styleType = 'list';
        break;
    }

    // Try to get style name
    let styleName = BUILT_IN_STYLES[sti] ?? '';

    // Parse style name from the STD if present
    // The name follows the StdfBase at offset cbSTDBaseInFile
    const nameOffset = startOffset + cbSTDBaseInFile;
    if (nameOffset < startOffset + cbStd) {
      try {
        styleName = this.parseStyleName(nameOffset, startOffset + cbStd) || styleName;
      } catch {
        // Use built-in name or empty
      }
    }

    // Create style definition
    const style: StyleDefinition = {
      index,
      name: styleName || `Style${index}`,
      type: styleType,
      sti,
      basedOn: istdBase !== 0x0fff ? istdBase : undefined,
      next: istdNext !== 0x0fff ? istdNext : undefined,
      isBuiltIn: sti < 4095 && BUILT_IN_STYLES[sti] !== undefined,
    };

    // Parse properties (CHPX/PAPX) if present
    // This would require more complex parsing based on cupx and the UPX data
    // For now, we just capture the basic style definition

    return style;
  }

  /**
   * Parse style name from STD
   * Names can be either XChar (Pascal string) or internal name reference
   */
  private parseStyleName(offset: number, endOffset: number): string {
    if (offset >= endOffset) {
      return '';
    }

    // First byte indicates name type/length
    const firstByte = this.data[offset] ?? 0;

    // Check for internal name reference (0xFFxx pattern)
    if (firstByte === 0xff && offset + 1 < endOffset) {
      // Internal reference to built-in style name
      return '';
    }

    // Pascal-style string: first byte/word is length
    // In Word 97+, names are stored as null-terminated Unicode strings
    const nameLength = firstByte;
    if (nameLength === 0) {
      return '';
    }

    // Try reading as UTF-16LE (common in Word 97+)
    const nameStart = offset + 1;
    const chars: string[] = [];

    for (let i = 0; i < nameLength && nameStart + i * 2 + 1 < endOffset; i++) {
      const low = this.data[nameStart + i * 2] ?? 0;
      const high = this.data[nameStart + i * 2 + 1] ?? 0;
      const char = low | (high << 8);

      if (char === 0) {
        break; // Null terminator
      }
      chars.push(String.fromCharCode(char));
    }

    return chars.join('');
  }

  /**
   * Static method to parse style sheet
   */
  static parse(stshData: Uint8Array): ParsedStyleSheet {
    const parser = new StyleSheetParser(stshData);
    return parser.parse();
  }

  /**
   * Get built-in style name by sti
   */
  static getBuiltInStyleName(sti: number): string | undefined {
    return BUILT_IN_STYLES[sti];
  }
}
