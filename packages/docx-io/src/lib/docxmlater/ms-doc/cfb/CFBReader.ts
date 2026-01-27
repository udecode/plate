/**
 * CFBReader - Compound File Binary format reader
 *
 * Parses OLE2/CFB container files used by legacy Microsoft Office formats.
 *
 * References:
 * - [MS-CFB]: Compound File Binary File Format
 *   https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-cfb/
 */

import {
  CFB_SIGNATURE,
  CFB_HEADER_SIZE,
  SECTOR_SIZE_V3,
  SECTOR_SIZE_V4,
  MINI_STREAM_CUTOFF_SIZE,
  MINI_SECTOR_SIZE,
  DIRECTORY_ENTRY_SIZE,
  SECTOR_VALUES,
  HEADER_OFFSETS,
  DIR_ENTRY_OFFSETS,
  OBJECT_TYPES,
  NOSTREAM,
} from '../types/Constants';
import { CFBHeader, CFBDirectoryEntry, CFBFile, CFBStream } from '../types/DocTypes';

/**
 * Error thrown when CFB parsing fails
 */
export class CFBParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CFBParseError';
  }
}

/**
 * CFB (Compound File Binary) reader
 *
 * Parses OLE2 compound documents which are the container format for
 * legacy .doc, .xls, and .ppt files.
 */
export class CFBReader {
  private data: Uint8Array;
  private view: DataView;
  private header!: CFBHeader;
  private fat!: Uint32Array;
  private miniFat!: Uint32Array;
  private entries!: CFBDirectoryEntry[];
  private miniStream!: Uint8Array;

  /**
   * Create a new CFB reader
   * @param data Raw file data
   */
  constructor(data: Uint8Array | ArrayBuffer | Buffer) {
    if (data instanceof ArrayBuffer) {
      this.data = new Uint8Array(data);
    } else if (Buffer.isBuffer(data)) {
      this.data = new Uint8Array(data);
    } else {
      this.data = data;
    }
    this.view = new DataView(this.data.buffer, this.data.byteOffset, this.data.byteLength);
  }

  /**
   * Parse the CFB file
   * @returns Parsed CFB structure
   */
  parse(): CFBFile {
    this.validateSignature();
    this.parseHeader();
    this.buildFAT();
    this.parseDirectoryEntries();
    this.buildMiniFAT();
    this.buildMiniStream();

    const rootEntry = this.entries.find((e) => e.objectType === OBJECT_TYPES.ROOT_STORAGE);
    if (!rootEntry) {
      throw new CFBParseError('No root storage entry found');
    }

    return {
      header: this.header,
      entries: this.entries,
      rootEntry,
      fat: this.fat,
      miniFat: this.miniFat,
      miniStream: this.miniStream,
      data: this.data,
    };
  }

  /**
   * Validate the CFB file signature
   */
  private validateSignature(): void {
    if (this.data.length < CFB_HEADER_SIZE) {
      throw new CFBParseError(`File too small: ${this.data.length} bytes (minimum ${CFB_HEADER_SIZE})`);
    }

    for (let i = 0; i < CFB_SIGNATURE.length; i++) {
      if (this.data[i] !== CFB_SIGNATURE[i]) {
        const got = Array.from(this.data.slice(0, 8))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ');
        const expected = Array.from(CFB_SIGNATURE)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ');
        throw new CFBParseError(`Invalid CFB signature. Got: ${got}, Expected: ${expected}`);
      }
    }
  }

