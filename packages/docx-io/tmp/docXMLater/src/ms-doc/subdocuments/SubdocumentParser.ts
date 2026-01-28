/**
 * Subdocument Parser
 *
 * Parses subdocuments from MS-DOC files including headers, footers,
 * footnotes, endnotes, comments, and textboxes.
 *
 * In .doc files, subdocuments are stored as separate CP ranges within
 * the same WordDocument stream. The FIB contains the CP boundaries.
 *
 * References:
 * - [MS-DOC] 2.6.1 Main Document
 * - [MS-DOC] 2.6.3 Headers and Footers
 * - [MS-DOC] 2.6.4 Footnotes
 * - [MS-DOC] 2.6.5 Endnotes
 */

import { FIB } from '../types/DocTypes';
import { PieceTableParser } from '../text/PieceTable';

/**
 * Error thrown when subdocument parsing fails
 */
export class SubdocumentParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubdocumentParseError';
  }
}

/**
 * Types of subdocuments
 */
export type SubdocumentType = 'main' | 'header' | 'footer' | 'footnote' | 'endnote' | 'comment' | 'textbox' | 'headerTextbox';

/**
 * Header/footer types
 */
export type HeaderFooterType = 'even' | 'odd' | 'first';

/**
 * Parsed subdocument
 */
export interface ParsedSubdocument {
  /** Subdocument type */
  type: SubdocumentType;
  /** Starting CP */
  cpStart: number;
  /** Ending CP */
  cpEnd: number;
  /** Extracted text */
  text: string;
  /** Section index (for headers/footers) */
  sectionIndex?: number;
  /** Header/footer subtype */
  headerFooterType?: HeaderFooterType;
}

/**
 * Header/footer entry
 */
interface HeaderFooterEntry {
  /** CP offset within header/footer subdocument */
  cpOffset: number;
  /** Header or footer */
  type: 'header' | 'footer';
  /** Even, odd, or first page */
  subtype: HeaderFooterType;
  /** Section index */
  sectionIndex: number;
}

/**
 * Parse subdocuments from .doc file
 */
export class SubdocumentParser {
  private fib: FIB;
  private fullText: string;

  constructor(fib: FIB, fullText: string) {
    this.fib = fib;
    this.fullText = fullText;
  }

  /**
   * Get all subdocument ranges
   */
  getSubdocumentRanges(): {
    main: { cpStart: number; cpEnd: number };
    footnotes?: { cpStart: number; cpEnd: number };
    headers?: { cpStart: number; cpEnd: number };
    comments?: { cpStart: number; cpEnd: number };
    endnotes?: { cpStart: number; cpEnd: number };
    textboxes?: { cpStart: number; cpEnd: number };
    headerTextboxes?: { cpStart: number; cpEnd: number };
  } {
    const rgLw = this.fib.rgLw97;

    // Calculate CP boundaries based on FIB
    // Main document: 0 to ccpText
    const mainEnd = rgLw.ccpText;

    // Footnotes: mainEnd to mainEnd + ccpFtn
    const footnotesStart = mainEnd;
    const footnotesEnd = footnotesStart + rgLw.ccpFtn;

    // Headers/footers: footnotesEnd to footnotesEnd + ccpHdd
    const headersStart = footnotesEnd;
    const headersEnd = headersStart + rgLw.ccpHdd;

    // Comments/annotations: headersEnd to headersEnd + ccpAtn
    const commentsStart = headersEnd;
    const commentsEnd = commentsStart + rgLw.ccpAtn;

    // Endnotes: commentsEnd to commentsEnd + ccpEdn
    const endnotesStart = commentsEnd;
    const endnotesEnd = endnotesStart + rgLw.ccpEdn;

    // Textboxes: endnotesEnd to endnotesEnd + ccpTxbx
    const textboxesStart = endnotesEnd;
    const textboxesEnd = textboxesStart + rgLw.ccpTxbx;

    // Header textboxes: textboxesEnd to textboxesEnd + ccpHdrTxbx
    const headerTextboxesStart = textboxesEnd;
    const headerTextboxesEnd = headerTextboxesStart + rgLw.ccpHdrTxbx;

    const result: ReturnType<typeof this.getSubdocumentRanges> = {
      main: { cpStart: 0, cpEnd: mainEnd },
    };

    if (rgLw.ccpFtn > 0) {
      result.footnotes = { cpStart: footnotesStart, cpEnd: footnotesEnd };
    }
    if (rgLw.ccpHdd > 0) {
      result.headers = { cpStart: headersStart, cpEnd: headersEnd };
    }
    if (rgLw.ccpAtn > 0) {
      result.comments = { cpStart: commentsStart, cpEnd: commentsEnd };
    }
    if (rgLw.ccpEdn > 0) {
      result.endnotes = { cpStart: endnotesStart, cpEnd: endnotesEnd };
    }
    if (rgLw.ccpTxbx > 0) {
      result.textboxes = { cpStart: textboxesStart, cpEnd: textboxesEnd };
    }
    if (rgLw.ccpHdrTxbx > 0) {
      result.headerTextboxes = { cpStart: headerTextboxesStart, cpEnd: headerTextboxesEnd };
    }

    return result;
  }

  /**
   * Extract main document text
   */
  getMainDocumentText(): string {
    const ranges = this.getSubdocumentRanges();
    return this.fullText.substring(0, ranges.main.cpEnd);
  }

  /**
   * Extract footnotes text
   */
  getFootnotesText(): string | null {
    const ranges = this.getSubdocumentRanges();
    if (!ranges.footnotes) return null;
    return this.fullText.substring(ranges.footnotes.cpStart, ranges.footnotes.cpEnd);
  }

