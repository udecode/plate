/**
 * Type definitions for MS-DOC Binary File Format parsing
 *
 * References:
 * - [MS-CFB]: Compound File Binary File Format
 * - [MS-DOC]: Word (.doc) Binary File Format
 */

// =============================================================================
// CFB (Compound File Binary) Types
// =============================================================================

/**
 * CFB file header structure
 */
export interface CFBHeader {
  /** File signature (should match CFB_SIGNATURE) */
  signature: Uint8Array;
  /** Minor version (typically 0x003E) */
  minorVersion: number;
  /** Major version (3 or 4) */
  majorVersion: number;
  /** Byte order (0xFFFE = little-endian) */
  byteOrder: number;
  /** Sector size in bytes (512 for v3, 4096 for v4) */
  sectorSize: number;
  /** Mini sector size (always 64) */
  miniSectorSize: number;
  /** Total number of FAT sectors */
  totalFatSectors: number;
  /** First directory sector location */
  firstDirectorySector: number;
  /** First mini FAT sector location */
  firstMiniFatSector: number;
  /** Total mini FAT sectors */
  totalMiniFatSectors: number;
  /** First DIFAT sector location */
  firstDifatSector: number;
  /** Total DIFAT sectors */
  totalDifatSectors: number;
  /** DIFAT entries in header (up to 109) */
  difat: number[];
}

/**
 * CFB directory entry
 */
export interface CFBDirectoryEntry {
  /** Entry name (UTF-16LE decoded) */
  name: string;
  /** Object type (storage, stream, root) */
  objectType: number;
  /** Color flag (red=0, black=1) */
  colorFlag: number;
  /** Left sibling stream ID */
  leftSibling: number;
  /** Right sibling stream ID */
  rightSibling: number;
  /** Child stream ID */
  child: number;
  /** CLSID (16 bytes as hex string) */
  clsid: string;
  /** State bits */
  stateBits: number;
  /** Creation time (as Date or null) */
  creationTime: Date | null;
  /** Modification time (as Date or null) */
  modificationTime: Date | null;
  /** Starting sector location */
  startingSector: number;
  /** Stream size in bytes */
  streamSize: number;
  /** Index in directory array */
  index: number;
}

/**
 * CFB parsed file structure
 */
export interface CFBFile {
  /** Parsed header */
  header: CFBHeader;
  /** All directory entries */
  entries: CFBDirectoryEntry[];
  /** Root entry */
  rootEntry: CFBDirectoryEntry;
  /** FAT (File Allocation Table) */
  fat: Uint32Array;
  /** Mini FAT (for small streams) */
  miniFat: Uint32Array;
  /** Mini stream data */
  miniStream: Uint8Array;
  /** Raw file data */
  data: Uint8Array;
}

/**
 * Stream extraction result
 */
export interface CFBStream {
  /** Stream name */
  name: string;
  /** Stream data */
  data: Uint8Array;
  /** Stream size */
  size: number;
}

// =============================================================================
// FIB (File Information Block) Types
// =============================================================================

/**
 * FIB base structure (first 32 bytes)
 */
export interface FibBase {
  /** Magic number (should be 0xA5EC) */
  wIdent: number;
  /** FIB version (nFib) */
  nFib: number;
  /** Product version written */
  lid: number;
  /** Auto-text entry that is being edited */
  pnNext: number;
  /** Flags (including table stream indicator) */
  flags: number;
  /** FIB version for back-compat */
  nFibBack: number;
  /** Whether to use 1Table (true) or 0Table (false) */
  fWhichTblStm: boolean;
}

/**
 * FibRgW97 structure (14 uint16 values = 28 bytes)
 */
export interface FibRgW97 {
  /** Reserved */
  reserved1: number;
  /** Reserved */
  reserved2: number;
  /** Reserved */
  reserved3: number;
  /** Reserved */
  reserved4: number;
  /** Reserved */
  reserved5: number;
  /** Reserved */
  reserved6: number;
  /** Reserved */
  reserved7: number;
  /** Reserved */
  reserved8: number;
  /** Reserved */
  reserved9: number;
  /** Reserved */
  reserved10: number;
  /** Reserved */
  reserved11: number;
  /** Reserved */
  reserved12: number;
  /** Reserved */
  reserved13: number;
  /** Language ID for auto-correct */
  lidFE: number;
}

