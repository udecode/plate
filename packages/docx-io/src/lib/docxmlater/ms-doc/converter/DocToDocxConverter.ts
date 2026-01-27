/**
 * DocToDocxConverter - Main orchestrator for .doc to .docx conversion
 *
 * This class coordinates the parsing of a .doc file and conversion
 * to a .docx document using the docxmlater API.
 */

import { CFBReader, CFBParseError } from '../cfb/CFBReader';
import { FIBParser, FIBParseError } from '../fib/FIB';
import { PieceTableParser, PieceTableError } from '../text/PieceTable';
import { SPRMParser } from '../properties/SPRM';
import { StyleSheetParser } from '../styles/StyleSheet';
import { TableParser } from '../tables/TableParser';
import { PictureExtractor } from '../images/PictureExtractor';
import { SectionParser, ParsedSection } from '../sections/SectionParser';
import { SubdocumentParser, ParsedSubdocument } from '../subdocuments/SubdocumentParser';
import { FieldParser, ParsedField } from '../fields/FieldParser';
import { DOC_STREAM_NAMES, SPECIAL_CHARS } from '../types/Constants';
import {
  CFBFile,
  FIB,
  TextRange,
  CharacterProperties,
  ParagraphProperties,
  StyleDefinition,
  ExtractedImage,
  TableDefinition,
} from '../types/DocTypes';

/**
 * Error thrown when document conversion fails
 */
export class DocConversionError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DocConversionError';
  }
}

/**
 * Options for document conversion
 */
export interface DocConversionOptions {
  /** Whether to extract and convert images (default: true) */
  includeImages?: boolean;
  /** Whether to preserve headers and footers (default: true) */
  includeHeadersFooters?: boolean;
  /** Whether to preserve fields as static text (default: true) */
  preserveFields?: boolean;
  /** Whether to include footnotes and endnotes (default: true) */
  includeNotes?: boolean;
}

/**
 * Parsed paragraph with content and formatting
 */
export interface ParsedParagraph {
  /** Paragraph text content */
  text: string;
  /** Paragraph properties */
  paragraphProps: ParagraphProperties;
  /** Runs with text and character properties */
  runs: Array<{
    text: string;
    charProps: CharacterProperties;
  }>;
  /** Whether this is a table cell terminator */
  isTableCell?: boolean;
  /** Whether this is a table row terminator */
  isTableRow?: boolean;
}

/**
 * Parsed document structure
 */
export interface ParsedDocument {
  /** CFB container */
  cfb: CFBFile;
  /** File Information Block */
  fib: FIB;
  /** Extracted text ranges */
  textRanges: TextRange[];
  /** Full text content */
  fullText: string;
  /** Parsed paragraphs */
  paragraphs: ParsedParagraph[];
  /** Document styles */
  styles: Map<number, StyleDefinition>;
  /** Parsed tables */
  tables: TableDefinition[];
  /** Extracted images */
  images: ExtractedImage[];
  /** Document sections */
  sections: ParsedSection[];
  /** Subdocuments (headers, footers, etc.) */
  subdocuments: ParsedSubdocument[];
  /** Fields */
  fields: ParsedField[];
}

/**
 * Main converter class for .doc to .docx conversion
 */
export class DocToDocxConverter {
  private options: DocConversionOptions;

  constructor(options: DocConversionOptions = {}) {
    this.options = {
      includeImages: true,
      includeHeadersFooters: true,
      preserveFields: true,
      includeNotes: true,
      ...options,
    };
  }

