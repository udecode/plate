/**
 * Adapters Module
 *
 * This module provides adapter interfaces for converting between different
 * formats and the docXMLater Document API.
 *
 * @module adapters
 */

// HTML to Document conversion
export {
  htmlToDocument,
  htmlToDocumentSync,
  validateHtmlForConversion,
  type HtmlToDocumentOptions,
  type HtmlToDocumentResult,
  type HtmlStyleMapping,
  type ConversionWarning,
  type ConversionStats,
} from './html-to-document';

// Document options and configuration
export {
  applyDocumentOptions,
  createDocumentWithOptions,
  validateDocumentOptions,
  convertMarginsToTwips,
  resolvePageSize,
  DEFAULT_DOCUMENT_OPTIONS,
  type DocumentOptions,
  type DocumentLayoutOptions,
  type DocumentMargins,
  type HeaderFooterOptions,
  type PageNumberingOptions,
  type PageSizePreset,
  type MarginUnit,
} from './document-options';

// CSS to DOCX style conversion
export {
  // Types
  type StyleMapping,
  type CSSStyles,
  type CollectedFormatting,
  // Color conversion
  cssColorToDocxHex,
  // Unit conversion
  cssFontSizeToHalfPoints,
  cssLetterSpacingToTwips,
  // Individual style handlers
  handleBold,
  handleItalic,
  handleUnderline,
  handleStrikethrough,
  handleFontColor,
  handleBackgroundColor,
  handleFontSize,
  handleFontFamily,
  handleVerticalAlign,
  handleTextTransform,
  handleHighlight,
  handleInlineCodeStyle,
  handleTextAlign,
  // Parsing utilities
  parseTextDecoration,
  parseFontWeight,
  parseFontStyle,
  // Bulk operations
  collectFormatting,
  applyStyles,
  applyParagraphStyles,
  // Registry
  styleMapperRegistry,
} from './style-mappers';

// Tracking bridge - suggestions and comments conversion
export {
  // Types
  type TrackingOptions,
  type PlateSuggestion,
  type PlateComment,
  type TrackingSetupResult,
  type ConvertedRevision,
  type ConvertedComment,
  // Functions
  setupTracking,
  convertSuggestionToRevision,
  convertCommentToDocx,
  createRevision,
  createComment,
  processSuggestions,
  processComments,
} from './tracking-bridge';

// Element handlers - HTML element to DOCX conversion
export {
  // Types
  type ElementHandler,
  type ConversionContext,
  type ConversionResult,
  type ListContext,
  type TableContext,
  type ImageHandler,
  // Block handlers
  handleParagraph,
  handleHeading,
  handleBlockquote,
  handleHorizontalRule,
  handlePreformatted,
  handleCodeBlock,
  // List handlers
  handleUnorderedList,
  handleOrderedList,
  handleListItem,
  // Table handlers
  handleTable,
  handleTableRow,
  handleTableCell,
  // Inline handlers
  handleAnchor,
  handleImage,
  handleLineBreak,
  // Text formatting handlers - renamed to avoid conflicts with style-mappers
  handleBold as handleBoldElement,
  handleItalic as handleItalicElement,
  handleUnderline as handleUnderlineElement,
  handleStrikethrough as handleStrikethroughElement,
  handleSubscript,
  handleSuperscript,
  handleInlineCode,
  handleMark,
  handleSpan,
  // Indentation and container handlers
  parseCssIndentToTwips,
  handleIndentation,
  handleDiv,
  // Registry and utilities
  elementHandlers,
  getHandler,
  registerHandler,
  processElement,
} from './element-handlers';

// Slate bridge - Type definitions and utilities for Slate nodes
export {
  // Type aliases
  type SlateNode,
  type SlateElement,
  type SlateText,
  type SlateDescendant,
  // Type guards
  isElement,
  isText,
  isNode,
  isDescendant,
  isElementType,
  // Traversal utilities
  getChildren,
  getNodeText,
  getElementType,
  hasChildren,
  getTextNodes,
  getElementNodes,
  getDescendants,
  // Property utilities
  extractNodeProps,
  nodeMatches,
  getTextMark,
  hasTextMark,
} from './slate-bridge';