  /**
   * Extract headers/footers text
   */
  getHeadersFootersText(): string | null {
    const ranges = this.getSubdocumentRanges();
    if (!ranges.headers) return null;
    return this.fullText.substring(ranges.headers.cpStart, ranges.headers.cpEnd);
  }

  /**
   * Extract comments text
   */
  getCommentsText(): string | null {
    const ranges = this.getSubdocumentRanges();
    if (!ranges.comments) return null;
    return this.fullText.substring(ranges.comments.cpStart, ranges.comments.cpEnd);
  }

  /**
   * Extract endnotes text
   */
  getEndnotesText(): string | null {
    const ranges = this.getSubdocumentRanges();
    if (!ranges.endnotes) return null;
    return this.fullText.substring(ranges.endnotes.cpStart, ranges.endnotes.cpEnd);
  }

  /**
   * Parse individual headers and footers
   *
   * Headers and footers are stored in a specific order per section:
   * 1. Even page header
   * 2. Odd page header
   * 3. Even page footer
   * 4. Odd page footer
   * 5. First page header
   * 6. First page footer
   *
   * Each entry is terminated by a paragraph mark (0x0D)
   */
  parseHeadersFooters(): ParsedSubdocument[] {
    const results: ParsedSubdocument[] = [];
    const hfText = this.getHeadersFootersText();

    if (!hfText) return results;

    // Split by paragraph marks
    const entries = hfText.split('\r');
    let entryIndex = 0;
    let sectionIndex = 0;

    // Each section has 6 header/footer slots
    const entriesPerSection = 6;
    const types: Array<{ type: 'header' | 'footer'; subtype: HeaderFooterType }> = [
      { type: 'header', subtype: 'even' },
      { type: 'header', subtype: 'odd' },
      { type: 'footer', subtype: 'even' },
      { type: 'footer', subtype: 'odd' },
      { type: 'header', subtype: 'first' },
      { type: 'footer', subtype: 'first' },
    ];

    const ranges = this.getSubdocumentRanges();
    let cpOffset = ranges.headers?.cpStart ?? 0;

    for (const entry of entries) {
      const slotIndex = entryIndex % entriesPerSection;
      const typeInfo = types[slotIndex];

      if (entry.length > 0 && typeInfo) {
        results.push({
          type: typeInfo.type === 'header' ? 'header' : 'footer',
          cpStart: cpOffset,
          cpEnd: cpOffset + entry.length,
          text: entry,
          sectionIndex,
          headerFooterType: typeInfo.subtype,
        });
      }

      cpOffset += entry.length + 1; // +1 for paragraph mark
      entryIndex++;

      // Move to next section every 6 entries
      if (entryIndex % entriesPerSection === 0) {
        sectionIndex++;
      }
    }

    return results;
  }

  /**
   * Parse footnotes into individual entries
   */
  parseFootnotes(): ParsedSubdocument[] {
    const results: ParsedSubdocument[] = [];
    const fnText = this.getFootnotesText();

    if (!fnText) return results;

    // Footnotes are separated by paragraph marks
    const entries = fnText.split('\r');
    const ranges = this.getSubdocumentRanges();
    let cpOffset = ranges.footnotes?.cpStart ?? 0;

    for (const entry of entries) {
      if (entry.length > 0) {
        results.push({
          type: 'footnote',
          cpStart: cpOffset,
          cpEnd: cpOffset + entry.length,
          text: entry,
        });
      }
      cpOffset += entry.length + 1;
    }

    return results;
  }

  /**
   * Parse endnotes into individual entries
   */
  parseEndnotes(): ParsedSubdocument[] {
    const results: ParsedSubdocument[] = [];
    const enText = this.getEndnotesText();

    if (!enText) return results;

    const entries = enText.split('\r');
    const ranges = this.getSubdocumentRanges();
    let cpOffset = ranges.endnotes?.cpStart ?? 0;

    for (const entry of entries) {
      if (entry.length > 0) {
        results.push({
          type: 'endnote',
          cpStart: cpOffset,
          cpEnd: cpOffset + entry.length,
          text: entry,
        });
      }
      cpOffset += entry.length + 1;
    }

    return results;
  }

  /**
   * Parse comments into individual entries
   */
  parseComments(): ParsedSubdocument[] {
    const results: ParsedSubdocument[] = [];
    const cmtText = this.getCommentsText();

    if (!cmtText) return results;

    const entries = cmtText.split('\r');
    const ranges = this.getSubdocumentRanges();
    let cpOffset = ranges.comments?.cpStart ?? 0;

    for (const entry of entries) {
      if (entry.length > 0) {
        results.push({
          type: 'comment',
          cpStart: cpOffset,
          cpEnd: cpOffset + entry.length,
          text: entry,
        });
      }
      cpOffset += entry.length + 1;
    }

    return results;
  }

  /**
   * Parse all subdocuments
   */
  parseAll(): ParsedSubdocument[] {
    const results: ParsedSubdocument[] = [];

    // Add main document
    const mainText = this.getMainDocumentText();
    results.push({
      type: 'main',
      cpStart: 0,
      cpEnd: mainText.length,
      text: mainText,
    });

    // Add headers and footers
    results.push(...this.parseHeadersFooters());

    // Add footnotes
    results.push(...this.parseFootnotes());

    // Add endnotes
    results.push(...this.parseEndnotes());

    // Add comments
    results.push(...this.parseComments());

    return results;
  }

  /**
   * Static method to parse subdocuments
   */
  static parse(fib: FIB, fullText: string): ParsedSubdocument[] {
    const parser = new SubdocumentParser(fib, fullText);
    return parser.parseAll();
  }
}