/**
 * FibRgLw97 structure (22 uint32 values = 88 bytes)
 */
export interface FibRgLw97 {
  /** Count of bytes for main document text */
  cbMac: number;
  /** Reserved */
  reserved1: number;
  /** Reserved */
  reserved2: number;
  /** Last CP of main document text */
  ccpText: number;
  /** Last CP of footnote subdocument */
  ccpFtn: number;
  /** Last CP of header subdocument */
  ccpHdd: number;
  /** Reserved */
  reserved3: number;
  /** Last CP of annotation subdocument */
  ccpAtn: number;
  /** Last CP of endnote subdocument */
  ccpEdn: number;
  /** Last CP of textbox subdocument */
  ccpTxbx: number;
  /** Last CP of header textbox subdocument */
  ccpHdrTxbx: number;
  /** Reserved */
  reserved4: number;
  /** Reserved */
  reserved5: number;
  /** Reserved */
  reserved6: number;
  /** Reserved */
  reserved7: number;
  /** Reserved */
  reserved8: number;
  /** Reserved */
  reserved9: number;
  /** Reserved */
  reserved10: number;
  /** Reserved */
  reserved11: number;
  /** Reserved */
  reserved12: number;
  /** Reserved */
  reserved13: number;
  /** Reserved */
  reserved14: number;
}

/**
 * FibRgFcLcb structure (fc = offset, lcb = length pairs)
 * This contains 93+ entries depending on nFib version
 */
export interface FibRgFcLcb {
  /** Offset to STSH (style sheet) in table stream */
  fcStshf: number;
  /** Length of STSH */
  lcbStshf: number;

  /** Offset to Clx (piece table) in table stream */
  fcClx: number;
  /** Length of Clx */
  lcbClx: number;

  /** Offset to PlcBteChpx (character formatting bin table) */
  fcPlcfBteChpx: number;
  /** Length of PlcBteChpx */
  lcbPlcfBteChpx: number;

  /** Offset to PlcBtePapx (paragraph formatting bin table) */
  fcPlcfBtePapx: number;
  /** Length of PlcBtePapx */
  lcbPlcfBtePapx: number;

  /** Offset to PlcfSed (section descriptors) */
  fcPlcfSed: number;
  /** Length of PlcfSed */
  lcbPlcfSed: number;

  /** Offset to PlcfLst (list data) */
  fcPlcfLst: number;
  /** Length of PlcfLst */
  lcbPlcfLst: number;

  /** Offset to PlfLfo (list format override) */
  fcPlfLfo: number;
  /** Length of PlfLfo */
  lcbPlfLfo: number;

  /** Offset to SttbfBkmk (bookmark names) */
  fcSttbfBkmk: number;
  /** Length of SttbfBkmk */
  lcbSttbfBkmk: number;

  /** Offset to PlcfBkf (bookmark first) */
  fcPlcfBkf: number;
  /** Length of PlcfBkf */
  lcbPlcfBkf: number;

  /** Offset to PlcfBkl (bookmark last) */
  fcPlcfBkl: number;
  /** Length of PlcfBkl */
  lcbPlcfBkl: number;

  /** Offset to PlcfFldMom (field main doc) */
  fcPlcfFldMom: number;
  /** Length of PlcfFldMom */
  lcbPlcfFldMom: number;

  /** Offset to PlcfFldHdr (field header) */
  fcPlcfFldHdr: number;
  /** Length of PlcfFldHdr */
  lcbPlcfFldHdr: number;

  /** Offset to PlcfFldFtn (field footnotes) */
  fcPlcfFldFtn: number;
  /** Length of PlcfFldFtn */
  lcbPlcfFldFtn: number;

  /** Offset to PlcfFldAtn (field annotations) */
  fcPlcfFldAtn: number;
  /** Length of PlcfFldAtn */
  lcbPlcfFldAtn: number;

  /** Offset to SttbfFfn (font table) */
  fcSttbfFfn: number;
  /** Length of SttbfFfn */
  lcbSttbfFfn: number;

  /** Offset to Dop (document properties) */
  fcDop: number;
  /** Length of Dop */
  lcbDop: number;