// Re-export Slate types from platejs for convenience
export type {
  TNode,
  TElement,
  TText,
  Descendant,
  Ancestor,
  NodeOf,
  ElementOf,
  TextOf,
  NodeProps,
} from './slate-bridge';

// Plate bridge - Plugin interface and HTML serialization
export {
  // Types
  type PlateExportPlugin,
  type PlateExportContext,
  type PlateExportOptions,
  type ExportResult,
  // Plugin registry
  registerExportPlugin,
  getExportPlugin,
  getExportPluginForMark,
  getAllExportPlugins,
  clearExportPlugins,
  // HTML serialization
  serializeHtml,
  // Context builders
  createExportContext,
  buildElementContext,
} from './plate-bridge';

// Utils bridge - Unit conversion, color conversion, XML sanitization
export {
  // Constants
  TWIPS_PER_INCH,
  EMU_PER_INCH,
  POINTS_PER_INCH,
  TWIPS_PER_POINT,
  EMU_PER_POINT,
  EMU_PER_TWIP,
  EMU_PER_CM,
  STANDARD_DPI,
  HALF_POINTS_PER_POINT,
  DOCX_HIGHLIGHT_COLORS,
  type DocxHighlightColor,
  // Pixel conversions
  pxToTwips,
  pxToEMU,
  pxToHalfPoints,
  // Point conversions
  ptToTwips,
  ptToHalfPoints,
  ptToEMU,
  // Inch conversions
  inchesToTwips,
  inchesToEMU,
  // Centimeter conversions
  cmToTwips,
  cmToEMU,
  // Reverse conversions
  twipsToPx,
  emuToPx,
  halfPointsToPt,
  // Color conversion
  colorToDocxHex,
  hexToNearestHighlight,
  // XML sanitization
  sanitizeForXml,
  hasInvalidXmlChars,
  removeInvalidXmlChars,
  escapeXml,
  unescapeXml,
  // CSS parsing
  parseCssDimension,
} from './utils-bridge';

// Juice bridge - CSS inlining utilities
export {
  // Types
  type JuiceOptions,
  type ExtractedStyles,
  // Availability check
  isJuiceAvailable,
  preloadJuice,
  // CSS inlining
  inlineStyles,
  inlineStylesSync,
  // Style extraction
  parseStyleString,
  stylesToString,
  mergeStyles,
  extractStyles,
  extractInlineStyles,
} from './juice-bridge';

// HTML Parser - DOM parsing utilities
export {
  // Types
  type ParsedDocument,
  type HTMLElement as ParsedHTMLElement,
  type Node as ParsedNode,
  type Text as ParsedText,
  type NodeListOf,
  type HTMLCollection,
  type CSSStyleDeclaration as ParsedCSSStyleDeclaration,
  type WalkCallback,
  type ParseHtmlOptions,
  type ParseHtmlResult,
  // Constants
  NODE_TYPES,
  // Parsing functions
  parseHtml,
  parseHtmlSync,
  // DOM walking utilities
  walkDom,
  walkDomAsync,
  findElements,
  extractText,
  // Sanitization
  sanitizeHtml,
  // Type guards
  isElementNode,
  isTextNode,
  getTagName,
} from './html-parser';

// Plugin Bridge - Plugin architecture for export
export {
  // Types
  type PluginContext,
  type PluginWarning,
  type PluginStats,
  type ExportPluginOptions,
  type PluginHookResult,
  type PluginHooks,
  type ExportPlugin,
  type ElementAdapter,
  // Classes
  PluginRegistry,
  PluginExecutor,
  // Instances and factories
  globalPluginRegistry,
  createPluginRegistry,
  createPluginExecutor,
} from './plugin-bridge';

// Export Types - Type definitions for DOCX export
export {
  // Main export types
  type DocxExportOptions,
  type ExportResult as DocxExportResult,
  type ExportWarning as DocxExportWarning,
  type ExportError as DocxExportError,
  type ExportStats as DocxExportStats,
  type StyleMappingOptions,
  type HtmlConversionInput,
  type OutputFormat,
  type ConvertHtmlToDocx,
  // Legacy types
  type DocumentOptions as LegacyDocumentOptions,
  // Constants
  ExportErrorCodes,
  ExportWarningCodes,
  DEFAULT_EXPORT_OPTIONS,
} from './types';

