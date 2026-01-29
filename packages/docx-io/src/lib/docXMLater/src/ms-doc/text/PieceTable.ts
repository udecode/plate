/**
 * Piece Table Parser
 *
 * Parses the Clx structure which contains the piece table (PlcPcd)
 * that maps character positions to locations in the WordDocument stream.
 *
 * References:
 * - [MS-DOC] 2.8.35 Clx
 * - [MS-DOC] 2.8.36 Pcdt
 * - [MS-DOC] 2.8.37 PlcPcd
 * - [MS-DOC] 2.8.38 Pcd
 */

import type { PieceTable, PieceDescriptor, TextRange } from '../types/DocTypes';

/**
 * Error thrown when piece table parsing fails
 */
export class PieceTableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PieceTableError';
  }
}

/**
 * Clx structure type identifiers
 */
const CLX_TYPES = {
  /** Prc (Property modifier) - variable length */
  PRC: 0x01,
  /** Pcdt (Piece descriptor table) */
  PCDT: 0x02,
} as const;

/**
 * Parse piece table from Clx structure
 */
export class PieceTableParser {
  private data: Uint8Array;
  private view: DataView;
  private wordDocumentStream: Uint8Array;

  /**
   * @param clxData The Clx structure from the Table stream
   * @param wordDocumentStream The WordDocument stream containing text
   */
  constructor(clxData: Uint8Array, wordDocumentStream: Uint8Array) {
    this.data = clxData;
    this.view = new DataView(
      this.data.buffer,
      this.data.byteOffset,
      this.data.byteLength
    );
    this.wordDocumentStream = wordDocumentStream;
  }

  /**
   * Parse the piece table
   */
  parse(): PieceTable {
    let offset = 0;

    // Skip any Prc structures
    while (offset < this.data.length) {
      const clxType = this.data[offset];

      if (clxType === CLX_TYPES.PRC) {
        // Prc structure: 1 byte type + 2 bytes length + data
        offset++; // Skip type
        const prcLen = this.view.getInt16(offset, true);
        offset += 2 + prcLen; // Skip length and data
      } else if (clxType === CLX_TYPES.PCDT) {
        // Found the Pcdt
        offset++; // Skip type
        return this.parsePcdt(offset);
      } else {
        throw new PieceTableError(
          `Unknown Clx type: 0x${clxType?.toString(16)}`
        );
      }
    }

    throw new PieceTableError('No Pcdt found in Clx structure');
  }

  /**
   * Parse Pcdt structure
   */
  private parsePcdt(offset: number): PieceTable {
    // Pcdt: 4 bytes length + PlcPcd
    const pcdtLen = this.view.getUint32(offset, true);
    offset += 4;

    return this.parsePlcPcd(offset, pcdtLen);
  }

  /**
   * Parse PlcPcd (Piece descriptor PLC)
   *
   * Structure: array of (n+1) CPs followed by array of n Pcd structures
   * Each Pcd is 8 bytes
   */
  private parsePlcPcd(offset: number, length: number): PieceTable {
    const PCD_SIZE = 8;

    // Calculate number of pieces
    // length = (n+1) * 4 + n * 8
    // length = 4n + 4 + 8n = 12n + 4
    // n = (length - 4) / 12
    const numPieces = (length - 4) / 12;

    if (!Number.isInteger(numPieces) || numPieces < 0) {
      throw new PieceTableError(`Invalid PlcPcd length: ${length}`);
    }

    // Read CPs (n+1 values)
    const cps: number[] = [];
    for (let i = 0; i <= numPieces; i++) {
      cps.push(this.view.getUint32(offset + i * 4, true));
    }

    // Read Pcd structures
    const pcdOffset = offset + (numPieces + 1) * 4;
    const pieces: PieceDescriptor[] = [];

    for (let i = 0; i < numPieces; i++) {
      const pcd = this.parsePcd(
        pcdOffset + i * PCD_SIZE,
        cps[i] ?? 0,
        cps[i + 1] ?? 0
      );
      pieces.push(pcd);
    }

    return { cps, pieces };
  }

