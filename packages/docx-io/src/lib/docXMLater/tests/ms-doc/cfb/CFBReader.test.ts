/**
 * CFBReader tests
 *
 * Tests for Compound File Binary format parsing
 */

import { CFBReader, CFBParseError } from '../../../src/ms-doc/cfb/CFBReader';
import {
  CFB_SIGNATURE,
  OBJECT_TYPES,
} from '../../../src/ms-doc/types/Constants';
import * as fs from 'fs';
import * as path from 'path';

describe('CFBReader', () => {
  describe('isValidCFB', () => {
    it('should return true for valid CFB signature', () => {
      const data = new Uint8Array(512);
      // Set CFB signature
      data.set([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], 0);

      expect(CFBReader.isValidCFB(data)).toBe(true);
    });

    it('should return false for invalid signature', () => {
      const data = new Uint8Array(512);
      // Set wrong signature
      data.set([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00], 0);

      expect(CFBReader.isValidCFB(data)).toBe(false);
    });

    it('should return false for data too short', () => {
      const data = new Uint8Array(4);
      expect(CFBReader.isValidCFB(data)).toBe(false);
    });

    it('should work with ArrayBuffer input', () => {
      const buffer = new ArrayBuffer(512);
      const view = new Uint8Array(buffer);
      view.set([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], 0);

      expect(CFBReader.isValidCFB(buffer)).toBe(true);
    });

    it('should work with Buffer input', () => {
      const buffer = Buffer.alloc(512);
      buffer.set([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], 0);

      expect(CFBReader.isValidCFB(buffer)).toBe(true);
    });
  });

  describe('parse', () => {
    it('should throw CFBParseError for file too small', () => {
      const data = new Uint8Array(256);
      data.set([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], 0);

      expect(() => CFBReader.parse(data)).toThrow(CFBParseError);
      expect(() => CFBReader.parse(data)).toThrow(/too small/);
    });

    it('should throw CFBParseError for invalid signature', () => {
      const data = new Uint8Array(512);
      // Wrong signature
      data.set([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], 0);

      expect(() => CFBReader.parse(data)).toThrow(CFBParseError);
      expect(() => CFBReader.parse(data)).toThrow(/Invalid CFB signature/);
    });

    it('should throw CFBParseError for unsupported version', () => {
      const data = createMinimalCFBHeader({ majorVersion: 5 });

      expect(() => CFBReader.parse(data)).toThrow(CFBParseError);
      expect(() => CFBReader.parse(data)).toThrow(/Unsupported CFB version/);
    });

    it('should throw CFBParseError for wrong byte order', () => {
      const data = createMinimalCFBHeader({ byteOrder: 0xfe_ff });

      expect(() => CFBReader.parse(data)).toThrow(CFBParseError);
      expect(() => CFBReader.parse(data)).toThrow(/Invalid byte order/);
    });
  });

  describe('header parsing', () => {
    it('should correctly parse version 3 header', () => {
      // Create a minimal valid v3 CFB file
      const data = createMinimalCFBFile();
      const cfb = CFBReader.parse(data);

      expect(cfb.header.majorVersion).toBe(3);
      expect(cfb.header.minorVersion).toBe(0x00_3e);
      expect(cfb.header.sectorSize).toBe(512);
      expect(cfb.header.miniSectorSize).toBe(64);
      expect(cfb.header.byteOrder).toBe(0xff_fe);
    });

    it('should correctly parse signature', () => {
      const data = createMinimalCFBFile();
      const cfb = CFBReader.parse(data);

      expect(Array.from(cfb.header.signature)).toEqual(
        Array.from(CFB_SIGNATURE)
      );
    });
  });

  describe('directory entries', () => {
    it('should find root storage entry', () => {
      const data = createMinimalCFBFile();
      const cfb = CFBReader.parse(data);

      expect(cfb.rootEntry).toBeDefined();
      expect(cfb.rootEntry.objectType).toBe(OBJECT_TYPES.ROOT_STORAGE);
      expect(cfb.rootEntry.name).toBe('Root Entry');
    });

    it('should parse all directory entries', () => {
      const data = createMinimalCFBFile();
      const cfb = CFBReader.parse(data);

      expect(cfb.entries.length).toBeGreaterThan(0);
      // Root entry should be in entries
      expect(
        cfb.entries.some((e) => e.objectType === OBJECT_TYPES.ROOT_STORAGE)
      ).toBe(true);
    });
  });

  describe('stream access', () => {
    it('should return null for non-existent stream', () => {
      const data = createMinimalCFBFile();
      const reader = new CFBReader(data);
      reader.parse();

      const stream = reader.getStream('NonExistent');
      expect(stream).toBeNull();
    });

    it('should report correct stream names', () => {
      const data = createMinimalCFBFile();
      const reader = new CFBReader(data);
      reader.parse();

      const names = reader.getStreamNames();
      expect(Array.isArray(names)).toBe(true);
    });

    it('should report correct storage names', () => {
      const data = createMinimalCFBFile();
      const reader = new CFBReader(data);
      reader.parse();

      const names = reader.getStorageNames();
      expect(names).toContain('Root Entry');
    });

    it('should correctly check stream existence', () => {
      const data = createMinimalCFBFile();
      const reader = new CFBReader(data);
      reader.parse();

      expect(reader.hasStream('NonExistent')).toBe(false);
    });
  });

  describe('FAT chain following', () => {
    it('should correctly build FAT', () => {
      const data = createMinimalCFBFile();
      const cfb = CFBReader.parse(data);

      expect(cfb.fat).toBeInstanceOf(Uint32Array);
      expect(cfb.fat.length).toBeGreaterThan(0);
    });
  });

  describe('integration with real .doc files', () => {
    // Skip if no test files available
    const testFilePath = path.join(
      __dirname,
      '../../../../fixtures/sample.doc'
    );

    it.skip('should parse a real .doc file', async () => {
      // This test requires a real .doc file in fixtures
      if (!fs.existsSync(testFilePath)) {
        console.log('Skipping: No sample.doc file found');
        return;
      }

      const data = fs.readFileSync(testFilePath);
      const cfb = CFBReader.parse(data);

      expect(cfb.header.majorVersion).toBeGreaterThanOrEqual(3);
      expect(cfb.rootEntry).toBeDefined();

      // Check for expected Word document streams
      const streamNames = cfb.entries
        .filter((e) => e.objectType === OBJECT_TYPES.STREAM)
        .map((e) => e.name);

      // Word documents should have WordDocument stream
      expect(streamNames).toContain('WordDocument');

      // Should have either 0Table or 1Table
      const hasTableStream =
        streamNames.includes('0Table') || streamNames.includes('1Table');
      expect(hasTableStream).toBe(true);
    });
  });
});