  /**
   * Parse a .doc file without converting
   * Useful for inspection or partial processing
   */
  async parse(docBuffer: Buffer | Uint8Array): Promise<ParsedDocument> {
    const data = docBuffer instanceof Buffer ? new Uint8Array(docBuffer) : docBuffer;

    // Step 1: Parse CFB container
    let cfb: CFBFile;
    try {
      cfb = CFBReader.parse(data);
    } catch (error) {
      if (error instanceof CFBParseError) {
        throw new DocConversionError(`Invalid .doc file: ${error.message}`, error);
      }
      throw error;
    }

    // Step 2: Extract WordDocument stream
    const cfbReader = new CFBReader(data);
    cfbReader.parse();

    const wordDocStream = cfbReader.getStream(DOC_STREAM_NAMES.WORD_DOCUMENT);
    if (!wordDocStream) {
      throw new DocConversionError('WordDocument stream not found');
    }

    // Step 3: Parse FIB
    let fib: FIB;
    try {
      fib = FIBParser.parse(wordDocStream.data);
    } catch (error) {
      if (error instanceof FIBParseError) {
        throw new DocConversionError(`Invalid FIB: ${error.message}`, error);
      }
      throw error;
    }

    // Step 4: Get table stream
    const tableStream = cfbReader.getStream(fib.tableStreamName);
    if (!tableStream) {
      throw new DocConversionError(`Table stream '${fib.tableStreamName}' not found`);
    }

    // Step 5: Extract text via piece table
    let textRanges: TextRange[] = [];
    let fullText = '';

    if (fib.rgFcLcb.fcClx && fib.rgFcLcb.lcbClx && fib.rgFcLcb.lcbClx > 0) {
      const clxData = tableStream.data.slice(fib.rgFcLcb.fcClx, fib.rgFcLcb.fcClx + fib.rgFcLcb.lcbClx);

      try {
        const pieceTableParser = new PieceTableParser(clxData, wordDocStream.data);
        textRanges = pieceTableParser.extractText();
        fullText = pieceTableParser.getFullText();
      } catch (error) {
        if (error instanceof PieceTableError) {
          throw new DocConversionError(`Piece table error: ${error.message}`, error);
        }
        throw error;
      }
    }

    // Step 6: Parse paragraphs from text
    const paragraphs = this.parseTextIntoParagraphs(fullText);

    // Step 7: Parse styles
    const styles = new Map<number, StyleDefinition>();
    if (fib.rgFcLcb.fcStshf && fib.rgFcLcb.lcbStshf && fib.rgFcLcb.lcbStshf > 0) {
      try {
        const stshData = tableStream.data.slice(
          fib.rgFcLcb.fcStshf,
          fib.rgFcLcb.fcStshf + fib.rgFcLcb.lcbStshf
        );
        const styleSheet = StyleSheetParser.parse(stshData);
        for (const [index, style] of styleSheet.styles) {
          styles.set(index, style);
        }
      } catch {
        // Style parsing is optional, continue without styles
      }
    }

    // Step 8: Parse tables
    const tables: TableDefinition[] = [];
    if (TableParser.hasTableContent(fullText)) {
      try {
        const tableParser = new TableParser(fullText);
        tables.push(...tableParser.parseAllTables());
      } catch {
        // Table parsing is optional
      }
    }

    // Step 9: Extract images
    let images: ExtractedImage[] = [];
    const dataStream = cfbReader.getStream('Data');
    if (dataStream && this.options.includeImages) {
      try {
        images = PictureExtractor.extractAll(dataStream.data);
      } catch {
        // Image extraction is optional
      }
    }

    // Step 10: Parse sections
    let sections: ParsedSection[] = [];
    if (fib.rgFcLcb.fcPlcfSed && fib.rgFcLcb.lcbPlcfSed && fib.rgFcLcb.lcbPlcfSed > 0) {
      try {
        const plcfSedData = tableStream.data.slice(
          fib.rgFcLcb.fcPlcfSed,
          fib.rgFcLcb.fcPlcfSed + fib.rgFcLcb.lcbPlcfSed
        );
        sections = SectionParser.parse(plcfSedData, wordDocStream.data, tableStream.data);
      } catch {
        // Section parsing is optional
      }
    }

    // Step 11: Parse subdocuments (headers, footers, footnotes, etc.)
    let subdocuments: ParsedSubdocument[] = [];
    if (this.options.includeHeadersFooters || this.options.includeNotes) {
      try {
        subdocuments = SubdocumentParser.parse(fib, fullText);
      } catch {
        // Subdocument parsing is optional
      }
    }

    // Step 12: Parse fields
    let fields: ParsedField[] = [];
    if (this.options.preserveFields && FieldParser.hasFields(fullText)) {
      try {
        fields = FieldParser.parse(fullText);
      } catch {
        // Field parsing is optional
      }
    }

    return {
      cfb,
      fib,
      textRanges,
      fullText,
      paragraphs,
      styles,
      tables,
      images,
      sections,
      subdocuments,
      fields,
    };
  }

  /**
   * Parse raw text into paragraph structures
   */
  private parseTextIntoParagraphs(text: string): ParsedParagraph[] {
    const paragraphs: ParsedParagraph[] = [];

    // Split on paragraph marks (0x0D) and section breaks (0x0C)
    const paraTexts = text.split(/[\r\x0D]/);

    for (const paraText of paraTexts) {
      if (paraText.length === 0) continue;

      // Check for special characters
      const isTableCell = paraText.includes(String.fromCharCode(SPECIAL_CHARS.CELL));
      const isTableRow = isTableCell; // Cell mark also indicates row end in some contexts

      // Clean the text of special characters for display
      let cleanText = paraText;
      cleanText = cleanText.replace(/[\x07\x0B\x0C\x0D\x0E\x13\x14\x15]/g, '');

      // Create basic paragraph with single run
      const para: ParsedParagraph = {
        text: cleanText,
        paragraphProps: {},
        runs: [
          {
            text: cleanText,
            charProps: {},
          },
        ],
        isTableCell,
        isTableRow,
      };

      paragraphs.push(para);
    }

    return paragraphs;
  }