  /**
   * Parse the CFB header
   */
  private parseHeader(): void {
    const minorVersion = this.view.getUint16(HEADER_OFFSETS.MINOR_VERSION, true);
    const majorVersion = this.view.getUint16(HEADER_OFFSETS.MAJOR_VERSION, true);

    // Validate version
    if (majorVersion !== 3 && majorVersion !== 4) {
      throw new CFBParseError(`Unsupported CFB version: ${majorVersion}.${minorVersion}`);
    }

    // Validate byte order (must be little-endian)
    const byteOrder = this.view.getUint16(HEADER_OFFSETS.BYTE_ORDER, true);
    if (byteOrder !== 0xfffe) {
      throw new CFBParseError(`Invalid byte order: 0x${byteOrder.toString(16)} (expected 0xFFFE)`);
    }

    // Get sector size
    const sectorSizePower = this.view.getUint16(HEADER_OFFSETS.SECTOR_SIZE_POWER, true);
    const sectorSize = 1 << sectorSizePower;

    // Validate sector size matches version
    if (majorVersion === 3 && sectorSize !== SECTOR_SIZE_V3) {
      throw new CFBParseError(`Invalid sector size for v3: ${sectorSize} (expected ${SECTOR_SIZE_V3})`);
    }
    if (majorVersion === 4 && sectorSize !== SECTOR_SIZE_V4) {
      throw new CFBParseError(`Invalid sector size for v4: ${sectorSize} (expected ${SECTOR_SIZE_V4})`);
    }

    // Get mini sector size
    const miniSectorSizePower = this.view.getUint16(HEADER_OFFSETS.MINI_SECTOR_SIZE_POWER, true);
    const miniSectorSize = 1 << miniSectorSizePower;
    if (miniSectorSize !== MINI_SECTOR_SIZE) {
      throw new CFBParseError(`Invalid mini sector size: ${miniSectorSize} (expected ${MINI_SECTOR_SIZE})`);
    }

    // Parse DIFAT entries from header (109 entries max)
    const difat: number[] = [];
    for (let i = 0; i < 109; i++) {
      const entry = this.view.getUint32(HEADER_OFFSETS.DIFAT_ARRAY + i * 4, true);
      if (entry !== SECTOR_VALUES.FREE_SECT) {
        difat.push(entry);
      }
    }

    this.header = {
      signature: new Uint8Array(this.data.slice(0, 8)),
      minorVersion,
      majorVersion,
      byteOrder,
      sectorSize,
      miniSectorSize,
      totalFatSectors: this.view.getUint32(HEADER_OFFSETS.TOTAL_FAT_SECTORS, true),
      firstDirectorySector: this.view.getUint32(HEADER_OFFSETS.FIRST_DIRECTORY_SECTOR, true),
      firstMiniFatSector: this.view.getUint32(HEADER_OFFSETS.FIRST_MINI_FAT_SECTOR, true),
      totalMiniFatSectors: this.view.getUint32(HEADER_OFFSETS.TOTAL_MINI_FAT_SECTORS, true),
      firstDifatSector: this.view.getUint32(HEADER_OFFSETS.FIRST_DIFAT_SECTOR, true),
      totalDifatSectors: this.view.getUint32(HEADER_OFFSETS.TOTAL_DIFAT_SECTORS, true),
      difat,
    };
  }

  /**
   * Build the complete FAT (File Allocation Table)
   */
  private buildFAT(): void {
    const { sectorSize, totalFatSectors, difat, firstDifatSector, totalDifatSectors } = this.header;
    const entriesPerSector = sectorSize / 4;

    // Collect all FAT sector numbers
    const fatSectors: number[] = [...difat.slice(0, totalFatSectors)];

    // If there are more FAT sectors than fit in header, read DIFAT chain
    if (totalDifatSectors > 0 && firstDifatSector !== SECTOR_VALUES.END_OF_CHAIN) {
      let difatSector = firstDifatSector;
      let difatCount = 0;

      while (difatSector !== SECTOR_VALUES.END_OF_CHAIN && difatCount < totalDifatSectors) {
        const offset = this.sectorOffset(difatSector);

        // Each DIFAT sector contains (entriesPerSector - 1) FAT sector numbers
        // The last entry is the next DIFAT sector
        for (let i = 0; i < entriesPerSector - 1; i++) {
          const entry = this.view.getUint32(offset + i * 4, true);
          if (entry !== SECTOR_VALUES.FREE_SECT && fatSectors.length < totalFatSectors) {
            fatSectors.push(entry);
          }
        }

        // Get next DIFAT sector
        difatSector = this.view.getUint32(offset + (entriesPerSector - 1) * 4, true);
        difatCount++;
      }
    }

    // Build FAT from all FAT sectors
    const fatEntries: number[] = [];
    for (const sector of fatSectors) {
      const offset = this.sectorOffset(sector);
      for (let i = 0; i < entriesPerSector; i++) {
        fatEntries.push(this.view.getUint32(offset + i * 4, true));
      }
    }

    this.fat = new Uint32Array(fatEntries);
  }