/**
 * Helper function to create a minimal CFB header
 */
function createMinimalCFBHeader(
  options: { majorVersion?: number; byteOrder?: number } = {}
): Uint8Array {
  const { majorVersion = 3, byteOrder = 0xff_fe } = options;

  const data = new Uint8Array(512);

  // Signature
  data.set([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], 0);

  // Minor version (0x003E)
  data[0x18] = 0x3e;
  data[0x19] = 0x00;

  // Major version
  data[0x1a] = majorVersion;
  data[0x1b] = 0x00;

  // Byte order
  data[0x1c] = byteOrder & 0xff;
  data[0x1d] = (byteOrder >> 8) & 0xff;

  // Sector size power (9 = 512 bytes)
  data[0x1e] = 0x09;
  data[0x1f] = 0x00;

  // Mini sector size power (6 = 64 bytes)
  data[0x20] = 0x06;
  data[0x21] = 0x00;

  return data;
}

/**
 * Helper function to create a minimal valid CFB file with root entry
 */
function createMinimalCFBFile(): Uint8Array {
  // Minimum size: header (512) + FAT sector (512) + directory sector (512) = 1536
  const data = new Uint8Array(1536);

  // === Header (sector -1, offset 0) ===

  // Signature
  data.set([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], 0);

  // Minor version (0x003E)
  data[0x18] = 0x3e;
  data[0x19] = 0x00;

  // Major version (3)
  data[0x1a] = 0x03;
  data[0x1b] = 0x00;

  // Byte order (0xFFFE = little endian)
  data[0x1c] = 0xfe;
  data[0x1d] = 0xff;

  // Sector size power (9 = 512 bytes)
  data[0x1e] = 0x09;
  data[0x1f] = 0x00;

  // Mini sector size power (6 = 64 bytes)
  data[0x20] = 0x06;
  data[0x21] = 0x00;

  // Total FAT sectors (1)
  data[0x2c] = 0x01;

  // First directory sector (1)
  data[0x30] = 0x01;

  // First mini FAT sector (ENDOFCHAIN)
  data[0x3c] = 0xfe;
  data[0x3d] = 0xff;
  data[0x3e] = 0xff;
  data[0x3f] = 0xff;

  // Total mini FAT sectors (0)
  data[0x40] = 0x00;

  // First DIFAT sector (ENDOFCHAIN)
  data[0x44] = 0xfe;
  data[0x45] = 0xff;
  data[0x46] = 0xff;
  data[0x47] = 0xff;

  // Total DIFAT sectors (0)
  data[0x48] = 0x00;

  // DIFAT[0] = sector 0 (FAT sector)
  data[0x4c] = 0x00;

  // Fill rest of DIFAT with FREESECT
  for (let i = 1; i < 109; i++) {
    const offset = 0x4c + i * 4;
    data[offset] = 0xff;
    data[offset + 1] = 0xff;
    data[offset + 2] = 0xff;
    data[offset + 3] = 0xff;
  }

  // === FAT Sector (sector 0, offset 512) ===

  // FAT[0] = FATSECT (this sector is FAT)
  data[512] = 0xfd;
  data[513] = 0xff;
  data[514] = 0xff;
  data[515] = 0xff;

  // FAT[1] = ENDOFCHAIN (directory sector)
  data[516] = 0xfe;
  data[517] = 0xff;
  data[518] = 0xff;
  data[519] = 0xff;

  // Fill rest of FAT with FREESECT
  for (let i = 2; i < 128; i++) {
    const offset = 512 + i * 4;
    data[offset] = 0xff;
    data[offset + 1] = 0xff;
    data[offset + 2] = 0xff;
    data[offset + 3] = 0xff;
  }

  // === Directory Sector (sector 1, offset 1024) ===

  // Root Entry (entry 0, 128 bytes)
  const rootEntry = 1024;

  // Name: "Root Entry" in UTF-16LE
  const rootName = 'Root Entry';
  for (let i = 0; i < rootName.length; i++) {
    data[rootEntry + i * 2] = rootName.charCodeAt(i);
    data[rootEntry + i * 2 + 1] = 0;
  }

  // Name length in bytes (including null terminator)
  const nameLength = (rootName.length + 1) * 2;
  data[rootEntry + 0x40] = nameLength & 0xff;
  data[rootEntry + 0x41] = (nameLength >> 8) & 0xff;

  // Object type (0x05 = root storage)
  data[rootEntry + 0x42] = 0x05;

  // Color flag (0x01 = black)
  data[rootEntry + 0x43] = 0x01;

  // Left sibling (NOSTREAM)
  data[rootEntry + 0x44] = 0xff;
  data[rootEntry + 0x45] = 0xff;
  data[rootEntry + 0x46] = 0xff;
  data[rootEntry + 0x47] = 0xff;

  // Right sibling (NOSTREAM)
  data[rootEntry + 0x48] = 0xff;
  data[rootEntry + 0x49] = 0xff;
  data[rootEntry + 0x4a] = 0xff;
  data[rootEntry + 0x4b] = 0xff;

  // Child (NOSTREAM)
  data[rootEntry + 0x4c] = 0xff;
  data[rootEntry + 0x4d] = 0xff;
  data[rootEntry + 0x4e] = 0xff;
  data[rootEntry + 0x4f] = 0xff;

  // Starting sector (ENDOFCHAIN for empty root)
  data[rootEntry + 0x74] = 0xfe;
  data[rootEntry + 0x75] = 0xff;
  data[rootEntry + 0x76] = 0xff;
  data[rootEntry + 0x77] = 0xff;

  // Stream size (0 for empty root)
  data[rootEntry + 0x78] = 0x00;

  // Mark remaining directory entries as unused (object type = 0)
  for (let i = 1; i < 4; i++) {
    const entryOffset = rootEntry + i * 128;
    data[entryOffset + 0x42] = 0x00; // Object type = unknown/unallocated
  }

  return data;
}