  /** Offset to PlcfHdd (header positions) */
  fcPlcfHdd: number;
  /** Length of PlcfHdd */
  lcbPlcfHdd: number;

  /** Additional fields stored as a map for extensibility */
  [key: string]: number;
}

/**
 * Complete FIB structure
 */
export interface FIB {
  /** Base FIB information */
  base: FibBase;
  /** Word values section */
  rgW97: FibRgW97;
  /** Long word values section */
  rgLw97: FibRgLw97;
  /** Offset/length pairs */
  rgFcLcb: FibRgFcLcb;
  /** Which table stream to use */
  tableStreamName: '0Table' | '1Table';
}

// =============================================================================
// Text and Piece Table Types
// =============================================================================

/**
 * Piece descriptor (Pcd)
 */
export interface PieceDescriptor {
  /** File character position (includes compression flag) */
  fc: number;
  /** Whether text is compressed (ANSI) or Unicode */
  fCompressed: boolean;
  /** Property modifier index */
  prm: number;
  /** Starting character position */
  cpStart: number;
  /** Ending character position */
  cpEnd: number;
}

/**
 * Piece table (PlcPcd)
 */
export interface PieceTable {
  /** Array of character positions */
  cps: number[];
  /** Array of piece descriptors */
  pieces: PieceDescriptor[];
}

/**
 * Extracted text with position information
 */
export interface TextRange {
  /** Start character position */
  cpStart: number;
  /** End character position */
  cpEnd: number;
  /** Text content */
  text: string;
}

// =============================================================================
// Formatting Property Types
// =============================================================================

/**
 * Character properties (CHP equivalent)
 */
export interface CharacterProperties {
  /** Font name */
  fontName?: string;
  /** Font size in half-points */
  fontSize?: number;
  /** Bold */
  bold?: boolean;
  /** Italic */
  italic?: boolean;
  /** Underline style */
  underline?: string;
  /** Strikethrough */
  strikethrough?: boolean;
  /** Double strikethrough */
  doubleStrikethrough?: boolean;
  /** Small caps */
  smallCaps?: boolean;
  /** All caps */
  allCaps?: boolean;
  /** Hidden text */
  hidden?: boolean;
  /** Subscript */
  subscript?: boolean;
  /** Superscript */
  superscript?: boolean;
  /** Text color (RGB) */
  color?: string;
  /** Highlight color */
  highlight?: string;
  /** Character spacing in twips */
  spacing?: number;
  /** Position offset in half-points */
  position?: number;
  /** Style index */
  styleIndex?: number;
}

/**
 * Paragraph properties (PAP equivalent)
 */
export interface ParagraphProperties {
  /** Style index */
  styleIndex?: number;
  /** Justification (left, center, right, both) */
  justification?: 'left' | 'center' | 'right' | 'both';
  /** Left indent in twips */
  indentLeft?: number;
  /** Right indent in twips */
  indentRight?: number;
  /** First line indent in twips */
  indentFirstLine?: number;
  /** Space before in twips */
  spaceBefore?: number;
  /** Space after in twips */
  spaceAfter?: number;
  /** Line spacing value */
  lineSpacing?: number;
  /** Line spacing type */
  lineSpacingType?: 'auto' | 'exact' | 'atLeast';
  /** Keep with next */
  keepWithNext?: boolean;
  /** Keep lines together */
  keepTogether?: boolean;
  /** Page break before */
  pageBreakBefore?: boolean;
  /** Widow/orphan control */
  widowControl?: boolean;
  /** Border top */
  borderTop?: BorderProperties;
  /** Border bottom */
  borderBottom?: BorderProperties;
  /** Border left */
  borderLeft?: BorderProperties;
  /** Border right */
  borderRight?: BorderProperties;
  /** Shading */
  shading?: ShadingProperties;
  /** List information */
  listInfo?: ListInfo;
  /** Outline level (0-9, where 9 = body text) */
  outlineLevel?: number;
}

/**
 * Border properties
 */
export interface BorderProperties {
  /** Border style */
  style?: string;
  /** Border width in eighths of a point */
  width?: number;
  /** Border color */
  color?: string;
  /** Space from text in twips */
  space?: number;
}

/**
 * Shading properties
 */