// Table Handler - HTML table to DOCX table conversion
export {
  // Types
  type TableConversionOptions,
  // Element handlers
  handleTableElement,
  handleTableRowElement,
  handleTableCellElement,
  // Factory functions
  processHtmlTable,
  createSimpleTable,
} from './table-handler';

// Image Handler - HTML image to DOCX image conversion
export {
  // Types
  type ImageConversionOptions,
  type ImageDimensions,
  type Base64ImageData,
  // Constants (EMU constants that don't duplicate utils-bridge)
  EMU_PER_PIXEL_96DPI,
  EMU_PER_MM,
  DEFAULT_DPI,
  MAX_IMAGE_EMU,
  DEFAULT_IMAGE_WIDTH_EMU,
  DEFAULT_MAX_WIDTH_EMU,
  // Unit conversion (aliases that use image-specific defaults)
  pixelsToEmu,
  emuToPixels,
  pointsToEmu,
  inchesToEmu as imageInchesToEmu, // Renamed to avoid conflict with utils-bridge
  cmToEmu as imageCmToEmu, // Renamed to avoid conflict with utils-bridge
  mmToEmu,
  parseCssDimensionToEmu,
  // Dimension calculation
  calculateImageDimensions,
  // Image data extraction
  extractBase64ImageData,
  detectImageDimensions,
  // Factory function
  createImageHandler,
} from './image-handler';

// Link Handler - HTML anchor to DOCX hyperlink conversion
export {
  // Types
  type LinkConversionOptions,
  type ParsedLink,
  type LinkRelationship,
  // Relationship ID management
  generateRelationshipId,
  resetRelationshipIdCounter,
  // URL parsing
  parseHref,
  sanitizeUrl,
  extractLinkText,
  // Element handler
  handleAnchorElement,
  // Factory functions
  createExternalLink,
  createInternalLink,
  createEmailLink,
  createWebLink,
  // Relationship collection
  collectLinkRelationships,
} from './link-handler';

// List Handler - HTML list to DOCX list conversion
export {
  // Types
  type ListConversionOptions,
  type ExtendedListContext,
  type ListNumberingResult,
  type TaskListConversionOptions,
  // Constants
  MAX_LIST_LEVEL,
  DEFAULT_INDENT_PER_LEVEL,
  DEFAULT_HANGING_INDENT,
  BULLET_CHARACTERS,
  BULLET_FONT,
  NUMBERING_FORMATS,
  // Task list constants
  TASK_LIST_UNCHECKED,
  TASK_LIST_CHECKED,
  TASK_LIST_CANCELLED,
  TASK_LIST_FONT,
  // Helper functions
  mapListStyleType,
  getBulletCharacter,
  createLevelIndentation,
  createBulletListNumbering,
  createNumberedListNumbering,
  getOrCreateListNumbering,
  // Task list detection
  detectTaskListItem,
  // Element handlers
  handleUnorderedListElement,
  handleOrderedListElement,
  handleListItemElement,
  handleTaskListItemElement,
  handleModernListElement,
  handleListItemWithIndent,
  // Factory functions
  createBulletList,
  createNumberedList,
  createNestedList,
  createTaskList,
} from './list-handler';

// Re-export additional tracking-bridge utilities
export {
  // Additional types
  type IdMapping,
  type CommentRange,
  type CommentRangeXml,
  type CommentProcessingResult,
  // Constants
  COMMENT_MARK_PATTERN,
  COMMENT_ID_ATTR,
  COMMENT_ID_ATTR_ALT,
  // Comment mark detection (T082)
  isCommentMarked,
  extractCommentId,
  extractAllCommentIds,
  // Comment range generation (T083)
  createCommentRangeMarkers,
  createCommentRangeFromComment,
  CommentRangeTracker,
  // Comments.xml generation (T084)
  generateCommentsXml,
  processCommentsWithXml,
  // Additional functions
  createIdMapping,
  getDocxId,
  normalizeTrackingOptions,
} from './tracking-bridge';

