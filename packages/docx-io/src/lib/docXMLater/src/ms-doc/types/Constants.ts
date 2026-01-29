/**
 * Constants for MS-DOC Binary File Format parsing
 *
 * References:
 * - [MS-CFB]: Compound File Binary File Format
 * - [MS-DOC]: Word (.doc) Binary File Format
 */

// =============================================================================
// CFB (Compound File Binary) Constants
// =============================================================================

/**
 * CFB file signature (magic bytes)
 * D0 CF 11 E0 A1 B1 1A E1
 */
export const CFB_SIGNATURE = new Uint8Array([
  0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
]);

/**
 * CFB header size in bytes
 */
export const CFB_HEADER_SIZE = 512;

/**
 * Sector sizes by version
 */
export const SECTOR_SIZE_V3 = 512; // Version 3 (minor version 0x003E)
export const SECTOR_SIZE_V4 = 4096; // Version 4 (minor version 0x003E, major 0x0004)

/**
 * Mini stream cutoff size - streams smaller than this use mini FAT
 */
export const MINI_STREAM_CUTOFF_SIZE = 4096;

/**
 * Mini sector size (always 64 bytes)
 */
export const MINI_SECTOR_SIZE = 64;

/**
 * Directory entry size (always 128 bytes)
 */
export const DIRECTORY_ENTRY_SIZE = 128;

/**
 * Special sector values
 */
export const SECTOR_VALUES = {
  /** Free sector */
  FREE_SECT: 0xff_ff_ff_ff,
  /** End of chain */
  END_OF_CHAIN: 0xff_ff_ff_fe,
  /** FAT sector */
  FAT_SECT: 0xff_ff_ff_fd,
  /** DIFAT sector */
  DIFAT_SECT: 0xff_ff_ff_fc,
  /** Maximum regular sector */
  MAX_REG_SECT: 0xff_ff_ff_fa,
} as const;

/**
 * Header field offsets
 */
export const HEADER_OFFSETS = {
  /** File signature (8 bytes) */
  SIGNATURE: 0,
  /** Minor version (2 bytes) */
  MINOR_VERSION: 0x18,
  /** Major version (2 bytes) */
  MAJOR_VERSION: 0x1a,
  /** Byte order (2 bytes) - should be 0xFFFE for little-endian */
  BYTE_ORDER: 0x1c,
  /** Sector size power (2 bytes) - 2^n = sector size */
  SECTOR_SIZE_POWER: 0x1e,
  /** Mini sector size power (2 bytes) - 2^n = mini sector size */
  MINI_SECTOR_SIZE_POWER: 0x20,
  /** Total sectors in FAT (4 bytes, v3) */
  TOTAL_FAT_SECTORS: 0x2c,
  /** First directory sector location (4 bytes) */
  FIRST_DIRECTORY_SECTOR: 0x30,
  /** First mini FAT sector location (4 bytes) */
  FIRST_MINI_FAT_SECTOR: 0x3c,
  /** Total mini FAT sectors (4 bytes) */
  TOTAL_MINI_FAT_SECTORS: 0x40,
  /** First DIFAT sector location (4 bytes) */
  FIRST_DIFAT_SECTOR: 0x44,
  /** Total DIFAT sectors (4 bytes) */
  TOTAL_DIFAT_SECTORS: 0x48,
  /** DIFAT array (436 bytes = 109 entries * 4 bytes) */
  DIFAT_ARRAY: 0x4c,
} as const;

/**
 * Directory entry object types
 */
export const OBJECT_TYPES = {
  /** Unknown or unallocated */
  UNKNOWN: 0x00,
  /** Storage object (like a folder) */
  STORAGE: 0x01,
  /** Stream object (like a file) */
  STREAM: 0x02,
  /** Root storage object */
  ROOT_STORAGE: 0x05,
} as const;

/**
 * Directory entry field offsets (within 128-byte entry)
 */