export interface ShadingProperties {
  /** Pattern type */
  pattern?: string;
  /** Foreground color */
  foregroundColor?: string;
  /** Background color */
  backgroundColor?: string;
}

/**
 * List information
 */
export interface ListInfo {
  /** List format override index (ilfo) */
  ilfo?: number;
  /** List level (0-8) */
  ilvl?: number;
}

// =============================================================================
// Table Types
// =============================================================================

/**
 * Table cell properties
 */
export interface TableCellProperties {
  /** Cell width in twips */
  width?: number;
  /** Vertical merge (restart, continue, none) */
  verticalMerge?: 'restart' | 'continue' | 'none';
  /** Horizontal merge span */
  gridSpan?: number;
  /** Vertical alignment */
  verticalAlign?: 'top' | 'center' | 'bottom';
  /** Text direction */
  textDirection?: string;
  /** Cell shading */
  shading?: ShadingProperties;
  /** Cell borders */
  borders?: {
    top?: BorderProperties;
    bottom?: BorderProperties;
    left?: BorderProperties;
    right?: BorderProperties;
  };
  /** Cell margins */
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

/**
 * Table row properties
 */
export interface TableRowProperties {
  /** Row height in twips */
  height?: number;
  /** Height rule (exact, atLeast, auto) */
  heightRule?: 'exact' | 'atLeast' | 'auto';
  /** Header row */
  isHeader?: boolean;
  /** Allow row to break across pages */
  cantSplit?: boolean;
  /** Row justification */
  justification?: 'left' | 'center' | 'right';
}

/**
 * Table properties
 */
export interface TableProperties {
  /** Table width in twips */
  width?: number;
  /** Table justification */
  justification?: 'left' | 'center' | 'right';
  /** Table indent in twips */
  indent?: number;
  /** Table borders */
  borders?: {
    top?: BorderProperties;
    bottom?: BorderProperties;
    left?: BorderProperties;
    right?: BorderProperties;
    insideH?: BorderProperties;
    insideV?: BorderProperties;
  };
  /** Cell spacing in twips */
  cellSpacing?: number;
  /** Default cell margins */
  defaultCellMargins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  /** Table style */
  styleId?: string;
  /** Table alignment (alias for justification) */
  alignment?: 'left' | 'center' | 'right';
  /** Row height in twips */
  rowHeight?: number;
  /** Row height rule */
  rowHeightRule?: 'auto' | 'exact' | 'atLeast';
}

/**
 * Table cell definition
 */
export interface TableCellDefinition {
  /** Cell text content */
  text: string;
  /** Row index */
  rowIndex: number;
  /** Column index */
  colIndex: number;
  /** Row span */
  rowSpan: number;
  /** Column span */
  colSpan: number;
  /** Cell width in twips */
  width?: number;
  /** Cell properties */
  properties?: {
    /** Vertical alignment */
    verticalAlign?: 'top' | 'center' | 'bottom';
    /** Background color */
    shading?: string;
    /** Cell borders */
    borders?: {
      top?: BorderProperties;
      bottom?: BorderProperties;
      left?: BorderProperties;
      right?: BorderProperties;
    };
  };
}

/**
 * Table row definition
 */
export interface TableRowDefinition {
  /** Row index */
  index: number;
  /** Cells in this row */
  cells: TableCellDefinition[];
  /** Is this a header row */
  isHeader?: boolean;
  /** Row height in twips */
  height?: number;
  /** Can the row break across pages */
  cantSplit?: boolean;
}

/**
 * Table definition
 */
export interface TableDefinition {
  /** Table rows */
  rows: TableRowDefinition[];
  /** Number of rows */
  rowCount: number;
  /** Number of columns */
  columnCount: number;
  /** Start character position */
  cpStart: number;
  /** End character position */
  cpEnd: number;
  /** Table properties */
  properties?: TableProperties;
}

// =============================================================================
// Section Types
// =============================================================================

/**
 * Section properties (SEP equivalent)
 */
export interface SectionProperties {
  /** Page width in twips */
  pageWidth?: number;
  /** Page height in twips */
  pageHeight?: number;
  /** Left margin in twips */
  marginLeft?: number;
  /** Right margin in twips */
  marginRight?: number;
  /** Top margin in twips */
  marginTop?: number;
  /** Bottom margin in twips */
  marginBottom?: number;
  /** Header margin in twips */
  marginHeader?: number;
  /** Footer margin in twips */
  marginFooter?: number;
  /** Gutter margin in twips */
  marginGutter?: number;
  /** Page orientation */
  orientation?: 'portrait' | 'landscape';
  /** Number of columns */
  columns?: number;
  /** Column spacing in twips */
  columnSpacing?: number;
  /** Section break type */
  breakType?: 'continuous' | 'nextPage' | 'evenPage' | 'oddPage' | 'nextColumn';
  /** Page numbering start */
  pageNumberStart?: number;
  /** Different first page header/footer */
  titlePage?: boolean;
  /** Different odd/even headers/footers */
  evenAndOddHeaders?: boolean;
}

// =============================================================================
// Style Types
// =============================================================================

/**
 * Style type enumeration
 */
export type StyleType = 'paragraph' | 'character' | 'table' | 'list' | 'numbering';

/**
 * Style definition
 */
export interface StyleDefinition {
  /** Style type */
  type: StyleType;
  /** Style ID/name (for DOCX compatibility) */
  styleId?: string;
  /** Display name */
  name: string;
  /** Base style index (for .doc files) */
  basedOn?: number | string;
  /** Next style index (for .doc files) */
  next?: number | string;
  /** Linked style ID */
  link?: string;
  /** Is built-in style */
  isBuiltIn?: boolean;
  /** Style index in stylesheet */
  index: number;
  /** Built-in style identifier (sti) - .doc specific */
  sti?: number;
  /** Paragraph properties (for paragraph styles) */
  paragraphProperties?: ParagraphProperties;
  /** Character properties */
  characterProperties?: CharacterProperties;
  /** Table properties (for table styles) */
  tableProperties?: TableProperties;
}

// =============================================================================
// Image Types
// =============================================================================

/**
 * Image extraction result
 */
export interface ExtractedImage {
  /** Image ID/relationship ID */
  id: string;
  /** Image format (png, jpeg, gif, wmf, emf) */
  format: string;
  /** Image data */
  data: Uint8Array;
  /** Width in EMUs */
  width?: number;
  /** Height in EMUs */
  height?: number;
  /** Is inline or floating */
  inline: boolean;
  /** Anchor position (for floating images) */
  anchor?: {
    horizontal: number;
    vertical: number;
    horizontalRelation: string;
    verticalRelation: string;
  };
}

// =============================================================================
// Field Types
// =============================================================================

/**
 * Field instruction
 */
export interface FieldInstruction {
  /** Field type (HYPERLINK, PAGE, REF, etc.) */
  type: string;
  /** Field argument */
  argument?: string;
  /** Field switches */
  switches?: string[];
  /** Field result (displayed text) */
  result?: string;
  /** Character position of field begin */
  cpBegin: number;
  /** Character position of field end */
  cpEnd: number;
}

/**
 * Field definition (for conversion)
 */
export interface FieldDefinition {
  /** Field type (normalized) */
  type: string;
  /** Field instruction/code */
  instruction: string;
  /** Field result (displayed text) */
  result: string;
  /** Start character position */
  cpStart: number;
  /** End character position */
  cpEnd: number;
}

// =============================================================================
// Document Types
// =============================================================================

/**
 * Subdocument types
 */
export type SubdocumentType =
  | 'main'
  | 'footnote'
  | 'endnote'
  | 'header'
  | 'footer'
  | 'comment'
  | 'textbox'
  | 'headerTextbox';

/**
 * Complete parsed .doc file
 */
export interface ParsedDocFile {
  /** CFB container */
  cfb: CFBFile;
  /** File Information Block */
  fib: FIB;
  /** All extracted text by subdocument */
  text: Map<SubdocumentType, TextRange[]>;
  /** Styles */
  styles: StyleDefinition[];
  /** Sections */
  sections: SectionProperties[];
  /** Images */
  images: ExtractedImage[];
  /** Fields */
  fields: FieldInstruction[];
  /** Character properties by CP range */
  characterProperties: Map<number, CharacterProperties>;
  /** Paragraph properties by CP */
  paragraphProperties: Map<number, ParagraphProperties>;
}