// CSV Handler - CSV to DOCX table conversion
export {
  // Types
  type CSVConversionOptions,
  type ParsedCSVData,
  // CSV parsing
  parseCSV,
  // CSV to table conversion
  csvToTable,
  csvDataToTable,
  // Element handler
  handleCSVTable,
  isCSVTable,
  // Utility functions
  extractCSVDataFromTable,
  tableToCSV,
} from './csv-handler';

// Layout Handler - Column layout and page layout handling
export {
  // Types
  type ColumnLayoutOptions,
  type ExtractedLayoutProperties,
  // CSS parsing utilities
  parseColumnCount,
  parseGapToTwips,
  parseColumnWidthToTwips,
  // Layout property extraction
  extractLayoutProperties,
  // Section configuration
  configureColumnLayout,
  createColumnSection,
  // Element handlers
  handleColumnLayout,
  handleColumnBreak,
  hasColumnLayout,
  // Page layout utilities
  createPageLayoutSection,
  createTwoColumnSection,
  createThreeColumnSection,
  createNewspaperSection,
  createSingleColumnSection,
} from './layout-handler';

// TOC Handler - Table of Contents handling
export {
  // Types
  type TOCConversionOptions,
  type DetectedTOCStructure,
  // Detection utilities
  isTOCElement,
  detectTOCStructure,
  // TOC creation
  createTOC,
  createTOCFromStructure,
  // Element handler
  handleTOCElement,
  // Factory functions
  createStandardTOC,
  createSimpleTOC,
  createDetailedTOC,
  createHyperlinkedTOC,
  createTOCWithLevels,
  createTOCWithStyles,
  createTOCWithoutPageNumbers,
  // Field code utilities
  generateTOCFieldCode,
  parseTOCFieldCode,
} from './toc-handler';

// Code Block Handler - <pre>/<code> to DOCX preformatted text
export {
  // Types
  type CodeBlockConversionOptions,
  // Constants
  CODE_BLOCK_FONT,
  CODE_BLOCK_FONT_SIZE,
  CODE_BLOCK_BACKGROUND,
  CODE_BLOCK_INDENT,
  // Helper functions
  normalizeCodeText,
  splitCodeIntoLines,
  // Element handlers
  handlePreElement,
  handleCodeElement,
  // Factory functions
  createCodeBlock,
  createInlineCodeRun,
} from './code-block-handler';

// Callout Handler - Callout/alert elements to styled paragraphs
export {
  // Types
  type CalloutVariant,
  type CalloutConversionOptions,
  // Constants
  CALLOUT_COLORS,
  CALLOUT_ICONS,
  CALLOUT_INDENT,
  CALLOUT_BORDER_WIDTH,
  // Helper functions
  extractCalloutVariant,
  getCalloutColors,
  getCalloutIcon,
  // Element handler
  handleCalloutElement,
  // Factory functions
  createCallout,
  createMultiLineCallout,
} from './callout-handler';

// Toggle Handler - <details>/<summary> to expanded paragraphs
export {
  // Types
  type ToggleConversionOptions,
  // Constants
  TOGGLE_EXPAND_INDICATOR,
  TOGGLE_COLLAPSE_INDICATOR,
  TOGGLE_CONTENT_INDENT,
  TOGGLE_HEADER_COLOR,
  // Helper functions
  extractToggleHeader,
  extractToggleContent,
  isToggleElement,
  // Element handlers
  handleDetailsElement,
  handleSummaryElement,
  handleToggleElement,
  // Factory functions
  createToggle,
  createAccordion,
} from './toggle-handler';

// Pagination Handler - Page breaks and page settings
export {
  // Types
  type PageBreakType,
  type PaginationOptions,
  type ExtractedPaginationProperties,
  type DocumentSettings,
  // CSS parsing utilities
  parsePageBreakValue,
  parsePageBreakInsideValue,
  parseBreakValue,
  // Property extraction
  extractPaginationProperties,
  isPageBreakElement,
  isColumnBreakElement,
  // Page settings resolution
  resolvePageSize as resolvePaginationPageSize, // Aliased to avoid conflict with document-options
  resolveMargins,
  // Paragraph configuration
  applyPaginationToParagraph,
  createPageBreakRun,
  createColumnBreakRun,
  createPageBreakParagraph,
  // Section configuration
  configureSectionFromSettings,
  createSectionFromSettings,
  // Element handlers
  handlePaginationElement,
  handleExplicitPageBreak,
  handleExplicitColumnBreak,
  hasPaginationStyles,
  // Page layout presets
  createLetterSettings,
  createA4Settings,
  createLegalSettings,
  createNarrowSettings,
  createWideSettings,
} from './pagination-handler';