export const DIR_ENTRY_OFFSETS = {
  /** Entry name (64 bytes, UTF-16LE) */
  NAME: 0x00,
  /** Entry name length in bytes (2 bytes) */
  NAME_LENGTH: 0x40,
  /** Object type (1 byte) */
  OBJECT_TYPE: 0x42,
  /** Color flag for red-black tree (1 byte) */
  COLOR_FLAG: 0x43,
  /** Left sibling stream ID (4 bytes) */
  LEFT_SIBLING: 0x44,
  /** Right sibling stream ID (4 bytes) */
  RIGHT_SIBLING: 0x48,
  /** Child stream ID (4 bytes) */
  CHILD: 0x4c,
  /** CLSID (16 bytes) */
  CLSID: 0x50,
  /** State bits (4 bytes) */
  STATE_BITS: 0x60,
  /** Creation time (8 bytes, FILETIME) */
  CREATION_TIME: 0x64,
  /** Modification time (8 bytes, FILETIME) */
  MODIFICATION_TIME: 0x6c,
  /** Starting sector location (4 bytes) */
  STARTING_SECTOR: 0x74,
  /** Stream size (8 bytes for v4, low 4 bytes for v3) */
  STREAM_SIZE: 0x78,
} as const;

/**
 * Nostream value - indicates no sibling/child
 */
export const NOSTREAM = 0xff_ff_ff_ff;

// =============================================================================
// MS-DOC Specific Constants
// =============================================================================

/**
 * Known stream names in Word documents
 */
export const DOC_STREAM_NAMES = {
  /** Main document stream */
  WORD_DOCUMENT: 'WordDocument',
  /** Table stream (depends on bit in FIB) */
  TABLE_0: '0Table',
  TABLE_1: '1Table',
  /** Data stream for embedded objects */
  DATA: 'Data',
  /** Summary information */
  SUMMARY_INFO: '\x05SummaryInformation',
  /** Document summary information */
  DOC_SUMMARY_INFO: '\x05DocumentSummaryInformation',
  /** Object pool storage */
  OBJECT_POOL: 'ObjectPool',
  /** Macros storage */
  MACROS: 'Macros',
} as const;

/**
 * FIB (File Information Block) constants
 */
export const FIB_CONSTANTS = {
  /** FIB signature - should be 0xA5EC */
  SIGNATURE: 0xa5_ec,
  /** Minimum FIB size */
  MIN_SIZE: 68,
  /** FibBase size */
  FIB_BASE_SIZE: 32,
  /** Offset to nFib (version) in FibBase */
  NFIB_OFFSET: 2,
  /** Offset to flags in FibBase */
  FLAGS_OFFSET: 10,
  /** Bit 9 of flags indicates which table stream */
  TABLE_STREAM_BIT: 0x02_00,
} as const;

/**
 * FIB versions
 */
export const FIB_VERSIONS = {
  /** Word 97 */
  WORD_97: 0x00_c1,
  /** Word 2000 */
  WORD_2000: 0x00_d9,
  /** Word 2002 */
  WORD_2002: 0x01_01,
  /** Word 2003 */
  WORD_2003: 0x01_0c,
  /** Word 2007 (also uses .doc in compatibility mode) */
  WORD_2007: 0x01_12,
} as const;

/**
 * Field instruction special characters
 */
export const FIELD_CHARS = {
  /** Field begin character */
  BEGIN: 0x13,
  /** Field separator character */
  SEPARATOR: 0x14,
  /** Field end character */
  END: 0x15,
} as const;

/**
 * Special text characters
 */
export const SPECIAL_CHARS = {
  /** Cell mark (end of table cell) */
  CELL: 0x07,
  /** Row mark (end of table row) */
  ROW: 0x07,
  /** Paragraph mark */
  PARAGRAPH: 0x0d,
  /** Hard line break */
  LINE_BREAK: 0x0b,
  /** Page break */
  PAGE_BREAK: 0x0c,
  /** Column break */
  COLUMN_BREAK: 0x0e,
  /** Section break */
  SECTION_BREAK: 0x0c,
  /** Tab */
  TAB: 0x09,
  /** Non-breaking space */
  NON_BREAKING_SPACE: 0xa0,
  /** Non-breaking hyphen */
  NON_BREAKING_HYPHEN: 0x1e,
  /** Optional hyphen */
  OPTIONAL_HYPHEN: 0x1f,
} as const;

// =============================================================================
// Unit Conversion Constants
// =============================================================================

/**
 * Twips per point (1 point = 20 twips)
 */
export const TWIPS_PER_POINT = 20;

/**
 * Twips per inch (1 inch = 1440 twips)
 */
export const TWIPS_PER_INCH = 1440;

/**
 * EMUs per inch (English Metric Units)
 */
export const EMUS_PER_INCH = 914_400;

/**
 * EMUs per point
 */
export const EMUS_PER_POINT = 12_700;
