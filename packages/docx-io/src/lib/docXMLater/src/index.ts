/**
 * DocXML - DOCX Editing Framework
 * Main entry point
 */

// Main ZIP handler
export { ZipHandler } from './zip/ZipHandler';
export { ZipReader } from './zip/ZipReader';
export { ZipWriter } from './zip/ZipWriter';

// Types
export {
  ZipFile,
  FileMap,
  LoadOptions,
  SaveOptions,
  AddFileOptions,
  SizeLimitOptions,
  DEFAULT_SIZE_LIMITS,
  REQUIRED_DOCX_FILES,
  DOCX_PATHS,
} from './zip/types';

// Errors
export {
  DocxError,
  DocxNotFoundError,
  InvalidDocxError,
  CorruptedArchiveError,
  MissingRequiredFileError,
  FileOperationError,
} from './zip/errors';

// Utilities
export {
  validateDocxStructure,
  isBinaryFile,
  normalizePath,
  isValidZipBuffer,
  isTextContent,
  validateTwips,
  validateColor,
  validateHexColor,
  normalizeColor,
  validateNumberingId,
  validateLevel,
  validateAlignment,
  validateFontSize,
  validateNonEmptyString,
  validatePercentage,
  validateEmus,
  detectXmlInText,
  cleanXmlFromText,
  validateRunText,
  TextValidationResult,
} from './utils/validation';

// Formatting utilities
export {
  mergeFormatting,
  cloneFormatting,
  hasFormatting,
  cleanFormatting,
  isEqualFormatting,
  applyDefaults,
} from './utils/formatting';

// Corruption Detection
export {
  detectCorruptionInDocument,
  detectCorruptionInText,
  suggestFix,
  looksCorrupted,
  CorruptionReport,
  CorruptionLocation,
  CorruptionType,
} from './utils/corruptionDetection';

// Unit conversions
export {
  STANDARD_DPI,
  UNITS,
  PAGE_SIZES,
  COMMON_MARGINS,
  twipsToPoints,
  twipsToInches,
  twipsToCm,
  twipsToEmus,
  emusToTwips,
  emusToInches,
  emusToCm,
  emusToPoints,
  emusToPixels,
  pointsToTwips,
  pointsToEmus,
  pointsToInches,
  pointsToCm,
  inchesToTwips,
  inchesToEmus,
  inchesToPoints,
  inchesToCm,
  inchesToPixels,
  cmToTwips,
  cmToEmus,
  cmToInches,
  cmToPoints,
  cmToPixels,
  pixelsToEmus,
  pixelsToInches,
  pixelsToTwips,
  pixelsToCm,
  pixelsToPoints,
} from './utils/units';

// Core classes
export {
  Document,
  DocumentProperties,
  DocumentOptions,
  DocumentLoadOptions,
  DocumentPart,
} from './core/Document';
export {
  Relationship,
  RelationshipType,
  RelationshipProperties,
} from './core/Relationship';
export { RelationshipManager } from './core/RelationshipManager';
export { DocumentParser, ParseError } from './core/DocumentParser';
export { DocumentGenerator, IZipHandlerReader } from './core/DocumentGenerator';
export {
  DocumentValidator,
  SizeEstimate,
  MemoryOptions,
} from './core/DocumentValidator';
export { DocumentIdManager } from './core/DocumentIdManager';

// Document subsystem classes (Phase 7 refactoring)
export {
  DocumentMetadata,
  DocumentProperties as MetadataProperties,
} from './core/DocumentMetadata';
export { DocumentContent, BodyElement } from './core/DocumentContent';
export { DocumentFormatting } from './core/DocumentFormatting';
export { DocumentTracking } from './core/DocumentTracking';

// Style configuration types
export {
  StyleRunFormatting,
  StyleParagraphFormatting,
  Heading2TableOptions,
  StyleConfig,
  Heading2Config,
  ApplyCustomFormattingOptions,
} from './types/styleConfig';

// Formatting classes
export { Style, StyleType, StyleProperties } from './formatting/Style';
export { StylesManager, ValidationResult } from './formatting/StylesManager';
export {
  NumberingLevel,
  NumberFormat,
  NumberAlignment,
  NumberingLevelProperties,
  WORD_NATIVE_BULLETS,
  WordNativeBullet,
} from './formatting/NumberingLevel';
export {
  AbstractNumbering,
  AbstractNumberingProperties,
} from './formatting/AbstractNumbering';
export {
  NumberingInstance,
  NumberingInstanceProperties,
} from './formatting/NumberingInstance';
export { NumberingManager } from './formatting/NumberingManager';