// Mention Handler - HTML mention elements to styled text
export {
  // Types
  type MentionConversionOptions,
  type ParsedMention,
  // Constants
  MENTION_COLOR,
  MENTION_PREFIX,
  // Detection utilities
  isMentionElement,
  extractMentionData,
  // Element handler
  handleMentionElement,
  // Factory functions
  createMention,
  createUserMention,
  createChannelMention,
} from './mention-handler';

// Tag Handler - HTML tag elements to styled badge text
export {
  // Types
  type TagConversionOptions,
  type ParsedTag,
  // Constants
  TAG_COLOR,
  TAG_BACKGROUND,
  TAG_PREFIX,
  // Detection utilities
  isTagElement,
  extractTagData,
  // Element handler
  handleTagElement,
  // Factory functions
  createTag,
  createPriorityTag,
  createStatusTag,
} from './tag-handler';

// Date Handler - HTML date elements to formatted text
export {
  // Types
  type DateFormatStyle,
  type DateConversionOptions,
  type ParsedDate,
  // Constants
  DATE_COLOR,
  DEFAULT_DATE_FORMAT,
  // Detection utilities
  isDateElement,
  extractDateData,
  // Formatting utilities
  formatDate,
  formatRelativeDate,
  // Element handler
  handleDateElement,
  // Factory functions
  createDate,
  createDateFromString,
  createTodayDate,
  createDateRange,
} from './date-handler';

// Media Handler - HTML video/audio/file to placeholder conversion
export {
  // Types
  type MediaType,
  type MediaConversionOptions,
  type ParsedMediaData,
  // Constants
  VIDEO_PLACEHOLDER_PREFIX,
  VIDEO_PLACEHOLDER_SUFFIX,
  AUDIO_PLACEHOLDER_PREFIX,
  AUDIO_PLACEHOLDER_SUFFIX,
  FILE_PLACEHOLDER_PREFIX,
  FILE_PLACEHOLDER_SUFFIX,
  MEDIA_LINK_COLOR,
  MEDIA_TEXT_COLOR,
  // Detection utilities
  isVideoElement,
  isAudioElement,
  isFileElement,
  extractMediaData,
  // Formatting utilities
  formatFileSize,
  formatDuration,
  // Element handlers
  handleVideoElement,
  handleAudioElement,
  handleFileElement,
  // Factory functions
  createVideoPlaceholder,
  createAudioPlaceholder,
  createFileAttachment,
} from './media-handler';

// Caption Handler - HTML figure/figcaption to DOCX caption
export {
  // Types
  type CaptionType,
  type CaptionConversionOptions,
  type ParsedCaption,
  // Constants
  CAPTION_STYLE,
  CAPTION_COLOR,
  CAPTION_FONT_SIZE,
  // Detection utilities
  isFigureElement,
  isFigcaptionElement,
  hasCaptionData,
  extractCaptionData,
  // Building utilities
  buildCaptionText,
  // Element handlers
  handleFigureElement,
  handleFigcaptionElement,
  handleCaptionElement,
  // Factory functions
  createCaption,
  createFigureCaption,
  createTableCaption,
  createEquationCaption,
  createListingCaption,
} from './caption-handler';

// Comment Extended Handler - Nested/threaded comments support (T085)
export {
  // Types
  type ExtendedCommentProperties,
  type CommentThread,
  type CommentExtendedOptions,
  type ExtendedCommentsResult,
  // Threading utilities
  organizeCommentThreads,
  findThreadForComment,
  getCommentDepth,
  // Extended properties generation
  generateExtendedProperties,
  generateParaId,
  // commentsExtended.xml generation
  W15_NAMESPACE,
  generateCommentsExtendedXml,
  needsCommentsExtended,
  processExtendedComments,
  // Relationship helpers
  COMMENTS_EXTENDED_CONTENT_TYPE,
  COMMENTS_EXTENDED_RELATIONSHIP_TYPE,
  COMMENTS_EXTENDED_PATH,
  createCommentsExtendedRelationship,
  createCommentsExtendedContentType,
  // Utility functions
  validateCommentThread,
  sortThreadsByDate,
  flattenThreads,
  countTotalReplies,
  getThreadAuthors,
} from './comment-extended-handler';