  /**
   * Convert a .doc file to .docx format
   *
   * This method parses the .doc file and uses the docxmlater public API
   * to create an equivalent .docx document.
   */
  async convert(docBuffer: Buffer | Uint8Array): Promise<Buffer> {
    // Parse the .doc file
    const parsed = await this.parse(docBuffer);

    // Import Document from docxmlater (deferred to avoid circular deps)
    const { Document } = await import('../../index');

    // Create new document using static factory method
    const doc = Document.create();

    // Add paragraphs
    for (const para of parsed.paragraphs) {
      // Skip table markers for now (would need full table parsing)
      if (para.isTableCell) continue;

      // Create paragraph using the public API
      const p = doc.createParagraph();

      // Apply paragraph properties
      if (para.paragraphProps.justification) {
        p.setAlignment(para.paragraphProps.justification);
      }
      if (para.paragraphProps.indentLeft) {
        p.setLeftIndent(para.paragraphProps.indentLeft);
      }
      if (para.paragraphProps.indentRight) {
        p.setRightIndent(para.paragraphProps.indentRight);
      }
      if (para.paragraphProps.indentFirstLine) {
        p.setFirstLineIndent(para.paragraphProps.indentFirstLine);
      }
      if (para.paragraphProps.spaceBefore !== undefined) {
        p.setSpaceBefore(para.paragraphProps.spaceBefore);
      }
      if (para.paragraphProps.spaceAfter !== undefined) {
        p.setSpaceAfter(para.paragraphProps.spaceAfter);
      }

      // Add runs with formatting
      // The addText method accepts formatting as second parameter
      for (const run of para.runs) {
        if (run.text.length === 0) continue;

        // Build formatting object from character properties
        const formatting: Record<string, unknown> = {};

        if (run.charProps.bold) formatting.bold = true;
        if (run.charProps.italic) formatting.italic = true;
        if (run.charProps.strikethrough) formatting.strikethrough = true;
        if (run.charProps.underline && run.charProps.underline !== 'none') {
          formatting.underline = run.charProps.underline;
        }
        if (run.charProps.fontSize) {
          // Font size is in half-points, convert to points
          formatting.size = run.charProps.fontSize / 2;
        }
        if (run.charProps.fontName) {
          formatting.font = run.charProps.fontName;
        }
        if (run.charProps.color) {
          formatting.color = run.charProps.color;
        }
        if (run.charProps.highlight) {
          formatting.highlight = run.charProps.highlight;
        }
        if (run.charProps.smallCaps) formatting.smallCaps = true;
        if (run.charProps.allCaps) formatting.allCaps = true;
        if (run.charProps.subscript) formatting.subscript = true;
        if (run.charProps.superscript) formatting.superscript = true;

        // Add text with formatting
        p.addText(run.text, formatting);
      }
    }

    // Save to buffer using the public API
    return await doc.toBuffer();
  }

  /**
   * Check if a buffer contains a valid .doc file
   */
  static isDocFile(data: Uint8Array | Buffer): boolean {
    const bytes = data instanceof Buffer ? new Uint8Array(data) : data;
    return CFBReader.isValidCFB(bytes);
  }

  /**
   * Get document info without full parsing
   */
  static async getDocumentInfo(
    data: Uint8Array | Buffer
  ): Promise<{
    isValid: boolean;
    wordVersion?: string;
    characterCount?: number;
    hasImages?: boolean;
    hasTables?: boolean;
  }> {
    try {
      const bytes = data instanceof Buffer ? new Uint8Array(data) : data;

      if (!CFBReader.isValidCFB(bytes)) {
        return { isValid: false };
      }

      const cfbReader = new CFBReader(bytes);
      cfbReader.parse();

      const wordDocStream = cfbReader.getStream(DOC_STREAM_NAMES.WORD_DOCUMENT);
      if (!wordDocStream) {
        return { isValid: false };
      }

      const fib = FIBParser.parse(wordDocStream.data);

      return {
        isValid: true,
        wordVersion: FIBParser.getWordVersion(fib.base.nFib),
        characterCount: fib.rgLw97.ccpText,
        hasImages: cfbReader.hasStream('Data'),
        hasTables: fib.rgLw97.ccpText > 0, // Simplified check
      };
    } catch {
      return { isValid: false };
    }
  }
}

/**
 * Convenience function to convert a .doc buffer to .docx
 */
export async function convertDocToDocx(docBuffer: Buffer | Uint8Array, options?: DocConversionOptions): Promise<Buffer> {
  const converter = new DocToDocxConverter(options);
  return converter.convert(docBuffer);
}

/**
 * Convenience function to parse a .doc file without conversion
 */
export async function parseDocFile(docBuffer: Buffer | Uint8Array): Promise<ParsedDocument> {
  const converter = new DocToDocxConverter();
  return converter.parse(docBuffer);
}