  /**
   * Parse a single Pcd structure (8 bytes)
   *
   * Structure:
   * - 2 bytes: fNoParaLast (unused in reading)
   * - 4 bytes: fc (file character position, includes compression flag)
   * - 2 bytes: prm (property modifier)
   */
  private parsePcd(
    offset: number,
    cpStart: number,
    cpEnd: number
  ): PieceDescriptor {
    // Skip first 2 bytes (fNoParaLast)
    const fcRaw = this.view.getUint32(offset + 2, true);
    const prm = this.view.getUint16(offset + 6, true);

    // Bit 30 indicates compression (1 = compressed ANSI, 0 = Unicode)
    const fCompressed = (fcRaw & 0x40_00_00_00) !== 0;

    // The actual file offset (mask out the compression bit)
    // For compressed text, divide by 2 to get actual offset
    let fc = fcRaw & 0x3f_ff_ff_ff;
    if (fCompressed) {
      fc = fc >> 1;
    }

    return {
      fc,
      fCompressed,
      prm,
      cpStart,
      cpEnd,
    };
  }

  /**
   * Extract text from all pieces
   */
  extractText(): TextRange[] {
    const pieceTable = this.parse();
    const ranges: TextRange[] = [];

    for (const piece of pieceTable.pieces) {
      const text = this.extractPieceText(piece);
      ranges.push({
        cpStart: piece.cpStart,
        cpEnd: piece.cpEnd,
        text,
      });
    }

    return ranges;
  }

  /**
   * Extract text from a single piece
   */
  private extractPieceText(piece: PieceDescriptor): string {
    const charCount = piece.cpEnd - piece.cpStart;

    if (piece.fCompressed) {
      // ANSI (1 byte per character)
      const bytes = this.wordDocumentStream.slice(
        piece.fc,
        piece.fc + charCount
      );
      return this.decodeANSI(bytes);
    }
    // Unicode (2 bytes per character)
    const bytes = this.wordDocumentStream.slice(
      piece.fc,
      piece.fc + charCount * 2
    );
    return this.decodeUTF16LE(bytes);
  }

  /**
   * Decode ANSI bytes to string (Windows-1252)
   */
  private decodeANSI(bytes: Uint8Array): string {
    // Windows-1252 to Unicode mapping for bytes 0x80-0x9F
    const cp1252Map: { [key: number]: number } = {
      128: 0x20_ac, // Euro sign
      130: 0x20_1a, // Single low-9 quotation mark
      131: 0x01_92, // Latin small f with hook
      132: 0x20_1e, // Double low-9 quotation mark
      133: 0x20_26, // Horizontal ellipsis
      134: 0x20_20, // Dagger
      135: 0x20_21, // Double dagger
      136: 0x02_c6, // Modifier letter circumflex accent
      137: 0x20_30, // Per mille sign
      138: 0x01_60, // Latin capital S with caron
      139: 0x20_39, // Single left-pointing angle quotation mark
      140: 0x01_52, // Latin capital ligature OE
      142: 0x01_7d, // Latin capital Z with caron
      145: 0x20_18, // Left single quotation mark
      146: 0x20_19, // Right single quotation mark
      147: 0x20_1c, // Left double quotation mark
      148: 0x20_1d, // Right double quotation mark
      149: 0x20_22, // Bullet
      150: 0x20_13, // En dash
      151: 0x20_14, // Em dash
      152: 0x02_dc, // Small tilde
      153: 0x21_22, // Trade mark sign
      154: 0x01_61, // Latin small s with caron
      155: 0x20_3a, // Single right-pointing angle quotation mark
      156: 0x01_53, // Latin small ligature oe
      158: 0x01_7e, // Latin small z with caron
      159: 0x01_78, // Latin capital Y with diaeresis
    };

    const chars: string[] = [];
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      if (byte === undefined) continue;

      if (byte >= 0x80 && byte <= 0x9f && cp1252Map[byte] !== undefined) {
        chars.push(String.fromCharCode(cp1252Map[byte]!));
      } else {
        chars.push(String.fromCharCode(byte));
      }
    }
    return chars.join('');
  }

  /**
   * Decode UTF-16LE bytes to string
   */
  private decodeUTF16LE(bytes: Uint8Array): string {
    const chars: string[] = [];
    for (let i = 0; i < bytes.length - 1; i += 2) {
      const low = bytes[i];
      const high = bytes[i + 1];
      if (low === undefined || high === undefined) break;
      chars.push(String.fromCharCode(low | (high << 8)));
    }
    return chars.join('');
  }

  /**
   * Get combined text as single string
   */
  getFullText(): string {
    const ranges = this.extractText();
    return ranges.map((r) => r.text).join('');
  }

  /**
   * Static method to parse and extract text
   */
  static extractText(
    clxData: Uint8Array,
    wordDocumentStream: Uint8Array
  ): TextRange[] {
    const parser = new PieceTableParser(clxData, wordDocumentStream);
    return parser.extractText();
  }
}