  /**
   * Parse all directory entries
   */
  private parseDirectoryEntries(): void {
    const { firstDirectorySector, sectorSize } = this.header;
    const entriesPerSector = sectorSize / DIRECTORY_ENTRY_SIZE;

    this.entries = [];
    let entryIndex = 0;

    // Follow the directory chain
    const directorySectors = this.followChain(firstDirectorySector);

    for (const sector of directorySectors) {
      const sectorOffset = this.sectorOffset(sector);

      for (let i = 0; i < entriesPerSector; i++) {
        const entryOffset = sectorOffset + i * DIRECTORY_ENTRY_SIZE;
        const entry = this.parseDirectoryEntry(entryOffset, entryIndex);

        if (entry.objectType !== OBJECT_TYPES.UNKNOWN) {
          this.entries.push(entry);
        }
        entryIndex++;
      }
    }
  }

  /**
   * Parse a single directory entry
   */
  private parseDirectoryEntry(offset: number, index: number): CFBDirectoryEntry {
    // Read name (UTF-16LE, up to 64 bytes)
    const nameLength = this.view.getUint16(offset + DIR_ENTRY_OFFSETS.NAME_LENGTH, true);
    const nameBytes = this.data.slice(offset + DIR_ENTRY_OFFSETS.NAME, offset + DIR_ENTRY_OFFSETS.NAME + nameLength);
    const name = this.decodeUTF16LE(nameBytes).replace(/\0+$/, '');

    const objectType = this.data[offset + DIR_ENTRY_OFFSETS.OBJECT_TYPE] ?? 0;
    const colorFlag = this.data[offset + DIR_ENTRY_OFFSETS.COLOR_FLAG] ?? 0;
    const leftSibling = this.view.getUint32(offset + DIR_ENTRY_OFFSETS.LEFT_SIBLING, true);
    const rightSibling = this.view.getUint32(offset + DIR_ENTRY_OFFSETS.RIGHT_SIBLING, true);
    const child = this.view.getUint32(offset + DIR_ENTRY_OFFSETS.CHILD, true);

    // Read CLSID (16 bytes)
    const clsidBytes = this.data.slice(offset + DIR_ENTRY_OFFSETS.CLSID, offset + DIR_ENTRY_OFFSETS.CLSID + 16);
    const clsid = Array.from(clsidBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const stateBits = this.view.getUint32(offset + DIR_ENTRY_OFFSETS.STATE_BITS, true);

    // Read timestamps (FILETIME format)
    const creationTime = this.parseFiletime(offset + DIR_ENTRY_OFFSETS.CREATION_TIME);
    const modificationTime = this.parseFiletime(offset + DIR_ENTRY_OFFSETS.MODIFICATION_TIME);

    const startingSector = this.view.getUint32(offset + DIR_ENTRY_OFFSETS.STARTING_SECTOR, true);

    // Stream size - for v3, only low 4 bytes are valid
    let streamSize: number;
    if (this.header.majorVersion === 3) {
      streamSize = this.view.getUint32(offset + DIR_ENTRY_OFFSETS.STREAM_SIZE, true);
    } else {
      // v4 uses full 8 bytes, but we can only handle up to Number.MAX_SAFE_INTEGER
      const low = this.view.getUint32(offset + DIR_ENTRY_OFFSETS.STREAM_SIZE, true);
      const high = this.view.getUint32(offset + DIR_ENTRY_OFFSETS.STREAM_SIZE + 4, true);
      streamSize = low + high * 0x100000000;
    }

    return {
      name,
      objectType,
      colorFlag,
      leftSibling,
      rightSibling,
      child,
      clsid,
      stateBits,
      creationTime,
      modificationTime,
      startingSector,
      streamSize,
      index,
    };
  }

  /**
   * Build the mini FAT
   */
  private buildMiniFAT(): void {
    const { firstMiniFatSector, totalMiniFatSectors, sectorSize } = this.header;

    if (totalMiniFatSectors === 0 || firstMiniFatSector === SECTOR_VALUES.END_OF_CHAIN) {
      this.miniFat = new Uint32Array(0);
      return;
    }

    const entriesPerSector = sectorSize / 4;
    const miniFatEntries: number[] = [];

    const miniFatSectors = this.followChain(firstMiniFatSector);
    for (const sector of miniFatSectors) {
      const offset = this.sectorOffset(sector);
      for (let i = 0; i < entriesPerSector; i++) {
        miniFatEntries.push(this.view.getUint32(offset + i * 4, true));
      }
    }

    this.miniFat = new Uint32Array(miniFatEntries);
  }

  /**
   * Build the mini stream from root entry
   */
  private buildMiniStream(): void {
    const rootEntry = this.entries.find((e) => e.objectType === OBJECT_TYPES.ROOT_STORAGE);
    if (!rootEntry || rootEntry.streamSize === 0) {
      this.miniStream = new Uint8Array(0);
      return;
    }

    // The mini stream is stored in the root entry's stream data
    this.miniStream = this.readStreamData(rootEntry.startingSector, rootEntry.streamSize, false);
  }

  /**
   * Read a stream's data
   * @param startSector Starting sector
   * @param size Stream size
   * @param useMini Whether to use mini FAT/stream
   */
  private readStreamData(startSector: number, size: number, useMini: boolean): Uint8Array {
    if (size === 0) {
      return new Uint8Array(0);
    }

    const result = new Uint8Array(size);
    let offset = 0;

    if (useMini) {
      // Use mini stream and mini FAT
      const sectors = this.followMiniChain(startSector);
      for (const sector of sectors) {
        const miniOffset = sector * MINI_SECTOR_SIZE;
        const bytesToCopy = Math.min(MINI_SECTOR_SIZE, size - offset);
        result.set(this.miniStream.slice(miniOffset, miniOffset + bytesToCopy), offset);
        offset += bytesToCopy;
        if (offset >= size) break;
      }
    } else {
      // Use regular FAT
      const sectors = this.followChain(startSector);
      for (const sector of sectors) {
        const sectorOffset = this.sectorOffset(sector);
        const bytesToCopy = Math.min(this.header.sectorSize, size - offset);
        result.set(this.data.slice(sectorOffset, sectorOffset + bytesToCopy), offset);
        offset += bytesToCopy;
        if (offset >= size) break;
      }
    }

    return result;
  }

  /**
   * Follow a FAT chain starting from a sector
   */
  private followChain(startSector: number): number[] {
    const chain: number[] = [];
    let sector = startSector;
    const maxSectors = this.fat.length;
    let iterations = 0;

    while (
      sector !== SECTOR_VALUES.END_OF_CHAIN &&
      sector !== SECTOR_VALUES.FREE_SECT &&
      sector < maxSectors &&
      iterations < maxSectors
    ) {
      chain.push(sector);
      const nextSector = this.fat[sector];
      sector = nextSector !== undefined ? nextSector : SECTOR_VALUES.END_OF_CHAIN;
      iterations++;
    }

    return chain;
  }

  /**
   * Follow a mini FAT chain
   */
  private followMiniChain(startSector: number): number[] {
    const chain: number[] = [];
    let sector = startSector;
    const maxSectors = this.miniFat.length;
    let iterations = 0;

    while (
      sector !== SECTOR_VALUES.END_OF_CHAIN &&
      sector !== SECTOR_VALUES.FREE_SECT &&
      sector < maxSectors &&
      iterations < maxSectors
    ) {
      chain.push(sector);
      const nextSector = this.miniFat[sector];
      sector = nextSector !== undefined ? nextSector : SECTOR_VALUES.END_OF_CHAIN;
      iterations++;
    }

    return chain;
  }

  /**
   * Calculate byte offset for a sector number
   */
  private sectorOffset(sector: number): number {
    // Sectors are 0-indexed, but header occupies first sector worth of bytes
    return CFB_HEADER_SIZE + sector * this.header.sectorSize;
  }

  /**
   * Decode UTF-16LE bytes to string
   */
  private decodeUTF16LE(bytes: Uint8Array): string {
    const chars: string[] = [];
    for (let i = 0; i < bytes.length - 1; i += 2) {
      const lowByte = bytes[i];
      const highByte = bytes[i + 1];
      if (lowByte === undefined || highByte === undefined) break;
      const code = lowByte | (highByte << 8);
      if (code === 0) break;
      chars.push(String.fromCharCode(code));
    }
    return chars.join('');
  }

  /**
   * Parse FILETIME to Date
   */
  private parseFiletime(offset: number): Date | null {
    const low = this.view.getUint32(offset, true);
    const high = this.view.getUint32(offset + 4, true);

    if (low === 0 && high === 0) {
      return null;
    }

    // FILETIME is 100-nanosecond intervals since January 1, 1601
    // JavaScript Date is milliseconds since January 1, 1970
    const FILETIME_TO_UNIX_EPOCH = 116444736000000000n;
    const filetime = (BigInt(high) << 32n) | BigInt(low);
    const unixTime = (filetime - FILETIME_TO_UNIX_EPOCH) / 10000n;

    return new Date(Number(unixTime));
  }

  /**
   * Get a stream by name
   * @param name Stream name
   * @returns Stream data or null if not found
   */
  getStream(name: string): CFBStream | null {
    const entry = this.entries.find((e) => e.name === name && e.objectType === OBJECT_TYPES.STREAM);

    if (!entry) {
      return null;
    }

    const useMini = entry.streamSize < MINI_STREAM_CUTOFF_SIZE;
    const data = this.readStreamData(entry.startingSector, entry.streamSize, useMini);

    return {
      name: entry.name,
      data,
      size: entry.streamSize,
    };
  }

  /**
   * Get all stream names
   */
  getStreamNames(): string[] {
    return this.entries.filter((e) => e.objectType === OBJECT_TYPES.STREAM).map((e) => e.name);
  }

  /**
   * Get all storage (folder) names
   */
  getStorageNames(): string[] {
    return this.entries
      .filter((e) => e.objectType === OBJECT_TYPES.STORAGE || e.objectType === OBJECT_TYPES.ROOT_STORAGE)
      .map((e) => e.name);
  }

  /**
   * Check if a stream exists
   */
  hasStream(name: string): boolean {
    return this.entries.some((e) => e.name === name && e.objectType === OBJECT_TYPES.STREAM);
  }

  /**
   * Static method to parse a buffer
   */
  static parse(data: Uint8Array | ArrayBuffer | Buffer): CFBFile {
    const reader = new CFBReader(data);
    return reader.parse();
  }

  /**
   * Static method to check if data is a valid CFB file
   */
  static isValidCFB(data: Uint8Array | ArrayBuffer | Buffer): boolean {
    const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;

    if (bytes.length < CFB_SIGNATURE.length) {
      return false;
    }

    for (let i = 0; i < CFB_SIGNATURE.length; i++) {
      if (bytes[i] !== CFB_SIGNATURE[i]) {
        return false;
      }
    }

    return true;
  }
}