// Header/Footer Handler - Header and footer content configuration
export {
  // Types
  type HeaderContentOptions,
  type FooterContentOptions,
  type DifferentFirstPageOptions,
  type DifferentOddEvenOptions,
  type HeaderFooterConfiguration,
  // Header creation
  createHeaderFromOptions,
  // Footer creation
  createFooterFromOptions,
  // Configuration functions
  applyDifferentFirstPage,
  applyDifferentOddEven,
  applyHeaderFooterConfiguration,
} from './header-footer-handler';

// Font Defaults - Document-level font and spacing configuration
export {
  // Types
  type FontDefaultsOptions,
  // Application functions
  applyFontDefaults,
  applyFontDefaultsToStylesManager,
  getFontDefaults,
  resetFontDefaults,
  // Presets
  createTimesNewRomanDefaults,
  createArialDefaults,
  createCalibreDefaults,
} from './font-defaults';

// T112: packages/selection - Block selection operations only (no persistent nodes)
// T113: packages/dnd - Node movement via Slate transforms (preserves structure)

// T110: packages/find-replace - Decoration-only search highlighting
// T111: packages/tabbable - Tab navigation behavior only

// ============================================================================
// UI-Only Packages (Verified: No Export Handler Needed)
// ============================================================================
// T106: packages/floating - UI positioning only (tooltips, popovers, floating toolbars).
//       Exports virtual elements, bounding rect utilities, and floating hooks.
//       No editor node types or persistent content.
// T107: packages/cursor - Cursor overlay decorations only.
//       Exports CursorOverlay component, cursor position hooks/queries.
//       No editor node types or persistent content.
// T108: packages/combobox - Temporary autocomplete UI only.
//       Provides withTriggerCombobox utility that creates transient inline input
//       nodes during editing. No persistent node types defined in the package itself.
// T109: packages/slash-command - Command palette UI only.
//       BaseSlashInputPlugin uses editOnly: true with inline void elements.
//       These nodes are transient (removed on command selection) and never persisted.

// ============================================================================
// T116: test-utils Package Verification
//
// Package: @platejs/test-utils (v52.0.10)
// Location: packages/test-utils/
// Dependencies: @platejs/slate, slate, slate-hyperscript
//
// FINDINGS:
//
// 1. Test Editor Creation Utilities:
//    - Exports `createEditor` (a higher-order function wrapping @platejs/slate's
//      createEditor) that produces Editor instances from JSX-like hyperscript
//      syntax. It resolves descendants, handles selection tokens (anchor/focus/
//      cursor), and returns a fully populated Editor object with children and
//      optional selection.
//    - Exports `createHyperscript` for building custom hyperscript factories
//      with element shorthands and custom creator functions.
//
// 2. Can It Create Test Editors for DOCX Export Testing?
//    YES. The package provides `jsx`, `jsxt`, and `hjsx` pre-configured
//    hyperscript factories with shorthands for all standard Plate element types:
//      - Paragraphs (hp), Headings (hh1-hh6), Lists (hul, hol, hli, hlic, hnli),
//        Tables (htable, htr, htd, hth), Blockquotes (hblockquote),
//        Code blocks (hcodeblock, hcodeline), Images (himg), Links (ha),
//        Mentions (hmention), Media (haudio, hvideo, hmediaembed),
//        Callouts (hcallout), Toggles (htoggle), TOC (htoc),
//        Equations (hequation, hinlineequation), Columns (hcolumn, hcolumngroup),
//        Dates (hdate), Excalidraw (hexcalidraw), and more.
//    These produce valid TElement/TText/Editor trees that can be fed directly
//    into the DOCX export pipeline as `editor.children` values.
//
// 3. Confirmed: Testing Utility Only
//    This is purely a testing utility package. It does NOT produce exportable
//    nodes at runtime. It provides hyperscript-based DSL for constructing
//    Slate document trees in test files. It has no DOCX, XML, or file I/O
//    capabilities.
//
// 4. Useful Utilities for Export Testing:
//    - `jsx` / `hjsx` / `jsxt`: Create document trees with concise JSX syntax,
//      ideal for building test fixtures for each element handler.
//    - `createDataTransfer`: Creates mock DataTransfer objects (useful if
//      testing paste-to-export round-trips).
//    - `getHtmlDocument`: Parses HTML strings into DOM Documents (useful for
//      testing the HTML parsing stage of the export pipeline).
//    - Element shorthands cover all standard Plate node types, ensuring
//      comprehensive test coverage for every handler in the adapters layer.
//
// VERDICT: @platejs/test-utils is the recommended way to build test fixtures
// for DOCX export tests. Use `jsx` to create editor value trees, then pass
// them through the export pipeline to verify handler output.
// ============================================================================