// Common types (consolidated type definitions)
export {
  // Shading patterns
  ShadingPattern,
  BasicShadingPattern,
  // Border types
  BorderStyle,
  ExtendedBorderStyle,
  FullBorderStyle,
  BorderDefinition,
  FourSidedBorders,
  TableBorderDefinitions,
  // Alignment types
  HorizontalAlignment,
  VerticalAlignment,
  PageVerticalAlignment,
  CellVerticalAlignment,
  ParagraphAlignment as CommonParagraphAlignment,
  TableAlignment as CommonTableAlignment,
  RowJustification,
  TextVerticalAlignment,
  TabAlignment,
  // Positioning
  PositionAnchor,
  HorizontalAnchor,
  VerticalAnchor,
  // Text direction
  TextDirection,
  SectionTextDirection,
  // Width types
  WidthType,
  // Shading config
  ShadingConfig,
  // Tab stops
  TabLeader,
  TabStop,
  // Type guards
  isShadingPattern,
  isBorderStyle,
  isHorizontalAlignment,
  isVerticalAlignment,
  isParagraphAlignment,
  isWidthType,
  // Constants
  DEFAULT_BORDER,
  NO_BORDER,
} from './elements/CommonTypes';

// Document elements
export {
  Paragraph,
  ParagraphAlignment,
  ParagraphFormatting,
  ParagraphContent,
  FieldLike,
  // Type guards for ParagraphContent
  isRun,
  isField,
  isSimpleField,
  isComplexField,
  isHyperlink,
  isRevision,
  isRangeMarker,
  isShape,
  isTextBox,
} from './elements/Paragraph';
export { Run, RunFormatting, ThemeColorValue } from './elements/Run';
export {
  Section,
  PageOrientation,
  SectionType,
  PageNumberFormat,
  PageSize,
  Margins,
  Columns,
  PageNumbering,
  SectionProperties,
  LineNumbering,
  LineNumberingRestart,
} from './elements/Section';
export {
  Table,
  TableAlignment,
  TableLayout,
  TableBorder,
  TableBorders,
  TableFormatting,
} from './elements/Table';
export { TableRow, RowFormatting } from './elements/TableRow';
export {
  TableCell,
  // BorderStyle and CellVerticalAlignment are now exported from CommonTypes
  CellBorder,
  CellBorders,
  CellShading,
  CellFormatting,
} from './elements/TableCell';
export {
  TableGridChange,
  GridColumn,
  TableGridChangeProperties,
} from './elements/TableGridChange';
export { Image, ImageFormat, ImageProperties } from './elements/Image';
export { ImageManager } from './elements/ImageManager';
export { ImageRun } from './elements/ImageRun';
export {
  Shape,
  ShapeType,
  ShapeProperties,
  ShapeFill,
  ShapeOutline,
} from './elements/Shape';
export {
  TextBox,
  TextBoxProperties,
  TextBoxFill,
  TextBoxMargins,
} from './elements/TextBox';
export {
  DrawingManager,
  DrawingElement,
  DrawingType,
  PreservedDrawing,
} from './managers/DrawingManager';
export { FontManager, FontFormat, FontEntry } from './elements/FontManager';
export {
  Field,
  FieldType,
  FieldProperties,
  ComplexField,
  ComplexFieldProperties,
  FieldCharType,
  TOCFieldOptions,
  createTOCField,
} from './elements/Field';
export {
  createNestedIFMergeField,
  createMergeField,
  createRefField,
  createIFField,
  createNestedField,
  parseHyperlinkInstruction,
  buildHyperlinkInstruction,
  isHyperlinkInstruction,
  ParsedHyperlinkInstruction,
} from './elements/FieldHelpers';
export { Header, HeaderType, HeaderProperties } from './elements/Header';
export { Footer, FooterType, FooterProperties } from './elements/Footer';
export { HeaderFooterManager } from './elements/HeaderFooterManager';
export { Hyperlink, HyperlinkProperties } from './elements/Hyperlink';
export { TableOfContents, TOCProperties } from './elements/TableOfContents';
export { TableOfContentsElement } from './elements/TableOfContentsElement';
export { Bookmark, BookmarkProperties } from './elements/Bookmark';
export { BookmarkManager } from './elements/BookmarkManager';
export {
  StructuredDocumentTag,
  SDTProperties,
  SDTLockType,
  SDTContent,
} from './elements/StructuredDocumentTag';
export {
  Revision,
  RevisionType,
  RevisionProperties,
  FieldContext,
} from './elements/Revision';
export {
  RevisionContent,
  isRunContent,
  isHyperlinkContent,
} from './elements/RevisionContent';
export {
  RevisionManager,
  RevisionCategory,
  RevisionSummary,
} from './elements/RevisionManager';
export {
  RevisionLocation,
  RunPropertyChange,
  ParagraphPropertyChange,
  ParagraphFormattingPartial,
  ParagraphBorderDef,
  ParagraphBorders,
  ParagraphShading,
  TabStopDef,
  PropertyChangeBase,
  TablePropertyChange,
  TablePropertyChangeType,
  SectionPropertyChange,
  NumberingChange,
  AnyPropertyChange,
  isRunPropertyChange,
  isParagraphPropertyChange,
  isTablePropertyChange,
  isSectionPropertyChange,
  isNumberingChange,
} from './elements/PropertyChangeTypes';