// ============================================================================
// T114: yjs Package Verification
// Package: @platejs/yjs (v52.0.13)
// Dependencies: @slate-yjs/core, yjs
//
// The yjs package provides collaborative editing via Yjs CRDTs. It works by:
// 1. Maintaining a Y.Doc with a Y.XmlText shared type that mirrors the Slate tree
// 2. Using @slate-yjs/core's withYjs() to bind the Yjs document to the Slate editor
// 3. Syncing changes bidirectionally: local Slate ops -> Yjs deltas, remote Yjs
//    events -> Slate ops
//
// VERIFICATION: The yjs binding is a transparent layer. The editor returned by
// withPlateYjs is typed as SlateEditor & YjsEditorProps - meaning the editor's
// `children` property (the document tree) remains a standard Slate Value (i.e.,
// an array of standard Slate/Plate element and text nodes). The Yjs layer adds
// sync methods (connect, disconnect, flushLocalChanges, etc.) but does NOT
// introduce any custom Yjs-specific node types into the Slate tree.
//
// CONCLUSION: By the time DOCX export runs (reading editor.children), the value
// is a normal Plate value. No special yjs node handling is needed in the export
// pipeline. The yjs package is purely a sync/collaboration infrastructure layer.
// No export handler required.
//
// T115: playwright Package Verification
// Package: @platejs/playwright (v52.0.11)
// Dependencies: @playwright/test (peer)
//
// The playwright package provides E2E testing utilities for Plate editors:
// 1. PlaywrightPlugin exposes editor internals to Playwright via
//    window.platePlaywrightAdapter (a WeakMap of editable DOM -> editor)
// 2. Helper functions: clickAtPath, getDOMNodeByPath, getNodeByPath,
//    getEditorHandle, getSelection, setSelection, getTypeAtPath
// 3. All utilities operate on Playwright JSHandle<PlateEditor> for test assertions
//
// VERIFICATION: This is purely a testing infrastructure package. It does not
// define any Slate node types, plugins, or document content. It provides browser
// automation helpers to interact with a Plate editor during Playwright tests.
// It could potentially be used to write E2E tests that validate DOCX export
// output (e.g., trigger export, download file, validate content), but that would
// be at the application test level, not within the docx-io library itself.
//
// CONCLUSION: No export handler required. This package produces no exportable
// nodes. It is a test-time utility only.
// ============================================================================