// Cleanup Helper
export {
  CleanupHelper,
  CleanupOptions,
  CleanupReport,
} from './helpers/CleanupHelper';

// Changelog Generation
export {
  ChangelogGenerator,
  ChangeEntry,
  ChangeCategory,
  ChangeLocation,
  ChangelogOptions,
  ChangelogFormat,
  ConsolidatedChange,
  ChangelogSummary,
} from './utils/ChangelogGenerator';

// Revision Validation and Auto-Fix
export {
  REVISION_RULES,
  ValidationSeverity,
  ValidationIssue,
  ValidationRule,
  ValidationOptions,
  AutoFixOptions,
  ValidationResult as RevisionValidationResult,
  FixAction,
  AutoFixResult,
  createIssueFromRule,
  getRuleByCode,
  getRulesBySeverity,
  getAutoFixableRules,
  RevisionValidator,
  RevisionAutoFixer,
} from './validation';

// Revision-Aware Processing
export {
  RevisionAwareProcessor,
  RevisionHandlingMode,
  RevisionProcessingOptions,
  SelectionCriteria,
  RevisionProcessingResult,
  ConflictInfo,
  ProcessingLogEntry,
} from './utils/RevisionAwareProcessor';

// Selective Revision Acceptance
export {
  SelectiveRevisionAcceptor,
  SelectiveAcceptResult,
} from './utils/SelectiveRevisionAcceptor';
export {
  RangeMarker,
  RangeMarkerType,
  RangeMarkerProperties,
} from './elements/RangeMarker';
export { Comment, CommentProperties } from './elements/Comment';
export { CommentManager } from './elements/CommentManager';
export {
  Footnote,
  FootnoteType,
  FootnoteProperties,
} from './elements/Footnote';
export { FootnoteManager } from './elements/FootnoteManager';
export { Endnote, EndnoteType, EndnoteProperties } from './elements/Endnote';
export { EndnoteManager } from './elements/EndnoteManager';

// XML Builder and Parser
export { XMLBuilder, XMLElement } from './xml/XMLBuilder';
export {
  XMLParser,
  ParseToObjectOptions,
  ParsedXMLValue,
  ParsedXMLObject,
  DEFAULT_MAX_NESTING_DEPTH,
} from './xml/XMLParser';

// XML Sanitization (XML 1.0 compliance)
export {
  removeInvalidXmlChars,
  findInvalidXmlChars,
  hasInvalidXmlChars,
  XML_CONTROL_CHARS,
} from './utils/xmlSanitization';

// Logging utilities
export {
  ILogger,
  LogLevel,
  LogEntry,
  ConsoleLogger,
  SilentLogger,
  CollectingLogger,
  defaultLogger,
  createScopedLogger,
  createComponentLogger,
  getGlobalLogger,
  setGlobalLogger,
  resetGlobalLogger,
} from './utils/logger';

// Error handling utilities
export {
  isError,
  toError,
  wrapError,
  getErrorMessage,
} from './utils/errorHandling';

// Parsing utilities
export {
  safeParseInt,
  parseOoxmlBoolean,
  isExplicitlySet,
  parseNumericAttribute,
  parseOnOffAttribute,
} from './utils/parsingHelpers';

// Revision utilities
export { RevisionWalker, RevisionWalkerOptions } from './utils/RevisionWalker';

// In-memory revision acceptance (industry-standard approach)
export {
  acceptRevisionsInMemory,
  AcceptRevisionsOptions,
  AcceptRevisionsResult,
  paragraphHasRevisions,
  getRevisionsFromParagraph,
  countRevisionsByType,
  stripRevisionsFromXml,
} from './utils/InMemoryRevisionAcceptor';

// Move operation helper (creates complete move operations with range markers)
export {
  MoveOperationHelper,
  MoveOperationOptions,
  MoveOperationResult,
} from './utils/MoveOperationHelper';

// Constants
export { LIMITS } from './constants/limits';

// Formatting types
export {
  FormatOptions,
  StyleApplyOptions,
  EmphasisType,
  ListPrefix,
} from './types/formatting';

// List normalization
export {
  ListNormalizer,
  analyzeCellLists,
  analyzeTableLists,
  normalizeListsInCell,
  normalizeListsInTable,
  normalizeOrphanListLevelsInCell,
  normalizeOrphanListLevelsInTable,
  stripTypedPrefix,
} from './core/ListNormalizer';

export {
  detectTypedPrefix,
  detectListType,
  inferLevelFromIndentation,
  getParagraphIndentation,
  validateListSequence,
  getListCategoryFromFormat,
  getLevelFromFormat,
  TYPED_LIST_PATTERNS,
  PATTERN_TO_CATEGORY,
  FORMAT_TO_LEVEL,
} from './utils/list-detection';

export {
  ListCategory,
  NumberFormat as ListNumberFormat,
  BulletFormat,
  ListDetectionResult,
  ListAnalysis,
  ListNormalizationOptions,
  ListNormalizationReport,
} from './types/list-types';