// ============================================================================
// T117: udecode Utilities Package Verification
//
// FINDING 1: Package Hierarchy
//   The project uses a layered package structure under the "udecode" org:
//   - `platejs` (packages/plate) — umbrella re-export package that re-exports:
//       * @platejs/core (packages/core) — plugin system, editor API
//       * @platejs/slate (packages/slate) — Slate types: TNode, TElement, TText, etc.
//       * @platejs/utils (packages/utils) — plate-keys (NODES constants),
//         plate-types (typed element interfaces like TCalloutElement, TCodeBlockElement),
//         and plugin definitions
//       * @udecode/utils (packages/udecode/utils) — low-level helpers:
//         escapeRegExp, findHtmlParentElement, hexToBase64, isUrl,
//         sanitizeUrl, mergeProps, type-utils, and UnknownObject type
//
// FINDING 2: Usage by Export Adapters
//   - slate-bridge.ts imports from @platejs/slate: TNode, TElement, TText,
//     Descendant, Ancestor, NodeOf, ElementOf, TextOf, NodeProps,
//     NodeApi, ElementApi, TextApi (runtime APIs for type guards/traversal)
//   - plate-bridge.ts imports from @platejs/slate: TElement, TNode, TText
//   - tracking-bridge.ts references @udecode/plate-suggestion and
//     @udecode/plate-comments for type compatibility (comment only, no import)
//   - exportTrackChanges.ts and types.ts import TNode/TText from 'platejs'
//     (the umbrella package)
//
// FINDING 3: Accessibility Confirmed
//   - `platejs` is declared as a peerDependency in docx-io/package.json (>=52.0.0)
//   - All workspace packages resolve correctly via node_modules:
//     * platejs -> dist available
//     * @platejs/slate -> dist available
//     * @platejs/utils -> dist available
//     * @udecode/utils -> dist available (via platejs re-export)
//   - The adapters correctly use @platejs/slate directly for Slate types
//     rather than the umbrella platejs package, which is the recommended
//     approach for targeted imports
//
// FINDING 4: Key Utilities Available via @udecode/utils
//   - escapeRegExp — regex escaping (could be useful for XML content)
//   - hexToBase64 — hex-to-base64 conversion (useful for image handling)
//   - isUrl / sanitizeUrl — URL validation (useful for link-handler)
//   - findHtmlParentElement — DOM traversal helper
//   - UnknownObject type — generic object typing
//   Note: The adapters already implement their own specialized versions of
//   some of these utilities (e.g., sanitizeUrl in link-handler.ts,
//   escapeXml in utils-bridge.ts), which is appropriate since the adapter
//   versions are DOCX-specific.
//
// CONCLUSION: All udecode/platejs utility packages are available and
// accessible from packages/docx-io. The adapter layer correctly imports
// Slate types from @platejs/slate and uses the platejs umbrella package
// only for top-level type imports. No missing dependencies detected.
// ============================================================================

// DOCX Bridge - Round-trip support connecting packages/docx import cleaner with export pipeline
export {
  // Types
  type ExportCleaningOptions,
  type ExportCleaningResult,
  type PostExportCleanupOptions,
  type DocxBridgeOptions,
  // Constants
  DEFAULT_EXPORT_CLEANING,
  DEFAULT_POST_EXPORT_CLEANUP,
  // Pre-conversion (HTML cleaning for export)
  cleanHtmlForExport,
  normalizeHtmlBeforeConversion,
  // Post-conversion (Document cleanup after generation)
  toCleanupOptions,
  createBridgeOptions,
} from './docx-bridge';

// Sanitization - UTF-8 normalization and XML character sanitization (T120, T121)
export {
  // Types
  type TextSanitizationOptions,
  type XmlSanitizationResult,
  // T120: UTF-8 Normalization
  normalizeUtf8,
  stripBOM,
  replaceNonBreakingSpaces,
  normalizeLineEndings,
  normalizeWhitespace,
  sanitizeTextForDocx,
  sanitizeTextWithOptions,
  // T121: XML Character Sanitization
  removeInvalidXmlChars as removeInvalidXmlCharsSanitize, // Aliased to avoid conflict with utils-bridge
  escapeXmlText,
  escapeXmlAttribute,
  sanitizeForXmlContent,
  sanitizeForXmlAttribute,
  isValidXmlChar,
  containsInvalidXmlChars,
  sanitizeWithReport,
  // Combined pipeline
  sanitizeForDocxExport,
} from './sanitization';

// Validation - Document validation and export warning collection
export {
  // T122: Document Validation Before Save
  type ValidationSeverity,
  type DocumentValidationIssue,
  type DocumentValidationResult,
  validateDocument,
  validateDocumentForExport,
  // T123: ExportWarning Collection System
  type ExportWarningLevel,
  type ExportWarning as ValidationExportWarning,
  type WarningCollectorOptions,
  WarningCollector,
  WARNING_CODES,
} from './validation';
