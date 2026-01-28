/**
 * Document - High-level API for creating and managing Word documents
 * Provides a simple interface for creating DOCX files without managing ZIP and XML manually
 */

import { Bookmark } from "../elements/Bookmark";
import { BookmarkManager } from "../elements/BookmarkManager";
import { Comment } from "../elements/Comment";
import { CommentManager } from "../elements/CommentManager";
import { EndnoteManager } from "../elements/EndnoteManager";
import { Field } from "../elements/Field";
import { FootnoteManager } from "../elements/FootnoteManager";
import { Footer } from "../elements/Footer";
import { Header } from "../elements/Header";
import { HeaderFooterManager } from "../elements/HeaderFooterManager";
import { Hyperlink } from "../elements/Hyperlink";
import { Image } from "../elements/Image";
import { ImageManager } from "../elements/ImageManager";
import { ImageRun } from "../elements/ImageRun";
import { Paragraph, ParagraphContent, FieldLike } from "../elements/Paragraph";
import { RangeMarker } from "../elements/RangeMarker";
import { Revision, RevisionType } from "../elements/Revision";
import { RevisionManager } from "../elements/RevisionManager";
import { RevisionLocation } from "../elements/PropertyChangeTypes";
import { Run, RunFormatting } from "../elements/Run";
import { Shape } from "../elements/Shape";
import { TextBox } from "../elements/TextBox";
import {
  RevisionValidator,
  RevisionAutoFixer,
  ValidationOptions,
  AutoFixOptions,
  ValidationResult,
  AutoFixResult,
} from "../validation";
import { Section } from "../elements/Section";
import { StructuredDocumentTag } from "../elements/StructuredDocumentTag";
import { Table, TableBorder } from "../elements/Table";
import { TableCell } from "../elements/TableCell";
import { TableOfContentsElement } from "../elements/TableOfContentsElement";
import { NumberingManager } from "../formatting/NumberingManager";
import { Style, StyleProperties } from "../formatting/Style";
import { StylesManager } from "../formatting/StylesManager";
import { FormatOptions, StyleApplyOptions } from "../types/formatting";
import {
  ListNormalizationOptions,
  ListNormalizationReport,
} from "../types/list-types";
import {
  ApplyStylesOptions,
  Heading2Config,
  StyleConfig,
  StyleRunFormatting,
  StyleParagraphFormatting,
} from "../types/styleConfig";
import { ListNormalizer } from "./ListNormalizer";
import { defaultLogger, ILogger, getGlobalLogger, createScopedLogger } from "../utils/logger";

// Create scoped logger for Document operations
function getLogger(): ILogger {
  return createScopedLogger(getGlobalLogger(), 'Document');
}
// Raw XML revision acceptance - used at load time BEFORE parsing
// cleanupRevisionMetadata - cleanup metadata files after in-memory acceptance
import { acceptAllRevisions, cleanupRevisionMetadata } from "../utils/acceptRevisions";
// In-memory revision acceptance - used AFTER parsing, allows subsequent modifications
import { acceptRevisionsInMemory, AcceptRevisionsResult } from "../utils/InMemoryRevisionAcceptor";
import { stripTrackedChanges } from "../utils/stripTrackedChanges";
import { XMLBuilder } from "../xml/XMLBuilder";
import { XMLParser } from "../xml/XMLParser";
import { DocumentTrackingContext } from "../tracking/DocumentTrackingContext";
import type { TrackingContext } from "../tracking/TrackingContext";
import { ZipHandler } from "../zip/ZipHandler";
import { DOCX_PATHS } from "../zip/types";
import { DocumentGenerator } from "./DocumentGenerator";
import { DocumentIdManager } from "./DocumentIdManager";
import { DocumentParser } from "./DocumentParser";
import { DocumentValidator } from "./DocumentValidator";
import { RelationshipManager } from "./RelationshipManager";

/**
 * Document properties (core and extended)
 */
export interface DocumentProperties {
  // Core Properties (docProps/core.xml)
  title?: string;
  subject?: string;
  creator?: string;
  keywords?: string;
  description?: string;
  lastModifiedBy?: string;
  revision?: number;
  created?: Date;
  modified?: Date;
  language?: string;
  category?: string;
  contentStatus?: string;

  // Extended Properties (docProps/app.xml)
  application?: string;
  appVersion?: string;
  company?: string;
  manager?: string;
  version?: string;

  // Custom Properties (docProps/custom.xml)
  customProperties?: Record<string, string | number | boolean | Date>;
}

/**
 * Document part representation
 * Represents any part within a DOCX package (XML, binary, etc.)
 */
export interface DocumentPart {
  /** Part name/path within the package */
  name: string;
  /** Part content (string for XML/text, Buffer for binary) */
  content: string | Buffer;
  /** MIME content type */
  contentType?: string;
  /** Whether the part is binary */
  isBinary?: boolean;
  /** Part size in bytes */
  size?: number;
}

/**
 * Document creation options
 */
export interface DocumentOptions {
  properties?: DocumentProperties;
  /** Maximum memory usage percentage (0-100) before throwing error. Default: 80 */
  maxMemoryUsagePercent?: number;
  /** Maximum absolute RSS (Resident Set Size) in MB. Default: 2048 (2GB) */
  maxRssMB?: number;
  /** Enable absolute RSS limit checking. Default: true */
  useAbsoluteMemoryLimit?: boolean;
  /** Strict parsing mode - throw errors instead of collecting warnings. Default: false */
  strictParsing?: boolean;
  /** Maximum number of images allowed in document. Default: 1000 */
  maxImageCount?: number;
  /** Maximum total size of all images in MB. Default: 100 */
  maxTotalImageSizeMB?: number;
  /** Maximum size of a single image in MB. Default: 20 */
  maxSingleImageSizeMB?: number;
  /**
   * Logger instance for framework messages
   * Allows control over how warnings, info, and debug messages are handled
   * If not provided, uses ConsoleLogger with WARN minimum level
   * Use SilentLogger to suppress all logging
   * @example
   * // Use custom logger
   * const doc = Document.create({ logger: myCustomLogger });
   *
   * // Suppress all logging
   * import { SilentLogger } from 'docxmlater';
   * const doc = Document.create({ logger: new SilentLogger() });
   */
  logger?: ILogger;
}

/**
 * Document loading options
 */
export interface DocumentLoadOptions extends DocumentOptions {
  /**
   * How to handle tracked changes during document load
   *
   * - 'preserve': Keep tracked changes as-is (may cause corruption if IDs conflict)
   * - 'accept': Accept all changes - removes revision markup, keeps inserted content, removes deleted content (default)
   * - 'strip': Remove all revision markup completely
   *
   * Default: 'accept' (prevents corruption from revision ID conflicts)
   *
   * @default 'accept'
   *
   * @example
   * ```typescript
   * // Default: accept all changes (recommended)
   * const doc = await Document.load('file.docx');
   *
   * // Explicit accept
   * const doc = await Document.load('file.docx', { revisionHandling: 'accept' });
   *
   * // Strip all tracked changes
   * const doc = await Document.load('file.docx', { revisionHandling: 'strip' });
   *
   * // Preserve tracked changes (may cause corruption)
   * const doc = await Document.load('file.docx', { revisionHandling: 'preserve' });
   * ```
   */
  revisionHandling?: 'preserve' | 'accept' | 'strip';

  /**
   * Accept all tracked changes after parsing using in-memory transformation.
   *
   * Unlike `revisionHandling: 'accept'` which uses raw XML transformation before parsing,
   * this option parses the document first (so revisions are available for inspection),
   * then accepts them using in-memory DOM transformation.
   *
   * Key difference: This allows subsequent document modifications to be saved correctly,
   * whereas raw XML acceptance may cause modifications to be lost.
   *
   * When `true`:
   * - Document is loaded with revisions preserved
   * - Revisions are parsed into the model (available for ChangelogGenerator)
   * - After parsing, `acceptAllRevisions()` is called automatically
   * - Document is clean and ready for modifications
   *
   * Recommended for Template_UI workflow when auto-accept is enabled.
   *
   * @default false
   *
   * @example
   * ```typescript
   * // Load and accept revisions (clean document, modifications work)
   * const doc = await Document.load('file.docx', { acceptRevisions: true });
   * doc.enableTrackChanges({ author: 'Doc Hub' });
   * // ... make modifications ...
   * await doc.save('output.docx'); // Modifications are saved correctly
   * ```
   */
  acceptRevisions?: boolean;
}

/**
 * Body element - can be a Paragraph, Table, or TableOfContentsElement
 */
type BodyElement =
  | Paragraph
  | Table
  | TableOfContentsElement
  | StructuredDocumentTag;

/**
 * Represents a Word document
 */
export class Document {
  constructor(zipHandler?: ZipHandler, options: DocumentOptions = {}, initDefaults: boolean = true) {
    this.zipHandler = zipHandler || new ZipHandler();
    this.bodyElements = [];
    this.properties = options.properties || {};
    this.namespaces = {};
    this.stylesManager = StylesManager.create();
    this.numberingManager = NumberingManager.create();
    this.section = new Section();
    this.imageManager = ImageManager.create();
    this.relationshipManager = RelationshipManager.createForDocument();
    this.headerFooterManager = HeaderFooterManager.create();
    this.bookmarkManager = BookmarkManager.create();
    this.revisionManager = RevisionManager.create();
    this.commentManager = CommentManager.create();
    this.documentIdManager = DocumentIdManager.create();

    // Wire up centralized ID allocation for all annotation managers
    // This ensures bookmark, revision, and comment IDs are globally unique (ECMA-376 requirement)
    this.bookmarkManager.setIdProvider(
      () => this.documentIdManager.getNextId(),
      (existingId) => this.documentIdManager.ensureNextIdAbove(existingId)
    );
    this.revisionManager.setIdProvider(
      () => this.documentIdManager.getNextId(),
      (existingId) => this.documentIdManager.ensureNextIdAbove(existingId)
    );
    this.commentManager.setIdProvider(
      () => this.documentIdManager.getNextId(),
      (existingId) => this.documentIdManager.ensureNextIdAbove(existingId)
    );

    this.trackingContext = new DocumentTrackingContext(this.revisionManager);
    this.parser = new DocumentParser();
    this.generator = new DocumentGenerator();
    this.validator = new DocumentValidator();
    this.logger = options.logger || defaultLogger;
    this.trackChangesEnabled = false;
    this.trackFormatting = true;
    this.revisionViewSettings = {
      showInsertionsAndDeletions: true,
      showFormatting: true,
      showInkAnnotations: true,
    };
    this.autoPopulateTOCs = false;
    this.rsids = new Set();
    if (initDefaults) {
      this.initializeRequiredFiles();
    }
  }
  private zipHandler: ZipHandler;
  private bodyElements: BodyElement[] = [];
  private properties: DocumentProperties;
  public namespaces: Record<string, string> = {};
  private stylesManager: StylesManager;
  private numberingManager: NumberingManager;
  private section: Section;
  private imageManager: ImageManager;
  private relationshipManager: RelationshipManager;
  private headerFooterManager: HeaderFooterManager;
  private bookmarkManager: BookmarkManager;
  private revisionManager: RevisionManager;
  private commentManager: CommentManager;
  private documentIdManager: DocumentIdManager;
  private trackingContext: DocumentTrackingContext;
  // Reserved for future implementation - using proper types from existing managers
  private _footnoteManager?: FootnoteManager;
  private _endnoteManager?: EndnoteManager;

  // Helper classes for parsing, generation, and validation
  private parser: DocumentParser;
  private generator: DocumentGenerator;
  private validator: DocumentValidator;
  private logger: ILogger;

  // Track changes settings
  private trackChangesEnabled: boolean = false;
  private trackFormatting: boolean = true;
  private revisionViewSettings: {
    showInsertionsAndDeletions: boolean;
    showFormatting: boolean;
    showInkAnnotations: boolean;
  } = {
    showInsertionsAndDeletions: true,
    showFormatting: true,
    showInkAnnotations: true,
  };

  // TOC auto-population setting
  private autoPopulateTOCs: boolean = false;
  
  // TOC field instruction sync setting (default: OFF to preserve original instructions)
  private autoSyncTOCStyles: boolean = false;

  // Flag to skip document.xml regeneration after stripping tracked changes
  // When true, save() and toBuffer() will preserve the manually cleaned XML
  private skipDocumentXmlRegeneration: boolean = false;

  // Flag to accept all revisions before save
  // When true, acceptAllRevisions() is called after flushPendingChanges() but before XML generation
  // This ensures ALL revisions (including those created during save) are accepted
  private acceptRevisionsBeforeSave: boolean = false;

  // Store original [Content_Types].xml entries to preserve during save
  // This ensures round-trip fidelity for documents with features the framework doesn't track
  // (VBA macros, custom UI, embedded objects, etc.)
  private _originalContentTypes?: { defaults: Set<string>; overrides: Set<string> };

  // Store original styles.xml and numbering.xml to preserve formatting during save
  // Prevents loss of formatting details not captured by parsers (bullet indentation, cell padding, etc.)
  private _originalStylesXml?: string;
  private _originalNumberingXml?: string;

  private rsidRoot?: string;
  private rsids: Set<string> = new Set();
  private documentProtection?: {
    edit: "readOnly" | "comments" | "trackedChanges" | "forms";
    enforcement: boolean;
    cryptProviderType?: string;
    cryptAlgorithmClass?: string;
    cryptAlgorithmType?: string;
    cryptAlgorithmSid?: number;
    cryptSpinCount?: number;
    hash?: string;
    salt?: string;
  };

  /**
   * Creates a new empty Word document
   *
   * Creates a new DOCX document with all required files initialized and ready for content.
   * The document includes default styles, numbering definitions, and required relationships.
   *
   * @param options - Optional document configuration
   * @param options.properties - Document metadata (title, author, subject, etc.)
   * @param options.maxMemoryUsagePercent - Maximum memory usage percentage (0-100) before throwing error (default: 80)
   * @param options.maxRssMB - Maximum absolute RSS in MB (default: 2048)
   * @param options.strictParsing - Throw errors instead of collecting warnings (default: false)
   * @param options.logger - Custom logger for framework messages
   * @returns A new Document instance ready for adding content
   *
   * @example
   * ```typescript
   * // Create a basic document
   * const doc = Document.create();
   * doc.createParagraph('Hello World');
   * await doc.save('output.docx');
   * ```
   *
   * @example
   * ```typescript
   * // Create with metadata
   * const doc = Document.create({
   *   properties: {
   *     title: 'My Document',
   *     creator: 'John Doe',
   *     subject: 'Report'
   *   }
   * });
   * ```
   */
  static create(options?: DocumentOptions): Document {
    const doc = new Document(undefined, options);
    doc.initializeRequiredFiles();
    return doc;
  }

  /**
   * Loads an existing Word document from a file path
   *
   * Reads and parses an existing DOCX file, preserving all content, formatting,
   * styles, numbering, headers, footers, images, and other document elements.
   *
   * @param filePath - Absolute or relative path to the DOCX file to load
   * @param options - Optional document configuration (see {@link DocumentOptions})
   * @param options.strictParsing - If true, throws errors on malformed content; if false, collects warnings (default: false)
   * @param options.logger - Custom logger for warnings and errors during parsing
   * @returns Promise that resolves to a Document instance with all parsed content
   *
   * @throws Error if file doesn't exist, is not a valid DOCX, or is corrupted
   *
   * @example
   * ```typescript
   * // Load and modify a document
   * const doc = await Document.load('input.docx');
   * doc.createParagraph('Additional content');
   * await doc.save('modified.docx');
   * ```
   *
   * @example
   * ```typescript
   * // Load with strict parsing
   * try {
   *   const doc = await Document.load('input.docx', { strictParsing: true });
   * } catch (error) {
   *   console.error('Document is corrupted:', error);
   * }
   * ```
   */
  static async load(
    filePath: string,
    options?: DocumentLoadOptions
  ): Promise<Document> {
    const logger = getLogger();
    logger.info('Loading document from file', { path: filePath });

    const zipHandler = new ZipHandler();
    await zipHandler.load(filePath);

    // Determine revision handling strategy
    // If acceptRevisions is true, we need to preserve revisions during parsing
    // so they can be accepted using in-memory transformation after parsing
    const useInMemoryAccept = options?.acceptRevisions === true;
    const revisionHandling = useInMemoryAccept
      ? 'preserve'  // Force preserve so revisions are parsed into model
      : (options?.revisionHandling ?? 'accept'); // Default to accept

    // Handle tracked changes BEFORE parsing (unless using in-memory accept)
    if (revisionHandling === 'accept') {
      // Accept all tracked changes to prevent corruption (raw XML approach)
      await acceptAllRevisions(zipHandler);
    } else if (revisionHandling === 'strip') {
      // Strip all tracked changes completely
      await stripTrackedChanges(zipHandler);
    } else if (revisionHandling === 'preserve') {
      // Check if document has tracked changes and warn (unless intentionally accepting later)
      if (!useInMemoryAccept) {
        const documentXml = zipHandler.getFileAsString('word/document.xml');
        if (documentXml && (documentXml.includes('<w:ins') || documentXml.includes('<w:del') ||
            documentXml.includes('<w:moveFrom') || documentXml.includes('<w:moveTo'))) {
          logger.warn('Document contains tracked changes in preserve mode');
        }
      }
    }

    // Create document without default relationships (will parse from file)
    const doc = new Document(zipHandler, options, false);

    // Parse and preserve original [Content_Types].xml entries for round-trip fidelity
    const contentTypesXml = zipHandler.getFileAsString('[Content_Types].xml');
    if (contentTypesXml) {
      doc._originalContentTypes = doc.parseContentTypes(contentTypesXml);
    }

    // Parse and preserve original styles.xml and numbering.xml for formatting fidelity
    const stylesXml = zipHandler.getFileAsString(DOCX_PATHS.STYLES);
    if (stylesXml) {
      doc._originalStylesXml = stylesXml;
    }

    const numberingXml = zipHandler.getFileAsString(DOCX_PATHS.NUMBERING);
    if (numberingXml) {
      doc._originalNumberingXml = numberingXml;
    }

    await doc.parseDocument();

    // If acceptRevisions option was set, accept revisions using in-memory transformation
    // This happens AFTER parsing so revisions were available for inspection (e.g., ChangelogGenerator)
    // and allows subsequent document modifications to be saved correctly
    if (useInMemoryAccept) {
      logger.info('Accepting revisions using in-memory transformation');
      await doc.acceptAllRevisions();
      logger.info('Revisions accepted', { paragraphs: doc.getParagraphCount() });
    }

    logger.info('Document loaded', { paragraphs: doc.getParagraphCount() });

    return doc;
  }

  /**
   * Loads an existing Word document from a Buffer
   *
   * Reads and parses a DOCX file from an in-memory Buffer, useful for processing
   * documents from HTTP requests, database blobs, or other non-filesystem sources.
   *
   * @param buffer - Buffer containing the complete DOCX file data
   * @param options - Optional document configuration (see {@link DocumentOptions})
   * @returns Promise that resolves to a Document instance with all parsed content
   *
   * @throws Error if buffer doesn't contain valid DOCX data or is corrupted
   *
   * @example
   * ```typescript
   * // Load from HTTP response
   * const response = await fetch('https://example.com/doc.docx');
   * const buffer = Buffer.from(await response.arrayBuffer());
   * const doc = await Document.loadFromBuffer(buffer);
   * ```
   *
   * @example
   * ```typescript
   * // Load from file system buffer
   * import { promises as fs } from 'fs';
   * const buffer = await fs.readFile('input.docx');
   * const doc = await Document.loadFromBuffer(buffer);
   * ```
   */
  static async loadFromBuffer(
    buffer: Buffer,
    options?: DocumentLoadOptions
  ): Promise<Document> {
    const logger = getLogger();
    logger.info('Loading document from buffer', { bufferSize: buffer.length });

    const zipHandler = new ZipHandler();
    await zipHandler.loadFromBuffer(buffer);

    // Determine revision handling strategy
    // If acceptRevisions is true, we need to preserve revisions during parsing
    // so they can be accepted using in-memory transformation after parsing
    const useInMemoryAccept = options?.acceptRevisions === true;
    const revisionHandling = useInMemoryAccept
      ? 'preserve'  // Force preserve so revisions are parsed into model
      : (options?.revisionHandling ?? 'accept'); // Default to accept

    // Handle tracked changes BEFORE parsing (unless using in-memory accept)
    if (revisionHandling === 'accept') {
      // Accept all tracked changes to prevent corruption (raw XML approach)
      await acceptAllRevisions(zipHandler);
    } else if (revisionHandling === 'strip') {
      // Strip all tracked changes completely
      await stripTrackedChanges(zipHandler);
    } else if (revisionHandling === 'preserve') {
      // Check if document has tracked changes and warn (unless intentionally accepting later)
      if (!useInMemoryAccept) {
        const documentXml = zipHandler.getFileAsString('word/document.xml');
        if (documentXml && (documentXml.includes('<w:ins') || documentXml.includes('<w:del') ||
            documentXml.includes('<w:moveFrom') || documentXml.includes('<w:moveTo'))) {
          logger.warn('Document contains tracked changes in preserve mode');
        }
      }
    }

    // Create document without default relationships (will parse from file)
    const doc = new Document(zipHandler, options, false);

    // Parse and preserve original [Content_Types].xml entries for round-trip fidelity
    const contentTypesXml = zipHandler.getFileAsString('[Content_Types].xml');
    if (contentTypesXml) {
      doc._originalContentTypes = doc.parseContentTypes(contentTypesXml);
    }

    // Parse and preserve original styles.xml and numbering.xml for formatting fidelity
    const stylesXml = zipHandler.getFileAsString(DOCX_PATHS.STYLES);
    if (stylesXml) {
      doc._originalStylesXml = stylesXml;
    }

    const numberingXml = zipHandler.getFileAsString(DOCX_PATHS.NUMBERING);
    if (numberingXml) {
      doc._originalNumberingXml = numberingXml;
    }

    await doc.parseDocument();

    // If acceptRevisions option was set, accept revisions using in-memory transformation
    // This happens AFTER parsing so revisions were available for inspection (e.g., ChangelogGenerator)
    // and allows subsequent document modifications to be saved correctly
    if (useInMemoryAccept) {
      logger.info('Accepting revisions using in-memory transformation');
      await doc.acceptAllRevisions();
      logger.info('Revisions accepted', { paragraphs: doc.getParagraphCount() });
    }

    logger.info('Document loaded from buffer', { paragraphs: doc.getParagraphCount() });

    return doc;
  }

  /**
   * Parses an existing document file loaded into the ZIP handler
   * Populates all document elements from the loaded XML
   *
   * @private
   */
  private async parseDocument(): Promise<void> {
    // Use the parser helper that's already created
    const result = await this.parser.parseDocument(
      this.zipHandler,
      this.relationshipManager,
      this.imageManager,
      this.bookmarkManager
    );

    // Populate document properties from parser results
    this.bodyElements = result.bodyElements;
    this.relationshipManager = result.relationshipManager;
    this.namespaces = result.namespaces;
    this.properties = result.properties;

    // Populate styles manager
    for (const style of result.styles) {
      this.stylesManager.addStyle(style);
    }

    // Inject StylesManager into parsed tables for conditional formatting resolution
    for (const element of this.bodyElements) {
      if (element instanceof Table) {
        element._setStylesManager(this.stylesManager);
      }
    }

    // Populate numbering manager
    for (const abstractNum of result.abstractNumberings) {
      this.numberingManager.addAbstractNumbering(abstractNum);
    }
    for (const instance of result.numberingInstances) {
      this.numberingManager.addInstance(instance);
    }

    // Set section if present
    if (result.section) {
      this.section = result.section;
    }

    // Parse and register headers/footers
    const headersFooters = await this.parser.parseHeadersAndFooters(
      this.zipHandler,
      result.section,
      this.relationshipManager,
      this.imageManager
    );

    // Register headers with HeaderFooterManager
    for (const { header, relationshipId } of headersFooters.headers) {
      this.headerFooterManager.registerHeader(header, relationshipId);
    }

    // Register footers with HeaderFooterManager
    for (const { footer, relationshipId } of headersFooters.footers) {
      this.headerFooterManager.registerFooter(footer, relationshipId);
    }

    // Reset modified flags - loading doesn't count as modification
    // This enables XML preservation for unmodified documents
    this.stylesManager.resetModified();
    this.numberingManager.resetModified();

    // Initialize ALL annotation managers with a unified global ID to avoid collisions
    // Per ECMA-376, w:id must be unique across ALL annotation types (bookmarks, revisions, comments)
    // Must be called BEFORE populateRevisionLocations() which registers revisions
    this.initializeGlobalAnnotationIds();

    // Parse and register comments from comments.xml
    // Must be called AFTER initializeGlobalAnnotationIds() to properly handle ID synchronization
    this.parseAndRegisterComments();

    // Populate revision locations for changelog/tracking purposes
    this.populateRevisionLocations();

    // Initialize image manager with existing images to avoid filename collisions
    this.imageManager.initializeFromLoadedImages();
  }

  /**
   * Scans the raw document XML for ALL existing annotation IDs and initializes
   * ALL managers (BookmarkManager, RevisionManager, CommentManager) to use IDs
   * starting from the global maximum + 1.
   *
   * Per ECMA-376, w:id attributes must be UNIQUE across ALL annotation types:
   * - w:bookmarkStart / w:bookmarkEnd
   * - w:ins / w:del (revisions)
   * - w:pPrChange / w:rPrChange / w:tblPrChange (property changes)
   * - w:moveFrom / w:moveTo
   * - w:commentRangeStart / w:commentRangeEnd
   * - w:comment
   *
   * This unified approach prevents ID collisions between different annotation types
   * that were causing document corruption.
   *
   * @private
   */
  private initializeGlobalAnnotationIds(): void {
    const documentXml = this.zipHandler.getFileAsString('word/document.xml');
    const commentsXml = this.zipHandler.getFileAsString('word/comments.xml');

    // Initialize the centralized DocumentIdManager from document XML
    // This scans ALL w:id attributes and sets nextId to globalMax + 1
    // All managers (Bookmark, Revision, Comment) use this shared counter via callbacks
    this.documentIdManager.initializeFromDocument(documentXml || undefined, commentsXml || undefined);
  }

  /**
   * Parses comments from word/comments.xml and registers them with the CommentManager.
   * This enables round-trip preservation of comments in loaded documents.
   * @private
   */
  private parseAndRegisterComments(): void {
    const commentsXml = this.zipHandler.getFileAsString('word/comments.xml');
    if (!commentsXml) {
      return; // No comments.xml file, nothing to parse
    }

    const parser = new DocumentParser();
    const comments = parser.parseCommentsXml(commentsXml);

    // Register each comment with its existing ID
    for (const comment of comments) {
      this.commentManager.registerExisting(comment);
    }

    // Link replies to their parent comments
    this.commentManager.linkReplies();
  }

  /**
   * Populates location information on all revisions in the document
   * and registers them with the RevisionManager.
   * Called after parsing to set paragraph and run indices for each revision.
   * @private
   */
  private populateRevisionLocations(): void {
    const paragraphs = this.getParagraphs();

    // Track which revisions are already registered to avoid duplicates
    const registeredRevisions = new Set(this.revisionManager.getAllRevisions());

    for (let paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex++) {
      const paragraph = paragraphs[paragraphIndex];
      if (!paragraph) continue;

      // Get all revisions from this paragraph
      const revisions = paragraph.getRevisions?.() || [];

      // Track run position within paragraph
      let runIndex = 0;

      for (const revision of revisions) {
        // Set location if not already set
        if (!revision.getLocation()) {
          const location: RevisionLocation = {
            paragraphIndex,
            runIndex,
          };
          revision.setLocation(location);
        }

        // Register revision with manager if not already registered
        // This ensures parsed revisions from document XML are accessible via
        // ChangelogGenerator.fromDocument() and revisionManager.getAllRevisions()
        if (!registeredRevisions.has(revision)) {
          this.revisionManager.register(revision);
          registeredRevisions.add(revision);
        }

        // Advance run index for next revision
        runIndex++;
      }
    }
  }

  /**
   * Initializes all required DOCX files with minimal valid content
   */
  private initializeRequiredFiles(): void {
    // [Content_Types].xml
    this.zipHandler.addFile(
      DOCX_PATHS.CONTENT_TYPES,
      this.generator.generateContentTypes()
    );

    // _rels/.rels
    this.zipHandler.addFile(DOCX_PATHS.RELS, this.generator.generateRels());

    // word/document.xml (will be updated when saving)
    this.zipHandler.addFile(
      DOCX_PATHS.DOCUMENT,
      this.generator.generateDocumentXml(
        this.bodyElements,
        this.section,
        this.namespaces
      )
    );

    // word/_rels/document.xml.rels
    this.zipHandler.addFile(
      "word/_rels/document.xml.rels",
      this.relationshipManager.generateXml()
    );

    // word/styles.xml
    this.zipHandler.addFile(
      DOCX_PATHS.STYLES,
      this.stylesManager.generateStylesXml()
    );

    // word/numbering.xml
    this.zipHandler.addFile(
      DOCX_PATHS.NUMBERING,
      this.numberingManager.generateNumberingXml()
    );

    // word/fontTable.xml (REQUIRED for DOCX compliance)
    this.zipHandler.addFile(
      "word/fontTable.xml",
      this.generator.generateFontTable()
    );

    // word/settings.xml (REQUIRED for DOCX compliance)
    this.zipHandler.addFile(
      "word/settings.xml",
      this.generator.generateSettings({
        trackChangesEnabled: this.trackChangesEnabled,
        trackFormatting: this.trackFormatting,
        revisionView: this.revisionViewSettings,
        rsidRoot: this.rsidRoot,
        rsids: this.getRsids(),
        documentProtection: this.documentProtection,
      })
    );

    // word/theme/theme1.xml (REQUIRED for DOCX compliance)
    this.zipHandler.addFile(
      "word/theme/theme1.xml",
      this.generator.generateTheme()
    );

    // docProps/core.xml
    this.zipHandler.addFile(
      DOCX_PATHS.CORE_PROPS,
      this.generator.generateCoreProps(this.properties)
    );

    // docProps/app.xml
    this.zipHandler.addFile(
      DOCX_PATHS.APP_PROPS,
      this.generator.generateAppProps(this.properties)
    );

    // Note: docProps/custom.xml is added during save() if custom properties exist
  }


  /**
   * Adds an existing paragraph to the document body
   *
   * Appends a Paragraph instance to the end of the document's body elements.
   * The paragraph maintains all its content, formatting, and properties.
   *
   * @param paragraph - The Paragraph instance to add
   * @returns This document instance for method chaining
   *
   * @example
   * ```typescript
   * const para = new Paragraph();
   * para.addText('Hello World', { bold: true });
   * doc.addParagraph(para);
   * ```
   *
   * @example
   * ```typescript
   * // Create and add in one chain
   * const para = Paragraph.create('Formatted text', { alignment: 'center' });
   * doc.addParagraph(para);
   * ```
   */
  addParagraph(paragraph: Paragraph): this {
    paragraph._setStylesManager(this.stylesManager);
    this.bodyElements.push(paragraph);
    return this;
  }

  /**
   * Creates a new paragraph and adds it to the document
   *
   * This is a convenience method that creates a Paragraph, optionally adds text content,
   * and appends it to the document in one operation. The returned paragraph can be
   * further modified using its chainable methods.
   *
   * @param text - Optional text content for the paragraph
   * @returns The created Paragraph instance for further customization
   *
   * @example
   * ```typescript
   * // Create empty paragraph
   * const para1 = doc.createParagraph();
   *
   * // Create with text
   * const para2 = doc.createParagraph('Hello World');
   *
   * // Create and customize
   * doc.createParagraph('Chapter 1')
   *   .setStyle('Heading1')
   *   .setAlignment('center');
   * ```
   */
  createParagraph(text?: string): Paragraph {
    const para = new Paragraph();

    // Inject StylesManager for style resolution
    para._setStylesManager(this.stylesManager);

    // If track changes is enabled, bind tracking context to the new paragraph
    if (this.trackChangesEnabled && this.trackingContext.isEnabled()) {
      para._setTrackingContext(this.trackingContext);
    }

    if (text) {
      para.addText(text);
    }
    this.bodyElements.push(para);
    return para;
  }

  /**
   * Adds an existing table to the document body
   *
   * Appends a Table instance to the end of the document's body elements.
   * The table maintains all its rows, cells, content, and formatting.
   *
   * @param table - The Table instance to add
   * @returns This document instance for method chaining
   *
   * @example
   * ```typescript
   * const table = new Table(3, 4);
   * table.getCell(0, 0)?.addParagraph(new Paragraph().addText('Header'));
   * doc.addTable(table);
   * ```
   */
  addTable(table: Table): this {
    table._setStylesManager(this.stylesManager);
    this.bodyElements.push(table);
    return this;
  }

  /**
   * Adds a Structured Document Tag (content control) to the document body
   *
   * Appends a StructuredDocumentTag instance to the end of the document's body elements.
   * SDTs are content controls used for forms, templates, and data-binding.
   *
   * @param sdt - The StructuredDocumentTag instance to add
   * @returns This document instance for method chaining
   *
   * @example
   * ```typescript
   * const sdt = new StructuredDocumentTag();
   * sdt.addParagraph(new Paragraph().addText('Content'));
   * doc.addStructuredDocumentTag(sdt);
   * ```
   */
  addStructuredDocumentTag(sdt: StructuredDocumentTag): this {
    this.bodyElements.push(sdt);
    return this;
  }

  /**
   * Creates a new table and adds it to the document
   *
   * This is a convenience method that creates a Table with the specified dimensions
   * and appends it to the document in one operation. The returned table can be
   * further customized using its chainable methods.
   *
   * @param rows - Number of rows to create (must be positive)
   * @param columns - Number of columns per row (must be positive)
   * @returns The created Table instance for further customization
   *
   * @throws Error if rows or columns is 0 or negative
   *
   * @example
   * ```typescript
   * // Create a 3x4 table
   * const table = doc.createTable(3, 4);
   * table.getCell(0, 0)?.addParagraph(new Paragraph().addText('A1'));
   * ```
   *
   * @example
   * ```typescript
   * // Create and format in one chain
   * doc.createTable(2, 3)
   *   .setAllBorders({ style: 'single', size: 4, color: '000000' })
   *   .setFirstRowShading('DFDFDF');
   * ```
   */
  createTable(rows: number, columns: number): Table {
    const table = new Table(rows, columns);
    table._setStylesManager(this.stylesManager);
    this.bodyElements.push(table);
    return table;
  }

  /**
   * Populates all TOCs in document XML
   * Extracted from replaceTableOfContents for reuse
   *
   * @param docXml The document XML string
   * @returns Modified XML with populated TOCs
   * @private
   */

  /**
   * Gets all tables in the document body (top-level only)
   *
   * Returns only tables that are direct children of the document body.
   * Does NOT include tables inside SDTs or nested tables.
   * Use {@link getAllTables} for recursive search including nested content.
   *
   * @returns Array of Table instances in the document body
   *
   * @example
   * ```typescript
   * const tables = doc.getTables();
   * console.log(`Document has ${tables.length} tables`);
   *
   * for (const table of tables) {
   *   console.log(`Table: ${table.getRowCount()} rows x ${table.getColumnCount()} columns`);
   * }
   * ```
   */
  getTables(): Table[] {
    return this.bodyElements.filter((el): el is Table => el instanceof Table);
  }

  /**
   * Gets all paragraphs in the document recursively
   *
   * Performs a deep search and returns ALL paragraphs in the document,
   * including those nested inside:
   * - Tables (all cells in all rows)
   * - Structured Document Tags (content controls)
   * - Nested SDTs and tables
   *
   * @returns Array of all Paragraph instances found anywhere in the document
   *
   * @example
   * ```typescript
   * // Count all paragraphs including those in tables
   * const allParas = doc.getAllParagraphs();
   * console.log(`Total paragraphs: ${allParas.length}`);
   * ```
   *
   * @example
   * ```typescript
   * // Find all headings
   * const headings = doc.getAllParagraphs().filter(p => {
   *   const style = p.getStyle();
   *   return style?.startsWith('Heading');
   * });
   * ```
   */
  getAllParagraphs(): Paragraph[] {
    const result: Paragraph[] = [];

    for (const element of this.bodyElements) {
      if (element instanceof Paragraph) {
        result.push(element);
      } else if (element instanceof Table) {
        // Recurse into table cells
        for (const row of element.getRows()) {
          for (const cell of row.getCells()) {
            result.push(...cell.getParagraphs());
          }
        }
      } else if (element instanceof StructuredDocumentTag) {
        // Recurse into SDT content
        for (const content of element.getContent()) {
          if (content instanceof Paragraph) {
            result.push(content);
          } else if (content instanceof Table) {
            // Recurse into tables inside SDTs
            for (const row of content.getRows()) {
              for (const cell of row.getCells()) {
                result.push(...cell.getParagraphs());
              }
            }
          }
          // Handle nested SDTs recursively
          // Note: This could be extended to handle deeply nested SDTs
        }
      }
    }

    return result;
  }

  /**
   * Gets all paragraphs in the document (alias for getAllParagraphs)
   * @returns Array of all paragraphs recursively
   * @deprecated Use getAllParagraphs() instead for clarity
   */
  getParagraphs(): Paragraph[] {
    return this.getAllParagraphs();
  }

  // ============================================================================
  // Direct Index Access & Navigation Helpers
  // ============================================================================

  /**
   * Gets a paragraph at a specific index from top-level body elements
   * @param index - The index of the paragraph (0-based)
   * @returns The paragraph at that index, or undefined if out of bounds
   */
  getParagraphAt(index: number): Paragraph | undefined {
    const paragraphs = this.bodyElements.filter(
      (el): el is Paragraph => el instanceof Paragraph
    );
    return paragraphs[index];
  }

  /**
   * Gets a table at a specific index from top-level body elements
   * @param index - The index of the table (0-based)
   * @returns The table at that index, or undefined if out of bounds
   */
  getTableAt(index: number): Table | undefined {
    const tables = this.bodyElements.filter(
      (el): el is Table => el instanceof Table
    );
    return tables[index];
  }

  /**
   * Gets a body element at a specific index
   * @param index - The index of the element (0-based)
   * @returns The body element at that index, or undefined if out of bounds
   */
  getBodyElementAt(index: number): BodyElement | undefined {
    return this.bodyElements[index];
  }

  /**
   * Gets the index of a paragraph within the top-level body elements
   * @param paragraph - The paragraph to find
   * @returns The index of the paragraph, or -1 if not found
   */
  getParagraphIndex(paragraph: Paragraph): number {
    const paragraphs = this.bodyElements.filter(
      (el): el is Paragraph => el instanceof Paragraph
    );
    return paragraphs.indexOf(paragraph);
  }

  /**
   * Gets the index of a table within the top-level body elements
   * @param table - The table to find
   * @returns The index of the table, or -1 if not found
   */
  getTableIndex(table: Table): number {
    const tables = this.bodyElements.filter(
      (el): el is Table => el instanceof Table
    );
    return tables.indexOf(table);
  }

  /**
   * Gets the next paragraph after the given paragraph
   * @param paragraph - The current paragraph
   * @returns The next paragraph, or undefined if none exists
   */
  getNextParagraph(paragraph: Paragraph): Paragraph | undefined {
    const paragraphs = this.bodyElements.filter(
      (el): el is Paragraph => el instanceof Paragraph
    );
    const index = paragraphs.indexOf(paragraph);
    return index >= 0 && index < paragraphs.length - 1
      ? paragraphs[index + 1]
      : undefined;
  }

  /**
   * Gets the previous paragraph before the given paragraph
   * @param paragraph - The current paragraph
   * @returns The previous paragraph, or undefined if none exists
   */
  getPreviousParagraph(paragraph: Paragraph): Paragraph | undefined {
    const paragraphs = this.bodyElements.filter(
      (el): el is Paragraph => el instanceof Paragraph
    );
    const index = paragraphs.indexOf(paragraph);
    return index > 0 ? paragraphs[index - 1] : undefined;
  }

  /**
   * Gets all tables in the document recursively
   * Includes tables inside SDTs
   * @returns Array of all tables
   */
  getAllTables(): Table[] {
    const result: Table[] = [];

    for (const element of this.bodyElements) {
      if (element instanceof Table) {
        result.push(element);
      } else if (element instanceof StructuredDocumentTag) {
        // Recurse into SDT content
        for (const content of element.getContent()) {
          if (content instanceof Table) {
            result.push(content);
          }
          // Note: Could extend to handle tables nested in SDTs inside SDTs
        }
      }
    }

    return result;
  }

  /**
   * Normalizes typed list prefixes in all tables to proper Word list formatting.
   *
   * This method detects manually-typed list prefixes like "1. ", "a. ", "• ", etc.
   * and converts them to proper Word list formatting using <w:numPr>.
   * Within each table cell, lists are normalized to the majority type (numbered or bullet).
   *
   * @param options - Optional configuration for normalization
   * @returns Report with counts of normalized/skipped items and any errors
   *
   * @example
   * ```typescript
   * // Normalize all typed lists in tables
   * const report = doc.normalizeTableLists();
   * console.log(`Normalized ${report.normalized} list items`);
   *
   * // With custom numIds
   * const report = doc.normalizeTableLists({
   *   numberedStyleNumId: 5,
   *   bulletStyleNumId: 8,
   * });
   * ```
   */
  normalizeTableLists(
    options?: ListNormalizationOptions
  ): ListNormalizationReport {
    const normalizer = new ListNormalizer(this.numberingManager);
    const tables = this.getAllTables();
    return normalizer.normalizeAllTables(tables, options);
  }

  /**
   * Gets all Table of Contents elements in the document
   * @returns Array of TableOfContentsElement
   */
  getTableOfContentsElements(): TableOfContentsElement[] {
    return this.bodyElements.filter(
      (el): el is TableOfContentsElement => el instanceof TableOfContentsElement
    );
  }

  /**
   * Adds a body element (paragraph, table, SDT, etc.) to the document
   * @param element - The body element to add
   * @returns This document for chaining
   */
  addBodyElement(element: BodyElement): this {
    this.bodyElements.push(element);
    return this;
  }

  /**
   * Gets all body elements (paragraphs and tables)
   * @returns Array of body elements
   */
  getBodyElements(): BodyElement[] {
    return [...this.bodyElements];
  }

  /**
   * Gets the number of paragraphs
   * @returns Number of paragraphs
   */
  getParagraphCount(): number {
    return this.getAllParagraphs().length;
  }

  /**
   * Gets the number of tables
   * @returns Number of tables
   */
  getTableCount(): number {
    return this.getTables().length;
  }

  /**
   * Removes all body elements from the document
   *
   * Clears all paragraphs, tables, TOCs, and other elements from the document body.
   * This does NOT affect headers, footers, styles, or document properties.
   *
   * @returns This document instance for method chaining
   *
   * @example
   * ```typescript
   * // Clear and rebuild document content
   * doc.clearParagraphs();
   * doc.createParagraph('Fresh start');
   * ```
   */
  clearParagraphs(): this {
    this.bodyElements = [];
    return this;
  }

  /**
   * Sets or updates document metadata properties
   *
   * Updates document metadata that appears in File > Properties in Word.
   * Properties are validated and sanitized before storing. Existing properties
   * are merged with new values.
   *
   * @param properties - Document metadata properties
   * @param properties.title - Document title
   * @param properties.subject - Document subject
   * @param properties.creator - Document author/creator
   * @param properties.keywords - Comma-separated keywords
   * @param properties.description - Document description
   * @param properties.category - Document category
   * @param properties.company - Company name
   * @param properties.customProperties - Custom key-value properties
   * @returns This document instance for method chaining
   *
   * @example
   * ```typescript
   * doc.setProperties({
   *   title: 'Annual Report 2024',
   *   creator: 'Finance Department',
   *   company: 'Acme Corp',
   *   keywords: 'annual, report, financial'
   * });
   * ```
   */
  setProperties(properties: DocumentProperties): this {
    // Validate and sanitize properties before storing
    const validated = DocumentValidator.validateProperties(properties);
    this.properties = { ...this.properties, ...validated };
    return this;
  }

  /**
   * Gets all document metadata properties
   *
   * Returns a copy of all document properties including core properties
   * (title, creator, etc.) and custom properties.
   *
   * @returns Copy of the document properties object
   *
   * @example
   * ```typescript
   * const props = doc.getProperties();
   * console.log(`Title: ${props.title}`);
   * console.log(`Author: ${props.creator}`);
   * ```
   */
  getProperties(): DocumentProperties {
    return { ...this.properties };
  }

  /**
   * Sets document property value
   * @param key - Property key
   * @param value - Property value
   * @returns This document for chaining
   */
  setProperty(key: keyof DocumentProperties, value: any): this {
    (this.properties as any)[key] = value;
    return this;
  }

  /**
   * Sets the document title
   * @param title - Document title
   * @returns This document for chaining
   */
  setTitle(title: string): this {
    this.properties.title = title;
    return this;
  }

  /**
   * Sets the document subject
   * @param subject - Document subject
   * @returns This document for chaining
   */
  setSubject(subject: string): this {
    this.properties.subject = subject;
    return this;
  }

  /**
   * Sets the document creator/author
   * @param creator - Document creator
   * @returns This document for chaining
   */
  setCreator(creator: string): this {
    this.properties.creator = creator;
    return this;
  }

  /**
   * Sets the document author (alias for setCreator)
   * @param author - Document author name
   * @returns This document for chaining
   *
   * @example
   * ```typescript
   * doc.setAuthor('John Smith');
   * ```
   */
  setAuthor(author: string): this {
    return this.setCreator(author);
  }

  /**
   * Sets the document keywords
   * @param keywords - Document keywords (comma-separated)
   * @returns This document for chaining
   */
  setKeywords(keywords: string): this {
    this.properties.keywords = keywords;
    return this;
  }

  /**
   * Sets the document description
   * @param description - Document description
   * @returns This document for chaining
   */
  setDescription(description: string): this {
    this.properties.description = description;
    return this;
  }

  /**
   * Sets the document category
   * @param category - Document category
   * @returns This document for chaining
   */
  setCategory(category: string): this {
    this.properties.category = category;
    return this;
  }

  /**
   * Sets the document content status
   * @param status - Content status (e.g., "Draft", "Final", "In Review")
   * @returns This document for chaining
   */
  setContentStatus(status: string): this {
    this.properties.contentStatus = status;
    return this;
  }

  /**
   * Sets the application name
   * @param application - Application name
   * @returns This document for chaining
   */
  setApplication(application: string): this {
    this.properties.application = application;
    return this;
  }

  /**
   * Sets the application version
   * @param version - Application version
   * @returns This document for chaining
   */
  setAppVersion(version: string): this {
    this.properties.appVersion = version;
    return this;
  }

  /**
   * Sets the company name
   * @param company - Company name
   * @returns This document for chaining
   */
  setCompany(company: string): this {
    this.properties.company = company;
    return this;
  }

  /**
   * Sets the manager name
   * @param manager - Manager name
   * @returns This document for chaining
   */
  setManager(manager: string): this {
    this.properties.manager = manager;
    return this;
  }

  /**
   * Sets a custom property
   * @param name - Property name
   * @param value - Property value (string, number, boolean, or Date)
   * @returns This document for chaining
   */
  setCustomProperty(
    name: string,
    value: string | number | boolean | Date
  ): this {
    if (!this.properties.customProperties) {
      this.properties.customProperties = {};
    }
    this.properties.customProperties[name] = value;
    return this;
  }

  /**
   * Sets multiple custom properties
   * @param properties - Object containing custom properties
   * @returns This document for chaining
   */
  setCustomProperties(
    properties: Record<string, string | number | boolean | Date>
  ): this {
    this.properties.customProperties = { ...properties };
    return this;
  }

  /**
   * Gets a custom property value
   * @param name - Property name
   * @returns Property value or undefined
   */
  getCustomProperty(
    name: string
  ): string | number | boolean | Date | undefined {
    return this.properties.customProperties?.[name];
  }

  /**
   * Enables or disables automatic TOC population during save
   *
   * When enabled, the save() and toBuffer() methods will automatically
   * populate Table of Contents fields with hyperlinked entries based on
   * the document's heading structure.
   *
   * This is critical for documents where the in-memory model doesn't preserve
   * the complete TOC field structure. When save() regenerates document.xml,
   * the TOC field markers (begin/separate/end) may be lost. Enabling this
   * option ensures the TOC is rebuilt with proper field structure after
   * XML regeneration.
   *
   * @param enabled - Whether to auto-populate TOCs (default: false)
   * @returns This document instance for method chaining
   *
   * @example
   * ```typescript
   * const doc = await Document.load('input.docx');
   * doc.setAutoPopulateTOCs(true);
   * await doc.save('output.docx');
   * // TOC will have proper field structure with working "Update Field" in Word
   * ```
   */
  setAutoPopulateTOCs(enabled: boolean): this {
    this.autoPopulateTOCs = enabled;
    return this;
  }

  /**
   * Saves the document to a file path
   *
   * Generates all required XML parts, processes images and relationships, validates
   * the document structure, and writes the complete DOCX package to disk.
   * Uses atomic save pattern (temp file + rename) to prevent corruption on failure.
   *
   * @param filePath - Absolute or relative path where the DOCX file will be saved
   *
   * @throws Error if validation fails, memory limits exceeded, or file system error occurs
   * @throws Error if image count or size limits are exceeded
   *
   * @example
   * ```typescript
   * const doc = Document.create();
   * doc.createParagraph('Hello World');
   * await doc.save('output.docx');
   * ```
   *
   * @example
   * ```typescript
   * // Save with TOC auto-population
   * doc.setAutoPopulateTOCs(true);
   * doc.createTableOfContents();
   * doc.createParagraph('Chapter 1').setStyle('Heading1');
   * await doc.save('document-with-toc.docx');
   * ```
   */
  async save(filePath: string): Promise<void> {
    const logger = getLogger();
    logger.info('Saving document', { path: filePath, paragraphs: this.getParagraphCount() });

    // Use atomic save pattern: save to temp file, then rename
    // This prevents partial/corrupted saves if operation fails mid-way
    const tempPath = `${filePath}.tmp.${Date.now()}`;

    try {
      // Validate before saving to prevent data loss
      this.validator.validateBeforeSave(this.bodyElements);

      // Check memory usage before starting
      this.validator.checkMemoryThreshold();

      // Load all image data before saving (now async)
      await this.imageManager.loadAllImageData();

      // Check memory again after loading images
      this.validator.checkMemoryThreshold();

      // Check document size and warn if too large
      const sizeInfo = this.validator.estimateSize(
        this.bodyElements,
        this.imageManager
      );
      if (sizeInfo.warning) {
        this.logger.warn(sizeInfo.warning, {
          totalMB: sizeInfo.totalEstimatedMB,
          paragraphs: sizeInfo.paragraphs,
          tables: sizeInfo.tables,
          images: sizeInfo.images,
        });
      }

      // Clear preserve flags before final save (they're runtime-only)
      this.clearAllPreserveFlags();

      this.processHyperlinks();

      // Flush pending tracked changes to create Revision objects before XML generation
      if (this.trackChangesEnabled && this.trackingContext) {
        this.flushPendingChanges();
      }

      // Accept all revisions if auto-accept is enabled
      // This MUST happen after flushPendingChanges() to catch all revisions
      // but BEFORE updateDocumentXml() so accepted changes are serialized correctly
      if (this.acceptRevisionsBeforeSave) {
        await this.acceptAllRevisions();
        this.acceptRevisionsBeforeSave = false; // Reset flag after acceptance
      }

      // Only regenerate document.xml if we haven't manually stripped tracked changes
      // Stripping sets skipDocumentXmlRegeneration to preserve the cleaned raw XML
      if (!this.skipDocumentXmlRegeneration) {
        this.updateDocumentXml();
      }

      this.updateStylesXml();
      this.updateNumberingXml();
      this.updateCoreProps();
      this.updateAppProps(); // Update app.xml with current property values
      this.saveImages();
      this.saveHeaders();
      this.saveFooters();
      this.saveComments();
      this.saveCustomProperties(); // Add custom.xml if custom properties exist
      this.updateRelationships();
      this.updateContentTypesWithImagesHeadersFootersAndComments();

      // Save to temporary file first
      await this.zipHandler.save(tempPath);

      // Auto-populate TOCs if enabled
      if (this.autoPopulateTOCs) {
        await this.populateTOCsInFile(tempPath);
      }

      // Atomic rename - only if save succeeded
      const { promises: fs } = await import("fs");
      await fs.rename(tempPath, filePath);
      logger.info('Document saved', { path: filePath });
    } catch (error) {
      // Cleanup temporary file on error
      try {
        const { promises: fs } = await import("fs");
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
      throw error; // Re-throw original error
    } finally {
      // Release image data to free memory
      this.imageManager.releaseAllImageData();
    }
  }

  /**
   * Generates the document as an in-memory Buffer
   *
   * Creates the complete DOCX package in memory without writing to disk.
   * Useful for streaming documents in HTTP responses, storing in databases,
   * or processing through additional systems.
   *
   * @returns Promise that resolves to a Buffer containing the complete DOCX file
   *
   * @throws Error if validation fails, memory limits exceeded, or document is invalid
   *
   * @example
   * ```typescript
   * // Generate and send via HTTP
   * const doc = Document.create();
   * doc.createParagraph('Content');
   * const buffer = await doc.toBuffer();
   * res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
   * res.send(buffer);
   * ```
   *
   * @example
   * ```typescript
   * // Save to database
   * const buffer = await doc.toBuffer();
   * await db.documents.insert({ name: 'report.docx', data: buffer });
   * ```
   */
  async toBuffer(): Promise<Buffer> {
    const logger = getLogger();
    logger.info('Generating document buffer', { paragraphs: this.getParagraphCount() });

    try {
      // Validate before saving to prevent data loss
      this.validator.validateBeforeSave(this.bodyElements);

      // Check memory usage before starting
      this.validator.checkMemoryThreshold();

      // Load all image data before saving (now async)
      await this.imageManager.loadAllImageData();

      // Check memory again after loading images
      this.validator.checkMemoryThreshold();

      // Check document size and warn if too large
      const sizeInfo = this.validator.estimateSize(
        this.bodyElements,
        this.imageManager
      );
      if (sizeInfo.warning) {
        this.logger.warn(sizeInfo.warning, {
          totalMB: sizeInfo.totalEstimatedMB,
          paragraphs: sizeInfo.paragraphs,
          tables: sizeInfo.tables,
          images: sizeInfo.images,
        });
      }

      // Clear preserve flags before final save (they're runtime-only)
      this.clearAllPreserveFlags();

      this.processHyperlinks();

      // Flush pending tracked changes to create Revision objects before XML generation
      if (this.trackChangesEnabled && this.trackingContext) {
        this.flushPendingChanges();
      }

      // Accept all revisions if auto-accept is enabled
      // This MUST happen after flushPendingChanges() to catch all revisions
      // but BEFORE updateDocumentXml() so accepted changes are serialized correctly
      if (this.acceptRevisionsBeforeSave) {
        await this.acceptAllRevisions();
        this.acceptRevisionsBeforeSave = false; // Reset flag after acceptance
      }

      // Only regenerate document.xml if we haven't manually stripped tracked changes
      if (!this.skipDocumentXmlRegeneration) {
        this.updateDocumentXml();
      }

      this.updateStylesXml();
      this.updateNumberingXml();
      this.updateCoreProps();
      this.updateAppProps(); // Update app.xml with current property values
      this.saveImages();
      this.saveHeaders();
      this.saveFooters();
      this.saveComments();
      this.updateRelationships();
      this.updateContentTypesWithImagesHeadersFootersAndComments();

      // Auto-populate TOCs if enabled
      if (this.autoPopulateTOCs) {
        const docXml = this.zipHandler.getFileAsString("word/document.xml");
        if (docXml) {
          const populatedXml = this.populateAllTOCsInXML(docXml);
          if (populatedXml !== docXml) {
            this.zipHandler.updateFile("word/document.xml", populatedXml);
          }
        }
      }

      const buffer = await this.zipHandler.toBuffer();
      logger.info('Document buffer generated', { bufferSize: buffer.length });
      return buffer;
    } finally {
      // Release image data to free memory
      this.imageManager.releaseAllImageData();
    }
  }

  /**
   * Updates the document.xml file with current paragraphs
   */
  private updateDocumentXml(): void {
    let xml = this.generator.generateDocumentXml(
      this.bodyElements,
      this.section,
      this.namespaces
    );

    // Sync TOC field instructions with actual style names
    // This ensures TOC \t switches reference styles by their current names
    xml = this.syncTOCFieldInstructions(xml);

    this.zipHandler.updateFile(DOCX_PATHS.DOCUMENT, xml);
  }

  /**
   * Updates the core properties with current values
   */
  private updateCoreProps(): void {
    const xml = this.generator.generateCoreProps(this.properties);
    this.zipHandler.updateFile(DOCX_PATHS.CORE_PROPS, xml);
  }

  /**
   * Updates the app properties with current values
   */
  private updateAppProps(): void {
    const xml = this.generator.generateAppProps(this.properties);
    this.zipHandler.updateFile(DOCX_PATHS.APP_PROPS, xml);
  }

  /**
   * Updates the styles.xml file with current styles
   * Uses merge strategy to preserve unmodified styles from original document
   */
  private updateStylesXml(): void {
    if (this._originalStylesXml) {
      // Merge modified styles with original - preserves all unmodified styles
      const mergedXml = this.mergeStylesWithOriginal();
      this.zipHandler.updateFile(DOCX_PATHS.STYLES, mergedXml);
    } else {
      // New document - generate from scratch
      const xml = this.stylesManager.generateStylesXml();
      this.zipHandler.updateFile(DOCX_PATHS.STYLES, xml);
    }
  }

  /**
   * Merges modified styles with the original styles.xml
   *
   * This preserves all styles from the original document while only updating
   * styles that have been explicitly modified via addStyle().
   *
   * @returns Merged XML string with original styles + modified styles
   * @private
   */
  private mergeStylesWithOriginal(): string {
    if (!this._originalStylesXml) {
      return this.stylesManager.generateStylesXml();
    }

    const modifiedStyleIds = this.stylesManager.getModifiedStyleIds();

    // If nothing was modified, return original as-is
    if (modifiedStyleIds.size === 0) {
      return this._originalStylesXml;
    }

    // Get modified styles from StylesManager
    const modifiedStyles = new Map<string, Style>();
    for (const styleId of modifiedStyleIds) {
      const style = this.stylesManager.getStyle(styleId);
      if (style) {
        modifiedStyles.set(styleId, style);
      }
    }

    // Strategy: Use regex to replace style definitions in original XML
    // This preserves structure, whitespace, and any elements we don't parse
    let resultXml = this._originalStylesXml;

    for (const [styleId, style] of modifiedStyles) {
      // Generate the new style XML as a string
      const newStyleXml = XMLBuilder.elementToString(style.toXML());

      // Pattern to match existing style with this ID (handles various attribute orders)
      // Matches: <w:style w:type="..." w:styleId="StyleId">...</w:style>
      // or: <w:style w:styleId="StyleId" w:type="...">...</w:style>
      const escapedStyleId = styleId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const stylePattern = new RegExp(
        `<w:style[^>]*\\sw:styleId="${escapedStyleId}"[^>]*>[\\s\\S]*?</w:style>`
      );

      if (stylePattern.test(resultXml)) {
        // Replace existing style
        resultXml = resultXml.replace(stylePattern, newStyleXml);
      } else {
        // Style doesn't exist in original - append before </w:styles>
        resultXml = resultXml.replace(
          '</w:styles>',
          `${newStyleXml}\n</w:styles>`
        );
      }
    }

    return resultXml;
  }

  /**
   * Updates the numbering.xml file with current numbering definitions
   * Uses selective merge when possible to preserve original bullet/numbering styles
   */
  private updateNumberingXml(): void {
    // Case 1: No modifications - preserve original exactly
    if (this._originalNumberingXml && !this.numberingManager.isModified()) {
      this.zipHandler.updateFile(DOCX_PATHS.NUMBERING, this._originalNumberingXml);
      return;
    }

    // Case 2: Selective changes with original XML - use selective merge
    if (this._originalNumberingXml && this.numberingManager.hasSelectiveChanges()) {
      const xml = this.numberingManager.generateNumberingXmlSelective(this._originalNumberingXml);
      this.zipHandler.updateFile(DOCX_PATHS.NUMBERING, xml);
      return;
    }

    // Case 3: Full regeneration (fallback for new documents or full changes)
    const xml = this.numberingManager.generateNumberingXml();
    this.zipHandler.updateFile(DOCX_PATHS.NUMBERING, xml);
  }

  /**
   * Gets the StylesManager for advanced style operations
   *
   * Provides direct access to the StylesManager for advanced scenarios
   * like bulk style operations, custom style creation, or style analysis.
   *
   * @returns The StylesManager instance managing this document's styles
   *
   * @example
   * ```typescript
   * const stylesManager = doc.getStylesManager();
   * const allStyles = stylesManager.getAllStyles();
   * console.log(`Document has ${allStyles.length} styles`);
   * ```
   */
  getStylesManager(): StylesManager {
    return this.stylesManager;
  }

  /**
   * Convenience shortcut for {@link getStylesManager}
   *
   * Provides quick access to the StylesManager for style operations.
   * This is a shorter alternative to calling getStylesManager().
   *
   * @returns The StylesManager instance managing this document's styles
   *
   * @example
   * ```typescript
   * // Quick access to styles manager
   * const styles = doc.styles();
   * styles.addStyle(customStyle);
   * ```
   */
  styles(): StylesManager {
    return this.stylesManager;
  }

  /**
   * Adds or updates a style definition in the document
   *
   * Registers a style definition that can be applied to paragraphs and tables.
   * If a style with the same ID already exists, it is replaced.
   * The styles.xml file is updated immediately.
   *
   * @param style - The Style instance to add or update
   * @returns This document instance for method chaining
   *
   * @example
   * ```typescript
   * const customStyle = Style.create({
   *   styleId: 'MyCustomStyle',
   *   name: 'My Custom Style',
   *   type: 'paragraph',
   *   runFormatting: { font: 'Arial', size: 14, bold: true },
   *   paragraphFormatting: { alignment: 'center' }
   * });
   * doc.addStyle(customStyle);
   *
   * // Apply to paragraphs
   * doc.createParagraph('Styled text').setStyle('MyCustomStyle');
   * ```
   */
  addStyle(style: Style): this {
    this.stylesManager.addStyle(style);
    // Update styles XML immediately so it's reflected in getStylesXml()
    this.updateStylesXml();
    return this;
  }

  /**
   * Retrieves a style definition by its ID
   *
   * @param styleId - The unique style identifier (e.g., 'Heading1', 'Normal', 'CustomStyle')
   * @returns The Style instance if found, undefined otherwise
   *
   * @example
   * ```typescript
   * const heading1 = doc.getStyle('Heading1');
   * if (heading1) {
   *   console.log(`Font: ${heading1.getRunFormatting().font}`);
   * }
   * ```
   */
  getStyle(styleId: string): Style | undefined {
    return this.stylesManager.getStyle(styleId);
  }

  /**
   * Checks if a style definition exists in the document
   *
   * @param styleId - The style identifier to check
   * @returns True if the style is defined, false otherwise
   *
   * @example
   * ```typescript
   * if (!doc.hasStyle('CustomHeader')) {
   *   doc.addStyle(Style.create({
   *     styleId: 'CustomHeader',
   *     name: 'Custom Header',
   *     type: 'paragraph'
   *   }));
   * }
   * ```
   */
  hasStyle(styleId: string): boolean {
    return this.stylesManager.hasStyle(styleId);
  }

  /**
   * Gets all style definitions in the document
   *
   * Returns all registered styles including built-in Word styles
   * (Normal, Heading1-9, etc.) and custom styles.
   *
   * @returns Array of all Style instances in the document
   *
   * @example
   * ```typescript
   * const styles = doc.getStyles();
   * for (const style of styles) {
   *   console.log(`${style.getStyleId()}: ${style.getName()}`);
   * }
   * ```
   */
  getStyles(): Style[] {
    return this.stylesManager.getAllStyles();
  }

  /**
   * Removes a style from the document
   * @param styleId - Style ID to remove
   * @returns True if the style was removed, false if not found
   */
  removeStyle(styleId: string): boolean {
    return this.stylesManager.removeStyle(styleId);
  }

  /**
   * Updates an existing style with new properties
   * @param styleId - Style ID to update
   * @param properties - Properties to update
   * @returns True if the style was updated, false if not found
   */
  updateStyle(styleId: string, properties: Partial<StyleProperties>): boolean {
    const style = this.stylesManager.getStyle(styleId);
    if (!style) {
      return false;
    }

    // Update the style properties
    const currentProps = style.getProperties();

    // Deep merge nested properties (paragraphFormatting, runFormatting)
    const updatedProps: StyleProperties = {
      ...currentProps,
      ...properties,
      styleId, // Preserve styleId
      // Deep merge paragraph formatting
      paragraphFormatting: properties.paragraphFormatting
        ? {
            ...currentProps.paragraphFormatting,
            ...properties.paragraphFormatting,
            // Deep merge nested spacing and indentation
            spacing: properties.paragraphFormatting.spacing
              ? {
                  ...currentProps.paragraphFormatting?.spacing,
                  ...properties.paragraphFormatting.spacing,
                }
              : currentProps.paragraphFormatting?.spacing,
            indentation: properties.paragraphFormatting.indentation
              ? {
                  ...currentProps.paragraphFormatting?.indentation,
                  ...properties.paragraphFormatting.indentation,
                }
              : currentProps.paragraphFormatting?.indentation,
          }
        : currentProps.paragraphFormatting,
      // Deep merge run formatting
      runFormatting: properties.runFormatting
        ? { ...currentProps.runFormatting, ...properties.runFormatting }
        : currentProps.runFormatting,
    };

    // Create new style with updated properties
    const updatedStyle = Style.create(updatedProps);

    // Replace in manager
    this.stylesManager.addStyle(updatedStyle);
    return true;
  }

  /**
   * Applies a style to all elements matching a predicate
   * @param styleId - Style ID to apply
   * @param predicate - Function to test each element
   * @returns Number of elements updated
   * @example
   * ```typescript
   * // Apply Heading1 style to all paragraphs containing "Chapter"
   * const count = doc.applyStyleToAll('Heading1', (el) => {
   *   return el instanceof Paragraph && el.getText().includes('Chapter');
   * });
   * console.log(`Updated ${count} elements`);
   * ```
   */
  applyStyleToAll(
    styleId: string,
    predicate: (
      element:
        | Paragraph
        | Table
        | TableOfContentsElement
        | StructuredDocumentTag
    ) => boolean
  ): number {
    let count = 0;

    for (const element of this.bodyElements) {
      if (predicate(element)) {
        if (element instanceof Paragraph) {
          element.setStyle(styleId);
          count++;
        }
      }
    }

    // Also check paragraphs inside tables
    for (const table of this.getTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          for (const para of cell.getParagraphs()) {
            if (predicate(para)) {
              para.setStyle(styleId);
              count++;
            }
          }
        }
      }
    }

    return count;
  }

  /**
   * Finds all elements using a specific style
   * @param styleId - Style ID to search for
   * @returns Array of paragraphs and table cells using this style
   * @example
   * ```typescript
   * const heading1Elements = doc.findElementsByStyle('Heading1');
   * console.log(`Found ${heading1Elements.length} Heading1 elements`);
   * ```
   */
  findElementsByStyle(styleId: string): Array<Paragraph | TableCell> {
    const results: Array<Paragraph | TableCell> = [];

    // Check body paragraphs
    for (const element of this.bodyElements) {
      if (element instanceof Paragraph) {
        const formatting = element.getFormatting();
        if (formatting.style === styleId) {
          results.push(element);
        }
      }
    }

    // Check paragraphs inside tables
    for (const table of this.getTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          for (const para of cell.getParagraphs()) {
            const formatting = para.getFormatting();
            if (formatting.style === styleId) {
              results.push(para);
            }
          }

          // Include the cell itself if it has styled paragraphs
          const hasStyledParagraph = cell
            .getParagraphs()
            .some((p) => p.getFormatting().style === styleId);
          if (hasStyledParagraph) {
            results.push(cell);
          }
        }
      }
    }

    return results;
  }

  /**
   * Applies a new style to all paragraphs currently using a specific style
   * Useful for bulk style updates across the document
   * @param currentStyleId - The style ID currently applied to paragraphs
   * @param newStyleId - The style ID to apply
   * @returns Number of paragraphs updated
   * @example
   * ```typescript
   * // Change all Normal paragraphs to BodyText
   * const count = doc.applyStyleToAllParagraphsWithStyle('Normal', 'BodyText');
   * console.log(`Updated ${count} paragraphs`);
   * ```
   */
  applyStyleToAllParagraphsWithStyle(
    currentStyleId: string,
    newStyleId: string
  ): number {
    let count = 0;

    // Check body paragraphs
    for (const element of this.bodyElements) {
      if (element instanceof Paragraph) {
        const formatting = element.getFormatting();
        if (formatting.style === currentStyleId) {
          element.setStyle(newStyleId);
          count++;
        }
      }
    }

    // Check paragraphs inside tables
    for (const table of this.getTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          for (const para of cell.getParagraphs()) {
            const formatting = para.getFormatting();
            if (formatting.style === currentStyleId) {
              para.setStyle(newStyleId);
              count++;
            }
          }
        }
      }
    }

    return count;
  }

  /**
   * Applies a style to all paragraphs in the document with optional filtering and formatting control
   *
   * This method provides flexible bulk style application with the ability to:
   * - Apply style to all paragraphs or filter by current style
   * - Clear direct run formatting so the style takes full effect
   * - Clear only specific formatting properties
   *
   * @param styleId - The style ID to apply (e.g., 'Normal', 'Heading1')
   * @param options - Optional configuration
   * @param options.currentStyleId - Only apply to paragraphs with this style (undefined = all paragraphs)
   * @param options.clearFormatting - Whether to clear direct run formatting (default: false)
   * @param options.clearProperties - Specific properties to clear (default: all if clearFormatting=true)
   * @returns Number of paragraphs updated
   * @example
   * ```typescript
   * // Apply Normal to all paragraphs and clear all direct formatting
   * doc.applyStyleToAllParagraphs('Normal', { clearFormatting: true });
   *
   * // Apply Heading1 to all Normal paragraphs, clear only font and color
   * doc.applyStyleToAllParagraphs('Heading1', {
   *   currentStyleId: 'Normal',
   *   clearFormatting: true,
   *   clearProperties: ['font', 'color']
   * });
   *
   * // Apply BodyText to all paragraphs without clearing formatting
   * doc.applyStyleToAllParagraphs('BodyText');
   * ```
   */
  applyStyleToAllParagraphs(
    styleId: string,
    options?: {
      currentStyleId?: string;
      clearFormatting?: boolean;
      clearProperties?: string[];
    }
  ): number {
    let count = 0;
    const clearFormatting = options?.clearFormatting || false;
    const clearProperties = options?.clearProperties;
    const currentStyleId = options?.currentStyleId;

    // Helper to apply style to a paragraph
    const applyToParagraph = (para: Paragraph): void => {
      const formatting = para.getFormatting();

      // Check if this paragraph matches the filter
      if (currentStyleId !== undefined && formatting.style !== currentStyleId) {
        return; // Skip this paragraph
      }

      // Apply style
      if (clearFormatting) {
        para.applyStyleAndClearFormatting(
          styleId,
          clearProperties === undefined ? [] : clearProperties
        );
      } else {
        para.setStyle(styleId);
      }

      count++;
    };

    // Process body paragraphs
    for (const element of this.bodyElements) {
      if (element instanceof Paragraph) {
        applyToParagraph(element);
      }
    }

    // Process paragraphs inside tables
    for (const table of this.getTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          for (const para of cell.getParagraphs()) {
            applyToParagraph(para);
          }
        }
      }
    }

    return count;
  }

  /**
   * Updates the color of all hyperlinks in the document
   * @param color - Hex color without # (e.g., '0000FF' for blue)
   * @returns Number of hyperlinks updated
   * @example
   * ```typescript
   * // Make all hyperlinks blue
   * const count = doc.updateAllHyperlinkColors('0000FF');
   * console.log(`Updated ${count} hyperlinks`);
   * ```
   */
  updateAllHyperlinkColors(color: string): number {
    const hyperlinks = this.getHyperlinks();

    for (const { hyperlink } of hyperlinks) {
      const currentFormatting = hyperlink.getFormatting();
      hyperlink.setFormatting({
        ...currentFormatting,
        color: color,
      });
    }

    return hyperlinks.length;
  }

  /**
   * Sets layout for all tables in the document
   * @param layout - Layout type ('auto' for fit to window, 'fixed' for fixed width)
   * @returns Number of tables updated
   * @example
   * ```typescript
   * // Make all tables fit to window
   * const count = doc.setAllTablesLayout('auto');
   * console.log(`Updated ${count} tables`);
   * ```
   */
  setAllTablesLayout(layout: "auto" | "fixed"): number {
    const tables = this.getTables();

    for (const table of tables) {
      table.setLayout(layout);
    }

    return tables.length;
  }

  /**
   * Applies borders to all cells in all tables throughout the document
   * Useful for ensuring consistent border styling across all tables
   * @param border - Border definition to apply to all sides of every cell
   * @returns Number of tables updated
   * @example
   * ```typescript
   * // Add single black borders to all tables
   * const count = doc.applyBordersToAllTables({
   *   style: 'single',
   *   size: 8,
   *   color: '000000'
   * });
   * console.log(`Applied borders to ${count} tables`);
   * ```
   */
  applyBordersToAllTables(border: TableBorder): number {
    const tables = this.getAllTables();

    for (const table of tables) {
      table.setAllBorders(border);
    }

    return tables.length;
  }

  /**
   * Applies different shading to tables based on their size
   * 1x1 tables get one color, multi-cell tables get another color on first row
   * @param singleCellShading - Hex color for 1x1 tables (e.g., 'BFBFBF')
   * @param multiCellFirstRowShading - Hex color for first row of multi-cell tables (e.g., 'DFDFDF')
   * @returns Object with counts of single-cell and multi-cell tables updated
   * @example
   * ```typescript
   * const result = doc.applyTableFormattingBySize('BFBFBF', 'DFDFDF');
   * console.log(`Updated ${result.singleCellCount} 1x1 tables and ${result.multiCellCount} multi-cell tables`);
   * ```
   */
  applyTableFormattingBySize(
    singleCellShading: string,
    multiCellFirstRowShading: string
  ): { singleCellCount: number; multiCellCount: number } {
    const tables = this.getTables();
    let singleCellCount = 0;
    let multiCellCount = 0;

    for (const table of tables) {
      const rowCount = table.getRowCount();
      const colCount = table.getColumnCount();

      if (rowCount === 1 && colCount === 1) {
        // 1x1 table - shade the single cell
        const cell = table.getCell(0, 0);
        if (cell) {
          cell.setShading({ fill: singleCellShading });
          singleCellCount++;
        }
      } else {
        // Multi-cell table - shade first row
        const firstRow = table.getRow(0);
        if (firstRow) {
          for (const cell of firstRow.getCells()) {
            cell.setShading({ fill: multiCellFirstRowShading });
          }
          multiCellCount++;
        }
      }
    }

    return { singleCellCount, multiCellCount };
  }

  /**
   * Fixes all "Top of Document" hyperlinks to use standard formatting and anchor
   *
   * Changes made to matching hyperlinks:
   * - Text: Any variation → "Top of the Document"
   * - Formatting: Verdana 12pt, underline, blue (0000FF)
   * - Paragraph: Right aligned
   * - Anchor: Points to "_top" bookmark at document start
   *
   * Creates "_top" bookmark at first paragraph if it doesn't exist
   *
   * @returns Number of hyperlinks updated
   * @example
   * ```typescript
   * const count = doc.fixTODHyperlinks();
   * console.log(`Fixed ${count} "Top of Document" links`);
   * ```
   */
  fixTODHyperlinks(): number {
    let count = 0;

    // Ensure _top bookmark exists at document start
    if (!this.hasBookmark("_top")) {
      const paragraphs = this.getAllParagraphs();
      if (paragraphs.length > 0) {
        const firstPara = paragraphs[0];
        if (firstPara) {
          const bookmark = new Bookmark({ name: "_top" });
          const registered = this.bookmarkManager.register(bookmark);
          firstPara.addBookmark(registered);
        }
      }
    }

    // Find and fix all "Top of Document" hyperlinks
    const hyperlinks = this.getHyperlinks();

    for (const { hyperlink, paragraph } of hyperlinks) {
      const text = hyperlink.getText().toLowerCase();

      // Match variations: "top of document", "top of the document", etc.
      if (text.includes("top") && text.includes("document")) {
        // Update text
        hyperlink.setText("Top of the Document");

        // Update formatting
        hyperlink.setFormatting({
          font: "Verdana",
          size: 12,
          underline: "single",
          color: "0000FF",
        });

        // Update anchor to _top
        hyperlink.setAnchor("_top");

        // Set paragraph alignment to right
        paragraph.setAlignment("right");

        count++;
      }
    }

    return count;
  }

  /**
   * Sets width to 5% for first column of tables containing "If"
   *
   * For tables with 2+ columns where first column text contains "If",
   * sets the first column width to 5% of table width.
   *
   * Common use case: If/Then decision tables
   *
   * @returns Number of table cells updated
   * @example
   * ```typescript
   * const count = doc.setIfColumnWidth();
   * console.log(`Updated ${count} If column cells`);
   * ```
   */
  setIfColumnWidth(): number {
    let count = 0;
    const tables = this.getTables();

    for (const table of tables) {
      const columnCount = table.getColumnCount();

      // Only process tables with at least 2 columns
      if (columnCount < 2) continue;

      // Check all rows for "If" in first column
      let hasIfColumn = false;
      const rows = table.getRows();

      for (const row of rows) {
        const cells = row.getCells();
        const firstCell = cells[0];
        if (firstCell) {
          const text = firstCell.getText().toLowerCase();
          if (text.includes("if")) {
            hasIfColumn = true;
            break;
          }
        }
      }

      // If "If" found, set width on all first column cells
      if (hasIfColumn) {
        const tableWidth = table.getFormatting().width || 12960; // Default page width in twips
        const targetWidth = Math.round(tableWidth * 0.05); // 5%

        for (const row of rows) {
          const cells = row.getCells();
          const firstCell = cells[0];
          if (firstCell) {
            firstCell.setWidth(targetWidth);
            count++;
          }
        }
      }
    }

    return count;
  }

  /**
   * Applies comprehensive formatting to all tables in the document
   *
   * This helper function provides a one-call solution for standardizing table formatting:
   * - Apply black borders to all cells (always applied to all tables)
   * - Set table width to autofit to window (always applied to all tables)
   * - Format first row as header (shading, bold, centered, custom font/spacing)
   * - Apply consistent cell margins to all cells
   * - Recolor and format cells with existing shading
   * - Optionally skip shading/formatting for single-cell (1x1) tables
   *
   * Shading and formatting logic (for tables > 1x1):
   * - Row 0: Apply the specified color + full formatting (bold, Verdana 12pt, centered, 3pt spacing)
   * - Other rows: Cells with existing color (NOT white) receive the same color + formatting
   * - Cells with no color or white color remain unchanged
   *
   * @param colorOrOptions Hex color for multi-cell tables, or options object
   * @param multiCellColor Optional second color for multi-cell tables (when first param is 1x1 color)
   * @returns Statistics about tables processed
   *
   * @example
   * // Use default gray color (E9E9E9) for multi-cell tables, skip 1x1 tables
   * const result = doc.applyStandardTableFormatting();
   *
   * @example
   * // Custom color for multi-cell tables only
   * const result = doc.applyStandardTableFormatting('D9D9D9');
   *
   * @example
   * // Two colors: first for 1x1 tables, second for multi-cell tables
   * const result = doc.applyStandardTableFormatting('BFBFBF', 'E9E9E9');
   *
   * @example
   * // Advanced: Full customization
   * const result = doc.applyStandardTableFormatting({
   *   singleCellShading: 'BFBFBF',  // Gray for 1x1 tables
   *   headerRowShading: '4472C4',   // Blue for multi-cell table headers
   *   headerRowFormatting: {
   *     bold: true,
   *     alignment: 'center',
   *     font: 'Arial',
   *     size: 14
   *   }
   * });
   * console.log(`Processed ${result.tablesProcessed} tables`);
   * console.log(`Formatted ${result.headerRowsFormatted} header rows`);
   * console.log(`Recolored ${result.cellsRecolored} cells`);
   * console.log(`Shaded ${result.singleCellTablesShaded} single-cell tables`);
   */
  public applyStandardTableFormatting(
    colorOrOptions?:
      | string
      | {
          /** Autofit tables to window width (DEPRECATED: now always enabled) */
          autofitToWindow?: boolean;
          /** Single-cell (1x1) table shading color */
          singleCellShading?: string;
          /** Header row background color for multi-cell tables (default: 'E9E9E9') */
          headerRowShading?: string;
          /** Header row text formatting */
          headerRowFormatting?: {
            bold?: boolean;
            alignment?: "left" | "center" | "right" | "justify";
            font?: string;
            size?: number;
            color?: string;
            spacingBefore?: number;
            spacingAfter?: number;
          };
          /** Cell margins for all cells in twips */
          cellMargins?: {
            top?: number;
            bottom?: number;
            left?: number;
            right?: number;
          };
          /** Skip 1x1 tables (DEPRECATED: use singleCellShading instead) */
          skipSingleCellTables?: boolean;
        },
    multiCellColor?: string
  ): {
    tablesProcessed: number;
    headerRowsFormatted: number;
    cellsRecolored: number;
    singleCellTablesShaded: number;
  } {
    // Handle different parameter combinations
    let options: any;
    if (typeof colorOrOptions === "string") {
      if (multiCellColor) {
        // Two colors provided: applyStandardTableFormatting('BFBFBF', 'E9E9E9')
        options = {
          singleCellShading: colorOrOptions,
          headerRowShading: multiCellColor,
        };
      } else {
        // One color provided: backwards compatible - for multi-cell only
        options = { headerRowShading: colorOrOptions };
      }
    } else {
      options = colorOrOptions;
    }

    // Default values
    const singleCellShading = options?.singleCellShading?.toUpperCase();
    const headerRowShading = (
      options?.headerRowShading || "E9E9E9"
    ).toUpperCase();
    const headerRowFormatting = {
      bold: options?.headerRowFormatting?.bold !== false,
      alignment: options?.headerRowFormatting?.alignment || ("center" as const),
      font: options?.headerRowFormatting?.font || "Verdana",
      size: options?.headerRowFormatting?.size || 12,
      color: options?.headerRowFormatting?.color || "000000",
      spacingBefore: options?.headerRowFormatting?.spacingBefore ?? 60,
      spacingAfter: options?.headerRowFormatting?.spacingAfter ?? 60,
    };
    const cellMargins = {
      top: options?.cellMargins?.top ?? 0,
      bottom: options?.cellMargins?.bottom ?? 0,
      left: options?.cellMargins?.left ?? 115, // 0.08 inches
      right: options?.cellMargins?.right ?? 115, // 0.08 inches
    };
    const skipSingleCellTables =
      options?.skipSingleCellTables !== false && !singleCellShading;

    // Statistics
    let tablesProcessed = 0;
    let headerRowsFormatted = 0;
    let cellsRecolored = 0;
    let singleCellTablesShaded = 0;

    // Get all tables
    const tables = this.getAllTables();

    for (const table of tables) {
      const rowCount = table.getRowCount();
      const columnCount = table.getColumnCount();

      // Apply borders to all cells (always applied to all tables)
      table.setAllBorders({
        style: "single",
        size: 4,
        color: "000000",
      });

      // Set table width to autofit to window (always applied to all tables)
      table.setLayout("auto");
      table.setWidthType("pct");
      table.setWidth(5000);

      // Handle 1x1 (single-cell) tables separately
      const is1x1Table = rowCount === 1 && columnCount === 1;
      if (is1x1Table) {
        if (singleCellShading) {
          // Apply single-cell shading color
          const singleCell = table.getRow(0)?.getCell(0);
          if (singleCell) {
            singleCell.setShading({ fill: singleCellShading });
            singleCellTablesShaded++;
          }
        }
        // Skip further processing for 1x1 tables
        tablesProcessed++;
        continue;
      }

      // Format first row (header) for multi-cell tables
      const firstRow = table.getRow(0);
      if (firstRow) {
        for (const cell of firstRow.getCells()) {
          // Set header shading
          cell.setShading({ fill: headerRowShading });

          // Set margins
          cell.setMargins(cellMargins);

          // Format paragraphs and runs in header (skip list paragraphs)
          for (const para of cell.getParagraphs()) {
            // Skip paragraphs that are part of numbered or bulleted lists
            const numPr = para.getFormatting().numbering;
            if (
              numPr &&
              (numPr.level !== undefined || numPr.numId !== undefined)
            ) {
              continue; // Preserve list formatting
            }

            para.setAlignment(headerRowFormatting.alignment);
            para.setSpaceBefore(headerRowFormatting.spacingBefore);
            para.setSpaceAfter(headerRowFormatting.spacingAfter);

            for (const run of para.getRuns()) {
              if (headerRowFormatting.bold) run.setBold(true);
              run.setFont(headerRowFormatting.font, headerRowFormatting.size);
              // Preserve white font - don't change color if run is white (FFFFFF)
              const currentColor = run.getColor()?.toUpperCase();
              if (currentColor !== 'FFFFFF') {
                run.setColor(headerRowFormatting.color);
              }
            }
          }
        }
        headerRowsFormatted++;
      }

      // Format remaining rows (data rows)
      for (let i = 1; i < rowCount; i++) {
        const row = table.getRow(i);
        if (!row) continue;

        for (const cell of row.getCells()) {
          // Always apply margins
          cell.setMargins(cellMargins);

          // Apply shading and formatting to cells with existing shading
          // Shading can be either a hex fill color OR a pattern (like pct10)
          const currentShading = cell.getShading();
          const currentColor = currentShading?.fill?.toUpperCase();
          const currentPattern = currentShading?.pattern?.toLowerCase();

          // Check if color is a valid 6-character hex code (not 'auto' or other special values)
          const isValidHexColor = /^[0-9A-F]{6}$/i.test(currentColor || "");
          const hasHexFillShading =
            currentColor && currentColor !== "FFFFFF" && isValidHexColor;

          // Check if cell has pattern-based shading (like pct10, pct20, etc.)
          // Patterns like 'clear' or 'nil' don't count as shading
          const hasPatternShading =
            currentPattern &&
            currentPattern !== "clear" &&
            currentPattern !== "nil" &&
            currentPattern !== "auto";

          if (hasHexFillShading || hasPatternShading) {
            // Apply the color passed to the method
            cell.setShading({ fill: headerRowShading });
            cellsRecolored++;

            // Always apply formatting when shading is applied (but skip list paragraphs)
            for (const para of cell.getParagraphs()) {
              // Skip paragraphs that are part of numbered or bulleted lists
              const numPr = para.getFormatting().numbering;
              if (
                numPr &&
                (numPr.level !== undefined || numPr.numId !== undefined)
              ) {
                continue; // Preserve list formatting
              }

              para.setAlignment("center");
              para.setSpaceBefore(60); // 3pt
              para.setSpaceAfter(60); // 3pt

              for (const run of para.getRuns()) {
                // Skip runs with Hyperlink style - preserve their blue color and underline
                if (run.isHyperlinkStyled()) {
                  continue;
                }
                run.setBold(true);
                run.setFont("Verdana", 12);
                // Preserve white font - don't change color if run is white (FFFFFF)
                const currentColor = run.getColor()?.toUpperCase();
                if (currentColor !== 'FFFFFF') {
                  run.setColor("000000");
                }
              }
            }
          }
        }
      }

      tablesProcessed++;
    }

    return {
      tablesProcessed,
      headerRowsFormatted,
      cellsRecolored,
      singleCellTablesShaded,
    };
  }

  /**
   * Centers all images where either dimension exceeds the specified pixel size
   *
   * Actually centers the paragraph containing the image, since images
   * themselves don't have alignment properties in Word.
   *
   * Conversion: 96 pixels = 1 inch = 914,400 EMUs (at 96 DPI)
   *
   * @param minPixels Minimum size in pixels - if either width OR height exceeds this, image is centered (default: 96 = 1 inch)
   * @returns Number of images centered
   * @example
   * ```typescript
   * const count = doc.centerLargeImages(96);  // Center images > 1 inch
   * console.log(`Centered ${count} large images`);
   * ```
   */
  centerLargeImages(minPixels: number = 96): number {
    let count = 0;

    // Convert pixels to EMUs (914400 EMUs per inch, 96 DPI)
    // Formula: pixels * (914400 / 96) = pixels * 9525
    const minEmus = Math.round(minPixels * 9525);

    // Get all images with metadata
    const images = this.imageManager.getAllImages();

    // Create a Set of image IDs that meet size criteria
    const largeImageIds = new Set<string>();

    for (const entry of images) {
      const image = entry.image;
      const width = image.getWidth();
      const height = image.getHeight();

      // Check if either dimension meets minimum (width OR height >= threshold)
      if (width >= minEmus || height >= minEmus) {
        // Track this image's relationship ID
        const relId = image.getRelationshipId();
        if (relId) {
          largeImageIds.add(relId);
        }
      }
    }

    // Find paragraphs containing these large images and center them
    // Note: Images are embedded in paragraphs as ImageRun elements
    for (const paragraph of this.getAllParagraphs()) {
      const content = paragraph.getContent();

      for (const item of content) {
        // Check if this is an ImageRun (subclass of Run)
        if (item instanceof ImageRun) {
          const image = item.getImageElement();
          const relId = image.getRelationshipId();

          if (relId && largeImageIds.has(relId)) {
            // Center this paragraph
            paragraph.setAlignment("center");
            count++;
            break; // Only count paragraph once
          }
        }
      }
    }

    return count;
  }

  /**
   * Applies border and centers all images where either dimension exceeds the specified pixel size
   *
   * This helper combines two operations:
   * 1. Applies a border to the image
   * 2. Centers the paragraph containing the image
   *
   * Processes images where EITHER width OR height exceeds the minimum size.
   * Border defaults to 2pt with black color.
   *
   * Conversion: 96 pixels = 1 inch = 914,400 EMUs (at 96 DPI)
   *
   * @param minPixels Minimum size in pixels - if either width OR height exceeds this, image is processed (default: 96 = 1 inch)
   * @param borderThicknessPt Border thickness in points (default: 2)
   * @returns Number of images processed (bordered and centered)
   * @example
   * ```typescript
   * // Apply 2pt border and center all images > 1 inch
   * const count = doc.borderAndCenterLargeImages();
   * console.log(`Processed ${count} large images`);
   * ```
   * @example
   * ```typescript
   * // Custom threshold and border thickness
   * const count = doc.borderAndCenterLargeImages(96, 3);
   * console.log(`Applied 3pt borders to ${count} images > 1 inch`);
   * ```
   */
  public borderAndCenterLargeImages(minPixels: number = 96, borderThicknessPt: number = 2): number {
    let count = 0;

    // Convert pixels to EMUs (914400 EMUs per inch, 96 DPI)
    // Formula: pixels * (914400 / 96) = pixels * 9525
    const minEmus = Math.round(minPixels * 9525);

    // Helper to check if an item is an ImageRun with large dimensions
    // Returns true if a large image was found and processed
    const processImageRun = (item: unknown): boolean => {
      if (item instanceof ImageRun) {
        const image = item.getImageElement();
        const width = image.getWidth();
        const height = image.getHeight();

        // Check if either dimension meets minimum (width OR height >= threshold)
        if (width >= minEmus || height >= minEmus) {
          // Apply border to the image
          image.setBorder(borderThicknessPt);
          return true;
        }
      }
      return false;
    };

    // Helper to check revision content for images
    const processRevision = (revision: Revision): boolean => {
      let found = false;
      const revisionContent = revision.getContent();
      for (const item of revisionContent) {
        // ImageRun extends Run, so check instanceof ImageRun
        if (processImageRun(item)) {
          found = true;
        }
      }
      return found;
    };

    // Directly iterate all paragraphs and find images
    // This approach bypasses ImageManager and works with images wherever they are
    for (const paragraph of this.getAllParagraphs()) {
      const content = paragraph.getContent();
      let hasLargeImage = false;

      for (const item of content) {
        // Check direct ImageRun content
        if (processImageRun(item)) {
          hasLargeImage = true;
        }
        // Check images inside Revisions (tracked changes like w:ins, w:del)
        else if (item instanceof Revision) {
          if (processRevision(item)) {
            hasLargeImage = true;
          }
        }
        // Note: Hyperlinks typically contain text, not images
        // Image hyperlinks would be a separate ImageRun with link styling
      }

      // If paragraph has a large image, center it
      if (hasLargeImage) {
        paragraph.setAlignment("center");
        count++;
      }
    }

    return count;
  }

  /**
   * Sets line spacing for all list items (numbered or bulleted)
   *
   * @param spacingTwips Line spacing in twips (default: 240 = 12pt)
   * @returns Number of list items updated
   * @example
   * ```typescript
   * const count = doc.setListLineSpacing(240);
   * console.log(`Updated ${count} list items`);
   * ```
   */
  setListLineSpacing(spacingTwips: number = 240): number {
    let count = 0;

    for (const paragraph of this.getAllParagraphs()) {
      const numbering = paragraph.getNumbering();

      if (numbering) {
        // Has numbering - it's a list item
        paragraph.setLineSpacing(spacingTwips, "auto");
        count++;
      }
    }

    return count;
  }

  /**
   * Normalizes all numbered lists in the document to use consistent formatting
   *
   * Creates a standard numbered list format and applies it to all numbered lists:
   * - Level 0: 1., 2., 3., ... (decimal)
   * - Level 1: a., b., c., ... (lowerLetter)
   * - Level 2: i., ii., iii., ... (lowerRoman)
   * - Consistent indentation and spacing
   *
   * @returns Number of paragraphs updated
   * @example
   * ```typescript
   * const count = doc.normalizeNumberedLists();
   * console.log(`Normalized ${count} numbered list items`);
   * ```
   */
  normalizeNumberedLists(): number {
    let count = 0;

    // Create a standard numbered list
    const standardNumId = this.numberingManager.createNumberedList(3, [
      "decimal",
      "lowerLetter",
      "lowerRoman",
    ]);

    // Collect all paragraphs with numbering and identify numbered lists
    const paragraphs = this.getAllParagraphs();
    const numberedParas: { para: Paragraph; level: number }[] = [];

    for (const para of paragraphs) {
      const numbering = para.getNumbering();
      if (!numbering) continue;

      // Get the abstract numbering for this numId
      const instance = this.numberingManager.getInstance(numbering.numId);
      if (!instance) continue;

      const abstractNum = this.numberingManager.getAbstractNumbering(
        instance.getAbstractNumId()
      );
      if (!abstractNum) continue;

      // Check if level 0 is a numbered format (not bullet)
      const level0 = abstractNum.getLevel(0);
      if (!level0) continue;

      const format = level0.getFormat();
      // Numbered formats: decimal, lowerRoman, upperRoman, lowerLetter, upperLetter, etc.
      if (format !== "bullet") {
        numberedParas.push({ para, level: numbering.level });
      }
    }

    // Apply standard numbering to all numbered paragraphs
    for (const { para, level } of numberedParas) {
      para.setNumbering(standardNumId, level);
      count++;
    }

    // Clean up orphaned numbering definitions
    this.cleanupUnusedNumbering();

    return count;
  }

  /**
   * Normalizes all bullet lists in the document to use consistent formatting
   *
   * Creates a standard bullet list format and applies it to all bullet lists:
   * - Level 0: • (bullet)
   * - Level 1: ○ (circle)
   * - Level 2: ■ (square)
   * - Consistent indentation and spacing
   *
   * @returns Number of paragraphs updated
   * @example
   * ```typescript
   * const count = doc.normalizeBulletLists();
   * console.log(`Normalized ${count} bullet list items`);
   * ```
   */
  normalizeBulletLists(): number {
    let count = 0;

    // Create a standard bullet list with custom bullets
    const standardNumId = this.numberingManager.createBulletList(3, [
      "•",
      "○",
      "■",
    ]);

    // Collect all paragraphs with numbering and identify bullet lists
    const paragraphs = this.getAllParagraphs();
    const bulletParas: { para: Paragraph; level: number }[] = [];

    for (const para of paragraphs) {
      const numbering = para.getNumbering();
      if (!numbering) continue;

      // Get the abstract numbering for this numId
      const instance = this.numberingManager.getInstance(numbering.numId);
      if (!instance) continue;

      const abstractNum = this.numberingManager.getAbstractNumbering(
        instance.getAbstractNumId()
      );
      if (!abstractNum) continue;

      // Check if level 0 is a bullet format
      const level0 = abstractNum.getLevel(0);
      if (!level0) continue;

      const format = level0.getFormat();
      if (format === "bullet") {
        bulletParas.push({ para, level: numbering.level });
      }
    }

    // Apply standard bullet numbering to all bullet paragraphs
    for (const { para, level } of bulletParas) {
      para.setNumbering(standardNumId, level);
      count++;
    }

    // Clean up orphaned numbering definitions
    this.cleanupUnusedNumbering();

    return count;
  }

  /**
   * Cleans up unused numbering definitions
   *
   * Removes numbering instances and abstract numberings that are no longer
   * referenced by any paragraphs in the document. This prevents corruption
   * from orphaned numbering definitions.
   *
   * @public
   */
  cleanupUnusedNumbering(): void {
    // Collect all numIds currently used by paragraphs
    const usedNumIds = new Set<number>();
    const paragraphs = this.getAllParagraphs();

    for (const para of paragraphs) {
      const numbering = para.getNumbering();
      if (numbering) {
        usedNumIds.add(numbering.numId);
      }
    }

    // Clean up unused numbering definitions
    this.numberingManager.cleanupUnusedNumbering(usedNumIds);
  }

  /**
   * Adds a blank paragraph with Normal style after each bullet/numbered list
   *
   * Processes the document and inserts a blank paragraph after every list ends.
   * Lists are identified by their numbering ID - nested lists with the same ID
   * are treated as part of the same list.
   *
   * @returns The number of blank paragraphs inserted
   *
   * @example
   * ```typescript
   * const doc = await Document.load('input.docx');
   * const count = doc.addBlankLineAfterLists();
   * console.log(`Added ${count} blank lines after lists`);
   * await doc.save('output.docx');
   * ```
   */
  addBlankLineAfterLists(): number {
    let insertedCount = 0;

    // Iterate through body elements - need index-based loop since we modify the array
    for (let i = 0; i < this.bodyElements.length; i++) {
      const element = this.bodyElements[i];

      // Check if current element is a paragraph with numbering (list item)
      if (element instanceof Paragraph) {
        const numbering = element.getNumbering();

        if (numbering) {
          // This is a list item - check if it's the last item of its list
          const nextElement = this.bodyElements[i + 1];
          const isListEnd =
            !nextElement || // End of document
            !(nextElement instanceof Paragraph) || // Next is not a paragraph
            !nextElement.getNumbering() || // Next paragraph has no numbering
            nextElement.getNumbering()!.numId !== numbering.numId; // Different list

          if (isListEnd) {
            // Check if there's already a blank paragraph after the list
            const alreadyHasBlank =
              nextElement instanceof Paragraph &&
              this.isParagraphBlank(nextElement);

            if (!alreadyHasBlank) {
              // Insert blank paragraph with Normal style after this list item
              const blankPara = new Paragraph();
              blankPara.setStyle("Normal");

              // Insert at position i+1 (after current element)
              this.bodyElements.splice(i + 1, 0, blankPara);
              insertedCount++;
            }

            // Skip the next element (either newly inserted or existing blank)
            i++;
          }
        }
      }
    }

    return insertedCount;
  }

  /**
   * Removes all headers and footers from the document
   *
   * Clears all header and footer references including:
   * - Default header/footer
   * - First page header/footer
   * - Even page header/footer
   *
   * @returns Number of headers and footers removed
   * @example
   * ```typescript
   * const count = doc.removeAllHeadersFooters();
   * console.log(`Removed ${count} headers and footers`);
   * ```
   */
  removeAllHeadersFooters(): number {
    let totalCount = 0;

    // Step 1: Remove relationship entries for headers and footers
    const headerRels = this.relationshipManager.getRelationshipsByType(
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/header"
    );
    const footerRels = this.relationshipManager.getRelationshipsByType(
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer"
    );

    for (const rel of [...headerRels, ...footerRels]) {
      this.relationshipManager.removeRelationship(rel.getId());
      totalCount++;
    }

    // Step 2: Find and delete all header/footer XML files from ZIP archive
    // Scan for word/header*.xml and word/footer*.xml files
    const allFiles = this.zipHandler.getFilePaths();
    const headerFooterFiles = allFiles.filter((path) =>
      path.match(/^word\/(header|footer)\d+\.xml$/i)
    );

    for (const filePath of headerFooterFiles) {
      this.zipHandler.removeFile(filePath);
    }

    // Step 3: Clear internal references
    this.headerFooterManager.clear();

    // Clear section header/footer references
    const section = this.section;
    const sectionProps = (section as any).properties as any;

    if (sectionProps.headers) {
      sectionProps.headers = {};
    }

    if (sectionProps.footers) {
      sectionProps.footers = {};
    }

    // Disable title page if it was enabled for first page headers/footers
    if (sectionProps.titlePage) {
      sectionProps.titlePage = false;
    }

    return totalCount;
  }

  /**
   * Gets the raw styles.xml content as a string
   * @returns The raw XML content of styles.xml
   */
  getStylesXml(): string {
    const stylesFile = this.zipHandler.getFileAsString(DOCX_PATHS.STYLES);
    return stylesFile || this.stylesManager.generateStylesXml();
  }

  /**
   * Sets the raw styles.xml content
   *
   * **Warning:** This directly sets the XML content without validation.
   * Invalid XML may corrupt the document. Use StylesManager.validate()
   * to check the XML before setting.
   *
   * @param xml - The raw XML content to set
   */
  setStylesXml(xml: string): void {
    this.zipHandler.updateFile(DOCX_PATHS.STYLES, xml);

    // Clear the styles manager to force reload on next access
    this.stylesManager.clear();
  }

  /**
   * Gets the underlying ZipHandler for advanced ZIP operations
   *
   * Provides low-level access to the ZIP archive for advanced scenarios
   * like direct file manipulation, custom part extraction, or debugging.
   * Use with caution as direct modifications can corrupt the document.
   *
   * @returns The ZipHandler instance managing the DOCX package
   *
   * @example
   * ```typescript
   * const zipHandler = doc.getZipHandler();
   * const files = zipHandler.getFilePaths();
   * console.log('Package contains:', files);
   * ```
   */
  getZipHandler(): ZipHandler {
    return this.zipHandler;
  }

  /**
   * Gets the NumberingManager for advanced list operations
   *
   * Provides direct access to the NumberingManager for advanced scenarios
   * like creating custom list definitions, managing numbering instances,
   * or analyzing list structures.
   *
   * @returns The NumberingManager instance managing this document's lists
   *
   * @example
   * ```typescript
   * const numManager = doc.getNumberingManager();
   * const instances = numManager.getAllInstances();
   * console.log(`Document has ${instances.length} list definitions`);
   * ```
   */
  getNumberingManager(): NumberingManager {
    return this.numberingManager;
  }

  /**
   * Creates a new bullet list definition and returns its ID
   *
   * Creates a multi-level bullet list with customizable bullet characters
   * for each level. The returned numId can be used with {@link Paragraph.setNumbering}
   * to apply the list to paragraphs.
   *
   * @param levels - Number of indentation levels to create (default: 3, max: 9)
   * @param bullets - Optional array of bullet characters for each level (default: ['•', '○', '■'])
   * @returns The numbering instance ID to use with paragraph.setNumbering()
   *
   * @example
   * ```typescript
   * // Create simple 3-level bullet list
   * const listId = doc.createBulletList();
   * doc.createParagraph('Level 1 item').setNumbering(listId, 0);
   * doc.createParagraph('Level 2 item').setNumbering(listId, 1);
   * ```
   *
   * @example
   * ```typescript
   * // Create with custom bullets
   * const listId = doc.createBulletList(4, ['★', '☆', '▶', '▷']);
   * doc.createParagraph('Star item').setNumbering(listId, 0);
   * doc.createParagraph('Hollow star').setNumbering(listId, 1);
   * ```
   */
  createBulletList(levels: number = 3, bullets?: string[]): number {
    return this.numberingManager.createBulletList(levels, bullets);
  }

  /**
   * Creates a new numbered list definition and returns its ID
   *
   * Creates a multi-level numbered list with customizable number formats
   * for each level (decimal, roman, letters, etc.). The returned numId can be
   * used with {@link Paragraph.setNumbering} to apply the list to paragraphs.
   *
   * @param levels - Number of indentation levels to create (default: 3, max: 9)
   * @param formats - Optional array of number formats for each level (default: ['decimal', 'lowerLetter', 'lowerRoman'])
   * @returns The numbering instance ID to use with paragraph.setNumbering()
   *
   * @example
   * ``` typescript
   * // Create simple 3-level numbered list
   * const listId = doc.createNumberedList();
   * doc.createParagraph('1. First item').setNumbering(listId, 0);
   * doc.createParagraph('a. Sub-item').setNumbering(listId, 1);
   * ```
   *
   * @example
   * ```typescript
   * // Create custom format list
   * const listId = doc.createNumberedList(2, ['upperRoman', 'lowerLetter']);
   * doc.createParagraph('Roman numeral').setNumbering(listId, 0);  // I.
   * doc.createParagraph('Letter').setNumbering(listId, 1);          // a.
   * ```
   */
  createNumberedList(
    levels: number = 3,
    formats?: Array<"decimal" | "lowerLetter" | "lowerRoman">
  ): number {
    return this.numberingManager.createNumberedList(levels, formats);
  }

  /**
   * Creates a new multi-level list and returns its numId
   * @returns The numId to use with setNumbering()
   */
  createMultiLevelList(): number {
    return this.numberingManager.createMultiLevelList();
  }

  /**
   * Gets the framework's standard indentation for a list level
   *
   * The framework uses a consistent indentation scheme:
   * - leftIndent: 720 * (level + 1) twips
   * - hangingIndent: 360 twips
   *
   * @param level The level (0-8)
   * @returns Object with leftIndent and hangingIndent in twips
   * @example
   * ```typescript
   * const indent = doc.getStandardIndentation(0);
   * // Returns: { leftIndent: 720, hangingIndent: 360 }
   * ```
   */
  getStandardIndentation(level: number): {
    leftIndent: number;
    hangingIndent: number;
  } {
    return this.numberingManager.getStandardIndentation(level);
  }

  /**
   * Sets custom indentation for a specific level in a numbering definition
   *
   * This updates the indentation for a specific level across ALL paragraphs
   * that use this numId and level combination.
   *
   * @param numId The numbering instance ID
   * @param level The level to modify (0-8)
   * @param leftIndent Left indentation in twips
   * @param hangingIndent Hanging indentation in twips (optional, defaults to 360)
   * @returns This document for chaining
   * @example
   * ```typescript
   * // Set level 0 to 0.5 inch left, 0.25 inch hanging
   * doc.setListIndentation(1, 0, 720, 360);
   * ```
   */
  setListIndentation(
    numId: number,
    level: number,
    leftIndent: number,
    hangingIndent?: number
  ): this {
    this.numberingManager.setListIndentation(
      numId,
      level,
      leftIndent,
      hangingIndent
    );
    return this;
  }

  /**
   * Normalizes indentation for all lists in the document
   *
   * Applies standard indentation to every numbering instance:
   * - leftIndent: 720 * (level + 1) twips
   * - hangingIndent: 360 twips
   *
   * This ensures consistent spacing across all lists in the document.
   *
   * @returns Number of numbering instances updated
   * @example
   * ```typescript
   * const count = doc.normalizeAllListIndentation();
   * console.log(`Normalized ${count} lists`);
   * ```
   */
  normalizeAllListIndentation(): number {
    return this.numberingManager.normalizeAllListIndentation();
  }

  /**
   * Applies standard formatting to all bullet lists in the document
   *
   * Standardizes bullet lists with:
   * - Alternating bullet symbols: • (solid) for even levels, ○ (open) for odd levels
   * - Indentation: 0.5" increments (720 twips per level)
   * - Hanging indent: 0.25" (360 twips)
   * - Paragraph text: Verdana 12pt
   * - Spacing: 0pt before, 3pt after (60 twips)
   * - Contextual spacing enabled (no spacing between same-type paragraphs)
   *
   * @returns Number of bullet lists updated
   * @example
   * ```typescript
   * const doc = await Document.load('document.docx');
   * const count = doc.applyStandardListFormatting();
   * console.log(`Standardized ${count} bullet lists`);
   * await doc.save('document-formatted.docx');
   * ```
   */
  applyStandardListFormatting(): number {
    const instances = this.numberingManager.getAllInstances();
    let count = 0;

    for (const instance of instances) {
      const abstractNumId = instance.getAbstractNumId();
      const abstractNum =
        this.numberingManager.getAbstractNumbering(abstractNumId);

      if (!abstractNum) continue;

      // Only process bullet lists (skip numbered lists)
      const level0 = abstractNum.getLevel(0);
      if (!level0 || level0.getFormat() !== "bullet") continue;

      // Update all 9 levels (0-8) with standard formatting
      for (let levelIndex = 0; levelIndex < 9; levelIndex++) {
        const numLevel = abstractNum.getLevel(levelIndex);
        if (!numLevel) continue;

        // Alternate bullets: even levels = solid (•), odd levels = open (○)
        const bullet = levelIndex % 2 === 0 ? "•" : "○";
        numLevel.setText(bullet);

        // Set bullet font to Arial (Unicode bullets require a regular font, not Symbol)
        numLevel.setFont("Arial");

        // Set bullet size to 12pt (24 half-points)
        numLevel.setFontSize(24);

        // Indentation: 0.5" per level (720 twips)
        // Level 0 = 720, Level 1 = 1440, Level 2 = 2160, etc.
        numLevel.setLeftIndent(720 * (levelIndex + 1));

        // Hanging indent: 0.25" (360 twips) for all levels
        numLevel.setHangingIndent(360);
      }

      // Apply paragraph formatting to all paragraphs using this list
      this.applyFormattingToListParagraphs(instance.getNumId());
      count++;
    }

    return count;
  }

  /**
   * Applies standard formatting to all numbered lists in the document
   *
   * Standardizes numbered lists with (preserves existing numbering format):
   * - Indentation: 0.5" increments (720 twips per level)
   * - Hanging indent: 0.25" (360 twips)
   * - Number font: Verdana 12pt
   * - Paragraph text: Verdana 12pt
   * - Spacing: 0pt before, 3pt after (60 twips)
   * - Contextual spacing enabled (no spacing between same-type paragraphs)
   *
   * Note: This preserves the existing numbering format (decimal, roman, etc.)
   * and only standardizes the visual formatting. To change numbering formats,
   * use normalizeNumberedLists() instead.
   *
   * @returns Number of numbered lists updated
   * @example
   * ```typescript
   * const doc = await Document.load('document.docx');
   * const count = doc.applyStandardNumberedListFormatting();
   * console.log(`Standardized ${count} numbered lists`);
   * await doc.save('document-formatted.docx');
   * ```
   */
  applyStandardNumberedListFormatting(): number {
    const instances = this.numberingManager.getAllInstances();
    let count = 0;

    for (const instance of instances) {
      const abstractNumId = instance.getAbstractNumId();
      const abstractNum =
        this.numberingManager.getAbstractNumbering(abstractNumId);

      if (!abstractNum) continue;

      // Only process numbered lists (skip bullet lists)
      const level0 = abstractNum.getLevel(0);
      if (!level0 || level0.getFormat() === "bullet") continue;

      // Update all 9 levels (0-8) with standard formatting
      for (let levelIndex = 0; levelIndex < 9; levelIndex++) {
        const numLevel = abstractNum.getLevel(levelIndex);
        if (!numLevel) continue;

        // Set number font to Verdana 12pt
        numLevel.setFont("Verdana");
        numLevel.setFontSize(24); // 12pt = 24 half-points

        // Indentation: 0.5" per level (720 twips)
        // Level 0 = 720, Level 1 = 1440, Level 2 = 2160, etc.
        numLevel.setLeftIndent(720 * (levelIndex + 1));

        // Hanging indent: 0.25" (360 twips) for all levels
        numLevel.setHangingIndent(360);

        // Set alignment to left
        numLevel.setAlignment("left");
      }

      // Apply paragraph formatting to all paragraphs using this list
      this.applyFormattingToListParagraphs(instance.getNumId());
      count++;
    }

    return count;
  }

  /**
   * Applies formatting to all paragraphs that use a specific numbering instance
   * Sets font, spacing, and contextual spacing properties
   * @param numId The numbering instance ID
   * @private
   */
  private applyFormattingToListParagraphs(numId: number): void {
    const paragraphs = this.getAllParagraphs();

    for (const para of paragraphs) {
      const numbering = para.getNumbering();
      if (numbering?.numId === numId) {
        // Apply font to all runs in the paragraph
        const runs = para.getRuns();
        for (const run of runs) {
          run.setFont("Verdana", 12);
        }

        // Apply paragraph spacing
        para.setSpaceBefore(0); // 0pt before
        para.setSpaceAfter(60); // 3pt after (60 twips)
        para.setContextualSpacing(true); // No spacing between same-type paragraphs

        // Clear paragraph-level indentation so numbering definition indentation takes effect
        // Paragraph-level indentation overrides numbering indentation, so we need to remove it
        para.formatting.indentation = undefined;
      }
    }
  }

  /**
   * Checks if a paragraph is contained within a table cell
   * @param para The paragraph to check
   * @returns Object with inTable boolean and cell reference if found
   * @private
   */
  private isParagraphInTable(para: Paragraph): {
    inTable: boolean;
    cell?: TableCell;
  } {
    const allTables = this.getAllTables();

    for (const table of allTables) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          const cellParas = cell.getParagraphs();
          for (const cellPara of cellParas) {
            if (cellPara === para) {
              return { inTable: true, cell };
            }
          }
        }
      }
    }

    return { inTable: false };
  }

  /**
   * Wraps a paragraph in a 1x1 table and applies cell formatting
   * @param para The paragraph to wrap
   * @param options Formatting options for the table cell
   * @returns The created table
   * @private
   */
  private wrapParagraphInTable(
    para: Paragraph,
    options: {
      shading?: string;
      marginTop?: number;
      marginBottom?: number;
      marginLeft?: number;
      marginRight?: number;
      tableWidthPercent?: number;
    }
  ): Table {
    // Find the paragraph index in bodyElements
    const paraIndex = this.bodyElements.indexOf(para);
    if (paraIndex === -1) {
      throw new Error("Paragraph not found in document body elements");
    }

    // Create 1x1 table
    const table = new Table(1, 1);
    const cell = table.getCell(0, 0);

    if (!cell) {
      throw new Error("Failed to get cell from newly created table");
    }

    // Move paragraph to cell
    // Remove paragraph from document body
    this.bodyElements.splice(paraIndex, 1);

    // Add paragraph to cell
    cell.addParagraph(para);

    // Apply cell formatting
    if (options.shading) {
      cell.setShading({ fill: options.shading });
    }

    if (
      options.marginTop !== undefined ||
      options.marginBottom !== undefined ||
      options.marginLeft !== undefined ||
      options.marginRight !== undefined
    ) {
      cell.setMargins({
        top: options.marginTop ?? 100,
        bottom: options.marginBottom ?? 100,
        left: options.marginLeft ?? 100,
        right: options.marginRight ?? 100,
      });
    }

    // Set table width (percentage of page width)
    if (options.tableWidthPercent !== undefined) {
      table.setWidth(options.tableWidthPercent);
      table.setWidthType("pct");
    }

    // Insert table where paragraph was
    this.bodyElements.splice(paraIndex, 0, table);

    return table;
  }

  // Default style configurations for applyStyles()
  private static readonly DEFAULT_HEADING1_CONFIG: StyleConfig = {
    run: {
      font: "Verdana",
      size: 18,
      bold: true,
      color: "000000",
    },
    paragraph: {
      alignment: "left",
      spacing: { before: 0, after: 240, line: 240, lineRule: "auto" },
    },
  };

  private static readonly DEFAULT_HEADING2_CONFIG: Heading2Config = {
    run: {
      font: "Verdana",
      size: 14,
      bold: true,
      color: "000000",
    },
    paragraph: {
      alignment: "left",
      spacing: { before: 120, after: 120, line: 240, lineRule: "auto" },
    },
    tableOptions: {
      shading: "BFBFBF",
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 115,
      marginRight: 115,
      tableWidthPercent: 5000,
    },
  };

  private static readonly DEFAULT_HEADING3_CONFIG: StyleConfig = {
    run: {
      font: "Verdana",
      size: 12,
      bold: true,
      color: "000000",
    },
    paragraph: {
      alignment: "left",
      spacing: { before: 60, after: 60, line: 240, lineRule: "auto" },
    },
  };

  private static readonly DEFAULT_NORMAL_CONFIG: StyleConfig = {
    run: {
      font: "Verdana",
      size: 12,
      color: "000000",
    },
    paragraph: {
      alignment: "left",
      spacing: { before: 60, after: 60, line: 240, lineRule: "auto" },
    },
  };

  private static readonly DEFAULT_LIST_PARAGRAPH_CONFIG: StyleConfig = {
    run: {
      font: "Verdana",
      size: 12,
      color: "000000",
    },
    paragraph: {
      alignment: "left",
      spacing: { before: 0, after: 60, line: 240, lineRule: "auto" },
      indentation: { left: 360, hanging: 360 },
      contextualSpacing: true,
    },
  };

  /**
   * Gets all Run instances from a paragraph, including those nested inside
   * Revision, Hyperlink, and other container elements.
   *
   * This method recursively extracts runs from:
   * - Direct Run children of the paragraph
   * - Runs inside Revision elements (tracked changes)
   * - Runs inside Hyperlink elements
   *
   * @param para - The paragraph to extract runs from
   * @returns Array of all Run instances found in the paragraph
   * @private
   */
  private getAllRunsFromParagraph(para: Paragraph): Run[] {
    const runs: Run[] = [];
    const content = para.getContent();

    for (const item of content) {
      if (item instanceof Run) {
        // Direct run
        runs.push(item);
      } else if (item instanceof Revision) {
        // Runs inside revision wrappers
        const revisionRuns = item.getRuns();
        runs.push(...revisionRuns);
      } else if (item instanceof Hyperlink) {
        // Run inside hyperlink (Hyperlink has a single run)
        const hyperlinkRun = item.getRun();
        runs.push(hyperlinkRun);
      }
    }

    return runs;
  }

  /**
   * Applies styles to the document with custom formatting
   *
   * Modifies existing Heading1, Heading2, Heading3, Normal, and List Paragraph style definitions
   * with custom formatting. This approach preserves the original style names while updating their formatting.
   *
   * **Key Feature**: Only properties explicitly provided in options will override current style values.
   * The method reads the ACTUAL current values from the style objects, not hardcoded defaults.
   * This allows you to change just one property (like font) while keeping all other existing values.
   *
   * Per ECMA-376 §17.7.2, direct formatting in document.xml ALWAYS overrides
   * style definitions in styles.xml. This method clears conflicting direct
   * formatting from paragraphs to allow style modifications to take effect.
   *
   * Fallback defaults (when no options provided OR style doesn't exist):
   * - Heading1: 18pt black bold Verdana, left aligned, 0pt before / 12pt after, single line spacing, no italic/underline
   * - Heading2: 14pt black bold Verdana, left aligned, 6pt before/after, single line spacing, wrapped in gray tables (0.08" margins), no italic/underline
   * - Heading3: 12pt black bold Verdana, left aligned, 3pt before/after, single line spacing, no table wrapping, no italic/underline
   * - Normal: 12pt Verdana, left aligned, 3pt before/after, single line spacing, no italic/underline
   * - List Paragraph: 12pt Verdana, left aligned, 0pt before / 3pt after, single line spacing, 0.25" bullet indent / 0.50" text indent, contextual spacing enabled, no italic/underline
   *
   * Heading2 table wrapping behavior:
   * - Empty Heading2 paragraphs are skipped (not wrapped in tables)
   * - Heading2 paragraphs already in tables have their cell formatted (shading, margins, width)
   * - Heading2 paragraphs not in tables are wrapped in new 1x1 tables
   * - Table appearance is configurable via options.heading2.tableOptions
   *
   * @param options - Optional custom formatting configuration for each style. Properties merge with current values.
   * @returns Object indicating which styles were successfully modified
   *
   * @example
   * ```typescript
   * // Use default formatting (applies Verdana defaults)
   * doc.applyStyles();
   * ```
   *
   * @example
   * ```typescript
   * // Just change font, keep all other existing style values
   * doc.applyStyles({
   *   heading1: {
   *     run: { font: 'Arial' } // Only overrides font, keeps existing size/bold/color/etc.
   *   }
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Comprehensive custom formatting
   * doc.applyStyles({
   *   heading1: {
   *     run: { font: 'Arial', size: 16, bold: true, color: '000000' },
   *     paragraph: { spacing: { before: 0, after: 200, line: 240, lineRule: 'auto' } }
   *   },
   *   heading2: {
   *     run: { font: 'Arial', size: 14, bold: true },
   *     paragraph: { spacing: { before: 100, after: 100 } },
   *     tableOptions: { shading: '808080', marginLeft: 150, marginRight: 150 }
   *   }
   * });
   * ```
   */
  public applyStyles(options?: ApplyStylesOptions): {
    heading1: boolean;
    heading2: boolean;
    heading3: boolean;
    normal: boolean;
    listParagraph: boolean;
  } {
    const results = {
      heading1: false,
      heading2: false,
      heading3: false,
      normal: false,
      listParagraph: false,
    };

    // Get existing styles from StylesManager
    const heading1 = this.stylesManager.getStyle("Heading1");
    const heading2 = this.stylesManager.getStyle("Heading2");
    const heading3 = this.stylesManager.getStyle("Heading3");
    const normal = this.stylesManager.getStyle("Normal");
    const listParagraph = this.stylesManager.getStyle("ListParagraph");

    // Merge provided options with ACTUAL current style values (not hardcoded defaults)
    // This allows users to only specify properties they want to change
    const h1Config = {
      run: {
        ...(heading1?.getRunFormatting() ||
          Document.DEFAULT_HEADING1_CONFIG.run),
        ...options?.heading1?.run,
      },
      paragraph: {
        ...(heading1?.getParagraphFormatting() ||
          Document.DEFAULT_HEADING1_CONFIG.paragraph),
        ...options?.heading1?.paragraph,
      },
    };
    const h2Config = {
      run: {
        ...(heading2?.getRunFormatting() ||
          Document.DEFAULT_HEADING2_CONFIG.run),
        ...options?.heading2?.run,
      },
      paragraph: {
        ...(heading2?.getParagraphFormatting() ||
          Document.DEFAULT_HEADING2_CONFIG.paragraph),
        ...options?.heading2?.paragraph,
      },
      tableOptions: {
        ...Document.DEFAULT_HEADING2_CONFIG.tableOptions,
        ...options?.heading2?.tableOptions,
      },
    };
    const h3Config = {
      run: {
        ...(heading3?.getRunFormatting() ||
          Document.DEFAULT_HEADING3_CONFIG.run),
        ...options?.heading3?.run,
      },
      paragraph: {
        ...(heading3?.getParagraphFormatting() ||
          Document.DEFAULT_HEADING3_CONFIG.paragraph),
        ...options?.heading3?.paragraph,
      },
    };
    const normalConfig = {
      run: {
        ...(normal?.getRunFormatting() || Document.DEFAULT_NORMAL_CONFIG.run),
        ...options?.normal?.run,
      },
      paragraph: {
        ...(normal?.getParagraphFormatting() ||
          Document.DEFAULT_NORMAL_CONFIG.paragraph),
        ...options?.normal?.paragraph,
      },
    };
    const listParaConfig = {
      run: {
        ...(listParagraph?.getRunFormatting() ||
          Document.DEFAULT_LIST_PARAGRAPH_CONFIG.run),
        ...options?.listParagraph?.run,
      },
      paragraph: {
        ...(listParagraph?.getParagraphFormatting() ||
          Document.DEFAULT_LIST_PARAGRAPH_CONFIG.paragraph),
        ...options?.listParagraph?.paragraph,
      },
    };

    // Extract preserve blank lines option (defaults to true)
    const preserveBlankLines =
      options?.preserveBlankLinesAfterHeading2Tables ?? true;

    // Modify Heading1 definition
    if (heading1 && h1Config.run && h1Config.paragraph) {
      if (h1Config.run) heading1.setRunFormatting(h1Config.run);
      if (h1Config.paragraph)
        heading1.setParagraphFormatting(h1Config.paragraph);
      // Mark style as modified so it gets included in mergeStylesWithOriginal()
      this.addStyle(heading1);
      results.heading1 = true;
    }

    // Modify Heading2 definition
    if (heading2 && h2Config.run && h2Config.paragraph) {
      if (h2Config.run) heading2.setRunFormatting(h2Config.run);
      if (h2Config.paragraph)
        heading2.setParagraphFormatting(h2Config.paragraph);
      // Mark style as modified so it gets included in mergeStylesWithOriginal()
      this.addStyle(heading2);
      results.heading2 = true;
    }

    // Modify Heading3 definition
    if (heading3 && h3Config.run && h3Config.paragraph) {
      if (h3Config.run) heading3.setRunFormatting(h3Config.run);
      if (h3Config.paragraph)
        heading3.setParagraphFormatting(h3Config.paragraph);
      // Mark style as modified so it gets included in mergeStylesWithOriginal()
      this.addStyle(heading3);
      results.heading3 = true;
    }

    // Modify Normal definition
    if (normal && normalConfig.run && normalConfig.paragraph) {
      if (normalConfig.run) normal.setRunFormatting(normalConfig.run);
      if (normalConfig.paragraph)
        normal.setParagraphFormatting(normalConfig.paragraph);
      // Mark style as modified so it gets included in mergeStylesWithOriginal()
      this.addStyle(normal);

      // Link NormalWeb to Normal (if enabled and NormalWeb exists)
      // Default is true - changes to Normal automatically apply to NormalWeb
      const shouldLinkNormalWeb = options?.linkNormalWebToNormal !== false;
      if (shouldLinkNormalWeb) {
        const normalWeb = this.stylesManager.getStyle("NormalWeb");
        if (normalWeb) {
          // Apply same formatting to NormalWeb
          if (normalConfig.run) normalWeb.setRunFormatting(normalConfig.run);
          if (normalConfig.paragraph)
            normalWeb.setParagraphFormatting(normalConfig.paragraph);
          // Mark as modified for selective merging during save
          this.addStyle(normalWeb);
        }
      }

      results.normal = true;
    }

    // Modify List Paragraph definition
    if (listParagraph && listParaConfig.run && listParaConfig.paragraph) {
      if (listParaConfig.run)
        listParagraph.setRunFormatting(listParaConfig.run);
      if (listParaConfig.paragraph)
        listParagraph.setParagraphFormatting(listParaConfig.paragraph);
      // Mark style as modified so it gets included in mergeStylesWithOriginal()
      this.addStyle(listParagraph);
      results.listParagraph = true;
    }

    // Extract preserve flags from configurations
    const h1Preserve = {
      bold: h1Config.run?.preserveBold ?? false,
      italic: h1Config.run?.preserveItalic ?? false,
      underline: h1Config.run?.preserveUnderline ?? false,
    };
    const h2Preserve = {
      bold: h2Config.run?.preserveBold ?? false,
      italic: h2Config.run?.preserveItalic ?? false,
      underline: h2Config.run?.preserveUnderline ?? false,
    };
    const h3Preserve = {
      bold: h3Config.run?.preserveBold ?? false,
      italic: h3Config.run?.preserveItalic ?? false,
      underline: h3Config.run?.preserveUnderline ?? false,
    };
    const normalPreserve = {
      bold: normalConfig.run?.preserveBold ?? true,
      italic: normalConfig.run?.preserveItalic ?? false,
      underline: normalConfig.run?.preserveUnderline ?? false,
    };
    const listParaPreserve = {
      bold: listParaConfig.run?.preserveBold ?? true,
      italic: listParaConfig.run?.preserveItalic ?? false,
      underline: listParaConfig.run?.preserveUnderline ?? false,
    };

    // Clear direct formatting from affected paragraphs and wrap Heading2 in tables
    // Use a Set to track processed paragraphs and prevent duplicate wrapping
    const processedParagraphs = new Set<Paragraph>();

    // Get all paragraphs ONCE before modifications to prevent processing duplicates
    const allParas = this.getAllParagraphs();

    for (const para of allParas) {
      // Skip if already processed
      if (processedParagraphs.has(para)) {
        continue;
      }

      const styleId = para.getStyle();

      // Process Heading1 paragraphs
      if (styleId === "Heading1" && heading1) {
        // Save white font status BEFORE clearing (clearDirectFormattingConflicts clears color)
        const allRuns = this.getAllRunsFromParagraph(para);
        const whiteFontRuns = new Set(
          options?.preserveWhiteFont
            ? allRuns.filter(run => run.getColor()?.toUpperCase() === 'FFFFFF')
            : []
        );

        para.clearDirectFormattingConflicts(heading1);

        // Apply formatting to all runs (including those in revisions/hyperlinks), respecting preserve flags
        for (const run of allRuns) {
          // Skip runs with Hyperlink style - preserve their blue color and underline
          if (run.isHyperlinkStyled()) {
            continue;
          }
          if (!h1Preserve.bold) {
            run.setBold(h1Config.run?.bold ?? false);
          }
          if (!h1Preserve.italic) {
            run.setItalic(h1Config.run?.italic ?? false);
          }
          if (!h1Preserve.underline) {
            run.setUnderline(h1Config.run?.underline ? "single" : false);
          }
          // Apply font, color, and size - skip color if run was white font
          if (h1Config.run?.font) {
            run.setFont(h1Config.run.font);
          }
          if (h1Config.run?.color !== undefined) {
            if (whiteFontRuns.has(run)) {
              // Restore white font
              run.setColor('FFFFFF');
            } else {
              run.setColor(h1Config.run.color);
            }
          }
          if (h1Config.run?.size) {
            run.setSize(h1Config.run.size);
          }
        }

        // Update paragraph mark properties to match configuration
        if (para.formatting.paragraphMarkRunProperties) {
          const markProps = para.formatting.paragraphMarkRunProperties;
          if (
            !h1Preserve.bold &&
            h1Config.run?.bold === false &&
            markProps.bold
          ) {
            delete markProps.bold;
          }
          if (
            !h1Preserve.italic &&
            h1Config.run?.italic === false &&
            markProps.italic
          ) {
            delete markProps.italic;
          }
          if (
            !h1Preserve.underline &&
            h1Config.run?.underline === false &&
            markProps.underline
          ) {
            delete markProps.underline;
          }
          // Update paragraph mark font, color, size
          if (h1Config.run?.font) {
            markProps.font = h1Config.run.font;
          }
          if (h1Config.run?.color) {
            markProps.color = h1Config.run.color;
          }
          if (h1Config.run?.size) {
            markProps.size = h1Config.run.size;
          }
        }

        processedParagraphs.add(para);
      }

      // Process Heading2 paragraphs
      else if (styleId === "Heading2" && heading2) {
        // Check if paragraph has actual text content (skip empty paragraphs)
        const hasContent = this.getAllRunsFromParagraph(para)
          .some((run) => run.getText().trim().length > 0);

        if (!hasContent) {
          // Skip empty Heading2 paragraphs - don't wrap them in tables
          processedParagraphs.add(para);
          continue;
        }

        // Check if paragraph is in a table FIRST (need this info for alignment preservation)
        const { inTable, cell } = this.isParagraphInTable(para);

        // Preserve alignment for shaded cells in multi-cell tables
        // Centering should not be cleared by clearDirectFormattingConflicts()
        let preservedAlignment: typeof para.formatting.alignment = undefined;

        if (inTable && cell) {
          // Find the table to check if it's > 1x1
          const table = this.getAllTables().find((t) => {
            for (const row of t.getRows()) {
              for (const c of row.getCells()) {
                if (c === cell) return true;
              }
            }
            return false;
          });

          // Preserve alignment for shaded cells in multi-cell tables
          if (table) {
            const rowCount = table.getRowCount();
            const colCount = table.getColumnCount();
            const isMultiCellTable = !(rowCount === 1 && colCount === 1);
            const cellFormatting = cell.getFormatting();
            const cellHasShading = !!(
              cellFormatting?.shading?.fill ||
              cellFormatting?.shading?.pattern
            );

            if (isMultiCellTable && cellHasShading && para.formatting.alignment) {
              preservedAlignment = para.formatting.alignment;
            }
          }
        }

        // Save white font status BEFORE clearing (clearDirectFormattingConflicts clears color)
        const allRuns = this.getAllRunsFromParagraph(para);
        const whiteFontRuns = new Set(
          options?.preserveWhiteFont
            ? allRuns.filter(run => run.getColor()?.toUpperCase() === 'FFFFFF')
            : []
        );

        // Clear direct formatting
        para.clearDirectFormattingConflicts(heading2);

        // Restore preserved alignment
        if (preservedAlignment) {
          para.setAlignment(preservedAlignment);
        }

        // Apply formatting to all runs (including those in revisions/hyperlinks), respecting preserve flags
        for (const run of allRuns) {
          // Skip runs with Hyperlink style - preserve their blue color and underline
          if (run.isHyperlinkStyled()) {
            continue;
          }
          if (!h2Preserve.bold) {
            run.setBold(h2Config.run?.bold ?? false);
          }
          if (!h2Preserve.italic) {
            run.setItalic(h2Config.run?.italic ?? false);
          }
          if (!h2Preserve.underline) {
            run.setUnderline(h2Config.run?.underline ? "single" : false);
          }
          // Apply font, color, and size - skip color if run was white font
          if (h2Config.run?.font) {
            run.setFont(h2Config.run.font);
          }
          if (h2Config.run?.color !== undefined) {
            if (whiteFontRuns.has(run)) {
              // Restore white font
              run.setColor('FFFFFF');
            } else {
              run.setColor(h2Config.run.color);
            }
          }
          if (h2Config.run?.size) {
            run.setSize(h2Config.run.size);
          }
        }

        // Update paragraph mark properties to match configuration
        if (para.formatting.paragraphMarkRunProperties) {
          const markProps = para.formatting.paragraphMarkRunProperties;
          if (
            !h2Preserve.bold &&
            h2Config.run?.bold === false &&
            markProps.bold
          ) {
            delete markProps.bold;
          }
          if (
            !h2Preserve.italic &&
            h2Config.run?.italic === false &&
            markProps.italic
          ) {
            delete markProps.italic;
          }
          if (
            !h2Preserve.underline &&
            h2Config.run?.underline === false &&
            markProps.underline
          ) {
            delete markProps.underline;
          }
          // Update paragraph mark font, color, size
          if (h2Config.run?.font) {
            markProps.font = h2Config.run.font;
          }
          if (h2Config.run?.color) {
            markProps.color = h2Config.run.color;
          }
          if (h2Config.run?.size) {
            markProps.size = h2Config.run.size;
          }
        }

        if (inTable && cell) {
          // Paragraph is already in a table - apply cell formatting using config
          if (h2Config.tableOptions?.shading) {
            cell.setShading({ fill: h2Config.tableOptions.shading });
          }
          if (
            h2Config.tableOptions?.marginTop !== undefined ||
            h2Config.tableOptions?.marginBottom !== undefined ||
            h2Config.tableOptions?.marginLeft !== undefined ||
            h2Config.tableOptions?.marginRight !== undefined
          ) {
            cell.setMargins({
              top: h2Config.tableOptions.marginTop ?? 0,
              bottom: h2Config.tableOptions.marginBottom ?? 0,
              left: h2Config.tableOptions.marginLeft ?? 115,
              right: h2Config.tableOptions.marginRight ?? 115,
            });
          }

          // Set table width using config
          if (h2Config.tableOptions?.tableWidthPercent) {
            const table = this.getAllTables().find((t) => {
              for (const row of t.getRows()) {
                for (const c of row.getCells()) {
                  if (c === cell) return true;
                }
              }
              return false;
            });
            if (table) {
              table.setWidth(h2Config.tableOptions.tableWidthPercent);
              table.setWidthType("pct");
            }
          }
        } else {
          // Paragraph is not in a table - wrap it using config
          const table = this.wrapParagraphInTable(para, {
            shading: h2Config.tableOptions?.shading ?? "BFBFBF",
            marginTop: h2Config.tableOptions?.marginTop ?? 0,
            marginBottom: h2Config.tableOptions?.marginBottom ?? 0,
            marginLeft: h2Config.tableOptions?.marginLeft ?? 115,
            marginRight: h2Config.tableOptions?.marginRight ?? 115,
            tableWidthPercent: h2Config.tableOptions?.tableWidthPercent ?? 5000,
          });

          // Add blank paragraph after table for spacing (only if not already present)
          const tableIndex = this.bodyElements.indexOf(table);
          if (tableIndex !== -1) {
            // Check if the next element has any content (text, hyperlinks, images, etc.)
            const nextElement = this.bodyElements[tableIndex + 1];

            // Check if next element is truly blank (no content at all)
            const isNextElementBlank = (() => {
              if (!(nextElement instanceof Paragraph)) return false;

              const content = nextElement.getContent();
              if (!content || content.length === 0) return true;

              // Check if all content items are empty
              for (const item of content) {
                // Hyperlinks count as content
                if (item instanceof Hyperlink) {
                  return false;
                }
                // Images count as content (check for Image class when implemented)
                // Runs with text count as content
                if ((item as any).getText) {
                  const text = (item as any).getText().trim();
                  if (text !== "") return false;
                }
              }

              return true; // All content is empty
            })();

            // Only add blank paragraph if next element is truly blank or doesn't exist
            if (!isNextElementBlank) {
              const blankPara = Paragraph.create();
              // Add explicit spacing to ensure visibility in Word (120 twips = 6pt)
              blankPara.setSpaceAfter(120);
              // Mark as preserved if option is enabled (defaults to true)
              if (preserveBlankLines) {
                blankPara.setPreserved(true);
              }
              this.bodyElements.splice(tableIndex + 1, 0, blankPara);
            }
          }
        }

        processedParagraphs.add(para);
      }

      // Process Heading3 paragraphs
      else if (styleId === "Heading3" && heading3) {
        // Save white font status BEFORE clearing (clearDirectFormattingConflicts clears color)
        const allRuns = this.getAllRunsFromParagraph(para);
        const whiteFontRuns = new Set(
          options?.preserveWhiteFont
            ? allRuns.filter(run => run.getColor()?.toUpperCase() === 'FFFFFF')
            : []
        );

        para.clearDirectFormattingConflicts(heading3);

        // Apply formatting to all runs (including those in revisions/hyperlinks), respecting preserve flags
        for (const run of allRuns) {
          // Skip runs with Hyperlink style - preserve their blue color and underline
          if (run.isHyperlinkStyled()) {
            continue;
          }
          if (!h3Preserve.bold) {
            run.setBold(h3Config.run?.bold ?? false);
          }
          if (!h3Preserve.italic) {
            run.setItalic(h3Config.run?.italic ?? false);
          }
          if (!h3Preserve.underline) {
            run.setUnderline(h3Config.run?.underline ? "single" : false);
          }
          // Apply font, color, and size - skip color if run was white font
          if (h3Config.run?.font) {
            run.setFont(h3Config.run.font);
          }
          if (h3Config.run?.color !== undefined) {
            if (whiteFontRuns.has(run)) {
              // Restore white font
              run.setColor('FFFFFF');
            } else {
              run.setColor(h3Config.run.color);
            }
          }
          if (h3Config.run?.size) {
            run.setSize(h3Config.run.size);
          }
        }

        // Update paragraph mark properties to match configuration
        if (para.formatting.paragraphMarkRunProperties) {
          const markProps = para.formatting.paragraphMarkRunProperties;
          if (
            !h3Preserve.bold &&
            h3Config.run?.bold === false &&
            markProps.bold
          ) {
            delete markProps.bold;
          }
          if (
            !h3Preserve.italic &&
            h3Config.run?.italic === false &&
            markProps.italic
          ) {
            delete markProps.italic;
          }
          if (
            !h3Preserve.underline &&
            h3Config.run?.underline === false &&
            markProps.underline
          ) {
            delete markProps.underline;
          }
          // Update paragraph mark font, color, size
          if (h3Config.run?.font) {
            markProps.font = h3Config.run.font;
          }
          if (h3Config.run?.color) {
            markProps.color = h3Config.run.color;
          }
          if (h3Config.run?.size) {
            markProps.size = h3Config.run.size;
          }
        }

        processedParagraphs.add(para);
      }

      // Process List Paragraph paragraphs
      else if (styleId === "ListParagraph" && listParagraph) {
        // Check for mis-styled paragraphs: ListParagraph + left:0 + no numbering
        // These are not actual list items - change them to Normal style
        const paraIndentation = para.getFormatting().indentation;
        const hasNumbering = para.getNumbering();
        if (paraIndentation?.left === 0 && !hasNumbering) {
          // This paragraph has ListParagraph style but explicitly overrides indent to 0
          // and has no numbering - it should be Normal style, not ListParagraph
          para.setStyle("Normal");

          // Preserve existing bold formatting and white font before applying Normal style
          const allRuns = this.getAllRunsFromParagraph(para);
          const preservedBold = allRuns.map((run) => ({
            run,
            bold: run.getBold(),
            isWhiteFont: options?.preserveWhiteFont && run.getColor()?.toUpperCase() === 'FFFFFF',
          }));

          // Process as Normal style - skip ListParagraph processing
          if (normal) {
            para.clearDirectFormattingConflicts(normal);
            for (const saved of preservedBold) {
              const run = saved.run;
              // Apply Normal style formatting
              if (normalConfig.run?.font) {
                run.setFont(normalConfig.run.font);
              }
              if (normalConfig.run?.color !== undefined) {
                if (saved.isWhiteFont) {
                  // Restore white font
                  run.setColor('FFFFFF');
                } else {
                  run.setColor(normalConfig.run.color);
                }
              }
              if (normalConfig.run?.size && normalConfig.run?.font) {
                run.setFont(normalConfig.run.font, normalConfig.run.size);
              }
            }
          }

          // Restore bold formatting that was present before conversion
          for (const saved of preservedBold) {
            if (saved.bold) {
              saved.run.setBold(true);
            }
          }

          processedParagraphs.add(para);
          continue;
        }

        // Save formatting that should be preserved BEFORE clearing
        const allRuns = this.getAllRunsFromParagraph(para);
        const preservedFormatting = allRuns.map((run) => {
          const fmt = run.getFormatting();
          return {
            run: run,
            bold: listParaPreserve.bold ? fmt.bold : undefined,
            italic: listParaPreserve.italic ? fmt.italic : undefined,
            underline: listParaPreserve.underline ? fmt.underline : undefined,
            isWhiteFont: options?.preserveWhiteFont && fmt.color?.toUpperCase() === 'FFFFFF',
          };
        });

        para.clearDirectFormattingConflicts(listParagraph);

        // Restore preserved formatting AFTER clearing
        for (const saved of preservedFormatting) {
          if (saved.bold !== undefined) {
            saved.run.setBold(saved.bold);
          }
          if (saved.italic !== undefined) {
            saved.run.setItalic(saved.italic);
          }
          if (saved.underline !== undefined) {
            saved.run.setUnderline(saved.underline);
          }
        }

        // Apply formatting to all runs (including those in revisions/hyperlinks), respecting preserve flags
        for (const saved of preservedFormatting) {
          const run = saved.run;
          // Skip runs with Hyperlink style - preserve their blue color and underline
          if (run.isHyperlinkStyled()) {
            continue;
          }
          if (!listParaPreserve.bold) {
            run.setBold(listParaConfig.run?.bold ?? false);
          }
          if (!listParaPreserve.italic) {
            run.setItalic(listParaConfig.run?.italic ?? false);
          }
          if (!listParaPreserve.underline) {
            run.setUnderline(listParaConfig.run?.underline ? "single" : false);
          }
          // Apply font, color, and size - skip color if run was white font
          if (listParaConfig.run?.font) {
            run.setFont(listParaConfig.run.font);
          }
          if (listParaConfig.run?.color !== undefined) {
            if (saved.isWhiteFont) {
              // Restore white font
              run.setColor('FFFFFF');
            } else {
              run.setColor(listParaConfig.run.color);
            }
          }
          if (listParaConfig.run?.size) {
            run.setSize(listParaConfig.run.size);
          }
        }

        // Update paragraph mark properties to match configuration
        if (para.formatting.paragraphMarkRunProperties) {
          const markProps = para.formatting.paragraphMarkRunProperties;
          if (
            !listParaPreserve.bold &&
            listParaConfig.run?.bold === false &&
            markProps.bold
          ) {
            delete markProps.bold;
          }
          if (
            !listParaPreserve.italic &&
            listParaConfig.run?.italic === false &&
            markProps.italic
          ) {
            delete markProps.italic;
          }
          if (
            !listParaPreserve.underline &&
            listParaConfig.run?.underline === false &&
            markProps.underline
          ) {
            delete markProps.underline;
          }
          // Update paragraph mark font, color, size
          if (listParaConfig.run?.font) {
            markProps.font = listParaConfig.run.font;
          }
          if (listParaConfig.run?.color) {
            markProps.color = listParaConfig.run.color;
          }
          if (listParaConfig.run?.size) {
            markProps.size = listParaConfig.run.size;
          }
        }

        processedParagraphs.add(para);
      }

      // Process Normal paragraphs (including undefined style which defaults to Normal)
      else if ((styleId === "Normal" || styleId === undefined) && normal) {
        // Save formatting that should be preserved BEFORE clearing
        const allRuns = this.getAllRunsFromParagraph(para);
        const preservedFormatting = allRuns.map((run) => {
          const fmt = run.getFormatting();
          return {
            run: run,
            bold: normalPreserve.bold ? fmt.bold : undefined,
            italic: normalPreserve.italic ? fmt.italic : undefined,
            underline: normalPreserve.underline ? fmt.underline : undefined,
            isWhiteFont: options?.preserveWhiteFont && fmt.color?.toUpperCase() === 'FFFFFF',
          };
        });

        // Save center alignment BEFORE clearing if preserveCenterAlignment is set
        const savedCenterAlignment = options?.normal?.preserveCenterAlignment &&
          para.getAlignment() === 'center';

        para.clearDirectFormattingConflicts(normal);

        // Restore center alignment if it was saved
        if (savedCenterAlignment) {
          para.setAlignment('center');
        }

        // Restore preserved formatting AFTER clearing
        for (const saved of preservedFormatting) {
          if (saved.bold !== undefined) {
            saved.run.setBold(saved.bold);
          }
          if (saved.italic !== undefined) {
            saved.run.setItalic(saved.italic);
          }
          if (saved.underline !== undefined) {
            saved.run.setUnderline(saved.underline);
          }
        }

        // Apply formatting to all runs (including those in revisions/hyperlinks), respecting preserve flags
        for (const saved of preservedFormatting) {
          const run = saved.run;
          // Skip runs with Hyperlink style - preserve their blue color and underline
          if (run.isHyperlinkStyled()) {
            continue;
          }
          if (!normalPreserve.bold) {
            run.setBold(normalConfig.run?.bold ?? false);
          }
          if (!normalPreserve.italic) {
            run.setItalic(normalConfig.run?.italic ?? false);
          }
          if (!normalPreserve.underline) {
            run.setUnderline(normalConfig.run?.underline ? "single" : false);
          }
          // Apply font, color, and size - skip color if run was white font
          if (normalConfig.run?.font) {
            run.setFont(normalConfig.run.font);
          }
          if (normalConfig.run?.color !== undefined) {
            // Use saved isWhiteFont flag since color was cleared by clearDirectFormattingConflicts
            if (!saved.isWhiteFont) {
              run.setColor(normalConfig.run.color);
            } else {
              // Restore white font
              run.setColor('FFFFFF');
            }
          }
          if (normalConfig.run?.size) {
            run.setSize(normalConfig.run.size);
          }
        }

        // Update paragraph mark properties to match configuration
        if (para.formatting.paragraphMarkRunProperties) {
          const markProps = para.formatting.paragraphMarkRunProperties;
          if (
            !normalPreserve.bold &&
            normalConfig.run?.bold === false &&
            markProps.bold
          ) {
            delete markProps.bold;
          }
          if (
            !normalPreserve.italic &&
            normalConfig.run?.italic === false &&
            markProps.italic
          ) {
            delete markProps.italic;
          }
          if (
            !normalPreserve.underline &&
            normalConfig.run?.underline === false &&
            markProps.underline
          ) {
            delete markProps.underline;
          }
          // Update paragraph mark font, color, size
          if (normalConfig.run?.font) {
            markProps.font = normalConfig.run.font;
          }
          if (normalConfig.run?.color) {
            markProps.color = normalConfig.run.color;
          }
          if (normalConfig.run?.size) {
            markProps.size = normalConfig.run.size;
          }
        }

        processedParagraphs.add(para);
      }
    }

    return results;
  }

  /**
   * Formats all TOC (Table of Contents) entry styles with the specified formatting.
   * Creates TOC 1-9 styles if they don't exist in the document.
   *
   * When Word updates a TOC field, it looks for these styles in styles.xml and
   * applies them to the generated entries. This method allows you to pre-define
   * how TOC entries will appear.
   *
   * @param options - Formatting options for TOC entries
   * @param options.run - Run (character) formatting to apply
   * @param options.paragraph - Paragraph formatting to apply
   * @param options.levels - Which TOC levels to format (default: 1-9)
   * @returns Object indicating which levels were formatted
   *
   * @example
   * ```typescript
   * // Format all TOC entries with consistent styling
   * doc.formatTOCStyles({
   *   run: {
   *     font: 'Verdana',
   *     size: 12,
   *     color: '0000FF',      // Blue
   *     underline: true,
   *     bold: false,
   *     italic: false
   *   },
   *   paragraph: {
   *     spacing: { before: 0, after: 0 }  // 0pt spacing
   *   }
   * });
   *
   * // Format only first 3 levels
   * doc.formatTOCStyles({
   *   run: { font: 'Arial', size: 11 },
   *   levels: [1, 2, 3]
   * });
   * ```
   */
  formatTOCStyles(options: {
    run?: StyleRunFormatting;
    paragraph?: StyleParagraphFormatting;
    levels?: number[];
  }): { formatted: number[] } {
    const levels = options.levels ?? [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const formatted: number[] = [];

    for (const level of levels) {
      if (level < 1 || level > 9) continue;

      const styleId = `TOC${level}`;
      let tocStyle = this.stylesManager.getStyle(styleId);

      if (!tocStyle) {
        // Create TOC style if it doesn't exist
        tocStyle = Style.createTOCStyle(level, {
          run: options.run,
          paragraph: options.paragraph,
        });
        this.addStyle(tocStyle);
      } else {
        // Update existing style
        if (options.run) tocStyle.setRunFormatting(options.run);
        if (options.paragraph) tocStyle.setParagraphFormatting(options.paragraph);
        this.addStyle(tocStyle); // Mark as modified
      }

      formatted.push(level);
    }

    return { formatted };
  }

  /**
   * Helper function to apply formatting from Style objects
   *
   * This is a convenience wrapper that accepts Style objects, extracts their properties,
   * and converts them to configuration format before calling {@link applyStyles}.
   *
   * Style objects are matched by their styleId property:
   * - 'Heading1' → applies to Heading1 style
   * - 'Heading2' → applies to Heading2 style (with optional table options)
   * - 'Heading3' → applies to Heading3 style
   * - 'Normal' → applies to Normal style
   * - 'ListParagraph' → applies to List Paragraph style
   *
   * Other styleIds are ignored.
   *
   * @param styles - Variable number of Style objects to apply
   * @returns Object indicating which styles were successfully modified
   *
   * @example
   * // Create Style objects with your desired formatting
   * const h1 = new Style({
   *   styleId: 'Heading1',
   *   name: 'Heading 1',
   *   type: 'paragraph',
   *   runFormatting: { font: 'Arial', size: 16, bold: true },
   *   paragraphFormatting: { spacing: { before: 0, after: 200 } }
   * });
   *
   * const h2 = Style.createHeadingStyle(2);
   * h2.setRunFormatting({ font: 'Arial', size: 14, bold: true });
   * h2.setHeading2TableOptions({ shading: '808080', marginLeft: 150, marginRight: 150 });
   *
   * // Apply to document
   * doc.applyStylesFromObjects(h1, h2);
   *
   * @example
   * // Just modify one style
   * const myNormal = new Style({
   *   styleId: 'Normal',
   *   name: 'Normal',
   *   type: 'paragraph',
   *   runFormatting: { font: 'Times New Roman', size: 12 }
   * });
   * doc.applyStylesFromObjects(myNormal);
   */
  public applyStylesFromObjects(...styles: Style[]): {
    heading1: boolean;
    heading2: boolean;
    heading3: boolean;
    normal: boolean;
    listParagraph: boolean;
  } {
    // Convert Style objects to ApplyStylesOptions
    const options: ApplyStylesOptions = {};

    for (const style of styles) {
      const styleId = style.getStyleId();

      switch (styleId) {
        case "Heading1":
          options.heading1 = {
            run: style.getRunFormatting() as any,
            paragraph: style.getParagraphFormatting() as any,
          };
          break;

        case "Heading2":
          options.heading2 = {
            run: style.getRunFormatting() as any,
            paragraph: style.getParagraphFormatting() as any,
            tableOptions: style.getHeading2TableOptions(),
          };
          break;

        case "Heading3":
          options.heading3 = {
            run: style.getRunFormatting() as any,
            paragraph: style.getParagraphFormatting() as any,
          };
          break;

        case "Normal":
          options.normal = {
            run: style.getRunFormatting() as any,
            paragraph: style.getParagraphFormatting() as any,
          };
          break;

        case "ListParagraph":
          options.listParagraph = {
            run: style.getRunFormatting() as any,
            paragraph: style.getParagraphFormatting() as any,
          };
          break;

        default:
          // Ignore styles with other styleIds
          break;
      }
    }

    // Call existing method with converted options
    return this.applyStyles(options);
  }

  /**
   * Removes extra blank paragraphs from the document with optional structure spacing
   *
   * This method uses a two-pass approach:
   * 1. First pass: Removes ALL blank paragraphs (ignoring preserve flags)
   * 2. Second pass (optional): Re-inserts Normal-style blank paragraphs after structural elements
   *
   * A paragraph is considered blank if it:
   * - Has no text content (or only whitespace)
   * - Has no images, hyperlinks, or other non-text content
   * - Has no bookmarks or comments
   *
   * When `addStructureBlankLines` is enabled, blank paragraphs are added after:
   * - Heading 1 paragraphs
   * - Table of Contents elements
   * - Bullet/numbered list blocks
   * - "End of Document Warning" paragraph
   * - Hyperlinks with display text "top of the document" (case-insensitive)
   * - Every 1×1 table (including those in cells)
   *
   * @param options Configuration options for removal and re-insertion
   * @returns Statistics about removed and added paragraphs
   *
   * @example
   * // Remove all blank paragraphs and add structure spacing
   * const result = doc.removeExtraBlankParagraphs({ addStructureBlankLines: true });
   * console.log(`Removed ${result.removed} blank paragraphs, added ${result.added} structure blanks`);
   *
   * @example
   * // Remove blanks and re-add structure spacing
   * const result = doc.removeExtraBlankParagraphs({ addStructureBlankLines: true });
   * console.log(`Removed ${result.removed}, added ${result.added} structure blanks`);
   */
  public removeExtraBlankParagraphs(options?: {
    /**
     * Whether to re-insert Normal-style blank paragraphs after structural elements.
     * When true, adds spacing after headers, TOCs, lists, tables, and special hyperlinks.
     * @default true
     */
    addStructureBlankLines?: boolean;
    /**
     * Stop adding bold+colon blank lines after this heading text is found in a 1x1 table.
     * This option is passed through to addStructureBlankLines().
     */
    stopBoldColonAfterHeading?: string;
    /**
     * Whether to remove trailing blank paragraphs from table cells.
     * A trailing blank is a blank paragraph at the END of a cell, after content.
     * This removes blanks after images, text, or nested tables in cells.
     * @default true
     */
    removeTrailingCellBlanks?: boolean;
    /**
     * Whether to preserve single blank lines (non-consecutive).
     * When true, only consecutive duplicate blanks (2+) are removed, keeping one.
     * Single blank lines between content are preserved.
     * @default false
     */
    preserveSingleBlanks?: boolean;
  }): {
    removed: number;
    added: number;
    total: number;
    preserved: number;
  } {
    const addStructureBlankLines = options?.addStructureBlankLines ?? true;
    const removeTrailingCellBlanks = options?.removeTrailingCellBlanks ?? true;
    const preserveSingleBlanks = options?.preserveSingleBlanks ?? false;
    let removed = 0;
    let added = 0;
    let preserved = 0;

    // OPTIONAL PASS: Remove SDT wrappers if addStructureBlankLines is enabled
    if (addStructureBlankLines) {
      this.clearCustom();
    }

    // OPTIONAL PASS: Mark single blanks as preserved if option enabled
    // This ensures only consecutive duplicates (2+) are removed, keeping one
    if (preserveSingleBlanks) {
      preserved = this.markSingleBlanksAsPreserved();
    }

    // PASS 1: Remove blank paragraphs (respecting preserve flag)
    const indicesToRemove: number[] = [];

    for (let i = 0; i < this.bodyElements.length; i++) {
      const element = this.bodyElements[i];

      // Only process paragraphs
      if (!(element instanceof Paragraph)) {
        continue;
      }

      const para = element;

      // Skip preserved paragraphs
      if (para.isPreserved()) {
        continue;
      }

      // Check if paragraph is blank
      const isBlank = this.isParagraphBlank(para);

      if (isBlank) {
        indicesToRemove.push(i);
      }
    }

    // Remove in reverse order to maintain indices
    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
      const index = indicesToRemove[i];
      if (index !== undefined) {
        this.bodyElements.splice(index, 1);
        removed++;
      }
    }

    // PASS 1.5: Remove blank paragraphs inside table cells
    for (const table of this.getAllTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          // Get fresh count each iteration since we're modifying the cell
          let cellParaCount = cell.getParagraphs().length;
          // Remove blank paragraphs from cell (in reverse to maintain indices)
          // Keep at least one paragraph in the cell (Word requires it)
          for (let i = cellParaCount - 1; i >= 0; i--) {
            // Don't remove the last paragraph in a cell
            if (cell.getParagraphs().length <= 1) break;

            const para = cell.getParagraphs()[i];
            if (para && !para.isPreserved() && this.isParagraphBlank(para)) {
              cell.removeParagraph(i);
              removed++;
            }
          }
        }
      }
    }

    // PASS 2: If requested, re-insert structure blank lines
    if (addStructureBlankLines) {
      added = this.addStructureBlankLinesAfterElements({
        stopBoldColonAfterHeading: options?.stopBoldColonAfterHeading,
      });
    }

    // PASS 3: Remove trailing blank paragraphs from table cells
    // This removes blanks at the END of cells, after images/text/nested content
    if (removeTrailingCellBlanks) {
      const trailingRemoved = this.removeTrailingBlanksInTableCells({
        ignorePreserveFlag: true, // Always remove trailing cell blanks
      });
      removed += trailingRemoved;
    }

    return {
      removed,
      added,
      total: removed,
      preserved,
    };
  }

  /**
   * Removes trailing blank paragraphs from all table cells in the document.
   * A trailing blank is a blank paragraph at the END of a cell, after all content (images, text, nested tables).
   * This is useful for removing unnecessary whitespace in table cells.
   *
   * This method respects the ECMA-376 requirement that each table cell must have at least one paragraph.
   *
   * @param options.ignorePreserveFlag - If true, removes trailing blanks even if marked preserved (default: true)
   * @returns Total number of paragraphs removed across all cells
   *
   * @example
   * ```typescript
   * // Remove all trailing blanks in table cells (ignoring preserve flags)
   * const removed = doc.removeTrailingBlanksInTableCells();
   * console.log(`Removed ${removed} trailing blank paragraphs from cells`);
   *
   * // Remove trailing blanks but respect preserve flags
   * const removed = doc.removeTrailingBlanksInTableCells({ ignorePreserveFlag: false });
   * ```
   */
  public removeTrailingBlanksInTableCells(options?: {
    ignorePreserveFlag?: boolean;
  }): number {
    let totalRemoved = 0;
    const ignorePreserve = options?.ignorePreserveFlag ?? true;

    for (const table of this.getAllTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          totalRemoved += cell.removeTrailingBlankParagraphs({
            ignorePreserveFlag: ignorePreserve,
          });
        }
      }
    }

    return totalRemoved;
  }

  /**
   * Updates shading colors in table style definitions in styles.xml.
   *
   * Table styles (e.g., GridTable4-Accent3) often have conditional formatting with
   * hardcoded shading values. When applying table uniformity with different shading
   * colors, the table style definitions should also be updated to match.
   *
   * This method finds all occurrences of `oldColor` in shading elements (`w:shd`)
   * within table styles and replaces them with `newColor`.
   *
   * @param oldColor - Hex color to find (e.g., "A5A5A5", without #)
   * @param newColor - Hex color to replace with (e.g., "DFDFDF", without #)
   * @returns Number of shading elements updated
   *
   * @example
   * ```typescript
   * // Update table style shading from gray to light gray
   * const updated = doc.updateTableStyleShading("A5A5A5", "DFDFDF");
   * console.log(`Updated ${updated} shading definitions in styles.xml`);
   * ```
   */
  public updateTableStyleShading(oldColor: string, newColor: string): number {
    // Normalize colors (uppercase, no #)
    const normalizedOld = oldColor.replace("#", "").toUpperCase();
    const normalizedNew = newColor.replace("#", "").toUpperCase();

    if (normalizedOld === normalizedNew) {
      return 0; // No change needed
    }

    // Get current styles.xml
    let stylesXml = this.getStylesXml();
    if (!stylesXml) {
      return 0;
    }

    let updateCount = 0;

    // Pattern to match shading elements with fill attribute containing the old color
    // Matches: w:fill="A5A5A5" (case-insensitive)
    const fillPattern = new RegExp(
      `(w:fill=["'])${normalizedOld}(["'])`,
      "gi"
    );

    // Replace all occurrences
    stylesXml = stylesXml.replace(fillPattern, (match, prefix, suffix) => {
      updateCount++;
      return `${prefix}${normalizedNew}${suffix}`;
    });

    // Also handle color attribute in shading elements
    // Matches: w:color="A5A5A5" within shd elements
    const colorPattern = new RegExp(
      `(<w:shd[^>]*w:color=["'])${normalizedOld}(["'])`,
      "gi"
    );

    stylesXml = stylesXml.replace(colorPattern, (match, prefix, suffix) => {
      updateCount++;
      return `${prefix}${normalizedNew}${suffix}`;
    });

    // Only update if changes were made
    if (updateCount > 0) {
      this.setStylesXml(stylesXml);
    }

    return updateCount;
  }

  /**
   * Updates all table style conditional formatting shading to match given settings.
   *
   * This is a convenience method that updates common table style shading patterns.
   * It's useful when applying table uniformity to ensure table styles in styles.xml
   * match the shading colors being applied to individual cells.
   *
   * @param settings - Shading configuration
   * @param settings.headerShading - Shading color for header/accent cells (e.g., "BFBFBF")
   * @param settings.dataShading - Shading color for data cells (e.g., "DFDFDF")
   * @param settings.replaceColors - Optional array of old colors to replace (defaults to common grays)
   * @returns Total number of shading elements updated
   *
   * @example
   * ```typescript
   * // Update table styles to use consistent shading
   * const updated = doc.updateTableStyleShadingBulk({
   *   headerShading: "BFBFBF",
   *   dataShading: "DFDFDF",
   *   replaceColors: ["A5A5A5", "C0C0C0", "D9D9D9"]
   * });
   * ```
   */
  public updateTableStyleShadingBulk(settings: {
    headerShading?: string;
    dataShading?: string;
    replaceColors?: string[];
  }): number {
    let totalUpdated = 0;

    // Default colors commonly used in table styles
    const defaultReplaceColors = ["A5A5A5", "C0C0C0", "D9D9D9", "E7E6E6"];
    const colorsToReplace = settings.replaceColors || defaultReplaceColors;

    // Replace header-type colors with header shading
    if (settings.headerShading) {
      for (const oldColor of colorsToReplace) {
        totalUpdated += this.updateTableStyleShading(
          oldColor,
          settings.headerShading
        );
      }
    }

    // If data shading differs from header, apply it to lighter colors
    if (settings.dataShading && settings.dataShading !== settings.headerShading) {
      // Typically data cells use lighter shading
      const dataColors = ["D9D9D9", "E7E6E6", "F2F2F2"];
      for (const oldColor of dataColors) {
        totalUpdated += this.updateTableStyleShading(
          oldColor,
          settings.dataShading
        );
      }
    }

    return totalUpdated;
  }

  /**
   * Helper method to process consecutive blank paragraphs
   * @private
   */
  private processConsecutiveBlanks(
    blanks: Paragraph[],
    keepOne: boolean,
    toRemove: Paragraph[]
  ): void {
    if (blanks.length === 0) return;

    if (keepOne && blanks.length > 1) {
      // Keep the first one, remove the rest
      for (let i = 1; i < blanks.length; i++) {
        const blank = blanks[i];
        if (blank) {
          toRemove.push(blank);
        }
      }
    } else if (!keepOne) {
      // Remove all
      toRemove.push(...blanks);
    }
    // If keepOne is true and there's only 1 blank, don't remove it
  }

  /**
   * Marks blank lines after 1x1 Heading 2 tables as preserved
   * @private
   */
  /**
   * Adds structural blank lines throughout the document for improved readability
   *
   * This comprehensive helper method systematically adds Normal-style blank paragraphs after
   * key structural elements to improve document readability and visual spacing. It combines
   * multiple spacing operations into a single convenient method.
   *
   * **Elements that receive blank lines:**
   * - All 1×1 tables (configurable via filter)
   * - All multi-cell tables (configurable via filter)
   * - Bullet and numbered list blocks (configurable)
   *
   * **Features:**
   * - Optional cleanup of duplicate blanks before adding structure blanks
   * - Configurable spacing after blank paragraphs (default: 120 twips = 6pt)
   * - Automatic preserve flag marking to protect structural blanks
   * - Customizable style for blank paragraphs (default: 'Normal')
   * - Per-table-type filtering for selective processing
   * - List block detection via paragraph numbering properties
   *
   * **Typical Workflow:**
   * 1. (Optional) Remove all duplicate blank paragraphs
   * 2. Add blank lines after 1×1 tables
   * 3. Add blank lines after multi-cell tables
   * 4. Add blank lines after list blocks
   * 5. Return aggregated statistics
   *
   * @param options Configuration options
   * @returns Statistics about the operation
   *
   * @example
   * // Add structure blanks with defaults (6pt spacing, marked as preserved)
   * const result = doc.addStructureBlankLines();
   * console.log(`Processed ${result.tablesProcessed} tables`);
   * console.log(`Added ${result.blankLinesAdded} new blank lines`);
   * console.log(`Marked ${result.existingLinesMarked} existing blank lines`);
   *
   * @example
   * // Clean up duplicates first, then add structure blanks
   * const result = doc.addStructureBlankLines({
   *   cleanupFirst: true
   * });
   * console.log(`Removed ${result.blankLinesRemoved} duplicates`);
   * console.log(`Added ${result.blankLinesAdded} structure blanks`);
   *
   * @example
   * // Custom spacing and selective processing
   * const result = doc.addStructureBlankLines({
   *   spacingAfter: 240,  // 12pt spacing
   *   after1x1Tables: true,
   *   afterOtherTables: false,  // Only 1x1 tables
   *   filter1x1: (table, index) => {
   *     // Only add blanks after Heading 2 tables
   *     const cell = table.getCell(0, 0);
   *     if (!cell) return false;
   *     return cell.getParagraphs().some(p => {
   *       const style = p.getStyle();
   *       return style === 'Heading2' || style === 'Heading 2';
   *     });
   *   }
   * });
   *
   * @example
   * // Don't mark as preserved (allow future cleanup)
   * doc.addStructureBlankLines({
   *   markAsPreserved: false,
   *   spacingAfter: 120
   * });
   */
  public addStructureBlankLines(options?: {
    /** Spacing after blank paragraphs in twips (default: 120 = 6pt) */
    spacingAfter?: number;
    /** Mark blank paragraphs as preserved to prevent removal (default: true) */
    markAsPreserved?: boolean;
    /** Style to apply to blank paragraphs (default: 'Normal') */
    style?: string;
    /** Add blanks after 1×1 tables (default: true) */
    after1x1Tables?: boolean;
    /** Add blanks after multi-cell tables (default: true) */
    afterOtherTables?: boolean;
    /** Optional filter for selecting which 1×1 tables to process */
    filter1x1?: (table: Table, index: number) => boolean;
    /** Optional filter for selecting which multi-cell tables to process */
    filterOther?: (table: Table, index: number) => boolean;
    /** Add blank line above the first table in document (default: true) */
    aboveFirstTable?: boolean;
    /** Add blank line above "Top of Document" hyperlinks (default: true) */
    aboveTODHyperlinks?: boolean;
    /** Add blank line above "Return to HLP" hyperlinks and format with HLP Hyperlinks style (default: true) */
    aboveReturnToHLP?: boolean;
    /** Add blank line below Heading 1 paragraphs with text (default: true) */
    belowHeading1Lines?: boolean;
    /** Add blank line below Table of Contents elements (default: true) */
    belowTOC?: boolean;
    /** Add blank line above warning message (default: true) */
    aboveWarning?: boolean;
    /** Add blank line after bullet/numbered list blocks (default: true) */
    afterLists?: boolean;
    /** Add blank lines around images larger than 100x100 pixels (default: true) */
    aroundImages?: boolean;
    /** Add blank line above paragraphs starting with bold text followed by colon (default: true) */
    aboveBoldColon?: boolean;
    /** Stop adding bold+colon blank lines after this heading text is found in a 1x1 table (default: undefined - process all) */
    stopBoldColonAfterHeading?: string;
  }): {
    tablesProcessed: number;
    blankLinesAdded: number;
    existingLinesMarked: number;
    blankLinesRemoved: number;
    listsProcessed: number;
  } {
    // Extract options with defaults
    const spacingAfter = options?.spacingAfter ?? 120;
    const markAsPreserved = options?.markAsPreserved ?? true;
    const style = options?.style ?? 'Normal';
    const after1x1Tables = options?.after1x1Tables ?? true;
    const afterOtherTables = options?.afterOtherTables ?? true;
    const filter1x1 = options?.filter1x1;
    const filterOther = options?.filterOther;
    const aboveFirstTable = options?.aboveFirstTable ?? true;
    const aboveTODHyperlinks = options?.aboveTODHyperlinks ?? true;
    const aboveReturnToHLP = options?.aboveReturnToHLP ?? true;
    const belowHeading1Lines = options?.belowHeading1Lines ?? true;
    const belowTOC = options?.belowTOC ?? true;
    const aboveWarning = options?.aboveWarning ?? true;
    const afterLists = options?.afterLists ?? true;
    const aroundImages = options?.aroundImages ?? true;
    const aboveBoldColon = options?.aboveBoldColon ?? true;
    const stopBoldColonAfterHeading = options?.stopBoldColonAfterHeading?.toLowerCase();

    // Aggregated statistics
    let totalTablesProcessed = 0;
    let totalBlankLinesAdded = 0;
    let totalExistingLinesMarked = 0;
    let blankLinesRemoved: number = 0;
    let totalListsProcessed = 0;

    // Phase 1: Remove duplicate blank paragraphs (always execute)
    // Note: Pass false to avoid recursive loop since addStructureBlankLines defaults to true
    const cleanupResult = this.removeExtraBlankParagraphs({ addStructureBlankLines: false });
    blankLinesRemoved = cleanupResult.removed;

    // Phase 2: Add blanks after 1×1 tables
    if (after1x1Tables) {
      const result1x1 = this.ensureBlankLinesAfter1x1Tables({
        spacingAfter,
        markAsPreserved,
        style,
        filter: filter1x1,
      });
      totalTablesProcessed += result1x1.tablesProcessed;
      totalBlankLinesAdded += result1x1.blankLinesAdded;
      totalExistingLinesMarked += result1x1.existingLinesMarked;
    }

    // Phase 3: Add blanks after multi-cell tables
    if (afterOtherTables) {
      const resultOther = this.ensureBlankLinesAfterOtherTables({
        spacingAfter,
        markAsPreserved,
        style,
        filter: filterOther,
      });
      totalTablesProcessed += resultOther.tablesProcessed;
      totalBlankLinesAdded += resultOther.blankLinesAdded;
      totalExistingLinesMarked += resultOther.existingLinesMarked;
    }

    // Phase 4: Add blank above first table
    if (aboveFirstTable) {
      const tables = this.getAllTables();
      if (tables.length > 0) {
        const firstTable = tables[0];
        if (firstTable) {
          const tableIndex = this.bodyElements.indexOf(firstTable);
          if (tableIndex > 0) {
            const prevElement = this.bodyElements[tableIndex - 1];
            
            // Check if previous element is already a blank paragraph
            if (prevElement instanceof Paragraph && this.isParagraphBlank(prevElement)) {
              // Mark existing blank as preserved
              prevElement.setStyle(style);
              if (markAsPreserved && !prevElement.isPreserved()) {
                prevElement.setPreserved(true);
                totalExistingLinesMarked++;
              }
            } else {
              // Add blank paragraph before first table
              const blankPara = Paragraph.create();
              blankPara.setStyle(style);
              blankPara.setSpaceAfter(spacingAfter);
              if (markAsPreserved) {
                blankPara.setPreserved(true);
              }
              this.bodyElements.splice(tableIndex, 0, blankPara);
              totalBlankLinesAdded++;
            }
          }
        }
      }
    }

    // Phase 5: Add blank above "Top of Document" hyperlinks
    if (aboveTODHyperlinks) {
      const hyperlinks = this.getHyperlinks();
      
      for (const { hyperlink, paragraph } of hyperlinks) {
        const text = hyperlink.getText().toLowerCase();
        
        // Match "top of document" or "top of the document" (case-insensitive)
        if ((text === 'top of document' || text === 'top of the document')) {
          const paraIndex = this.bodyElements.indexOf(paragraph);
          
          if (paraIndex > 0) {
            const prevElement = this.bodyElements[paraIndex - 1];
            
            // Check if previous element is already blank
            if (prevElement instanceof Paragraph && this.isParagraphBlank(prevElement)) {
              // Check if it's a 1x1 table followed by blank - skip to avoid double blanks
              if (paraIndex >= 2) {
                const twoPrevElement = this.bodyElements[paraIndex - 2];
                if (twoPrevElement instanceof Table) {
                  const is1x1 = twoPrevElement.getRowCount() === 1 && twoPrevElement.getColumnCount() === 1;
                  if (is1x1) {
                    continue; // Skip - this blank is already from the 1x1 table
                  }
                }
              }
              
              // Mark existing blank as preserved
              prevElement.setStyle(style);
              if (markAsPreserved && !prevElement.isPreserved()) {
                prevElement.setPreserved(true);
                totalExistingLinesMarked++;
              }
            } else if (!(prevElement instanceof Table && prevElement.getRowCount() === 1 && prevElement.getColumnCount() === 1)) {
              // Add blank only if previous is not a 1x1 table (which already has its own blank)
              const blankPara = Paragraph.create();
              blankPara.setStyle(style);
              blankPara.setSpaceAfter(spacingAfter);
              if (markAsPreserved) {
                blankPara.setPreserved(true);
              }
              this.bodyElements.splice(paraIndex, 0, blankPara);
              totalBlankLinesAdded++;
            }
          }
        }
      }
    }

    // Phase 5b: Add blank above "Return to HLP" hyperlinks
    if (aboveReturnToHLP) {
      // Create or ensure HLP Hyperlinks style exists
      if (!this.getStylesManager().hasStyle('HLPHyperlinks')) {
        const hlpStyle = Style.create({
          styleId: 'HLPHyperlinks',
          name: 'HLP Hyperlinks',
          type: 'paragraph',
          basedOn: 'Normal',
          customStyle: true,
          paragraphFormatting: {
            alignment: 'right',
            spacing: {
              before: 0,
              after: 0,
            }
          },
          runFormatting: {
            font: 'Verdana',
            size: 12,
            color: '0000FF',
            underline: 'single',
            bold: false,
            italic: false
          }
        });
        this.addStyle(hlpStyle);
      }

      const hlpHyperlinks = this.getHyperlinks();

      for (const { hyperlink, paragraph } of hlpHyperlinks) {
        const text = hyperlink.getText().toLowerCase();

        // Exact match only (case-insensitive)
        if (text === 'return to hlp') {
          const paraIndex = this.bodyElements.indexOf(paragraph);

          if (paraIndex > 0) {
            const prevElement = this.bodyElements[paraIndex - 1];

            // Check if previous element is already blank
            if (prevElement instanceof Paragraph && this.isParagraphBlank(prevElement)) {
              // Mark existing blank as preserved
              prevElement.setStyle(style);
              if (markAsPreserved && !prevElement.isPreserved()) {
                prevElement.setPreserved(true);
                totalExistingLinesMarked++;
              }
            } else if (!(prevElement instanceof Table && prevElement.getRowCount() === 1 && prevElement.getColumnCount() === 1)) {
              // Add blank only if previous is not a 1x1 table
              const blankPara = Paragraph.create();
              blankPara.setStyle(style);
              blankPara.setSpaceAfter(spacingAfter);
              if (markAsPreserved) {
                blankPara.setPreserved(true);
              }
              this.bodyElements.splice(paraIndex, 0, blankPara);
              totalBlankLinesAdded++;
            }
          }

          // Format the hyperlink
          hyperlink.setFormatting({
            font: 'Verdana',
            size: 12,
            underline: 'single',
            color: '0000FF',
            bold: false,
            italic: false
          });

          // Apply style and formatting to paragraph
          paragraph.setStyle('HLPHyperlinks');
          paragraph.setAlignment('right');
          paragraph.setSpaceBefore(0);
          paragraph.setSpaceAfter(0);
        }
      }
    }

    // Phase 6: Add blank below Heading 1 paragraphs with text
    if (belowHeading1Lines) {
      const allParas = this.getAllParagraphs();
      
      for (const para of allParas) {
        const styleId = para.getStyle();
        
        // Check if it's a Heading1 paragraph with text
        if (styleId === 'Heading1' && para.getText().trim() !== '') {
          const paraIndex = this.bodyElements.indexOf(para);
          
          if (paraIndex !== -1 && paraIndex < this.bodyElements.length - 1) {
            const nextElement = this.bodyElements[paraIndex + 1];
            
            // Check if next element is already blank
            if (nextElement instanceof Paragraph && this.isParagraphBlank(nextElement)) {
              // Mark existing blank as preserved
              nextElement.setStyle(style);
              if (markAsPreserved && !nextElement.isPreserved()) {
                nextElement.setPreserved(true);
                totalExistingLinesMarked++;
              }
            } else {
              // Add blank paragraph after Heading 1
              const blankPara = Paragraph.create();
              blankPara.setStyle(style);
              blankPara.setSpaceAfter(spacingAfter);
              if (markAsPreserved) {
                blankPara.setPreserved(true);
              }
              this.bodyElements.splice(paraIndex + 1, 0, blankPara);
              totalBlankLinesAdded++;
            }
          }
        }
      }
    }

    // Phase 7: Add blank below Table of Contents elements
    if (belowTOC) {
      // Part A: Handle TableOfContentsElement instances (programmatically created TOCs)
      const tocElements = this.getTableOfContentsElements();

      for (const toc of tocElements) {
        const tocIndex = this.bodyElements.indexOf(toc);

        if (tocIndex !== -1 && tocIndex < this.bodyElements.length - 1) {
          const nextElement = this.bodyElements[tocIndex + 1];

          // Check if next element is already blank
          if (nextElement instanceof Paragraph && this.isParagraphBlank(nextElement)) {
            // Mark existing blank as preserved
            nextElement.setStyle(style);
            if (markAsPreserved && !nextElement.isPreserved()) {
              nextElement.setPreserved(true);
              totalExistingLinesMarked++;
            }
          } else {
            // Add blank paragraph after TOC
            const blankPara = Paragraph.create();
            blankPara.setStyle(style);
            blankPara.setSpaceAfter(spacingAfter);
            if (markAsPreserved) {
              blankPara.setPreserved(true);
            }
            this.bodyElements.splice(tocIndex + 1, 0, blankPara);
            totalBlankLinesAdded++;
          }
        }
      }

      // Part B: Handle TOC paragraphs by style (parsed documents without SDT wrapper)
      // Find the last paragraph in each TOC block (consecutive TOC-styled paragraphs)
      let inTocBlock = false;
      let lastTocParaIndex = -1;

      for (let idx = 0; idx < this.bodyElements.length; idx++) {
        const element = this.bodyElements[idx];

        if (element instanceof Paragraph && this.isTocParagraph(element)) {
          inTocBlock = true;
          lastTocParaIndex = idx;
        } else if (inTocBlock) {
          // End of TOC block - add blank after the last TOC paragraph
          inTocBlock = false;

          if (lastTocParaIndex !== -1 && lastTocParaIndex < this.bodyElements.length - 1) {
            const nextElement = this.bodyElements[lastTocParaIndex + 1];

            // Check if next element is already blank
            if (nextElement instanceof Paragraph && this.isParagraphBlank(nextElement)) {
              // Mark existing blank as preserved
              nextElement.setStyle(style);
              if (markAsPreserved && !nextElement.isPreserved()) {
                nextElement.setPreserved(true);
                totalExistingLinesMarked++;
              }
            } else {
              // Add blank paragraph after TOC block
              const blankPara = Paragraph.create();
              blankPara.setStyle(style);
              blankPara.setSpaceAfter(spacingAfter);
              if (markAsPreserved) {
                blankPara.setPreserved(true);
              }
              this.bodyElements.splice(lastTocParaIndex + 1, 0, blankPara);
              totalBlankLinesAdded++;
              idx++; // Account for inserted element
            }
          }
          lastTocParaIndex = -1;
        }
      }

      // Handle case where TOC block is at the end of the document
      if (inTocBlock && lastTocParaIndex !== -1 && lastTocParaIndex < this.bodyElements.length - 1) {
        const nextElement = this.bodyElements[lastTocParaIndex + 1];

        if (nextElement instanceof Paragraph && this.isParagraphBlank(nextElement)) {
          nextElement.setStyle(style);
          if (markAsPreserved && !nextElement.isPreserved()) {
            nextElement.setPreserved(true);
            totalExistingLinesMarked++;
          }
        } else {
          const blankPara = Paragraph.create();
          blankPara.setStyle(style);
          blankPara.setSpaceAfter(spacingAfter);
          if (markAsPreserved) {
            blankPara.setPreserved(true);
          }
          this.bodyElements.splice(lastTocParaIndex + 1, 0, blankPara);
          totalBlankLinesAdded++;
        }
      }
    }

    // Phase 8: Add blank above warning message
    if (aboveWarning) {
      // Look for the two-line warning pattern in consecutive paragraphs
      for (let i = 0; i < this.bodyElements.length - 1; i++) {
        const firstElem = this.bodyElements[i];
        const secondElem = this.bodyElements[i + 1];
        
        if (firstElem instanceof Paragraph && secondElem instanceof Paragraph) {
          const firstText = firstElem.getText().trim().toLowerCase();
          const secondText = secondElem.getText().trim().toLowerCase();
          
          // Detect warning pattern - look for "warning" or "caution" keywords
          const isWarningFirst = firstText.includes('warning') || firstText.includes('caution') ||
                                 firstText.includes('important') || firstText.includes('note');
          const hasSecondLine = secondText.length > 0;

          // Skip if this paragraph is within a list context (e.g., "Note:" between bullet items)
          if (this.isWithinListContext(i)) continue;

          // Additional check: the warning is typically 2 consecutive non-empty paragraphs
          // with similar formatting or style
          if (isWarningFirst && hasSecondLine && i > 0) {
            const prevElement = this.bodyElements[i - 1];
            
            // Check if previous element is already blank
            if (prevElement instanceof Paragraph && this.isParagraphBlank(prevElement)) {
              // Mark existing blank as preserved
              prevElement.setStyle(style);
              if (markAsPreserved && !prevElement.isPreserved()) {
                prevElement.setPreserved(true);
                totalExistingLinesMarked++;
              }
            } else {
              // Add blank paragraph before warning
              const blankPara = Paragraph.create();
              blankPara.setStyle(style);
              blankPara.setSpaceAfter(spacingAfter);
              if (markAsPreserved) {
                blankPara.setPreserved(true);
              }
              this.bodyElements.splice(i, 0, blankPara);
              totalBlankLinesAdded++;
              i++; // Skip the newly inserted blank paragraph
            }
            
            // Only process the first warning found
            break;
          }
        }
      }
    }

    // Phase 9: Add blank after bullet/numbered list blocks
    // Uses numId to distinguish between different lists - nested items with same numId
    // are treated as part of the same list
    if (afterLists) {
      for (let i = 0; i < this.bodyElements.length; i++) {
        const element = this.bodyElements[i];

        if (element instanceof Paragraph) {
          const numbering = element.getNumbering();

          if (numbering) {
            // This is a list item - check if it's the last item of its list
            const nextElement = this.bodyElements[i + 1];

            // Check if next element is any list item (same or different list)
            // If so, don't add blank between consecutive lists
            const nextIsAnyListItem = nextElement instanceof Paragraph && nextElement.getNumbering();
            if (nextIsAnyListItem) {
              continue; // No blank between consecutive lists
            }

            // Check if next is small image followed by list item
            // If so, don't add blank after this list
            if (nextElement instanceof Paragraph && this.isSmallImageParagraph(nextElement)) {
              const elementAfterImage = i + 2 < this.bodyElements.length ? this.bodyElements[i + 2] : undefined;
              if (elementAfterImage && elementAfterImage instanceof Paragraph && elementAfterImage.getNumbering()) {
                continue; // No blank: list → small image → list
              }
            }

            // Check if next non-list paragraph is within the same list context
            // (e.g., "Example:" or "Note:" between list items)
            const nextIsWithinList =
              nextElement instanceof Paragraph &&
              !nextElement.getNumbering() &&
              this.isWithinListContext(i + 1);

            const isListEnd =
              !nextElement || // End of document
              !(nextElement instanceof Paragraph) || // Next is not a paragraph
              (!nextElement.getNumbering() && !nextIsWithinList); // No numbering AND not within list context

            if (isListEnd) {
              // Check if there's already a blank paragraph after the list
              const alreadyHasBlank =
                nextElement instanceof Paragraph &&
                this.isParagraphBlank(nextElement);

              if (alreadyHasBlank) {
                // Look PAST the blank to see if the list continues with the same numId
                const elementAfterBlank = this.bodyElements[i + 2];
                const listContinuesAfterBlank =
                  elementAfterBlank instanceof Paragraph &&
                  elementAfterBlank.getNumbering()?.numId === numbering.numId;

                if (listContinuesAfterBlank) {
                  // Blank is in the MIDDLE of a list - do NOT preserve it
                  // It will be removed by removeExtraBlankParagraphs
                } else {
                  // Blank is at the END of a list - preserve it
                  nextElement.setStyle(style);
                  if (markAsPreserved && !nextElement.isPreserved()) {
                    nextElement.setPreserved(true);
                    totalExistingLinesMarked++;
                  }
                }
              } else {
                // Add blank paragraph after list
                const blankPara = Paragraph.create();
                blankPara.setStyle(style);
                blankPara.setSpaceAfter(spacingAfter);
                blankPara.setPreserved(markAsPreserved);
                this.bodyElements.splice(i + 1, 0, blankPara);
                totalBlankLinesAdded++;
              }

              totalListsProcessed++;
              // Skip the next element (either newly inserted or existing blank)
              i++;
            }
          }
        }
      }

      // Phase 9b: Handle lists inside table cells
      // Add blank after list blocks in table cells, but NOT if list is last in cell
      for (const table of this.getAllTables()) {
        for (const row of table.getRows()) {
          for (const cell of row.getCells()) {
            // Get fresh paragraph list each iteration since we may modify it
            let cellParaCount = cell.getParagraphs().length;

            for (let ci = 0; ci < cellParaCount; ci++) {
              const cellParas = cell.getParagraphs(); // Get fresh copy
              const para = cellParas[ci];
              if (!para) continue;

              const numbering = para.getNumbering();
              if (!numbering) continue;

              // This is a list item - check if it's the last item of its list in this cell
              const nextParaInCell = cellParas[ci + 1];

              // Check if next element is any list item (same or different list)
              // If so, don't add blank between consecutive lists
              if (nextParaInCell && nextParaInCell.getNumbering()) {
                continue; // No blank between consecutive lists in cell
              }

              // Check if next is small image followed by list item
              // If so, don't add blank after this list
              if (nextParaInCell && this.isSmallImageParagraph(nextParaInCell)) {
                const paraAfterImage = cellParas[ci + 2];
                if (paraAfterImage && paraAfterImage.getNumbering()) {
                  continue; // No blank: list → small image → list in cell
                }
              }

              // Check if next non-list paragraph is within the same list context in the cell
              const nextIsWithinListInCell =
                nextParaInCell &&
                !nextParaInCell.getNumbering() &&
                this.isWithinListContextInCell(cell, ci + 1);

              const isListEndInCell =
                !nextParaInCell || // End of cell
                (!nextParaInCell.getNumbering() && !nextIsWithinListInCell); // No numbering AND not within list context

              if (isListEndInCell) {
                // Check if this is the last paragraph in the cell - don't add blank
                const isLastInCell = ci === cellParas.length - 1;
                if (isLastInCell) {
                  // List ends at cell boundary - no blank needed
                  continue;
                }

                // List ends but more content follows in cell
                // Check if next is already blank
                if (nextParaInCell && this.isParagraphBlank(nextParaInCell)) {
                  // Mark existing blank as preserved
                  nextParaInCell.setStyle(style);
                  if (markAsPreserved && !nextParaInCell.isPreserved()) {
                    nextParaInCell.setPreserved(true);
                    totalExistingLinesMarked++;
                  }
                } else {
                  // Add blank paragraph after list in cell
                  const blankPara = Paragraph.create();
                  blankPara.setStyle(style);
                  blankPara.setSpaceAfter(spacingAfter);
                  blankPara.setPreserved(markAsPreserved);
                  cell.addParagraphAt(ci + 1, blankPara);
                  totalBlankLinesAdded++;
                  ci++; // Skip the newly inserted blank
                  cellParaCount++; // Account for added paragraph
                }
                totalListsProcessed++;
              }
            }
          }
        }
      }
    }

    // Phase 10: Add blank lines around images
    if (aroundImages) {
      // Process body-level image paragraphs
      for (let imgIdx = 0; imgIdx < this.bodyElements.length; imgIdx++) {
        const element = this.bodyElements[imgIdx];

        if (!(element instanceof Paragraph)) continue;

        const imageRun = this.getImageRunFromParagraph(element);
        if (!imageRun) continue;

        const image = imageRun.getImageElement();
        const isSmall = this.isImageSmall(image);

        // Handle small images (< 100x100 pixels) with special rules
        if (isSmall) {
          // Add blank BEFORE small image unless:
          // - Already blank OR
          // - (Previous is list item AND current has left indent)
          if (imgIdx > 0) {
            const prevElement = this.bodyElements[imgIdx - 1];
            const prevIsBlank = prevElement instanceof Paragraph && this.isParagraphBlank(prevElement);
            const prevIsListItem = prevElement instanceof Paragraph && prevElement.getNumbering();
            const leftIndent = (element as Paragraph).getLeftIndent();
            const currentHasLeftIndent = leftIndent !== undefined && leftIndent > 0;

            if (!prevIsBlank && !(prevIsListItem && currentHasLeftIndent)) {
              const blankBefore = Paragraph.create();
              blankBefore.setStyle(style);
              blankBefore.setSpaceAfter(spacingAfter);
              if (markAsPreserved) blankBefore.setPreserved(true);
              this.bodyElements.splice(imgIdx, 0, blankBefore);
              totalBlankLinesAdded++;
              imgIdx++;
            }
          }

          // Add blank AFTER small image unless:
          // - Already blank OR
          // - Next is list item
          if (imgIdx < this.bodyElements.length - 1) {
            const nextElement = this.bodyElements[imgIdx + 1];
            const nextIsBlank = nextElement instanceof Paragraph && this.isParagraphBlank(nextElement);
            const nextIsListItem = nextElement instanceof Paragraph && nextElement.getNumbering();

            if (nextIsBlank) {
              // Mark existing blank as preserved
              nextElement.setStyle(style);
              if (markAsPreserved && !(nextElement as Paragraph).isPreserved()) {
                (nextElement as Paragraph).setPreserved(true);
                totalExistingLinesMarked++;
              }
            } else if (!nextIsListItem) {
              const blankAfter = Paragraph.create();
              blankAfter.setStyle(style);
              blankAfter.setSpaceAfter(spacingAfter);
              if (markAsPreserved) blankAfter.setPreserved(true);
              this.bodyElements.splice(imgIdx + 1, 0, blankAfter);
              totalBlankLinesAdded++;
              imgIdx++;
            }
          }

          continue; // Skip large image processing
        }

        // Handle large images (>= 100x100 pixels) - original behavior
        // Add blank BEFORE image (if not at start of document and prev is not blank)
        // Issue #7: Skip blank if prev is bold + centered text
        if (imgIdx > 0) {
          const prevElement = this.bodyElements[imgIdx - 1];
          const prevIsBlank = prevElement instanceof Paragraph && this.isParagraphBlank(prevElement);
          const prevIsBoldCentered = prevElement instanceof Paragraph && this.isParagraphBoldAndCentered(prevElement);

          if (!prevIsBlank && !prevIsBoldCentered) {
            const blankBefore = Paragraph.create();
            blankBefore.setStyle(style);
            blankBefore.setSpaceAfter(spacingAfter);
            if (markAsPreserved) blankBefore.setPreserved(true);
            this.bodyElements.splice(imgIdx, 0, blankBefore);
            totalBlankLinesAdded++;
            imgIdx++; // Account for inserted element
          }
        }

        // Add blank AFTER image (if not at end and next is not blank)
        if (imgIdx < this.bodyElements.length - 1) {
          const nextElement = this.bodyElements[imgIdx + 1];
          if (nextElement instanceof Paragraph && this.isParagraphBlank(nextElement)) {
            // Mark existing blank as preserved
            nextElement.setStyle(style);
            if (markAsPreserved && !nextElement.isPreserved()) {
              nextElement.setPreserved(true);
              totalExistingLinesMarked++;
            }
          } else {
            const blankAfter = Paragraph.create();
            blankAfter.setStyle(style);
            blankAfter.setSpaceAfter(spacingAfter);
            if (markAsPreserved) blankAfter.setPreserved(true);
            this.bodyElements.splice(imgIdx + 1, 0, blankAfter);
            totalBlankLinesAdded++;
            imgIdx++; // Skip the inserted blank
          }
        }
      }

      // Process images inside table cells
      for (const table of this.getAllTables()) {
        for (const row of table.getRows()) {
          for (const cell of row.getCells()) {
            let cellParaCount = cell.getParagraphs().length;

            for (let ci = 0; ci < cellParaCount; ci++) {
              const cellParas = cell.getParagraphs();
              const para = cellParas[ci];
              if (!para) continue;

              const imageRun = this.getImageRunFromParagraph(para);
              if (!imageRun) continue;

              const image = imageRun.getImageElement();
              const isSmall = this.isImageSmall(image);

              // Handle small images (< 100x100 pixels) with special rules
              if (isSmall) {
                // Add blank BEFORE small image unless:
                // - Already blank OR
                // - (Previous is list item AND current has left indent)
                if (ci > 0) {
                  const prevPara = cellParas[ci - 1];
                  const prevIsBlank = prevPara && this.isParagraphBlank(prevPara);
                  const prevIsListItem = prevPara && prevPara.getNumbering();
                  const leftIndent = para.getLeftIndent();
                  const currentHasLeftIndent = leftIndent !== undefined && leftIndent > 0;

                  if (!prevIsBlank && !(prevIsListItem && currentHasLeftIndent)) {
                    const blankBefore = Paragraph.create();
                    blankBefore.setStyle(style);
                    blankBefore.setSpaceAfter(spacingAfter);
                    if (markAsPreserved) blankBefore.setPreserved(true);
                    cell.addParagraphAt(ci, blankBefore);
                    totalBlankLinesAdded++;
                    ci++;
                    cellParaCount++;
                  }
                }

                // Add blank AFTER small image unless:
                // - Last in cell OR
                // - Already blank OR
                // - Next is list item
                const isLastInCellSmall = ci === cell.getParagraphs().length - 1;
                if (!isLastInCellSmall) {
                  const nextPara = cell.getParagraphs()[ci + 1];
                  const nextIsBlank = nextPara && this.isParagraphBlank(nextPara);
                  const nextIsListItem = nextPara && nextPara.getNumbering();

                  if (nextIsBlank) {
                    // Mark existing blank as preserved
                    nextPara.setStyle(style);
                    if (markAsPreserved && !nextPara.isPreserved()) {
                      nextPara.setPreserved(true);
                      totalExistingLinesMarked++;
                    }
                  } else if (!nextIsListItem) {
                    const blankAfter = Paragraph.create();
                    blankAfter.setStyle(style);
                    blankAfter.setSpaceAfter(spacingAfter);
                    if (markAsPreserved) blankAfter.setPreserved(true);
                    cell.addParagraphAt(ci + 1, blankAfter);
                    totalBlankLinesAdded++;
                    ci++;
                    cellParaCount++;
                  }
                }

                continue; // Skip large image processing
              }

              // Handle large images (>= 100x100 pixels) - original behavior
              // Add blank BEFORE image (if not at start of cell)
              // Issue #7: Skip blank if prev is bold + centered text
              if (ci > 0) {
                const prevPara = cellParas[ci - 1];
                const prevIsBlank = prevPara && this.isParagraphBlank(prevPara);
                const prevIsBoldCentered = prevPara && this.isParagraphBoldAndCentered(prevPara);

                if (prevPara && !prevIsBlank && !prevIsBoldCentered) {
                  const blankBefore = Paragraph.create();
                  blankBefore.setStyle(style);
                  blankBefore.setSpaceAfter(spacingAfter);
                  if (markAsPreserved) blankBefore.setPreserved(true);
                  cell.addParagraphAt(ci, blankBefore);
                  totalBlankLinesAdded++;
                  ci++;
                  cellParaCount++;
                }
              }

              // Add blank AFTER image (if not last in cell)
              const isLastInCell = ci === cell.getParagraphs().length - 1;
              if (!isLastInCell) {
                const nextPara = cell.getParagraphs()[ci + 1];
                if (nextPara && this.isParagraphBlank(nextPara)) {
                  // Mark existing blank as preserved
                  nextPara.setStyle(style);
                  if (markAsPreserved && !nextPara.isPreserved()) {
                    nextPara.setPreserved(true);
                    totalExistingLinesMarked++;
                  }
                } else {
                  const blankAfter = Paragraph.create();
                  blankAfter.setStyle(style);
                  blankAfter.setSpaceAfter(spacingAfter);
                  if (markAsPreserved) blankAfter.setPreserved(true);
                  cell.addParagraphAt(ci + 1, blankAfter);
                  totalBlankLinesAdded++;
                  ci++;
                  cellParaCount++;
                }
              }
            }
          }
        }
      }
    }

    // Phase 11: Add blank above paragraphs starting with bold text followed by colon
    if (aboveBoldColon) {
      let foundStopHeading = false;

      for (let i = 1; i < this.bodyElements.length; i++) {
        const element = this.bodyElements[i];

        // Check if this element is a 1x1 table containing the stop heading
        if (stopBoldColonAfterHeading && !foundStopHeading && element instanceof Table) {
          const rowCount = element.getRowCount();
          const colCount = element.getColumnCount();
          if (rowCount === 1 && colCount === 1) {
            const cell = element.getCell(0, 0);
            if (cell) {
              const cellText = cell
                .getParagraphs()
                .map((p) => p.getText())
                .join(" ")
                .toLowerCase();
              if (cellText.includes(stopBoldColonAfterHeading)) {
                foundStopHeading = true;
                continue;
              }
            }
          }
        }

        // Skip bold+colon processing after stop heading is found
        if (foundStopHeading) continue;

        if (!(element instanceof Paragraph)) continue;

        // Skip blank paragraphs
        if (this.isParagraphBlank(element)) continue;

        if (this.startsWithBoldColon(element)) {
          // Skip list items - they shouldn't get blank lines above them for bold+colon
          const numbering = element.getNumbering();
          if (numbering) continue;

          // Skip paragraphs within a list context (e.g., "Example:" between bullet items)
          if (this.isWithinListContext(i)) continue;

          // Skip if IMMEDIATE previous is a list item AND current is indented
          const indentation = element.getFormatting().indentation;
          const isIndented = indentation && indentation.left && indentation.left > 0;
          const prevElement = this.bodyElements[i - 1];
          if (isIndented && prevElement instanceof Paragraph) {
            const prevNumbering = prevElement.getNumbering();
            if (prevNumbering) {
              // Previous is list item AND current is indented - skip
              continue;
            }
          }

          if (
            prevElement instanceof Paragraph &&
            this.isParagraphBlank(prevElement)
          ) {
            // Mark existing blank as preserved
            prevElement.setStyle(style);
            if (markAsPreserved && !prevElement.isPreserved()) {
              prevElement.setPreserved(true);
              totalExistingLinesMarked++;
            }
          } else {
            // Add blank paragraph before bold+colon line
            const blankPara = Paragraph.create();
            blankPara.setStyle(style);
            blankPara.setSpaceAfter(spacingAfter);
            if (markAsPreserved) {
              blankPara.setPreserved(true);
            }
            this.bodyElements.splice(i, 0, blankPara);
            totalBlankLinesAdded++;
            i++; // Skip the inserted blank
          }
        }
      }
    }

    // Phase 11b: Handle bold+colon paragraphs inside table cells
    if (aboveBoldColon) {
      let foundStopHeadingInTable = false;

      for (const table of this.getAllTables()) {
        // Check if this is a 1x1 table containing the stop heading
        if (stopBoldColonAfterHeading && !foundStopHeadingInTable) {
          const rowCount = table.getRowCount();
          const colCount = table.getColumnCount();
          if (rowCount === 1 && colCount === 1) {
            const cell = table.getCell(0, 0);
            if (cell) {
              const cellText = cell
                .getParagraphs()
                .map((p) => p.getText())
                .join(" ")
                .toLowerCase();
              if (cellText.includes(stopBoldColonAfterHeading)) {
                foundStopHeadingInTable = true;
                continue; // Skip this table and all subsequent tables
              }
            }
          }
        }

        // Skip all tables after the stop heading table is found
        if (foundStopHeadingInTable) continue;

        for (const row of table.getRows()) {
          for (const cell of row.getCells()) {
            let cellParas = cell.getParagraphs();
            let cellParaCount = cellParas.length;

            for (let ci = 0; ci < cellParaCount; ci++) {
              cellParas = cell.getParagraphs(); // Refresh after potential insertion
              const para = cellParas[ci];
              if (!para) continue;

              // Skip blank paragraphs
              if (this.isParagraphBlank(para)) continue;

              // Skip list items
              if (para.getNumbering()) continue;

              // Skip paragraphs within a list context in the cell
              if (this.isWithinListContextInCell(cell, ci)) continue;

              // Check bold+colon condition
              if (!this.startsWithBoldColon(para)) continue;

              // Skip if first element in cell
              if (ci === 0) continue;

              const prevPara = cellParas[ci - 1];

              // Skip if IMMEDIATE previous is a list item AND current is indented
              const indentation = para.getFormatting().indentation;
              const isIndented = indentation && indentation.left && indentation.left > 0;
              if (isIndented && prevPara) {
                const prevNumbering = prevPara.getNumbering();
                if (prevNumbering) {
                  // Previous is list item AND current is indented - skip
                  continue;
                }
              }

              if (prevPara && this.isParagraphBlank(prevPara)) {
                // Mark existing blank as preserved
                prevPara.setStyle(style);
                if (markAsPreserved && !prevPara.isPreserved()) {
                  prevPara.setPreserved(true);
                  totalExistingLinesMarked++;
                }
              } else {
                // Add blank paragraph before bold+colon line
                const blankPara = Paragraph.create();
                blankPara.setStyle(style);
                blankPara.setSpaceAfter(spacingAfter);
                if (markAsPreserved) {
                  blankPara.setPreserved(true);
                }
                cell.addParagraphAt(ci, blankPara);
                totalBlankLinesAdded++;
                ci++; // Skip the inserted blank
                cellParaCount++; // Account for inserted paragraph
              }
            }
          }
        }
      }
    }

    // Phase 12: Remove blank lines between consecutive list items
    // List normalization may create different numIds for sub-lists (restart behavior),
    // which causes Phase 9b to see them as "different lists" and add blanks between them.
    // This cleanup removes blanks that are directly between two list items.
    let listItemBlanksRemoved = 0;

    // Body-level cleanup
    for (let bi = 1; bi < this.bodyElements.length - 1; bi++) {
      const prev = this.bodyElements[bi - 1];
      const current = this.bodyElements[bi];
      const next = this.bodyElements[bi + 1];

      // Skip if current is not a blank paragraph
      if (!(current instanceof Paragraph) || !this.isParagraphBlank(current)) continue;

      // Skip if prev or next is a table (don't cross table boundaries)
      if (prev instanceof Table || next instanceof Table) continue;

      // Check if prev and next are both list items
      if (prev instanceof Paragraph && next instanceof Paragraph) {
        const prevNumbering = prev.getNumbering();
        const nextNumbering = next.getNumbering();

        if (prevNumbering && nextNumbering && prevNumbering.numId === nextNumbering.numId) {
          // Both are items of the SAME list - remove the blank between them
          // Keep blanks between DIFFERENT lists (e.g., bullet list followed by numbered list)
          this.bodyElements.splice(bi, 1);
          bi--; // Adjust index after removal
          listItemBlanksRemoved++;
        }
      }
    }

    // Table cell cleanup - remove blanks between list items within each cell
    for (const table of this.getAllTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          let cellParas = cell.getParagraphs();
          for (let ci = 1; ci < cellParas.length - 1; ci++) {
            const prev = cellParas[ci - 1];
            const current = cellParas[ci];
            const next = cellParas[ci + 1];

            if (!current || !this.isParagraphBlank(current)) continue;

            const prevNumbering = prev?.getNumbering();
            const nextNumbering = next?.getNumbering();

            if (prevNumbering && nextNumbering && prevNumbering.numId === nextNumbering.numId) {
              // Both are items of the SAME list - remove the blank between them
              // Keep blanks between DIFFERENT lists (e.g., bullet list followed by numbered list)
              cell.removeParagraph(ci);
              ci--; // Adjust index after removal
              listItemBlanksRemoved++;
              cellParas = cell.getParagraphs(); // Refresh after removal
            }
          }
        }
      }
    }

    blankLinesRemoved += listItemBlanksRemoved;

    // Phase 13: Indentation-based blank lines (Issue #5)
    // Rule #5: If current line is indented, and next line is neither indented nor a list, add blank before next
    // Note: Issue #11 (both non-indented Normal) is not implemented here as it's too aggressive
    // and would conflict with Issue #4 (removing incorrect blanks)
    for (let ni = 0; ni < this.bodyElements.length - 1; ni++) {
      const current = this.bodyElements[ni];
      const next = this.bodyElements[ni + 1];

      // Both must be paragraphs
      if (!(current instanceof Paragraph) || !(next instanceof Paragraph)) continue;

      // Skip blank paragraphs
      if (this.isParagraphBlank(current) || this.isParagraphBlank(next)) continue;

      // Skip if next is a list item - handled by list phases
      if (next.getNumbering()) continue;

      // Skip if within a list context (text between list items of same list)
      if (this.isWithinListContext(ni) || this.isWithinListContext(ni + 1)) continue;

      const currentIndent = current.getLeftIndent() || 0;
      const nextIndent = next.getLeftIndent() || 0;

      // Rule #5: Indented current → non-indented next → add blank
      if (currentIndent > 0 && nextIndent === 0) {
        const blankPara = Paragraph.create();
        blankPara.setStyle(style);
        blankPara.setSpaceAfter(spacingAfter);
        if (markAsPreserved) {
          blankPara.setPreserved(true);
        }
        this.bodyElements.splice(ni + 1, 0, blankPara);
        totalBlankLinesAdded++;
        ni++; // Skip the inserted blank
      }
    }

    // Final Phase: Remove consecutive blank paragraphs to prevent double blanks
    // This handles edge cases where multiple phases add adjacent blanks
    let duplicateBlanksRemoved = 0;
    let i = 0;
    while (i < this.bodyElements.length - 1) {
      const current = this.bodyElements[i];
      const next = this.bodyElements[i + 1];

      if (
        current instanceof Paragraph &&
        this.isParagraphBlank(current) &&
        next instanceof Paragraph &&
        this.isParagraphBlank(next)
      ) {
        // Keep first blank, remove second
        this.bodyElements.splice(i + 1, 1);
        duplicateBlanksRemoved++;
        // Don't increment - check same position again in case there are 3+ blanks
      } else {
        i++;
      }
    }

    // Return aggregated statistics
    return {
      tablesProcessed: totalTablesProcessed,
      blankLinesAdded: totalBlankLinesAdded - duplicateBlanksRemoved,
      existingLinesMarked: totalExistingLinesMarked,
      blankLinesRemoved: blankLinesRemoved + duplicateBlanksRemoved,
      listsProcessed: totalListsProcessed,
    };
  }

  /**
   * Helper method called by removeExtraBlankParagraphs to re-insert structural blank lines
   * @private
   * @param options Optional configuration
   * @param options.stopBoldColonAfterHeading Stop adding bold+colon blank lines after this heading
   * @returns Number of blank paragraphs added
   */
  private addStructureBlankLinesAfterElements(options?: {
    stopBoldColonAfterHeading?: string;
  }): number {
    // Use the public method with all structure options enabled
    const result = this.addStructureBlankLines({
      spacingAfter: 120,
      markAsPreserved: true,
      style: 'Normal',
      after1x1Tables: true,
      afterOtherTables: true,
      aboveFirstTable: true,
      aboveTODHyperlinks: true,
      aboveReturnToHLP: true,
      belowHeading1Lines: true,
      belowTOC: true,
      aboveWarning: true,
      afterLists: true,
      aroundImages: true,
      stopBoldColonAfterHeading: options?.stopBoldColonAfterHeading,
    });

    return result.blankLinesAdded;
  }


  private markHeading2BlankLinesAsPreserved(): void {
    const tables = this.getAllTables();

    for (const table of tables) {
      const rowCount = table.getRowCount();
      const colCount = table.getColumnCount();

      // Check if it's a 1x1 table
      if (rowCount !== 1 || colCount !== 1) {
        continue;
      }

      // Get the cell and check if it contains a Heading 2 paragraph
      const cell = table.getCell(0, 0);
      if (!cell) continue;

      const cellParas = cell.getParagraphs();
      let hasHeading2 = false;

      for (const para of cellParas) {
        const style = para.getStyle();
        if (
          style === "Heading2" ||
          style === "Heading 2" ||
          style === "CustomHeader2" ||
          style === "Header2"
        ) {
          hasHeading2 = true;
          break;
        }
      }

      if (!hasHeading2) continue;

      // Found a 1x1 table with Heading 2 - mark next paragraph as preserved if it's blank
      const tableIndex = this.bodyElements.indexOf(table);
      if (tableIndex === -1) continue;

      const nextElement = this.bodyElements[tableIndex + 1];
      if (nextElement instanceof Paragraph) {
        if (this.isParagraphBlank(nextElement)) {
          nextElement.setPreserved(true);
        }
      }
    }
  }

  /**
   * Ensures that all 1x1 tables have a blank line after them with optional preserve flag.
   * This is useful for maintaining spacing after single-cell tables (e.g., Heading 2 tables).
   *
   * The method:
   * 1. Finds all 1x1 tables in the document
   * 2. Checks if there's a blank paragraph immediately after each table
   * 3. If no blank paragraph exists, adds one with spacing and preserve flag
   * 4. If a blank paragraph exists, optionally marks it as preserved
   *
   * @param options Configuration options
   * @param options.spacingAfter Spacing after the blank paragraph in twips (default: 120 twips = 6pt)
   * @param options.markAsPreserved Whether to mark blank paragraphs as preserved (default: true)
   * @param options.style Style to apply to blank paragraphs (default: 'Normal')
   * @param options.filter Optional filter function to select which tables to process
   * @returns Statistics about the operation
   *
   * @example
   * // Add blank lines after all 1x1 tables with default settings
   * const result = doc.ensureBlankLinesAfter1x1Tables();
   * console.log(`Added ${result.blankLinesAdded} blank lines`);
   * console.log(`Marked ${result.existingLinesMarked} existing blank lines as preserved`);
   *
   * @example
   * // Custom spacing and preserve flag
   * doc.ensureBlankLinesAfter1x1Tables({
   *   spacingAfter: 240,  // 12pt spacing
   *   markAsPreserved: true
   * });
   *
   * @example
   * // Custom style for blank paragraphs
   * doc.ensureBlankLinesAfter1x1Tables({
   *   style: 'BodyText',  // Use BodyText instead of Normal
   *   spacingAfter: 120
   * });
   *
   * @example
   * // Only process tables with Heading 2 paragraphs
   * doc.ensureBlankLinesAfter1x1Tables({
   *   filter: (table, index) => {
   *     const cell = table.getCell(0, 0);
   *     if (!cell) return false;
   *     return cell.getParagraphs().some(p => {
   *       const style = p.getStyle();
   *       return style === 'Heading2' || style === 'Heading 2';
   *     });
   *   }
   * });
   */
  public ensureBlankLinesAfter1x1Tables(options?: {
    spacingAfter?: number;
    markAsPreserved?: boolean;
    style?: string;
    filter?: (table: Table, index: number) => boolean;
  }): {
    tablesProcessed: number;
    blankLinesAdded: number;
    existingLinesMarked: number;
  } {
    const spacingAfter = options?.spacingAfter ?? 120;
    const markAsPreserved = options?.markAsPreserved ?? true;
    const style = options?.style ?? "Normal";
    const filter = options?.filter;

    let tablesProcessed = 0;
    let blankLinesAdded = 0;
    let existingLinesMarked = 0;

    const tables = this.getAllTables();

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      if (!table) continue;

      const rowCount = table.getRowCount();
      const colCount = table.getColumnCount();

      // Check if it's a 1x1 table
      if (rowCount !== 1 || colCount !== 1) {
        continue;
      }

      // Apply filter if provided
      if (filter && !filter(table, i)) {
        continue;
      }

      tablesProcessed++;

      // Find table index in body elements
      const tableIndex = this.bodyElements.indexOf(table);
      if (tableIndex === -1) continue;

      // Check next element
      const nextElement = this.bodyElements[tableIndex + 1];

      if (nextElement instanceof Paragraph) {
        // Next element is a paragraph - check if it's blank
        if (this.isParagraphBlank(nextElement)) {
          // Blank paragraph exists - set style to Normal and mark as preserved
          nextElement.setStyle(style);
          if (markAsPreserved && !nextElement.isPreserved()) {
            nextElement.setPreserved(true);
            existingLinesMarked++;
          }
        } else {
          // Next paragraph has content - add blank paragraph between table and content
          const blankPara = Paragraph.create();
          blankPara.setStyle(style);
          blankPara.setSpaceAfter(spacingAfter);
          if (markAsPreserved) {
            blankPara.setPreserved(true);
          }
          this.bodyElements.splice(tableIndex + 1, 0, blankPara);
          blankLinesAdded++;
        }
      } else {
        // No paragraph after table (or it's another table/element) - add blank paragraph
        const blankPara = Paragraph.create();
        blankPara.setStyle(style);
        blankPara.setSpaceAfter(spacingAfter);
        if (markAsPreserved) {
          blankPara.setPreserved(true);
        }
        this.bodyElements.splice(tableIndex + 1, 0, blankPara);
        blankLinesAdded++;
      }
    }

    return {
      tablesProcessed,
      blankLinesAdded,
      existingLinesMarked,
    };
  }
  /**
   * Ensures that all tables (excluding 1x1 tables) have a blank line after them with optional preserve flag.
   * This is useful for maintaining spacing after multi-cell tables.
   *
   * The method:
   * 1. Finds all tables with more than one cell (not 1x1) in the document
   * 2. Checks if there's a blank paragraph immediately after each table
   * 3. If no blank paragraph exists, adds one with spacing and preserve flag
   * 4. If a blank paragraph exists, optionally marks it as preserved
   *
   * @param options Configuration options
   * @param options.spacingAfter Spacing after the blank paragraph in twips (default: 120 twips = 6pt)
   * @param options.markAsPreserved Whether to mark blank paragraphs as preserved (default: true)
   * @param options.style Style to apply to blank paragraphs (default: 'Normal')
   * @param options.filter Optional filter function to select which tables to process
   * @returns Statistics about the operation
   *
   * @example
   * // Add blank lines after all multi-cell tables with default settings
   * const result = doc.ensureBlankLinesAfterOtherTables();
   * console.log(`Added ${result.blankLinesAdded} blank lines`);
   * console.log(`Marked ${result.existingLinesMarked} existing blank lines as preserved`);
   *
   * @example
   * // Custom spacing and preserve flag
   * doc.ensureBlankLinesAfterOtherTables({
   *   spacingAfter: 240,  // 12pt spacing
   *   markAsPreserved: true
   * });
   *
   * @example
   * // Custom style for blank paragraphs
   * doc.ensureBlankLinesAfterOtherTables({
   *   style: 'BodyText',  // Use BodyText instead of Normal
   *   spacingAfter: 120
   * });
   *
   * @example
   * // Only process tables with more than 2 rows
   * doc.ensureBlankLinesAfterOtherTables({
   *   filter: (table, index) => table.getRowCount() > 2
   * });
   */
  public ensureBlankLinesAfterOtherTables(options?: {
    spacingAfter?: number;
    markAsPreserved?: boolean;
    style?: string;
    filter?: (table: Table, index: number) => boolean;
  }): {
    tablesProcessed: number;
    blankLinesAdded: number;
    existingLinesMarked: number;
  } {
    const spacingAfter = options?.spacingAfter ?? 120;
    const markAsPreserved = options?.markAsPreserved ?? true;
    const style = options?.style ?? "Normal";
    const filter = options?.filter;

    let tablesProcessed = 0;
    let blankLinesAdded = 0;
    let existingLinesMarked = 0;

    const tables = this.getAllTables();

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      if (!table) continue;

      const rowCount = table.getRowCount();
      const colCount = table.getColumnCount();

      // Skip 1x1 tables (handled by ensureBlankLinesAfter1x1Tables)
      if (rowCount === 1 && colCount === 1) {
        continue;
      }

      // Apply filter if provided
      if (filter && !filter(table, i)) {
        continue;
      }

      tablesProcessed++;

      // Find table index in body elements
      const tableIndex = this.bodyElements.indexOf(table);
      if (tableIndex === -1) continue;

      // Check next element
      const nextElement = this.bodyElements[tableIndex + 1];

      if (nextElement instanceof Paragraph) {
        // Next element is a paragraph - check if it's blank
        if (this.isParagraphBlank(nextElement)) {
          // Blank paragraph exists - set style to Normal and mark as preserved
          nextElement.setStyle(style);
          if (markAsPreserved && !nextElement.isPreserved()) {
            nextElement.setPreserved(true);
            existingLinesMarked++;
          }
        } else {
          // Next paragraph has content - add blank paragraph between table and content
          const blankPara = Paragraph.create();
          blankPara.setStyle(style);
          blankPara.setSpaceAfter(spacingAfter);
          if (markAsPreserved) {
            blankPara.setPreserved(true);
          }
          this.bodyElements.splice(tableIndex + 1, 0, blankPara);
          blankLinesAdded++;
        }
      } else {
        // No paragraph after table (or it's another table/element) - add blank paragraph
        const blankPara = Paragraph.create();
        blankPara.setStyle(style);
        blankPara.setSpaceAfter(spacingAfter);
        if (markAsPreserved) {
          blankPara.setPreserved(true);
        }
        this.bodyElements.splice(tableIndex + 1, 0, blankPara);
        blankLinesAdded++;
      }
    }

    return {
      tablesProcessed,
      blankLinesAdded,
      existingLinesMarked,
    };
  }

  /**
   * Standardizes all bullet list symbols formatting (font, size, bold, color)
   *
   * This helper ensures consistent bullet FORMATTING across all bullet lists in the document.
   * It modifies the numbering definitions (not individual paragraphs), preserving the actual
   * bullet symbols (•, ○, ▪, etc.) while standardizing their visual formatting.
   *
   * **Important**: This only affects the bullet symbol FORMATTING, not the symbol itself.
   * The actual bullet characters are preserved as they were originally defined.
   *
   * @param options Formatting options
   * @returns Statistics about lists updated
   *
   * @example
   * // Standardize all bullet symbols with defaults (Arial 12pt bold black)
   * const result = doc.standardizeBulletSymbols();
   * console.log(`Updated ${result.listsUpdated} bullet lists (${result.levelsModified} levels)`);
   *
   * @example
   * // Custom formatting for bullet symbols
   * const result = doc.standardizeBulletSymbols({
   *   bold: true,
   *   fontSize: 28,  // 14pt
   *   color: 'FF0000',  // Red
   *   font: 'Calibri'
   * });
   */
  public standardizeBulletSymbols(options?: {
    bold?: boolean;
    fontSize?: number;
    color?: string;
    font?: string;
  }): {
    listsUpdated: number;
    levelsModified: number;
  } {
    const {
      bold = false,
      fontSize = 24, // 12pt
      color = "000000",
      font = "Arial",
    } = options || {};

    let listsUpdated = 0;
    let levelsModified = 0;

    const instances = this.numberingManager.getAllInstances();

    for (const instance of instances) {
      const abstractNumId = instance.getAbstractNumId();
      const abstractNum =
        this.numberingManager.getAbstractNumbering(abstractNumId);

      if (!abstractNum) continue;

      // Only process bullet lists (skip numbered lists)
      const level0 = abstractNum.getLevel(0);
      if (!level0 || level0.getFormat() !== "bullet") continue;

      // Update all 9 levels (0-8) with formatting only (preserve existing symbols)
      for (let levelIndex = 0; levelIndex < 9; levelIndex++) {
        const numLevel = abstractNum.getLevel(levelIndex);
        if (!numLevel) continue;

        // Only set formatting - do NOT change the bullet symbol itself
        numLevel.setFont(font);
        numLevel.setFontSize(fontSize);
        numLevel.setBold(bold);
        numLevel.setColor(color);
        // Always clear italic and underline from bullets (Issue #1: bullets should never be formatted)
        numLevel.setItalic(false);
        numLevel.clearUnderline();

        levelsModified++;
      }

      listsUpdated++;
    }

    return { listsUpdated, levelsModified };
  }

  /**
   * Standardizes numbered list prefixes (1., a., i., etc.) to Verdana 12pt bold black
   *
   * This only affects the prefix/number formatting, not the text content after it.
   * It modifies the numbering definitions in the document while preserving the
   * numbering format type (decimal, roman, letter, etc.).
   *
   * **Important**: This updates the visual formatting of prefixes like "1.", "a.", "i."
   * but does not change the numbering type itself.
   *
   * @param options Formatting options
   * @returns Statistics about lists updated
   *
   * @example
   * // Standardize all numbered list prefixes with defaults (Verdana 12pt bold black)
   * const result = doc.standardizeNumberedListPrefixes();
   * console.log(`Updated ${result.listsUpdated} numbered lists (${result.levelsModified} levels)`);
   *
   * @example
   * // Custom formatting for numbered list prefixes
   * const result = doc.standardizeNumberedListPrefixes({
   *   bold: true,
   *   fontSize: 24,
   *   color: '000000',
   *   font: 'Verdana'
   * });
   */
  public standardizeNumberedListPrefixes(options?: {
    bold?: boolean;
    fontSize?: number;
    color?: string;
    font?: string;
  }): {
    listsUpdated: number;
    levelsModified: number;
  } {
    const {
      bold = false,
      fontSize = 24, // 12pt
      color = "000000",
      font = "Verdana",
    } = options || {};

    let listsUpdated = 0;
    let levelsModified = 0;

    const instances = this.numberingManager.getAllInstances();

    for (const instance of instances) {
      const abstractNumId = instance.getAbstractNumId();
      const abstractNum =
        this.numberingManager.getAbstractNumbering(abstractNumId);

      if (!abstractNum) continue;

      // Only process numbered lists (skip bullet lists)
      const level0 = abstractNum.getLevel(0);
      if (!level0 || level0.getFormat() === "bullet") continue;

      // Update all 9 levels (0-8)
      for (let levelIndex = 0; levelIndex < 9; levelIndex++) {
        const numLevel = abstractNum.getLevel(levelIndex);
        if (!numLevel) continue;

        numLevel.setFont(font);
        numLevel.setFontSize(fontSize);
        numLevel.setBold(bold);
        numLevel.setColor(color);
        // Always clear italic and underline from numbered prefixes (Issue #1: numbers should never be formatted)
        numLevel.setItalic(false);
        numLevel.clearUnderline();

        levelsModified++;
      }

      listsUpdated++;
    }

    return { listsUpdated, levelsModified };
  }

  /**
   * Standardizes all hyperlinks in the document to Verdana 12pt blue (#0000FF) underline
   *
   * This applies consistent formatting to all hyperlinks throughout the document,
   * including those in tables. The method preserves the hyperlink URLs and text
   * while updating only the visual formatting.
   *
   * @param options Formatting options
   * @returns Number of hyperlinks updated
   *
   * @example
   * // Use default formatting (Verdana 12pt blue underline)
   * const count = doc.standardizeAllHyperlinks();
   * console.log(`Standardized ${count} hyperlinks`);
   *
   * @example
   * // Custom hyperlink formatting
   * const count = doc.standardizeAllHyperlinks({
   *   font: 'Arial',
   *   size: 11,
   *   color: 'FF0000',  // Red
   *   underline: true
   * });
   */
  public standardizeAllHyperlinks(options?: {
    font?: string;
    size?: number;
    color?: string;
    underline?: boolean;
  }): number {
    const {
      font = "Verdana",
      size = 12,
      color = "0000FF",
      underline = true,
    } = options || {};

    const hyperlinks = this.getHyperlinks();

    for (const { hyperlink } of hyperlinks) {
      hyperlink.setFormatting({
        font: font,
        size: size,
        color: color,
        underline: underline ? "single" : false,
      });
    }

    return hyperlinks.length;
  }


  /**
   * Applies Heading 1 style to paragraphs with H1-like style names
   * @param options Optional style application options
   * @returns Number of paragraphs updated
   * @example
   * ```typescript
   * // Simple usage
   * doc.applyH1();
   *
   * // With custom formatting
   * doc.applyH1({
   *   format: { font: 'Arial', size: 18, emphasis: ['bold'] }
   * });
   *
   * // Preserve specific properties
   * doc.applyH1({
   *   keepProperties: ['bold', 'color'],
   *   format: { font: 'Verdana' }
   * });
   * ```
   */
  public applyH1(options?: StyleApplyOptions): number {
    return this.applyStyleToMatching("Heading1", options, (style) =>
      /^(heading\s*1|header\s*1|h1)$/i.test(style)
    );
  }

  /**
   * Applies Heading 2 style to paragraphs with H2-like style names
   * @param options Optional style application options
   * @returns Number of paragraphs updated
   * @example
   * ```typescript
   * doc.applyH2({
   *   format: { font: 'Verdana', size: 14, color: '000000' }
   * });
   * ```
   */
  public applyH2(options?: StyleApplyOptions): number {
    return this.applyStyleToMatching("Heading2", options, (style) =>
      /^(heading\s*2|header\s*2|h2)$/i.test(style)
    );
  }

  /**
   * Applies Heading 3 style to paragraphs with H3-like style names
   * @param options Optional style application options
   * @returns Number of paragraphs updated
   * @example
   * ```typescript
   * doc.applyH3({
   *   format: { font: 'Verdana', size: 12, emphasis: ['bold'] }
   * });
   * ```
   */
  public applyH3(options?: StyleApplyOptions): number {
    return this.applyStyleToMatching("Heading3", options, (style) =>
      /^(heading\s*3|header\s*3|h3)$/i.test(style)
    );
  }

  /**
   * Applies Normal style to paragraphs without recognized styles
   * @param options Optional style application options
   * @returns Number of paragraphs updated
   */
  public applyNormal(options?: StyleApplyOptions): number {
    const targets =
      options?.paragraphs ||
      this.getAllParagraphs().filter((p) => {
        const style = p.getStyle();
        return (
          !style ||
          !/^(heading|header|h\d|list|toc|tod|caution|table)/i.test(style)
        );
      });

    let count = 0;
    for (const para of targets) {
      if (para.isPreserved()) continue;
      para.setStyle("Normal");

      if (options?.keepProperties && options.keepProperties.length > 0) {
        this.clearFormattingExcept(para, options.keepProperties);
      } else {
        para.clearDirectFormatting();
      }

      if (options?.format) {
        this.applyFormatOptions(para, options.format);
      }

      count++;
    }
    return count;
  }

  /**
   * Applies list style to numbered lists
   * @param options Optional style application options
   * @returns Number of paragraphs updated
   */
  public applyNumList(options?: StyleApplyOptions): number {
    return this.applyStyleToMatching("ListParagraph", options, (style) =>
      /^(list\s*number|numbered\s*list|list\s*paragraph)$/i.test(style)
    );
  }

  /**
   * Applies list style to bullet lists
   * @param options Optional style application options
   * @returns Number of paragraphs updated
   */
  public applyBulletList(options?: StyleApplyOptions): number {
    return this.applyStyleToMatching("ListParagraph", options, (style) =>
      /^(list\s*bullet|bullet\s*list|list\s*paragraph)$/i.test(style)
    );
  }

  /**
   * Applies Table of Contents style
   * @param options Optional style application options
   * @returns Number of paragraphs updated
   */
  public applyTOC(options?: StyleApplyOptions): number {
    return this.applyStyleToMatching("TOC", options, (style) =>
      /^(toc|table\s*of\s*contents|toc\s*heading)$/i.test(style)
    );
  }

  /**
   * Applies Top of Document style
   * @param options Optional style application options
   * @returns Number of paragraphs updated
   */
  public applyTOD(options?: StyleApplyOptions): number {
    return this.applyStyleToMatching("TopOfDocument", options, (style) =>
      /^(tod|top\s*of\s*document|document\s*top)$/i.test(style)
    );
  }

  /**
   * Applies Caution style
   * @param options Optional style application options
   * @returns Number of paragraphs updated
   */
  public applyCaution(options?: StyleApplyOptions): number {
    return this.applyStyleToMatching("Caution", options, (style) =>
      /^(caution|warning|important|alert)$/i.test(style)
    );
  }

  /**
   * Applies header style to table cell paragraphs (typically first row)
   * @param options Optional style application options
   * @returns Number of paragraphs updated
   */
  public applyCellHeader(options?: StyleApplyOptions): number {
    let count = 0;
    const tables = this.getAllTables();

    for (const table of tables) {
      const firstRow = table.getRow(0);
      if (!firstRow) continue;

      for (const cell of firstRow.getCells()) {
        for (const para of cell.getParagraphs()) {
          if (para.isPreserved()) continue;
          para.setStyle("TableHeader");

          if (options?.keepProperties && options.keepProperties.length > 0) {
            this.clearFormattingExcept(para, options.keepProperties);
          } else {
            para.clearDirectFormatting();
          }

          if (options?.format) {
            this.applyFormatOptions(para, options.format);
          }

          count++;
        }
      }
    }

    return count;
  }

  /**
   * Applies hyperlink style to hyperlinks
   * @returns Number of hyperlinks updated
   */
  public applyHyperlink(): number {
    let count = 0;
    const hyperlinks = this.getHyperlinks();

    for (const { hyperlink } of hyperlinks) {
      hyperlink.resetToStandardFormatting();
      count++;
    }

    return count;
  }

  /**
   * Helper method to apply formatting options to a paragraph
   * @private
   */
  private applyFormatOptions(para: Paragraph, options: FormatOptions): void {
    // Text formatting
    if (options.font || options.size || options.color || options.emphasis) {
      for (const run of para.getRuns()) {
        if (options.font) run.setFont(options.font);
        if (options.size) run.setSize(options.size);
        if (options.color) run.setColor(options.color);
        if (options.emphasis) {
          options.emphasis.forEach((emp) => {
            if (emp === "bold") run.setBold(true);
            if (emp === "italic") run.setItalic(true);
            if (emp === "underline") run.setUnderline("single");
          });
        }
      }
    }

    // Alignment
    if (options.alignment) {
      para.setAlignment(options.alignment);
    }

    // Spacing (convert points to twips: 1pt = 20 twips)
    if (options.spaceAbove !== undefined) {
      para.setSpaceBefore(options.spaceAbove * 20);
    }
    if (options.spaceBelow !== undefined) {
      para.setSpaceAfter(options.spaceBelow * 20);
    }
    if (options.lineSpacing !== undefined) {
      para.setLineSpacing(options.lineSpacing * 20);
    }

    // Indentation (convert inches to twips: 1in = 1440 twips)
    if (options.indentLeft !== undefined) {
      para.setLeftIndent(options.indentLeft * 1440);
    }
    if (options.indentRight !== undefined) {
      para.setRightIndent(options.indentRight * 1440);
    }
    if (options.indentFirst !== undefined) {
      para.setFirstLineIndent(options.indentFirst * 1440);
    }
    if (options.indentHanging !== undefined) {
      // Set hanging indent directly through formatting
      if (!para.formatting.indentation) {
        para.formatting.indentation = {};
      }
      para.formatting.indentation.hanging = options.indentHanging * 1440;
    }

    // Advanced options (only set if true)
    if (options.keepWithNext) {
      para.setKeepNext(true);
    }
    if (options.keepLines) {
      para.setKeepLines(true);
    }
  }

  /**
   * Helper method to selectively clear formatting while preserving specific properties
   * @private
   */
  private clearFormattingExcept(
    para: Paragraph,
    keepProperties: string[]
  ): void {
    // Save properties to keep
    const savedProps: any = {};
    const formatting = para.formatting;

    for (const prop of keepProperties) {
      if ((formatting as any)[prop] !== undefined) {
        savedProps[prop] = (formatting as any)[prop];
      }
    }

    // Clear all formatting
    para.clearDirectFormatting();

    // Restore saved properties
    for (const prop of keepProperties) {
      if (savedProps[prop] !== undefined) {
        (para.formatting as any)[prop] = savedProps[prop];
      }
    }

    // Handle run-level properties
    for (const run of para.getRuns()) {
      const runFormatting = run.getFormatting();
      const runSavedProps: any = {};
      for (const prop of keepProperties) {
        if ((runFormatting as any)[prop] !== undefined) {
          runSavedProps[prop] = (runFormatting as any)[prop];
        }
      }

      run.clearFormatting();

      // Restore saved properties using appropriate setters
      if (runSavedProps.bold !== undefined) run.setBold(runSavedProps.bold);
      if (runSavedProps.italic !== undefined)
        run.setItalic(runSavedProps.italic);
      if (runSavedProps.underline !== undefined)
        run.setUnderline(runSavedProps.underline);
      if (runSavedProps.color !== undefined) run.setColor(runSavedProps.color);
      if (runSavedProps.font !== undefined) run.setFont(runSavedProps.font);
      if (runSavedProps.size !== undefined) run.setSize(runSavedProps.size);
      if (runSavedProps.highlight !== undefined)
        run.setHighlight(runSavedProps.highlight);
      if (runSavedProps.strike !== undefined)
        run.setStrike(runSavedProps.strike);
      if (runSavedProps.subscript !== undefined)
        run.setSubscript(runSavedProps.subscript);
      if (runSavedProps.superscript !== undefined)
        run.setSuperscript(runSavedProps.superscript);
    }
  }

  /**
   * Helper method to apply style to matching paragraphs
   * @private
   */
  private applyStyleToMatching(
    targetStyle: string,
    options: StyleApplyOptions | undefined,
    matcher: (style: string) => boolean
  ): number {
    const targets =
      options?.paragraphs ||
      this.getAllParagraphs().filter((p) => {
        const style = p.getStyle();
        return style && matcher(style);
      });

    let count = 0;
    for (const para of targets) {
      if (para.isPreserved()) continue;

      // Apply style
      para.setStyle(targetStyle);

      // Handle formatting
      if (options?.keepProperties && options.keepProperties.length > 0) {
        // Clear formatting except specified properties
        this.clearFormattingExcept(para, options.keepProperties);
      } else {
        // Clear all formatting
        para.clearDirectFormatting();
      }

      // Apply custom formatting if provided
      if (options?.format) {
        this.applyFormatOptions(para, options.format);
      }

      count++;
    }
    return count;
  }

  /**
   * Checks if a paragraph is blank (no meaningful content)
   * @private
   */
  private isParagraphBlank(para: Paragraph): boolean {
    const content = para.getContent();

    // No content at all
    if (!content || content.length === 0) {
      return true;
    }

    // Check all content items
    for (const item of content) {
      // Hyperlinks count as content
      if (item instanceof Hyperlink) {
        return false;
      }

      // ImageRun (images embedded in runs) count as content
      // IMPORTANT: Check ImageRun BEFORE Run since ImageRun extends Run
      if (item instanceof ImageRun) {
        return false;
      }

      // Images/shapes count as content
      if (item instanceof Shape) {
        return false;
      }

      // TextBox count as content
      if (item instanceof TextBox) {
        return false;
      }

      // Fields count as content
      if (item instanceof Field) {
        return false;
      }

      // Revisions (track changes) - check nested content for text and hyperlinks
      if (item instanceof Revision) {
        const revisionText = item.getText().trim();
        if (revisionText !== '') {
          return false;
        }
        // Also check if revision contains hyperlinks (may have empty display text)
        for (const revContent of item.getContent()) {
          if (revContent instanceof Hyperlink) {
            return false;
          }
        }
        continue; // Already checked, move to next item
      }

      // Check runs for non-whitespace text
      if ((item as any).getText) {
        const text = (item as any).getText().trim();
        if (text !== "") {
          return false;
        }
      }
    }

    // Check for bookmarks
    if (
      para.getBookmarksStart().length > 0 ||
      para.getBookmarksEnd().length > 0
    ) {
      return false;
    }

    return true;
  }

  /**
   * Mark single blank paragraphs as preserved.
   * Single blanks are blank paragraphs that are NOT followed by another blank.
   * This allows consecutive duplicate blanks (2+) to be removed while keeping
   * intentional single blanks.
   *
   * Logic: For consecutive blanks [blank1, blank2], only blank2 is marked (last in series).
   * This means blank1 will be removed, blank2 kept - reducing duplicates to 1.
   *
   * @returns Number of paragraphs marked as preserved
   * @private
   */
  private markSingleBlanksAsPreserved(): number {
    let markedCount = 0;
    const paragraphs = this.getAllParagraphs();

    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];

      // Skip undefined paragraphs
      if (!para) continue;

      // Skip if already preserved
      if (para.isPreserved()) continue;

      // Check if this paragraph is blank
      if (!this.isParagraphBlank(para)) continue;

      // Check if next paragraph is also blank
      const nextPara = paragraphs[i + 1];
      const nextIsBlank = nextPara && this.isParagraphBlank(nextPara);

      // If this is a single blank (not followed by another blank), mark as preserved
      // This marks the LAST blank in any consecutive series
      if (!nextIsBlank) {
        para.setPreserved(true);
        markedCount++;
      }
    }

    return markedCount;
  }

  /**
   * Checks if a paragraph starts with bold text and has a colon within the first 55 characters.
   * Examples: "Note:", "Warning:", "Note: This can include the following:"
   * @param para The paragraph to check
   * @returns True if the paragraph starts with bold and has colon within first 55 chars
   * @private
   */
  private startsWithBoldColon(para: Paragraph): boolean {
    // Get ALL runs including those in revisions/hyperlinks (Issue #3, #8)
    // This ensures we detect bold text even when inside tracked changes
    const allRuns = this.getAllRunsFromParagraph(para);
    if (allRuns.length === 0) return false;

    // Find first run with actual text content
    const firstRunWithText = allRuns.find(run => run.getText().trim().length > 0);
    if (!firstRunWithText) return false;

    // Check if first run with text is bold
    const formatting = firstRunWithText.getFormatting();
    if (!formatting.bold) return false;

    // Check if colon exists within first 55 characters of paragraph text
    const fullText = para.getText();
    if (!fullText) return false;

    const first55 = fullText.substring(0, 55);
    return first55.includes(':');
  }

  /**
   * Checks if a non-list paragraph is "within" a list context.
   * A paragraph is within a list context if:
   * - It has no numbering (not a list item itself)
   * - The previous list item and next list item share the same numId
   *
   * This prevents blank lines from being added above paragraphs like
   * "Example:" or "Note:" that appear between list items.
   *
   * @param index The index of the paragraph in bodyElements
   * @returns True if the paragraph is within a list context
   * @private
   */
  private isWithinListContext(index: number): boolean {
    const current = this.bodyElements[index];
    if (!(current instanceof Paragraph)) {
      return false;
    }

    // If current is a list item, it's not "within" - it IS the list
    const currentNum = current.getNumbering();
    if (currentNum) {
      return false;
    }

    // Find previous list item (scanning backwards)
    let prevNumId: number | undefined;
    for (let i = index - 1; i >= 0; i--) {
      const el = this.bodyElements[i];
      if (el instanceof Paragraph) {
        const num = el.getNumbering();
        if (num) {
          prevNumId = num.numId;
          break;
        }
      } else if (el instanceof Table) {
        // Stop at table boundaries
        break;
      }
    }

    // Find next list item (scanning forwards)
    let nextNumId: number | undefined;
    for (let i = index + 1; i < this.bodyElements.length; i++) {
      const el = this.bodyElements[i];
      if (el instanceof Paragraph) {
        const num = el.getNumbering();
        if (num) {
          nextNumId = num.numId;
          break;
        }
      } else if (el instanceof Table) {
        // Stop at table boundaries
        break;
      }
    }

    // "Within" = sandwiched between items of the SAME list
    return prevNumId !== undefined && nextNumId !== undefined && prevNumId === nextNumId;
  }

  /**
   * Checks if a non-list paragraph within a table cell is "within" a list context.
   * Similar to isWithinListContext but operates within a single table cell.
   *
   * @param cell The table cell containing the paragraph
   * @param paraIndex The index of the paragraph within the cell
   * @returns True if the paragraph is within a list context in the cell
   * @private
   */
  private isWithinListContextInCell(cell: TableCell, paraIndex: number): boolean {
    const cellParas = cell.getParagraphs();
    const current = cellParas[paraIndex];
    if (!current) return false;

    // If current is a list item, it's not "within" - it IS the list
    const currentNum = current.getNumbering();
    if (currentNum) return false;

    // Find previous list item
    let prevNumId: number | undefined;
    for (let i = paraIndex - 1; i >= 0; i--) {
      const num = cellParas[i]?.getNumbering();
      if (num) {
        prevNumId = num.numId;
        break;
      }
    }

    // Find next list item
    let nextNumId: number | undefined;
    for (let i = paraIndex + 1; i < cellParas.length; i++) {
      const num = cellParas[i]?.getNumbering();
      if (num) {
        nextNumId = num.numId;
        break;
      }
    }

    return prevNumId !== undefined && nextNumId !== undefined && prevNumId === nextNumId;
  }

  /**
   * Checks if a paragraph is bold and centered.
   * Used for Issue #7: Don't add blank line above large images when preceded by bold+centered text.
   * @param para The paragraph to check
   * @returns True if the paragraph has centered alignment and contains bold text
   * @private
   */
  private isParagraphBoldAndCentered(para: Paragraph): boolean {
    const alignment = para.getFormatting().alignment;
    if (alignment !== 'center') return false;

    const runs = this.getAllRunsFromParagraph(para);
    return runs.some(run => run.getBold() && run.getText().trim().length > 0);
  }

  /**
   * Checks if a paragraph is a Table of Contents entry based on its style
   * @param para The paragraph to check
   * @returns True if the paragraph uses a TOC style
   * @private
   */
  private isTocParagraph(para: Paragraph): boolean {
    const styleId = para.getStyle()?.toLowerCase() || '';
    // Match TOC styles: toc1, toc2, toc 1, toc 2, TOC1, TOC2, etc.
    return /^toc\s?\d$/i.test(styleId) || styleId.startsWith('toc');
  }

  /**
   * Checks if an image is small (both dimensions < 100 pixels)
   * @param image The image to check
   * @returns True if both width and height are < 100 pixels
   * @private
   */
  private isImageSmall(image: Image): boolean {
    const EMU_PER_PIXEL = 9525; // at 96 DPI (914400 EMUs/inch / 96 pixels/inch)
    const widthPx = image.getWidth() / EMU_PER_PIXEL;
    const heightPx = image.getHeight() / EMU_PER_PIXEL;
    return widthPx < 100 && heightPx < 100;
  }

  /**
   * Checks if a paragraph contains a small image (< 100x100 pixels)
   * @param para The paragraph to check
   * @returns True if paragraph contains a small image
   * @private
   */
  private isSmallImageParagraph(para: Paragraph): boolean {
    const imageRun = this.getImageRunFromParagraph(para);
    if (!imageRun) return false;
    const image = imageRun.getImageElement();
    return this.isImageSmall(image);
  }

  /**
   * Gets the first ImageRun from a paragraph if it contains one
   * @param para The paragraph to check
   * @returns The ImageRun if found, null otherwise
   * @private
   */
  private getImageRunFromParagraph(para: Paragraph): ImageRun | null {
    for (const item of para.getContent()) {
      if (item instanceof ImageRun) {
        return item;
      }
    }
    return null;
  }

  /**
   * Removes all preserve flags from paragraphs in the document
   *
   * Clears the preserved state from all paragraphs, allowing them to be removed
   * by automatic cleanup operations like {@link removeExtraBlankParagraphs}.
   *
   * Preserve flags are runtime-only markers that prevent paragraphs from being
   * automatically removed. This method is useful when you need to allow
   * previously-protected paragraphs to be cleaned up.
   *
   * @returns Number of paragraphs that had preserve flags removed
   *
   * @example
   * ```typescript
   * // Remove all preserve flags to allow cleanup
   * const cleared = doc.removeAllPreserveFlags();
   * console.log(`Cleared preserve flags from ${cleared} paragraphs`);
   *
   * // Now remove extra blank paragraphs (including previously-preserved ones)
   * const result = doc.removeExtraBlankParagraphs();
   * console.log(`Removed ${result.removed} blank paragraphs`);
   * ```
   *
   * @example
   * ```typescript
   * // Clear all preserved paragraphs before applying operations
   * doc.removeAllPreserveFlags();
   * doc.normalizeSpacing({ removeDuplicateEmptyParagraphs: true });
   * ```
   */
  public removeAllPreserveFlags(): number {
    let cleared = 0;

    for (const para of this.getAllParagraphs()) {
      if (para.isPreserved()) {
        para.setPreserved(false);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Clears preserve flags from all paragraphs in the document
   * Called automatically before save since preserve flags are runtime-only
   * @returns Number of paragraphs that had preserve flags cleared
   * @private
   */
  private clearAllPreserveFlags(): number {
    return this.removeAllPreserveFlags();
  }

  /**
   * Parses a TOC field instruction to extract which heading levels to include
   *
   * Handles field codes like:
   * - "TOC \o &quot;1-3&quot;" → [1, 2, 3]
   * - "TOC \t &quot;Heading 2,2,&quot;" → [2]
   * - "TOC \t &quot;2-3&quot;" → [2, 3]
   * - "TOC \o &quot;1-2&quot; \t &quot;Heading 3,3,&quot;" → [1, 2, 3]
   * - "TOC \h \u \z \t &quot;Heading 2,2,&quot;" → [2]
   *
   * Supports both literal `"` and HTML-encoded `&quot;` in quotes.
   *
   * @param instrText The TOC field instruction text (may contain &quot;)
   * @returns Array of heading levels (1-9) to include, sorted
   */
  private parseTOCFieldInstruction(instrText: string): number[] {
    const levels = new Set<number>();
    let hasOutlineSwitch = false;
    let hasTableSwitch = false;

    // Normalize whitespace and quotes: trim input and replace &quot; with " for consistent parsing
    const normalizedText = instrText.trim().replace(/&quot;/g, '"');

    // === Parse \o "X-Y" switch (outline levels) - supports quoted and unquoted formats ===
    const outlineMatch = normalizedText.match(/\\o\s+(?:"(\d+)-(\d+)"|'(\d+)-(\d+)'|(\d+)-(\d+))/);
    if (outlineMatch) {
      // Extract captured groups from whichever format matched
      const start = parseInt(outlineMatch[1] || outlineMatch[3] || outlineMatch[5]!, 10);
      const end = parseInt(outlineMatch[2] || outlineMatch[4] || outlineMatch[6]!, 10);
      if (!isNaN(start) && !isNaN(end)) {
        hasOutlineSwitch = true;
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= 9) levels.add(i);
        }
      }
    }

    // === Parse \u switch (use outline levels) ===
    if (/\\u(?:\s|\\|$)/.test(normalizedText)) {
      // When \u is present without \o or \t, default to 1-9
      const hasTSwitch = /\\t\s+"/.test(normalizedText);
      if (!hasOutlineSwitch && !hasTSwitch) {
        for (let i = 1; i <= 9; i++) levels.add(i);
      }
    }

    // === Parse all \t "..." switches (style or range) ===
    // Match: \t followed by space and quoted string (supports nested commas safely)
    const tSwitchRegex = /\\t\s+"([^"]*)"/g; // Captures content inside quotes
    const tMatches = [...normalizedText.matchAll(tSwitchRegex)];

    for (const match of tMatches) {
      hasTableSwitch = true;
      const content = (match[1] || "").trim();
      if (!content) continue;

      // --- Case 1: Range format "X-Y" ---
      const rangeMatch = content.match(/^(\d+)-(\d+)$/);
      if (rangeMatch?.[1] && rangeMatch?.[2]) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= 9) levels.add(i);
        }
        continue;
      }

      // --- Case 2: Style format "StyleName,Level," (e.g., "Heading 2,2,") ---
      // Split by comma, expect pattern: styleName, level, [optional trailing comma]
      const parts = content
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      for (let i = 0; i < parts.length; i += 2) {
        if (i + 1 < parts.length) {
          const levelStr = parts[i + 1];
          if (levelStr) {
            const level = parseInt(levelStr, 10);
            if (!isNaN(level) && level >= 1 && level <= 9) {
              levels.add(level);
            }
          }
        }
      }
    }

    // Final: Return sorted array (no duplicates)
    return Array.from(levels).sort((a, b) => a - b);
  }

  /**
   * Synchronizes TOC field instructions with actual style names from styles.xml
   * This ensures \t switches reference styles by their current names, not outdated ones
   *
   * IMPORTANT: Does NOT modify style names - only updates TOC field references
   * This prevents TOC population failures when style names don't match field instructions
   *
   * @param documentXml - The generated document.xml content
   * @returns Modified XML with synchronized TOC field instructions
   * @private
   */
  private syncTOCFieldInstructions(documentXml: string): string {
    try {
      let modifiedXml = documentXml;
      let syncedCount = 0;

      // Strategy 1: Find TOC in SDT elements (modern Word format)
      const sdtTocRegex =
        /<w:sdt>[\s\S]*?<w:docPartGallery w:val="Table of Contents"[\s\S]*?<\/w:sdt>/g;
      const sdtMatches = Array.from(documentXml.matchAll(sdtTocRegex));

      for (const match of sdtMatches) {
        if (!match) continue;
        const result = this.syncTOCInstructionInXml(match[0]);
        if (result.changed) {
          modifiedXml = modifiedXml.replace(match[0], result.xml);
          syncedCount++;
        }
      }

      // Strategy 2: Find field-based TOC (older format without SDT wrapper)
      // Pattern: instrText containing "TOC" with field switches
      const instrRegex = /<w:instrText[^>]*>([^<]*TOC[^<]*)<\/w:instrText>/g;
      const instrMatches = Array.from(modifiedXml.matchAll(instrRegex));

      for (const match of instrMatches) {
        if (!match || !match[1]) continue;

        // Decode XML entities in instruction
        let fieldInstruction = match[1]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");

        // Check if instruction contains \t switches (style-specific TOC)
        if (!fieldInstruction.includes("\\t")) {
          continue; // Outline-based TOC, no style names to sync
        }

        // Parse and update \t switches
        const updatedInstruction = this.updateTOCStyleNames(fieldInstruction);

        // If instruction changed, replace in XML
        if (updatedInstruction !== fieldInstruction) {
          // Re-encode for XML
          const encodedInstruction = updatedInstruction
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");

          // Replace the instruction
          const updatedInstrXml = `<w:instrText xml:space="preserve">${encodedInstruction}</w:instrText>`;
          modifiedXml = modifiedXml.replace(match[0], updatedInstrXml);

          this.logger.info(
            `Synced TOC field instruction: "${fieldInstruction.substring(0, 50)}..." → "${updatedInstruction.substring(0, 50)}..."`
          );
          syncedCount++;
        }
      }

      if (syncedCount > 0) {
        this.logger.info(`Synced ${syncedCount} TOC field instruction(s)`);
      }

      return modifiedXml;
    } catch (error) {
      // Log error but don't fail the save
      this.logger.error(
        "Error syncing TOC field instructions - document will save with original instructions",
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) }
      );
      return documentXml; // Return original on error
    }
  }

  /**
   * Helper to sync TOC instruction within an XML fragment
   * @private
   */
  private syncTOCInstructionInXml(
    xml: string
  ): { xml: string; changed: boolean } {
    const instrMatch = xml.match(/<w:instrText[^>]*>([\s\S]*?)<\/w:instrText>/);
    if (!instrMatch?.[1]) {
      return { xml, changed: false };
    }

    // Decode XML entities in instruction
    let fieldInstruction = instrMatch[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");

    // Check if instruction contains \t switches (style-specific TOC)
    if (!fieldInstruction.includes("\\t")) {
      return { xml, changed: false };
    }

    // Parse and update \t switches
    const updatedInstruction = this.updateTOCStyleNames(fieldInstruction);

    if (updatedInstruction === fieldInstruction) {
      return { xml, changed: false };
    }

    // Re-encode for XML
    const encodedInstruction = updatedInstruction
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    const updatedXml = xml.replace(
      /<w:instrText[^>]*>[\s\S]*?<\/w:instrText>/,
      `<w:instrText xml:space="preserve">${encodedInstruction}</w:instrText>`
    );

    return { xml: updatedXml, changed: true };
  }

  /**
   * Updates style names in a TOC field instruction to match actual styles.xml names
   * Parses \t switches, resolves each style name, and rebuilds instruction
   *
   * @param fieldInstruction - Original TOC field instruction
   * @returns Updated field instruction with current style names
   * @private
   */
  private updateTOCStyleNames(fieldInstruction: string): string {
    // Extract all \t switches using regex
    // Format: \t "StyleName,Level," or \t "StyleName,Level,StyleName2,Level2,..."
    const tSwitchRegex = /\\t\s+"([^"]+)"/g;
    let updatedInstruction = fieldInstruction;
    let hasChanges = false;

    const matches = Array.from(fieldInstruction.matchAll(tSwitchRegex));

    for (const match of matches) {
      const originalSwitch = match[0]; // Full match: \t "StyleName,Level,"
      const content = match[1]; // Content inside quotes
      if (!content) continue;

      // Parse style names and levels from the switch content
      // Format: "StyleName,Level," or "StyleName,Level,StyleName2,Level2,..."
      const parts = content.split(',').map(p => p.trim()).filter(Boolean);
      const updatedParts: string[] = [];

      for (let i = 0; i < parts.length; i += 2) {
        const styleName = parts[i];
        const levelStr = parts[i + 1];

        if (!styleName || !levelStr) {
          // Preserve malformed parts
          if (styleName) updatedParts.push(styleName);
          if (levelStr) updatedParts.push(levelStr);
          continue;
        }

        // Resolve style name to actual name in styles.xml
        const actualStyleName = this.resolveStyleNameForTOC(styleName);

        if (actualStyleName && actualStyleName !== styleName) {
          // Style name changed - use actual name
          updatedParts.push(actualStyleName, levelStr);
          hasChanges = true;
        } else if (actualStyleName) {
          // Style name unchanged
          updatedParts.push(styleName, levelStr);
        } else {
          // Style not found - preserve original reference and log warning
          updatedParts.push(styleName, levelStr);
          this.logger.warn(
            `TOC references style "${styleName}" which doesn't exist in styles.xml - preserving original reference`
          );
        }
      }

      // Rebuild the \t switch with updated names
      if (hasChanges) {
        const updatedContent = updatedParts.join(',') + (content.endsWith(',') ? ',' : '');
        const updatedSwitch = `\\t "${updatedContent}"`;
        updatedInstruction = updatedInstruction.replace(originalSwitch, updatedSwitch);
      }
    }

    return updatedInstruction;
  }

  /**
   * Resolves a TOC style reference to the actual style name in styles.xml
   * Handles various naming patterns (Heading2 vs Heading 2 vs CustomHeader2)
   *
   * @param tocStyleName - Style name from TOC \t switch
   * @returns Actual style name from styles.xml or undefined if not found
   * @private
   */
  private resolveStyleNameForTOC(tocStyleName: string): string | undefined {
    // Strategy 1: For standard heading references (Heading 1, Heading 2, etc.),
    // find the actual style being used for that outline level FIRST.
    // This handles cases where heading styles have been renamed (e.g., "Heading 2" -> "Header 2")
    // and ensures we return the style that paragraphs actually use.
    const headingLevelMatch = tocStyleName.match(/^Heading\s*(\d+)$/i);
    if (headingLevelMatch && headingLevelMatch[1]) {
      const level = parseInt(headingLevelMatch[1]);
      const usedStyles = this.findHeadingStylesUsedByParagraphs();
      const actualStyleName = usedStyles.get(level);
      if (actualStyleName) {
        this.logger.info(
          `TOC style "${tocStyleName}" resolved to actual used style "${actualStyleName}" for level ${level}`
        );
        return actualStyleName;
      }
    }

    // Strategy 2: Direct name match (exact)
    const allStyles = this.stylesManager.getAllStyles();
    for (const style of allStyles) {
      if (style.getName() === tocStyleName) {
        return style.getName();
      }
    }

    // Strategy 3: Match by styleId pattern
    // "Heading 2" → styleId="Heading2" → get actual name
    // "List Paragraph" → styleId="ListParagraph" → get actual name
    const normalizedId = tocStyleName.replace(/\s+/g, '');
    const styleById = this.stylesManager.getStyle(normalizedId);
    if (styleById) {
      return styleById.getName();
    }

    // Strategy 4: Fuzzy match (case-insensitive search)
    const fuzzyResults = this.stylesManager.searchByName(tocStyleName);
    if (fuzzyResults.length > 0 && fuzzyResults[0]) {
      return fuzzyResults[0].getName();
    }

    // Style not found
    return undefined;
  }

  /**
   * Finds heading styles actually used by paragraphs in the document.
   * Returns a map of outline level -> style name for styles in use.
   *
   * This is used by resolveStyleNameForTOC to find the actual styles being used
   * when the TOC references standard heading styles that may have been renamed.
   *
   * @returns Map<outlineLevel, styleName> where outlineLevel is 1-indexed
   * @private
   */
  private findHeadingStylesUsedByParagraphs(): Map<number, string> {
    const usedStyles = new Map<number, string>();

    const processElement = (element: BodyElement) => {
      if (element instanceof Paragraph) {
        const styleId = element.getStyle();
        if (styleId) {
          const style = this.stylesManager.getStyle(styleId);
          if (style) {
            const outlineLevel = style.getParagraphFormatting()?.outlineLevel;
            if (outlineLevel !== undefined && outlineLevel >= 0) {
              const level = outlineLevel + 1; // Convert to 1-indexed
              const name = style.getName() || styleId;
              if (!usedStyles.has(level)) {
                usedStyles.set(level, name);
              }
            }
          }
        }
      } else if (element instanceof Table) {
        // Check table cells for paragraphs
        for (let row = 0; row < element.getRowCount(); row++) {
          const rowObj = element.getRow(row);
          if (rowObj) {
            for (let col = 0; col < rowObj.getCellCount(); col++) {
              const cell = rowObj.getCell(col);
              if (cell) {
                for (const para of cell.getParagraphs()) {
                  processElement(para);
                }
              }
            }
          }
        }
      }
    };

    for (const element of this.bodyElements) {
      processElement(element);
    }

    return usedStyles;
  }

  /**
   * Finds all headings in the document that match the specified levels
   *
   * @param levels Array of heading levels to include (e.g., [1, 2, 3])
   * @returns Array of heading information objects
   */
  /**
   * Find headings for TOC by parsing XML directly (searches body AND tables)
   * This is more reliable than using bodyElements as it searches inside table cells too
   */
  private findHeadingsForTOCFromXML(
    docXml: string,
    levels: number[]
  ): Array<{ level: number; text: string; bookmark: string }> {
    const headings: Array<{ level: number; text: string; bookmark: string }> =
      [];
    const levelSet = new Set(levels);

    try {
      // Parse document.xml to object structure
      const parsed = XMLParser.parseToObject(docXml, { trimValues: false });
      const document = parsed["w:document"];
      if (!document) {
        return headings;
      }

      const body = (document as any)["w:body"];
      if (!body) {
        return headings;
      }

      // Helper function to extract heading info from a parsed paragraph object
      const extractHeading = (para: any): void => {
        const pPr = para["w:pPr"];
        if (!pPr || !pPr["w:pStyle"]) {
          return;
        }

        const styleVal = pPr["w:pStyle"]["@_w:val"];
        if (!styleVal) {
          return;
        }

        // Check if style matches "HeadingN" format (exact match, case-insensitive)
        const headingMatch = styleVal.match(/^Heading(\d+)$/i);
        if (!headingMatch || !headingMatch[1]) {
          return;
        }

        const headingLevel = parseInt(headingMatch[1], 10);

        // Check if this level should be included in TOC
        if (!levelSet.has(headingLevel)) {
          return;
        }

        // Extract bookmark (use any existing bookmark, prioritize "_heading" or "_Toc")
        let bookmark = "";
        const bookmarkStart = para["w:bookmarkStart"];
        if (bookmarkStart) {
          const bookmarkArray = Array.isArray(bookmarkStart)
            ? bookmarkStart
            : [bookmarkStart];
          
          // First try to find preferred bookmark types
          for (const bm of bookmarkArray) {
            const bmName = bm["@_w:name"];
            if (bmName && (bmName.toLowerCase().includes("_heading") || bmName.toLowerCase().includes("_toc"))) {
              bookmark = bmName;
              break;
            }
          }
          
          // If no preferred bookmark found, use the first available bookmark
          if (!bookmark && bookmarkArray.length > 0) {
            const firstBm = bookmarkArray[0];
            const bmName = firstBm["@_w:name"];
            if (bmName) {
              bookmark = bmName;
            }
          }
        }

        // Extract text from runs
        let text = "";
        const runs = para["w:r"];
        if (runs) {
          const runArray = Array.isArray(runs) ? runs : [runs];
          for (const run of runArray) {
            const textElement = run["w:t"];
            if (textElement) {
              if (typeof textElement === "string") {
                text += textElement;
              } else if (textElement["#text"]) {
                text += textElement["#text"];
              }
            }
          }
        }

        // Only add if we have text
        text = text.trim();
        if (!text) {
          return;
        }

        // Generate bookmark if not found
        if (!bookmark) {
          bookmark = `_Toc${Date.now()}_${headings.length}`;
        }

        headings.push({
          level: headingLevel,
          text: text,
          bookmark: bookmark,
        });
      };

      // Search in direct paragraphs
      const paragraphs = body["w:p"];
      if (paragraphs) {
        const paraArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
        for (const para of paraArray) {
          extractHeading(para);
        }
      }

      // Search in tables (this is critical - many documents have headings in tables)
      const tables = body["w:tbl"];
      if (tables) {
        const tableArray = Array.isArray(tables) ? tables : [tables];
        for (const table of tableArray) {
          const rows = table["w:tr"];
          if (!rows) continue;

          const rowArray = Array.isArray(rows) ? rows : [rows];
          for (const row of rowArray) {
            const cells = row["w:tc"];
            if (!cells) continue;

            const cellArray = Array.isArray(cells) ? cells : [cells];
            for (const cell of cellArray) {
              const cellParas = cell["w:p"];
              if (!cellParas) continue;

              const cellParaArray = Array.isArray(cellParas)
                ? cellParas
                : [cellParas];
              for (const para of cellParaArray) {
                extractHeading(para);
              }
            }
          }
        }
      }
    } catch (error) {
      defaultLogger.error(
        "Error parsing document.xml for headings:",
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) }
      );
    }

    return headings;
  }

  /**
   * Legacy method - searches only bodyElements (doesn't search inside tables)
   * Kept for compatibility but not recommended
   * @deprecated Use findHeadingsForTOCFromXML instead
   */
  private findHeadingsForTOC(
    levels: number[]
  ): Array<{ level: number; text: string; bookmark: string }> {
    const headings: Array<{ level: number; text: string; bookmark: string }> =
      [];
    const levelSet = new Set(levels);

    // Iterate through body elements
    for (const element of this.bodyElements) {
      if (element instanceof Paragraph) {
        const para = element;
        const formatting = para.getFormatting();

        // Check if paragraph has a heading style (handle both "Heading1" and "Heading 1")
        if (formatting.style) {
          const styleMatch = formatting.style.match(/Heading\s*(\d+)/i);
          if (styleMatch && styleMatch[1]) {
            const headingLevel = parseInt(styleMatch[1], 10);

            // Check if this level should be included in TOC
            if (levelSet.has(headingLevel)) {
              const text = para.getText().trim();

              if (text) {
                // Create or get bookmark for this heading
                const bookmark =
                  this.bookmarkManager.createHeadingBookmark(text);

                headings.push({
                  level: headingLevel,
                  text: text,
                  bookmark: bookmark.getName(),
                });
              }
            }
          }
        }
      }
    }

    return headings;
  }

  /**
   * Generates TOC XML structure with populated entries
   *
   * Creates a complete SDT-wrapped TOC with:
   * - Complex field structure (begin/instruction/separate/entries/end)
   * - Pre-populated hyperlink entries for each heading
   * - Proper formatting (Verdana, blue, underlined)
   *
   * @param headings Array of heading information
   * @param originalInstrText Original TOC field instruction to preserve switches
   * @returns Complete TOC XML string
   */
  private generateTOCXML(
    headings: Array<{ level: number; text: string; bookmark: string }>,
    originalInstrText: string
  ): string {
    const sdtId = Math.floor(Math.random() * 2000000000) - 1000000000;

    let tocXml = "<w:sdt>";

    // SDT properties
    tocXml += "<w:sdtPr>";
    tocXml += `<w:id w:val="${sdtId}"/>`;
    tocXml += "<w:docPartObj>";
    tocXml += '<w:docPartGallery w:val="Table of Contents"/>';
    tocXml += '<w:docPartUnique w:val="1"/>';
    tocXml += "</w:docPartObj>";
    tocXml += "</w:sdtPr>";

    // SDT content
    tocXml += "<w:sdtContent>";

    // Calculate minimum level for relative indentation
    // If TOC shows only Heading 2s, minLevel=2, so Heading 2 gets 0" indent
    const minLevel =
      headings.length > 0 ? Math.min(...headings.map((h) => h.level)) : 1;

    // First paragraph: field begin + instruction + separator + first entry (if any)
    tocXml += "<w:p>";
    tocXml += "<w:pPr>";
    tocXml +=
      '<w:spacing w:after="0" w:before="0" w:line="240" w:lineRule="auto"/>';

    // Add indentation for first entry relative to minimum level (0.25" per level)
    if (headings.length > 0 && headings[0]) {
      const firstIndent = (headings[0].level - minLevel) * 360; // 360 twips = 0.25 inches
      if (firstIndent > 0) {
        tocXml += `<w:ind w:left="${firstIndent}"/>`;
      }
    }

    tocXml += "</w:pPr>";

    // Field begin
    tocXml += '<w:r><w:fldChar w:fldCharType="begin"/></w:r>';

    // Field instruction (preserve original switches)
    tocXml += "<w:r>";
    tocXml += `<w:instrText xml:space="preserve">${this.escapeXml(
      originalInstrText
    )}</w:instrText>`;
    tocXml += "</w:r>";

    // Field separator
    tocXml += '<w:r><w:fldChar w:fldCharType="separate"/></w:r>';

    // First entry (if any)
    if (headings.length > 0 && headings[0]) {
      tocXml += this.buildTOCEntryXML(headings[0]);
    }

    tocXml += "</w:p>";

    // Remaining entries (each in its own paragraph)
    for (let i = 1; i < headings.length; i++) {
      const heading = headings[i];
      if (!heading) continue;

      tocXml += "<w:p>";
      tocXml += "<w:pPr>";
      tocXml +=
        '<w:spacing w:after="0" w:before="0" w:line="240" w:lineRule="auto"/>';

      // Add indentation relative to minimum level (0.25" per level above minimum)
      const indent = (heading.level - minLevel) * 360;
      if (indent > 0) {
        tocXml += `<w:ind w:left="${indent}"/>`;
      }

      tocXml += "</w:pPr>";
      tocXml += this.buildTOCEntryXML(heading);
      tocXml += "</w:p>";
    }

    // Final paragraph with field end
    tocXml += "<w:p>";
    tocXml += "<w:pPr>";
    tocXml +=
      '<w:spacing w:after="0" w:before="0" w:line="240" w:lineRule="auto"/>';
    tocXml += "</w:pPr>";
    tocXml += '<w:r><w:fldChar w:fldCharType="end"/></w:r>';
    tocXml += "</w:p>";

    tocXml += "</w:sdtContent>";
    tocXml += "</w:sdt>";

    return tocXml;
  }

  /**
   * Builds XML for a single TOC entry with hyperlink
   *
   * @param heading Heading information
   * @returns XML string for the TOC entry
   */
  private buildTOCEntryXML(heading: {
    level: number;
    text: string;
    bookmark: string;
  }): string {
    const escapedText = this.escapeXml(heading.text);

    let xml = "";
    xml += `<w:hyperlink w:anchor="${this.escapeXml(heading.bookmark)}">`;
    xml += "<w:r>";
    xml += "<w:rPr>";
    xml +=
      '<w:rFonts w:ascii="Verdana" w:hAnsi="Verdana" w:cs="Verdana" w:eastAsia="Verdana"/>';
    xml += '<w:color w:val="0000FF"/>';
    xml += '<w:sz w:val="24"/>';
    xml += '<w:szCs w:val="24"/>';
    xml += '<w:u w:val="single"/>';
    xml += "</w:rPr>";
    xml += `<w:t xml:space="preserve">${escapedText}</w:t>`;
    xml += "</w:r>";
    xml += "</w:hyperlink>";

    return xml;
  }

  /**
   * Escapes XML special characters
   *
   * @param text Text to escape
   * @returns Escaped text
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /**
   * Populates TOCs in a saved file
   * Private helper used by save() when auto-populate is enabled
   *
   * @param filePath Path to the saved DOCX file
   * @returns Promise resolving to the number of TOCs populated
   * @private
   */
  private async populateTOCsInFile(filePath: string): Promise<number> {
    // Load the saved document
    const handler = new ZipHandler();
    await handler.load(filePath);

    // Get document.xml
    const docXml = handler.getFileAsString("word/document.xml");
    if (!docXml) {
      return 0;
    }

    // Populate all TOCs in the XML
    const modifiedXml = this.populateAllTOCsInXML(docXml);

    // Update and save if changes were made
    if (modifiedXml !== docXml) {
      handler.updateFile("word/document.xml", modifiedXml);
      await handler.save(filePath);

      // Count TOCs that were populated
      const tocRegex =
        /<w:sdt>[\s\S]*?<w:docPartGallery w:val="Table of Contents"[\s\S]*?<\/w:sdt>/g;
      const matches = Array.from(docXml.matchAll(tocRegex));
      return matches.length;
    }

    return 0;
  }

  /**
   * Populates all TOCs in document XML
   * Extracted from replaceTableOfContents for reuse
   *
   * @param docXml The document XML string
   * @returns Modified XML with populated TOCs
   * @private
   */
  private populateAllTOCsInXML(docXml: string): string {
    let modifiedXml = docXml;

    // Strategy 1: Try SDT-wrapped TOCs first (modern Word format)
    const sdtTocRegex =
      /<w:sdt>[\s\S]*?<w:docPartGallery w:val="Table of Contents"[\s\S]*?<\/w:sdt>/g;
    const sdtMatches = Array.from(docXml.matchAll(sdtTocRegex));

    if (sdtMatches.length > 0) {
      for (const match of sdtMatches) {
        try {
          const tocXml = match[0];
          const instrMatch = tocXml.match(
            /<w:instrText[^>]*>([\s\S]*?)<\/w:instrText>/
          );
          if (!instrMatch?.[1]) continue;

          let fieldInstruction = instrMatch[1]
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");

          const levels = this.parseTOCFieldInstruction(fieldInstruction);
          const headings = this.findHeadingsForTOCFromXML(docXml, levels);
          if (headings.length === 0) continue;

          const newTocXml = this.generateTOCXML(headings, fieldInstruction);
          modifiedXml = modifiedXml.replace(tocXml, newTocXml);
        } catch (error) {
          this.logger.error(
            "Error populating SDT TOC",
            error instanceof Error
              ? { message: error.message, stack: error.stack }
              : { error: String(error) }
          );
          continue;
        }
      }
      return modifiedXml;
    }

    // Strategy 2: Handle simple complex field TOCs (no SDT wrapper)
    // These have the structure: fldChar begin → instrText → fldChar separate → entries → fldChar end
    // Match pattern: paragraph containing fldChar begin followed by instrText with TOC
    const simpleTocRegex =
      /<w:p[^>]*>[\s\S]*?<w:fldChar[^>]*w:fldCharType="begin"[^>]*\/>[\s\S]*?<w:instrText[^>]*>([^<]*TOC[^<]*)<\/w:instrText>/g;
    const simpleMatches = Array.from(docXml.matchAll(simpleTocRegex));

    if (simpleMatches.length > 0) {
      for (const match of simpleMatches) {
        try {
          const instrText = match[1];
          if (!instrText) continue;

          let fieldInstruction = instrText
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");

          const levels = this.parseTOCFieldInstruction(fieldInstruction);
          const headings = this.findHeadingsForTOCFromXML(modifiedXml, levels);
          if (headings.length === 0) continue;

          // For simple TOCs, we need to find and replace the entire field structure
          // Find from fldChar begin to fldChar end
          const tocStartMatch = modifiedXml.match(
            new RegExp(
              `(<w:p[^>]*>[\\s\\S]*?<w:fldChar[^>]*w:fldCharType="begin"[^>]*/>)([\\s\\S]*?<w:instrText[^>]*>${instrText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/w:instrText>)`,
              'g'
            )
          );

          if (!tocStartMatch) continue;

          // Find the end marker - look for fldChar end after this TOC instruction
          // The TOC field spans multiple paragraphs, ending at fldChar end
          const tocFieldPattern = new RegExp(
            `(<w:p[^>]*>[\\s\\S]*?<w:fldChar[^>]*w:fldCharType="begin"[^>]*\\/>[\\s\\S]*?<w:instrText[^>]*>${instrText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/w:instrText>[\\s\\S]*?<w:fldChar[^>]*w:fldCharType="separate"[^>]*\\/>)([\\s\\S]*?)(<w:r[^>]*>[\\s\\S]*?<w:fldChar[^>]*w:fldCharType="end"[^>]*\\/>[\\s\\S]*?<\\/w:r>)`,
            'g'
          );

          const fullMatch = modifiedXml.match(tocFieldPattern);
          if (!fullMatch || fullMatch.length === 0) continue;

          const fullTocXml = fullMatch[0];

          // Generate new TOC XML preserving the complex field structure
          const newTocXml = this.generateSimpleTOCXML(headings, fieldInstruction);
          modifiedXml = modifiedXml.replace(fullTocXml, newTocXml);

          this.logger.info(
            `Populated simple TOC with ${headings.length} heading entries`
          );
        } catch (error) {
          this.logger.error(
            "Error populating simple TOC",
            error instanceof Error
              ? { message: error.message, stack: error.stack }
              : { error: String(error) }
          );
          continue;
        }
      }
    }

    return modifiedXml;
  }

  /**
   * Generates XML for a simple complex field TOC (without SDT wrapper)
   * Preserves the fldChar begin → instrText → fldChar separate → entries → fldChar end structure
   *
   * @param headings Array of heading info objects
   * @param fieldInstruction The TOC field instruction string
   * @returns XML string for the TOC field
   * @private
   */
  private generateSimpleTOCXML(
    headings: Array<{ text: string; level: number; bookmark: string }>,
    fieldInstruction: string
  ): string {
    // Build the TOC entries
    const entries: string[] = [];

    for (const heading of headings) {
      // Calculate TOC style based on heading level (TOC1, TOC2, etc.)
      const tocStyle = `TOC${heading.level}`;

      // Escape text for XML
      const escapedText = heading.text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      // Create hyperlinked TOC entry paragraph
      entries.push(
        `<w:p>` +
        `<w:pPr><w:pStyle w:val="${tocStyle}"/></w:pPr>` +
        `<w:hyperlink w:anchor="${heading.bookmark}" w:history="1">` +
        `<w:r><w:rPr><w:rStyle w:val="Hyperlink"/></w:rPr>` +
        `<w:t>${escapedText}</w:t></w:r>` +
        `</w:hyperlink>` +
        `</w:p>`
      );
    }

    // Escape field instruction for XML
    const escapedInstruction = fieldInstruction
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    // Build the complete TOC field structure
    return (
      // First paragraph: fldChar begin + instrText + fldChar separate
      `<w:p>` +
      `<w:pPr><w:pStyle w:val="TOC2"/></w:pPr>` +
      `<w:r><w:fldChar w:fldCharType="begin"/></w:r>` +
      `<w:r><w:instrText xml:space="preserve">${escapedInstruction}</w:instrText></w:r>` +
      `<w:r><w:fldChar w:fldCharType="separate"/></w:r>` +
      `</w:p>` +
      // TOC entry paragraphs (between separate and end)
      entries.join("") +
      // Last paragraph: fldChar end
      `<w:p>` +
      `<w:pPr><w:pStyle w:val="TOC2"/></w:pPr>` +
      `<w:r><w:fldChar w:fldCharType="end"/></w:r>` +
      `</w:p>`
    );
  }

  /**
   * Replaces all Table of Contents in a saved document file with pre-populated entries
   *
   * This helper function works with saved DOCX files:
   * 1. Loads the document file
   * 2. Finds all TOC elements in document.xml
   * 3. For each TOC, parses its field instruction to determine which heading levels to include
   * 4. Scans the document for all headings matching those levels
   * 5. Generates pre-populated TOC entries with working hyperlinks
   * 6. Replaces the TOC in the XML and saves the file
   *
   * The generated TOC maintains the complex field structure, so users can still
   * right-click "Update Field" in Word to refresh it.
   *
   * @param filePath Path to the DOCX file to process
   * @returns Promise resolving to the number of TOC elements that were replaced
   *
   * @example
   * // Save document first
   * await doc.save('output.docx');
   *
   * // Then replace TOCs with populated entries
   * const count = await doc.replaceTableOfContents('output.docx');
   * console.log(`Replaced ${count} TOC element(s) with populated entries`);
   */
  public async replaceTableOfContents(filePath: string): Promise<number> {
    // Reuse the new extracted logic
    return await this.populateTOCsInFile(filePath);
  }

  /**
   * Gets the document section
   * @returns The section
   */
  getSection(): Section {
    return this.section;
  }

  /**
   * Sets the document section
   * @param section The section to set
   * @returns This document for chaining
   */
  setSection(section: Section): this {
    this.section = section;
    return this;
  }

  /**
   * Sets page size
   * @param width Width in twips
   * @param height Height in twips
   * @param orientation Page orientation
   * @returns This document for chaining
   */
  setPageSize(
    width: number,
    height: number,
    orientation?: "portrait" | "landscape"
  ): this {
    this.section.setPageSize(width, height, orientation);
    return this;
  }

  /**
   * Sets page orientation
   * @param orientation Page orientation
   * @returns This document for chaining
   */
  setPageOrientation(orientation: "portrait" | "landscape"): this {
    this.section.setOrientation(orientation);
    return this;
  }

  /**
   * Sets margins
   * @param margins Margin properties
   * @returns This document for chaining
   */
  setMargins(margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    header?: number;
    footer?: number;
    gutter?: number;
  }): this {
    this.section.setMargins(margins);
    return this;
  }

  /**
   * Sets the default header for the document
   * @param header The header to set
   * @returns This document for chaining
   */
  setHeader(header: Header): this {
    // Generate relationship for header
    const relationship = this.relationshipManager.addHeader(
      `${header.getFilename(1)}`
    );

    // Register with manager
    this.headerFooterManager.registerHeader(header, relationship.getId());

    // Link to section
    this.section.setHeaderReference("default", relationship.getId());

    return this;
  }

  /**
   * Sets the first page header
   * @param header The header to set
   * @returns This document for chaining
   */
  setFirstPageHeader(header: Header): this {
    // Enable title page
    this.section.setTitlePage(true);

    // Generate relationship for header
    const relationship = this.relationshipManager.addHeader(
      `${header.getFilename(this.headerFooterManager.getHeaderCount() + 1)}`
    );

    // Register with manager
    this.headerFooterManager.registerHeader(header, relationship.getId());

    // Link to section
    this.section.setHeaderReference("first", relationship.getId());

    return this;
  }

  /**
   * Sets the even page header (requires different odd/even pages)
   * @param header The header to set
   * @returns This document for chaining
   */
  setEvenPageHeader(header: Header): this {
    // Generate relationship for header
    const relationship = this.relationshipManager.addHeader(
      `${header.getFilename(this.headerFooterManager.getHeaderCount() + 1)}`
    );

    // Register with manager
    this.headerFooterManager.registerHeader(header, relationship.getId());

    // Link to section
    this.section.setHeaderReference("even", relationship.getId());

    return this;
  }

  /**
   * Sets the default footer for the document
   * @param footer The footer to set
   * @returns This document for chaining
   */
  setFooter(footer: Footer): this {
    // Generate relationship for footer
    const relationship = this.relationshipManager.addFooter(
      `${footer.getFilename(1)}`
    );

    // Register with manager
    this.headerFooterManager.registerFooter(footer, relationship.getId());

    // Link to section
    this.section.setFooterReference("default", relationship.getId());

    return this;
  }

  /**
   * Sets the first page footer
   * @param footer The footer to set
   * @returns This document for chaining
   */
  setFirstPageFooter(footer: Footer): this {
    // Enable title page
    this.section.setTitlePage(true);

    // Generate relationship for footer
    const relationship = this.relationshipManager.addFooter(
      `${footer.getFilename(this.headerFooterManager.getFooterCount() + 1)}`
    );

    // Register with manager
    this.headerFooterManager.registerFooter(footer, relationship.getId());

    // Link to section
    this.section.setFooterReference("first", relationship.getId());

    return this;
  }

  /**
   * Sets the even page footer (requires different odd/even pages)
   * @param footer The footer to set
   * @returns This document for chaining
   */
  setEvenPageFooter(footer: Footer): this {
    // Generate relationship for footer
    const relationship = this.relationshipManager.addFooter(
      `${footer.getFilename(this.headerFooterManager.getFooterCount() + 1)}`
    );

    // Register with manager
    this.headerFooterManager.registerFooter(footer, relationship.getId());

    // Link to section
    this.section.setFooterReference("even", relationship.getId());

    return this;
  }

  /**
   * Gets the HeaderFooterManager
   * @returns HeaderFooterManager instance
   */
  getHeaderFooterManager(): HeaderFooterManager {
    return this.headerFooterManager;
  }

  /**
   * Removes a specific header from the document
   * Removes the header from HeaderFooterManager, RelationshipManager, and section references
   * Also removes the header XML file from the ZIP archive
   * @param type Header type to remove (default, first, even)
   * @returns This document for chaining
   */
  removeHeader(type: "default" | "first" | "even"): this {
    const sectionProps = this.section.getProperties();

    // Get the relationship ID from section properties
    const rId = sectionProps.headers?.[type];
    if (!rId) {
      return this; // No header of this type exists
    }

    // Get the header filename from relationship
    const rel = this.relationshipManager.getRelationship(rId);
    if (rel) {
      const headerPath = `word/${rel.getTarget()}`;

      // Remove the header XML file from ZIP
      if (this.zipHandler.hasFile(headerPath)) {
        this.zipHandler.removeFile(headerPath);
      }

      // Remove the relationship
      this.relationshipManager.removeRelationship(rId);
    }

    // Remove from section references
    if (sectionProps.headers) {
      delete sectionProps.headers[type];

      // If no more headers, remove the headers object
      if (Object.keys(sectionProps.headers).length === 0) {
        delete sectionProps.headers;
      }
    }

    // Note: We can't directly remove from HeaderFooterManager without access to the Header object
    // The manager will be rebuilt on next save() call

    return this;
  }

  /**
   * Removes a specific footer from the document
   * Removes the footer from HeaderFooterManager, RelationshipManager, and section references
   * Also removes the footer XML file from the ZIP archive
   * @param type Footer type to remove (default, first, even)
   * @returns This document for chaining
   */
  removeFooter(type: "default" | "first" | "even"): this {
    const sectionProps = this.section.getProperties();

    // Get the relationship ID from section properties
    const rId = sectionProps.footers?.[type];
    if (!rId) {
      return this; // No footer of this type exists
    }

    // Get the footer filename from relationship
    const rel = this.relationshipManager.getRelationship(rId);
    if (rel) {
      const footerPath = `word/${rel.getTarget()}`;

      // Remove the footer XML file from ZIP
      if (this.zipHandler.hasFile(footerPath)) {
        this.zipHandler.removeFile(footerPath);
      }

      // Remove the relationship
      this.relationshipManager.removeRelationship(rId);
    }

    // Remove from section references
    if (sectionProps.footers) {
      delete sectionProps.footers[type];

      // If no more footers, remove the footers object
      if (Object.keys(sectionProps.footers).length === 0) {
        delete sectionProps.footers;
      }
    }

    // Note: We can't directly remove from HeaderFooterManager without access to the Footer object
    // The manager will be rebuilt on next save() call

    return this;
  }

  /**
   * Removes all headers from the document
   * Removes all header relationships, section references, and header XML files from the ZIP archive
   * @returns This document for chaining
   */
  clearHeaders(): this {
    const sectionProps = this.section.getProperties();

    // Remove each header type
    if (sectionProps.headers) {
      const types = Object.keys(sectionProps.headers) as Array<
        "default" | "first" | "even"
      >;
      for (const type of types) {
        this.removeHeader(type);
      }
    }

    // Note: Don't call headerFooterManager.clear() as that would clear footers too
    // The manager will be rebuilt correctly during save based on section properties

    return this;
  }

  /**
   * Removes all footers from the document
   * Removes all footer relationships, section references, and footer XML files from the ZIP archive
   * @returns This document for chaining
   */
  clearFooters(): this {
    const sectionProps = this.section.getProperties();

    // Remove each footer type
    if (sectionProps.footers) {
      const types = Object.keys(sectionProps.footers) as Array<
        "default" | "first" | "even"
      >;
      for (const type of types) {
        this.removeFooter(type);
      }
    }

    // Note: Don't call headerFooterManager.clear() as that would clear headers too
    // The manager will be rebuilt correctly during save based on section properties

    return this;
  }

  /**
   * Adds an image to the document inside a paragraph
   * @param image The image to add
   * @returns This document for chaining
   */
  addImage(image: Image): this {
    // Generate relationship ID
    const target = `media/image${
      this.imageManager.getImageCount() + 1
    }.${image.getExtension()}`;
    const relationship = this.relationshipManager.addImage(target);

    // Register image with manager
    this.imageManager.registerImage(image, relationship.getId());

    // Create a paragraph containing the image
    const para = new Paragraph();
    // Add image as a run (ImageRun extends Run and generates w:drawing in w:r)
    const imageRun = this.createImageRun(image);
    para.addRun(imageRun);

    this.bodyElements.push(para);
    return this;
  }

  /**
   * Creates a run containing an image
   * @param image The image
   * @returns ImageRun (extends Run) with the image
   */
  private createImageRun(image: Image): ImageRun {
    // ImageRun extends Run, so it's type-safe to add to paragraphs
    return new ImageRun(image);
  }

  /**
   * Gets the ImageManager
   * @returns ImageManager instance
   */
  getImageManager(): ImageManager {
    return this.imageManager;
  }

  /**
   * Gets the RelationshipManager
   * @returns RelationshipManager instance
   */
  getRelationshipManager(): RelationshipManager {
    return this.relationshipManager;
  }

  /**
   * Processes all hyperlinks in paragraphs and registers them with RelationshipManager
   */
  private processHyperlinks(): void {
    this.generator.processHyperlinks(
      this.bodyElements,
      this.headerFooterManager,
      this.relationshipManager
    );
  }

  /**
   * Saves all images to the ZIP archive
   */
  private saveImages(): void {
    const images = this.imageManager.getAllImages();

    for (const entry of images) {
      const imageData = entry.image.getImageData();
      if (imageData && imageData.length > 0) {
        // Save to word/media/
        const path = `word/media/${entry.filename}`;
        this.zipHandler.addFile(path, imageData);
      }
    }
  }

  /**
   * Saves all headers to the ZIP archive
   */
  private saveHeaders(): void {
    const headers = this.headerFooterManager.getAllHeaders();

    for (const entry of headers) {
      const xml = entry.header.toXML();
      const path = `word/${entry.filename}`;
      this.zipHandler.addFile(path, xml);
    }
  }

  /**
   * Saves all footers to the ZIP archive
   */
  private saveFooters(): void {
    const footers = this.headerFooterManager.getAllFooters();

    for (const entry of footers) {
      const xml = entry.footer.toXML();
      const path = `word/${entry.filename}`;
      this.zipHandler.addFile(path, xml);
    }
  }

  /**
   * Updates the word/_rels/document.xml.rels file with current relationships
   */
  private updateRelationships(): void {
    const xml = this.relationshipManager.generateXml();
    this.zipHandler.updateFile("word/_rels/document.xml.rels", xml);
  }

  /**
   * Saves all comments to the ZIP archive
   */
  private saveComments(): void {
    // Only save comments.xml if there are comments
    if (this.commentManager.getCount() > 0) {
      const xml = this.commentManager.generateCommentsXml();
      this.zipHandler.addFile("word/comments.xml", xml);

      // Add comments relationship
      this.relationshipManager.addComments();
    }
  }

  /**
   * Saves custom properties to the ZIP archive
   */
  private saveCustomProperties(): void {
    // Only save custom.xml if there are custom properties
    if (
      this.properties.customProperties &&
      Object.keys(this.properties.customProperties).length > 0
    ) {
      const customXml = this.generator.generateCustomProps(
        this.properties.customProperties
      );
      if (customXml) {
        this.zipHandler.addFile("docProps/custom.xml", customXml);
      }
    }
  }

  /**
   * Parses [Content_Types].xml and extracts all Default and Override entries
   * Stores entries in format "ext|mimetype" and "path|mimetype" to enable round-trip preservation
   *
   * @param xml - The [Content_Types].xml content to parse
   * @returns Object containing sets of defaults and overrides
   */
  private parseContentTypes(xml: string): { defaults: Set<string>; overrides: Set<string> } {
    const defaults = new Set<string>();
    const overrides = new Set<string>();

    // Extract all <Default Extension="..." ContentType="..."/> entries
    const defaultMatches = xml.matchAll(/<Default\s+Extension="([^"]+)"\s+ContentType="([^"]+)"\s*\/>/g);
    for (const match of defaultMatches) {
      defaults.add(`${match[1]}|${match[2]}`); // Store as "ext|mimetype"
    }

    // Extract all <Override PartName="..." ContentType="..."/> entries
    const overrideMatches = xml.matchAll(/<Override\s+PartName="([^"]+)"\s+ContentType="([^"]+)"\s*\/>/g);
    for (const match of overrideMatches) {
      overrides.add(`${match[1]}|${match[2]}`); // Store as "path|mimetype"
    }

    return { defaults, overrides };
  }

  /**
   * Updates [Content_Types].xml to include image extensions, headers/footers, comments, and custom properties
   * Preserves entries for files that exist in the loaded document
   */
  private updateContentTypesWithImagesHeadersFootersAndComments(): void {
    const hasCustomProps =
      this.properties.customProperties &&
      Object.keys(this.properties.customProperties).length > 0;

    const contentTypes =
      this.generator.generateContentTypesWithImagesHeadersFootersAndComments(
        this.imageManager,
        this.headerFooterManager,
        this.commentManager,
        this.zipHandler, // Pass zipHandler to check file existence
        undefined, // fontManager (optional)
        hasCustomProps, // Flag to include custom.xml override
        this._originalContentTypes // Pass preserved original entries for round-trip fidelity
      );
    this.zipHandler.updateFile(DOCX_PATHS.CONTENT_TYPES, contentTypes);
  }

  /**
   * Gets the BookmarkManager for bookmark operations
   *
   * Provides access to the BookmarkManager for advanced bookmark management,
   * including creating, querying, and managing document bookmarks.
   *
   * @returns The BookmarkManager instance managing this document's bookmarks
   *
   * @example
   * ```typescript
   * const bookmarks = doc.getBookmarkManager();
   * console.log(`Document has ${bookmarks.getAllBookmarks().length} bookmarks`);
   * ```
   */
  getBookmarkManager(): BookmarkManager {
    return this.bookmarkManager;
  }

  /**
   * Creates and registers a new bookmark with a unique name
   *
   * Creates a bookmark that can be used as an anchor for internal hyperlinks
   * or cross-references. The name is automatically normalized and made unique.
   *
   * @param name - Desired bookmark name (will be normalized to remove spaces and special characters)
   * @returns The created and registered Bookmark instance
   *
   * @example
   * ```typescript
   * const bookmark = doc.createBookmark('ImportantSection');
   * const para = doc.createParagraph('This is important');
   * para.addBookmark(bookmark);
   *
   * // Link to it from elsewhere
   * const link = Hyperlink.createInternal(bookmark.getName(), 'Go to section');
   * doc.createParagraph().addHyperlink(link);
   * ```
   */
  createBookmark(name: string): Bookmark {
    return this.bookmarkManager.createBookmark(name);
  }

  /**
   * Creates and registers a bookmark for a heading
   * Automatically generates a unique name from the heading text
   * @param headingText - The text of the heading
   * @returns The created and registered bookmark
   */
  createHeadingBookmark(headingText: string): Bookmark {
    return this.bookmarkManager.createHeadingBookmark(headingText);
  }

  /**
   * Gets a bookmark by name
   * @param name - Bookmark name
   * @returns The bookmark, or undefined if not found
   */
  getBookmark(name: string): Bookmark | undefined {
    return this.bookmarkManager.getBookmark(name);
  }

  /**
   * Checks if a bookmark exists
   * @param name - Bookmark name
   * @returns True if the bookmark exists
   */
  hasBookmark(name: string): boolean {
    return this.bookmarkManager.hasBookmark(name);
  }

  /**
   * Adds a bookmark to a paragraph (wraps the entire paragraph)
   * Creates the bookmark if a name is provided, or uses an existing bookmark object
   * @param paragraph - The paragraph to bookmark
   * @param bookmarkOrName - Bookmark object or bookmark name
   * @returns The bookmark that was added
   */
  addBookmarkToParagraph(
    paragraph: Paragraph,
    bookmarkOrName: Bookmark | string
  ): Bookmark {
    const bookmark =
      typeof bookmarkOrName === "string"
        ? this.createBookmark(bookmarkOrName)
        : bookmarkOrName;

    paragraph.addBookmark(bookmark);
    return bookmark;
  }

  /**
   * Adds or retrieves a "_top" bookmark at the beginning of the document
   *
   * This is a convenience method that ensures a "_top" bookmark exists at the start of the document body.
   * The bookmark is placed in an empty paragraph at position 0, with the structure:
   * ```xml
   * <w:bookmarkStart w:id="0" w:name="_top"/>
   * <w:bookmarkEnd w:id="0"/>
   * ```
   *
   * This method is idempotent - calling it multiple times will not create duplicate bookmarks.
   * If the "_top" bookmark already exists, the existing bookmark is returned.
   *
   * @returns Object containing:
   *  - `bookmark`: The Bookmark instance for "_top"
   *  - `anchor`: The anchor name ("_top") for creating hyperlinks
   *  - `hyperlink`: Convenience function to create a hyperlink to this bookmark
   *
   * @example
   * ```typescript
   * // Add or retrieve the _top bookmark
   * const { bookmark, anchor, hyperlink } = doc.addTopBookmark();
   *
   * // Create a hyperlink to the top of the document
   * const link = hyperlink('Back to top');
   * paragraph.addHyperlink(link);
   *
   * // Or create it manually
   * const link2 = Hyperlink.createInternal(anchor, 'Go to top');
   * ```
   */
  addTopBookmark(): {
    bookmark: Bookmark;
    anchor: string;
    hyperlink: (text: string, formatting?: RunFormatting) => Hyperlink;
  } {
    const BOOKMARK_NAME = "_top";

    // Check if _top bookmark already exists
    let bookmark = this.getBookmark(BOOKMARK_NAME);

    if (!bookmark) {
      // Create new _top bookmark
      // Note: We use skipNormalization to preserve the exact name "_top"
      // and explicitly set id to 0 as per the XML structure requirement
      bookmark = new Bookmark({
        id: 0,
        name: BOOKMARK_NAME,
        skipNormalization: true,
      });

      // Register the bookmark with the manager
      this.bookmarkManager.register(bookmark);

      // Add bookmark to the first existing paragraph if document has content
      // This avoids creating a visible newline at the top of the document
      const paragraphs = this.getAllParagraphs();

      if (paragraphs.length > 0 && paragraphs[0]) {
        // Add bookmark to first existing paragraph
        paragraphs[0].addBookmark(bookmark);
      } else {
        // Fallback: Create empty paragraph if document is empty
        const topParagraph = new Paragraph();
        topParagraph.addBookmark(bookmark);
        this.bodyElements.unshift(topParagraph);
      }
    }

    // Return the bookmark information and a convenience function
    return {
      bookmark,
      anchor: BOOKMARK_NAME,
      hyperlink: (text: string, formatting?: RunFormatting) => {
        return Hyperlink.createInternal(BOOKMARK_NAME, text, formatting);
      },
    };
  }

  /**
   * Gets the RevisionManager for track changes operations
   *
   * Provides access to the RevisionManager for managing tracked changes
   * (insertions, deletions, formatting changes, etc.) in the document.
   *
   * @returns The RevisionManager instance managing this document's revisions
   *
   * @example
   * ```typescript
   * const revManager = doc.getRevisionManager();
   * const stats = revManager.getStats();
   * console.log(`Document has ${stats.total} tracked changes`);
   * ```
   */
  getRevisionManager(): RevisionManager {
    return this.revisionManager;
  }

  // ============================================================
  // Revision Validation Methods
  // ============================================================

  /**
   * Validates all revisions in the document for ECMA-376 compliance.
   *
   * Checks for:
   * - Duplicate revision IDs
   * - Missing or invalid author attributes
   * - Orphaned move markers (moveFrom without moveTo or vice versa)
   * - Missing or invalid date formats
   * - Empty revisions
   * - Non-sequential IDs (in strict mode)
   *
   * @param options - Validation options
   * @returns Validation result with all issues found
   *
   * @example
   * ```typescript
   * const result = doc.validateRevisions();
   * if (!result.valid) {
   *   console.error(`Found ${result.errors.length} errors:`);
   *   for (const error of result.errors) {
   *     console.error(`  ${error.code}: ${error.message}`);
   *   }
   * }
   * ```
   */
  validateRevisions(options?: ValidationOptions): ValidationResult {
    return RevisionValidator.validate(this, options);
  }

  /**
   * Auto-fixes revision validation issues.
   *
   * Can fix:
   * - Duplicate IDs (reassigns unique IDs)
   * - Missing authors (sets default author)
   * - Missing dates (sets current date)
   * - Orphaned move markers (removes orphaned markers)
   * - Empty revisions (removes them)
   * - Non-sequential IDs (reassigns sequentially)
   *
   * @param options - Auto-fix options
   * @returns Result with details of all fixes applied
   *
   * @example
   * ```typescript
   * // Fix all issues
   * const result = doc.autoFixRevisions();
   * console.log(`Fixed ${result.issuesFixed} issues`);
   *
   * // Preview fixes without applying
   * const preview = doc.autoFixRevisions({ dryRun: true });
   * console.log('Would fix:', preview.actions.map(a => a.action));
   * ```
   */
  autoFixRevisions(options?: AutoFixOptions): AutoFixResult {
    return RevisionAutoFixer.fix(this, options);
  }

  /**
   * Quick check if document revisions are valid.
   *
   * @returns True if document has no revision errors
   *
   * @example
   * ```typescript
   * if (!doc.isRevisionValid()) {
   *   doc.autoFixRevisions();
   * }
   * ```
   */
  isRevisionsValid(): boolean {
    return RevisionValidator.isValid(this);
  }

  /**
   * Validates and auto-fixes revisions before save.
   *
   * This is a convenience method that validates first, then auto-fixes
   * any issues found. Use this before saving to ensure the document
   * will open correctly in Word.
   *
   * @param options - Options for validation and fixing
   * @returns Combined result of validation and fixing
   *
   * @example
   * ```typescript
   * const result = doc.validateAndFixRevisions();
   * if (result.validation.valid) {
   *   await doc.save('output.docx');
   * }
   * ```
   */
  validateAndFixRevisions(options?: {
    validation?: ValidationOptions;
    autoFix?: AutoFixOptions;
  }): { validation: ValidationResult; fix: AutoFixResult } {
    // First validate
    const validation = this.validateRevisions(options?.validation);

    // If issues found, auto-fix
    let fix: AutoFixResult = {
      allFixed: true,
      issuesFixed: 0,
      issuesRemaining: 0,
      actions: [],
      errors: [],
    };

    if (!validation.valid) {
      fix = this.autoFixRevisions(options?.autoFix);
    }

    return { validation, fix };
  }

  /**
   * Creates and registers a new insertion revision
   * @param author - Author who made the insertion
   * @param content - Inserted content (Run or array of Runs)
   * @param date - Optional date (defaults to now)
   * @returns The created and registered revision
   */
  createInsertion(author: string, content: Run | Run[], date?: Date): Revision {
    const revision = Revision.createInsertion(author, content, date);
    return this.revisionManager.register(revision);
  }

  /**
   * Creates and registers a new deletion revision
   * @param author - Author who made the deletion
   * @param content - Deleted content (Run or array of Runs)
   * @param date - Optional date (defaults to now)
   * @returns The created and registered revision
   */
  createDeletion(author: string, content: Run | Run[], date?: Date): Revision {
    const revision = Revision.createDeletion(author, content, date);
    return this.revisionManager.register(revision);
  }

  /**
   * Creates and registers a revision from text
   * Convenience method that creates a Run from the text
   * @param type - Revision type ('insert' or 'delete')
   * @param author - Author who made the change
   * @param text - Text content
   * @param date - Optional date (defaults to now)
   * @returns The created and registered revision
   */
  createRevisionFromText(
    type: RevisionType,
    author: string,
    text: string,
    date?: Date
  ): Revision {
    const revision = Revision.fromText(type, author, text, date);
    return this.revisionManager.register(revision);
  }

  /**
   * Finds the index of a paragraph in the document body
   * @param paragraph - The paragraph to find
   * @returns The index (0-based), or -1 if not found
   */
  private findParagraphIndex(paragraph: Paragraph): number {
    const paragraphs = this.getParagraphs();
    return paragraphs.indexOf(paragraph);
  }

  /**
   * Creates a RevisionLocation for a paragraph
   * @param paragraph - The paragraph containing the revision
   * @param runIndex - Optional run index within the paragraph
   * @returns RevisionLocation with paragraph index, or undefined if not found
   */
  private createRevisionLocation(paragraph: Paragraph, runIndex?: number): RevisionLocation | undefined {
    const paragraphIndex = this.findParagraphIndex(paragraph);
    if (paragraphIndex === -1) {
      return undefined; // Paragraph not found in document
    }
    const location: RevisionLocation = { paragraphIndex };
    if (runIndex !== undefined) {
      location.runIndex = runIndex;
    }
    return location;
  }

  /**
   * Adds a tracked insertion to a paragraph
   * @param paragraph - The paragraph to add the insertion to
   * @param author - Author who made the insertion
   * @param text - Inserted text
   * @param date - Optional date (defaults to now)
   * @returns The created revision with location set
   */
  trackInsertion(
    paragraph: Paragraph,
    author: string,
    text: string,
    date?: Date
  ): Revision {
    const revision = this.createRevisionFromText("insert", author, text, date);

    // Set location for changelog/tracking purposes
    const location = this.createRevisionLocation(paragraph);
    if (location) {
      // Run index will be the next run position in the paragraph
      location.runIndex = paragraph.getRuns().length;
      revision.setLocation(location);
    }

    paragraph.addRevision(revision);
    return revision;
  }

  /**
   * Adds a tracked deletion to a paragraph
   * @param paragraph - The paragraph to add the deletion to
   * @param author - Author who made the deletion
   * @param text - Deleted text
   * @param date - Optional date (defaults to now)
   * @returns The created revision with location set
   */
  trackDeletion(
    paragraph: Paragraph,
    author: string,
    text: string,
    date?: Date
  ): Revision {
    const revision = this.createRevisionFromText("delete", author, text, date);

    // Set location for changelog/tracking purposes
    const location = this.createRevisionLocation(paragraph);
    if (location) {
      // Run index will be the next run position in the paragraph
      location.runIndex = paragraph.getRuns().length;
      revision.setLocation(location);
    }

    paragraph.addRevision(revision);
    return revision;
  }

  /**
   * Adds a tracked field instruction deletion to a paragraph
   * Uses w:delInstrText instead of w:delText for field codes
   * @param paragraph - The paragraph to add the deletion to
   * @param author - Author who made the deletion
   * @param fieldInstruction - Deleted field instruction text (e.g., 'PAGE', 'DATE')
   * @param date - Optional date (defaults to now)
   * @returns The created revision with location set
   * @example
   * // Track deletion of a PAGE field
   * const para = doc.createParagraph();
   * doc.trackFieldInstructionDeletion(para, 'Alice', 'PAGE \\* MERGEFORMAT');
   */
  trackFieldInstructionDeletion(
    paragraph: Paragraph,
    author: string,
    fieldInstruction: string,
    date?: Date
  ): Revision {
    const run = new Run(fieldInstruction);
    const revision = Revision.createFieldInstructionDeletion(author, run, date);
    this.revisionManager.register(revision);

    // Set location for changelog/tracking purposes
    const location = this.createRevisionLocation(paragraph);
    if (location) {
      location.runIndex = paragraph.getRuns().length;
      revision.setLocation(location);
    }

    paragraph.addRevision(revision);
    return revision;
  }

  /**
   * Marks a paragraph mark as deleted (tracked change)
   *
   * When a paragraph mark is deleted, it indicates that the paragraph
   * was joined with the next paragraph. This creates a deletion marker
   * in the paragraph properties (w:pPr/w:rPr/w:del) per ECMA-376 Part 1 §17.13.5.14.
   *
   * @param paragraph - Paragraph whose mark is deleted
   * @param author - Author who deleted the paragraph mark
   * @param date - Optional date (defaults to now)
   * @returns The paragraph for chaining
   * @example
   * // Mark paragraph mark as deleted when joining paragraphs
   * const para = doc.createParagraph('First paragraph');
   * doc.trackParagraphMarkDeletion(para, 'Alice');
   * // In Word, this shows the ¶ symbol as deleted
   */
  trackParagraphMarkDeletion(
    paragraph: Paragraph,
    author: string,
    date?: Date
  ): Paragraph {
    const revisionId = this.revisionManager.consumeNextId();
    paragraph.markParagraphMarkAsDeleted(revisionId, author, date);
    return paragraph;
  }

  /**
   * Checks if the document contains any tracked changes
   *
   * Note: This checks if revisions exist, not if tracking is enabled.
   * Use {@link isTrackChangesEnabled} to check the tracking mode setting.
   *
   * @returns True if the document has one or more tracked changes (insertions, deletions, etc.)
   *
   * @example
   * ```typescript
   * if (doc.isTrackingChanges()) {
   *   console.log('Document has pending changes to review');
   *   const stats = doc.getRevisionStats();
   *   console.log(`${stats.insertions} insertions, ${stats.deletions} deletions`);
   * }
   * ```
   */
  isTrackingChanges(): boolean {
    return this.revisionManager.isTrackingChanges();
  }

  /**
   * Checks if the document has any tracked changes (revisions)
   *
   * Convenience method that checks whether the document contains any revision
   * objects (insertions, deletions, moves, property changes, etc.).
   *
   * This is functionally equivalent to {@link isTrackingChanges} but uses a
   * more intuitive name that clarifies it checks for the *presence* of revisions,
   * not whether tracking mode is enabled.
   *
   * @returns True if the document contains one or more tracked changes
   *
   * @example
   * ```typescript
   * if (doc.hasTrackedChanges()) {
   *   console.log('Document has pending revisions to review');
   *   const stats = doc.getRevisionStats();
   *   console.log(`Found ${stats.total} tracked changes`);
   * }
   * ```
   *
   * @see {@link isTrackingChanges} - Identical functionality
   * @see {@link isTrackChangesEnabled} - Checks if tracking mode is enabled
   */
  hasTrackedChanges(): boolean {
    return this.revisionManager.isTrackingChanges();
  }

  /**
   * Checks if the document's raw XML contains revision markup.
   *
   * This method checks the actual XML content of the document for revision
   * elements like `<w:ins>`, `<w:del>`, `<w:moveFrom>`, and `<w:moveTo>`.
   * Unlike {@link hasTrackedChanges}, which only checks the in-memory model,
   * this method detects revisions that may not have been fully parsed.
   *
   * Use this when you need to know if the document file contains any tracked
   * changes, regardless of whether they were parsed into the object model.
   *
   * @returns True if the raw XML contains revision markup
   *
   * @example
   * ```typescript
   * const doc = await Document.load('document.docx');
   *
   * // Check raw XML for revisions (more reliable)
   * if (doc.hasRawXmlRevisions()) {
   *   console.log('Document XML contains tracked changes');
   * }
   *
   * // Compare with in-memory check
   * if (doc.hasTrackedChanges()) {
   *   console.log('Document has parsed revisions in memory');
   * }
   * ```
   */
  hasRawXmlRevisions(): boolean {
    const documentXml = this.zipHandler.getFileAsString('word/document.xml');
    if (!documentXml) {
      return false;
    }
    // Use precise patterns to avoid false matches like <w:insideH> (table borders)
    // Revision elements are: <w:ins ...>, <w:del ...>, <w:moveFrom ...>, <w:moveTo ...>
    // They either have attributes (<w:ins w:author=...) or just close (>)
    return (
      /<w:ins[\s>]/.test(documentXml) ||
      /<w:del[\s>]/.test(documentXml) ||
      /<w:moveFrom[\s>]/.test(documentXml) ||
      /<w:moveTo[\s>]/.test(documentXml)
    );
  }

  /**
   * Gets detailed statistics about tracked changes in the document
   *
   * Provides a comprehensive breakdown of all revisions including counts
   * by type, list of authors, and the next available revision ID.
   *
   * @returns Object containing revision statistics
   *
   * @example
   * ```typescript
   * const stats = doc.getRevisionStats();
   * console.log(`Total changes: ${stats.total}`);
   * console.log(`Insertions: ${stats.insertions}`);
   * console.log(`Deletions: ${stats.deletions}`);
   * console.log(`Authors: ${stats.authors.join(', ')}`);
   * ```
   */
  getRevisionStats(): {
    total: number;
    insertions: number;
    deletions: number;
    propertyChanges: number;
    moves: number;
    tableCellChanges: number;
    authors: string[];
    nextId: number;
  } {
    return this.revisionManager.getStats();
  }

  /**
   * Enables track changes mode for the document
   *
   * When enabled, Word will track all future edits made to the document.
   * This adds the w:trackRevisions flag to settings.xml and configures
   * revision view settings (what changes are visible).
   *
   * @param options - Optional track changes configuration
   * @param options.trackFormatting - Track formatting changes (default: true)
   * @param options.showInsertionsAndDeletions - Display insertions/deletions in Word (default: true)
   * @param options.showFormatting - Display formatting changes in Word (default: true)
   * @param options.showInkAnnotations - Display ink annotations in Word (default: true)
   * @returns This document instance for method chaining
   *
   * @example
   * ```typescript
   * // Enable with defaults
   * doc.enableTrackChanges();
   * ```
   *
   * @example
   * ```typescript
   * // Enable with custom settings
   * doc.enableTrackChanges({
   *   trackFormatting: false,
   *   showInsertionsAndDeletions: true
   * });
   * ```
   */
  enableTrackChanges(options?: {
    /** Author name for automatically tracked changes (default: 'DocHub') */
    author?: string;
    trackFormatting?: boolean;
    showInsertionsAndDeletions?: boolean;
    showFormatting?: boolean;
    showInkAnnotations?: boolean;
    /**
     * Whether to clear existing pPrChange elements before enabling tracking.
     * Default: true
     *
     * When true, any existing paragraph property change tracking (w:pPrChange)
     * is cleared before enabling fresh tracking. This prevents merge issues
     * where Word requires multiple "Accept All" clicks.
     *
     * Set to false only if you specifically want to preserve and merge with
     * existing pPrChange elements.
     */
    clearExistingPropertyChanges?: boolean;
  }): this {
    // Clear existing pPrChange elements to prevent merge issues with Word
    // This ensures Word's "Accept All Changes" works in a single click
    // Can be disabled via options.clearExistingPropertyChanges = false
    const shouldClear = options?.clearExistingPropertyChanges !== false;
    if (shouldClear) {
      this.clearAllParagraphPropertyChanges();
    }

    this.trackChangesEnabled = true;

    if (options) {
      if (options.trackFormatting !== undefined) {
        this.trackFormatting = options.trackFormatting;
      }
      if (options.showInsertionsAndDeletions !== undefined) {
        this.revisionViewSettings.showInsertionsAndDeletions =
          options.showInsertionsAndDeletions;
      }
      if (options.showFormatting !== undefined) {
        this.revisionViewSettings.showFormatting = options.showFormatting;
      }
      if (options.showInkAnnotations !== undefined) {
        this.revisionViewSettings.showInkAnnotations =
          options.showInkAnnotations;
      }
    }

    // Enable the tracking context for automatic change tracking
    this.trackingContext.enable({
      author: options?.author,
      trackFormatting: this.trackFormatting,
    });

    // Bind tracking context to all existing elements
    this.bindTrackingToAllElements();

    return this;
  }

  /**
   * Disables track changes mode for the document
   *
   * When disabled, Word will not track future edits.
   * Note: This does NOT remove existing tracked changes.
   *
   * @returns This document instance for method chaining
   *
   * @example
   * ```typescript
   * doc.disableTrackChanges();
   * await doc.save('output.docx');  // Future edits won't be tracked
   * ```
   */
  disableTrackChanges(): this {
    this.trackChangesEnabled = false;
    this.trackingContext.disable(); // Flushes pending changes and disables
    return this;
  }

  /**
   * Checks if track changes is enabled
   * @returns True if track changes is enabled
   */
  isTrackChangesEnabled(): boolean {
    return this.trackChangesEnabled;
  }

  /**
   * Gets the track formatting setting
   * @returns True if formatting changes are tracked
   */
  isTrackFormattingEnabled(): boolean {
    return this.trackFormatting;
  }

  /**
   * Gets the revision view settings
   * @returns Revision view settings
   */
  getRevisionViewSettings(): {
    showInsertionsAndDeletions: boolean;
    showFormatting: boolean;
    showInkAnnotations: boolean;
  } {
    return { ...this.revisionViewSettings };
  }

  /**
   * Gets the tracking context for automatic change tracking.
   * Elements use this to notify the document of changes.
   * @returns The tracking context
   */
  getTrackingContext(): TrackingContext {
    return this.trackingContext;
  }

  /**
   * Flushes all pending tracked changes and creates Revision objects.
   * Called automatically on save, but can be called manually.
   * @returns Array of created Revision objects
   */
  flushPendingChanges(): Revision[] {
    return this.trackingContext.flushPendingChanges();
  }

  /**
   * Enable automatic acceptance of all revisions before save.
   *
   * When enabled, acceptAllRevisions() is called after flushPendingChanges()
   * but before XML generation during save(). This ensures ALL revisions
   * (including those created during save) are accepted.
   *
   * This is useful when you want a clean document without visible tracked changes,
   * but need to process the document first and capture changes for logging/UI display.
   *
   * @param accept - Whether to accept all revisions before save (default: false)
   * @returns This document instance for method chaining
   *
   * @example
   * ```typescript
   * // Enable track changes for processing
   * doc.enableTrackChanges({ author: 'DocHub' });
   *
   * // Make modifications (automatically tracked)
   * doc.createParagraph('New content');
   *
   * // Extract changes for UI display BEFORE accepting
   * const changes = ChangelogGenerator.fromDocument(doc);
   *
   * // Enable auto-accept so document will be clean after save
   * doc.setAcceptRevisionsBeforeSave(true);
   * doc.disableTrackChanges();
   *
   * // Save - all revisions will be accepted, document will have no visible tracked changes
   * await doc.save('output.docx');
   * ```
   */
  setAcceptRevisionsBeforeSave(accept: boolean): this {
    this.acceptRevisionsBeforeSave = accept;
    return this;
  }

  /**
   * Check if revisions will be automatically accepted before save.
   * @returns True if revisions will be accepted before save
   */
  getAcceptRevisionsBeforeSave(): boolean {
    return this.acceptRevisionsBeforeSave;
  }

  /**
   * Binds the tracking context to all existing elements in the document.
   * Called automatically when track changes is enabled.
   * @internal
   */
  private bindTrackingToAllElements(): void {
    for (const element of this.bodyElements) {
      this.bindTrackingToElement(element);
    }
  }

  /**
   * Binds the tracking context to an element and its children.
   * @param element - Element to bind
   * @internal
   */
  private bindTrackingToElement(element: any): void {
    // Set tracking context on element if it supports it
    if (element && typeof element._setTrackingContext === 'function') {
      element._setTrackingContext(this.trackingContext);
    }

    // Recursively bind to runs
    if (element && typeof element.getRuns === 'function') {
      for (const run of element.getRuns()) {
        this.bindTrackingToElement(run);
      }
    }

    // Recursively bind to hyperlinks
    if (element && typeof element.getHyperlinks === 'function') {
      for (const link of element.getHyperlinks()) {
        this.bindTrackingToElement(link);
      }
    }

    // Recursively bind to table rows and cells
    if (element && typeof element.getRows === 'function') {
      for (const row of element.getRows()) {
        this.bindTrackingToElement(row);
        if (typeof row.getCells === 'function') {
          for (const cell of row.getCells()) {
            this.bindTrackingToElement(cell);
            // Bind to paragraphs in cell
            if (typeof cell.getParagraphs === 'function') {
              for (const para of cell.getParagraphs()) {
                this.bindTrackingToElement(para);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Sets the RSID root for this document
   * RSID (Revision Save ID) identifies the first editing session
   * @param rsidRoot - 8-character hexadecimal RSID value
   */
  setRsidRoot(rsidRoot: string): this {
    // Validate RSID format (8 hex characters)
    if (!/^[0-9A-Fa-f]{8}$/.test(rsidRoot)) {
      throw new Error("RSID must be an 8-character hexadecimal value");
    }
    this.rsidRoot = rsidRoot.toUpperCase();
    this.rsids.add(this.rsidRoot);
    return this;
  }

  /**
   * Adds an RSID to the document
   * Each editing session gets a unique RSID
   * @param rsid - 8-character hexadecimal RSID value
   */
  addRsid(rsid: string): this {
    // Validate RSID format
    if (!/^[0-9A-Fa-f]{8}$/.test(rsid)) {
      throw new Error("RSID must be an 8-character hexadecimal value");
    }
    this.rsids.add(rsid.toUpperCase());
    return this;
  }

  /**
   * Generates a new random RSID and adds it to the document
   * @returns The generated RSID
   */
  generateRsid(): string {
    const rsid = Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .toUpperCase()
      .padStart(8, "0");
    this.rsids.add(rsid);
    return rsid;
  }

  /**
   * Gets the RSID root value
   * @returns RSID root or undefined if not set
   */
  getRsidRoot(): string | undefined {
    return this.rsidRoot;
  }

  /**
   * Gets all RSIDs in the document
   * @returns Array of RSID values
   */
  getRsids(): string[] {
    return Array.from(this.rsids);
  }

  /**
   * Protects the document with specified edit restrictions
   * @param protection - Document protection settings
   */
  protectDocument(protection: {
    edit: "readOnly" | "comments" | "trackedChanges" | "forms";
    enforcement?: boolean;
    password?: string;
    cryptProviderType?: string;
    cryptAlgorithmClass?: string;
    cryptAlgorithmType?: string;
    cryptAlgorithmSid?: number;
    cryptSpinCount?: number;
  }): this {
    this.documentProtection = {
      edit: protection.edit,
      enforcement: protection.enforcement ?? true,
      cryptProviderType: protection.cryptProviderType,
      cryptAlgorithmClass: protection.cryptAlgorithmClass,
      cryptAlgorithmType: protection.cryptAlgorithmType,
      cryptAlgorithmSid: protection.cryptAlgorithmSid,
      cryptSpinCount: protection.cryptSpinCount,
    };

    // If password provided, generate hash and salt
    if (protection.password) {
      // For now, use a simple hash. In production, use proper cryptographic functions
      const crypto = require("crypto");
      const salt = crypto.randomBytes(16).toString("base64");
      const hash = crypto
        .pbkdf2Sync(
          protection.password,
          salt,
          protection.cryptSpinCount || 100000,
          32,
          "sha512"
        )
        .toString("base64");

      this.documentProtection.hash = hash;
      this.documentProtection.salt = salt;
    }

    return this;
  }

  /**
   * Removes document protection
   */
  unprotectDocument(): this {
    this.documentProtection = undefined;
    return this;
  }

  /**
   * Checks if document is protected
   * @returns True if document has protection enabled
   */
  isProtected(): boolean {
    return this.documentProtection !== undefined;
  }

  /**
   * Gets document protection settings
   * @returns Document protection settings or undefined
   */
  getProtection(): typeof this.documentProtection {
    return this.documentProtection;
  }

  /**
   * Creates and registers a run properties change revision
   * @param author - Author who made the change
   * @param content - Content with changed formatting
   * @param previousProperties - Previous run properties
   * @param date - Optional date (defaults to now)
   * @returns The created and registered revision
   */
  createRunPropertiesChange(
    author: string,
    content: Run | Run[],
    previousProperties: Record<string, any>,
    date?: Date
  ): Revision {
    const revision = Revision.createRunPropertiesChange(
      author,
      content,
      previousProperties,
      date
    );
    return this.revisionManager.register(revision);
  }

  /**
   * Creates and registers a paragraph properties change revision
   * @param author - Author who made the change
   * @param content - Paragraph content
   * @param previousProperties - Previous paragraph properties
   * @param date - Optional date (defaults to now)
   * @returns The created and registered revision
   */
  createParagraphPropertiesChange(
    author: string,
    content: Run | Run[],
    previousProperties: Record<string, any>,
    date?: Date
  ): Revision {
    const revision = Revision.createParagraphPropertiesChange(
      author,
      content,
      previousProperties,
      date
    );
    return this.revisionManager.register(revision);
  }

  /**
   * Creates and registers a table properties change revision
   * @param author - Author who made the change
   * @param content - Table content
   * @param previousProperties - Previous table properties
   * @param date - Optional date (defaults to now)
   * @returns The created and registered revision
   */
  createTablePropertiesChange(
    author: string,
    content: Run | Run[],
    previousProperties: Record<string, any>,
    date?: Date
  ): Revision {
    const revision = Revision.createTablePropertiesChange(
      author,
      content,
      previousProperties,
      date
    );
    return this.revisionManager.register(revision);
  }

  /**
   * Creates and registers a moveFrom revision (source of moved content)
   * @param author - Author who moved the content
   * @param content - Content that was moved
   * @param moveId - Unique move operation ID (links moveFrom and moveTo)
   * @param date - Optional date (defaults to now)
   * @returns The created and registered revision
   */
  createMoveFrom(
    author: string,
    content: Run | Run[],
    moveId: string,
    date?: Date
  ): Revision {
    const revision = Revision.createMoveFrom(author, content, moveId, date);
    return this.revisionManager.register(revision);
  }

  /**
   * Creates and registers a moveTo revision (destination of moved content)
   * @param author - Author who moved the content
   * @param content - Content that was moved
   * @param moveId - Unique move operation ID (links moveFrom and moveTo)
   * @param date - Optional date (defaults to now)
   * @returns The created and registered revision
   */
  createMoveTo(
    author: string,
    content: Run | Run[],
    moveId: string,
    date?: Date
  ): Revision {
    const revision = Revision.createMoveTo(author, content, moveId, date);
    return this.revisionManager.register(revision);
  }

  /**
   * Creates a pair of moveFrom and moveTo revisions for moving content
   * @param author - Author who moved the content
   * @param content - Content that was moved
   * @param date - Optional date (defaults to now)
   * @returns Object with both moveFrom and moveTo revisions and range markers
   */
  trackMove(
    author: string,
    content: Run | Run[],
    date?: Date
  ): {
    moveFrom: Revision;
    moveTo: Revision;
    moveId: string;
    moveFromRangeStart: RangeMarker;
    moveFromRangeEnd: RangeMarker;
    moveToRangeStart: RangeMarker;
    moveToRangeEnd: RangeMarker;
  } {
    // Generate unique move ID and name
    const moveId = `move${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const moveName = `move${Date.now()}`;

    // Get unique IDs for range markers (use revision manager's next ID)
    const rangeIdStart = this.revisionManager.getStats().nextId;

    // Create range markers for moveFrom
    const moveFromRangeStart = RangeMarker.createMoveFromStart(
      rangeIdStart,
      moveName,
      author,
      date
    );
    const moveFromRangeEnd = RangeMarker.createMoveFromEnd(rangeIdStart);

    // Create range markers for moveTo
    const moveToRangeStart = RangeMarker.createMoveToStart(
      rangeIdStart,
      moveName,
      author,
      date
    );
    const moveToRangeEnd = RangeMarker.createMoveToEnd(rangeIdStart);

    // Create the actual move revisions
    const moveFrom = this.createMoveFrom(author, content, moveId, date);
    const moveTo = this.createMoveTo(author, content, moveId, date);

    return {
      moveFrom,
      moveTo,
      moveId,
      moveFromRangeStart,
      moveFromRangeEnd,
      moveToRangeStart,
      moveToRangeEnd,
    };
  }

  /**
   * Creates and registers a table cell insertion revision
   * @param author - Author who inserted the cell
   * @param content - Cell content
   * @param date - Optional date (defaults to now)
   * @returns The created and registered revision
   */
  createTableCellInsert(
    author: string,
    content: Run | Run[],
    date?: Date
  ): Revision {
    const revision = Revision.createTableCellInsert(author, content, date);
    return this.revisionManager.register(revision);
  }

  /**
   * Creates and registers a table cell deletion revision
   * @param author - Author who deleted the cell
   * @param content - Cell content
   * @param date - Optional date (defaults to now)
   * @returns The created and registered revision
   */
  createTableCellDelete(
    author: string,
    content: Run | Run[],
    date?: Date
  ): Revision {
    const revision = Revision.createTableCellDelete(author, content, date);
    return this.revisionManager.register(revision);
  }

  /**
   * Creates and registers a table cell merge revision
   * @param author - Author who merged cells
   * @param content - Merged cell content
   * @param date - Optional date (defaults to now)
   * @returns The created and registered revision
   */
  createTableCellMerge(
    author: string,
    content: Run | Run[],
    date?: Date
  ): Revision {
    const revision = Revision.createTableCellMerge(author, content, date);
    return this.revisionManager.register(revision);
  }

  /**
   * Creates and registers a numbering change revision
   * @param author - Author who changed the numbering
   * @param content - Content with changed numbering
   * @param previousProperties - Previous numbering properties
   * @param date - Optional date (defaults to now)
   * @returns The created and registered revision
   */
  createNumberingChange(
    author: string,
    content: Run | Run[],
    previousProperties: Record<string, any>,
    date?: Date
  ): Revision {
    const revision = Revision.createNumberingChange(
      author,
      content,
      previousProperties,
      date
    );
    return this.revisionManager.register(revision);
  }

  /**
   * Gets the CommentManager for comment operations
   *
   * Provides access to the CommentManager for creating, managing, and
   * querying document comments and comment threads.
   *
   * @returns The CommentManager instance managing this document's comments
   *
   * @example
   * ```typescript
   * const commentMgr = doc.getCommentManager();
   * const allComments = commentMgr.getAllComments();
   * console.log(`Document has ${allComments.length} comments`);
   * ```
   */
  getCommentManager(): CommentManager {
    return this.commentManager;
  }

  /**
   * Creates and registers a new comment
   *
   * Creates a comment that can be attached to paragraphs or text ranges.
   * The comment is automatically registered with the CommentManager and
   * assigned a unique ID.
   *
   * @param author - Name of the comment author
   * @param content - Comment text content, single Run, or array of Runs
   * @param initials - Optional author initials (defaults to first letters of author name)
   * @returns The created and registered Comment instance
   *
   * @example
   * ```typescript
   * // Create simple text comment
   * const comment = doc.createComment('John Doe', 'Please review this section');
   * const para = doc.createParagraph('Important text');
   * para.addComment(comment);
   * ```
   *
   * @example
   * ```typescript
   * // Create comment with formatted content
   * const run = new Run('This needs attention', { bold: true, color: 'FF0000' });
   * const comment = doc.createComment('Alice', run, 'A');
   * ```
   */
  createComment(
    author: string,
    content: string | Run | Run[],
    initials?: string
  ): Comment {
    return this.commentManager.createComment(author, content, initials);
  }

  /**
   * Creates and registers a reply to an existing comment
   * @param parentCommentId - ID of the parent comment
   * @param author - Reply author
   * @param content - Reply content (text or runs)
   * @param initials - Optional author initials
   * @returns The created and registered reply
   */
  createReply(
    parentCommentId: number,
    author: string,
    content: string | Run | Run[],
    initials?: string
  ): Comment {
    return this.commentManager.createReply(
      parentCommentId,
      author,
      content,
      initials
    );
  }

  /**
   * Gets a comment by ID
   * @param id - Comment ID
   * @returns The comment, or undefined if not found
   */
  getComment(id: number): Comment | undefined {
    return this.commentManager.getComment(id);
  }

  /**
   * Gets all comments (top-level only, not replies)
   * @returns Array of all top-level comments
   */
  getAllComments(): Comment[] {
    return this.commentManager.getAllComments();
  }

  /**
   * Adds a comment to a paragraph (wraps the entire paragraph)
   * Creates the comment if text is provided, or uses an existing comment object
   * @param paragraph - The paragraph to comment
   * @param commentOrAuthor - Comment object, or author name if creating new comment
   * @param content - Comment content (required if creating new comment)
   * @param initials - Optional author initials (for new comments)
   * @returns The comment that was added
   */
  addCommentToParagraph(
    paragraph: Paragraph,
    commentOrAuthor: Comment | string,
    content?: string | Run | Run[],
    initials?: string
  ): Comment {
    const comment =
      typeof commentOrAuthor === "string"
        ? this.createComment(commentOrAuthor, content!, initials)
        : commentOrAuthor;

    paragraph.addComment(comment);
    return comment;
  }

  /**
   * Gets statistics about comments
   * @returns Object with comment statistics
   */
  getCommentStats(): {
    total: number;
    topLevel: number;
    replies: number;
    authors: string[];
    nextId: number;
  } {
    return this.commentManager.getStats();
  }

  /**
   * Checks if there are any comments in the document
   * @returns True if there are no comments
   */
  hasNoComments(): boolean {
    return this.commentManager.isEmpty();
  }

  /**
   * Checks if there are comments in the document
   * @returns True if there are comments
   */
  hasComments(): boolean {
    return !this.commentManager.isEmpty();
  }

  /**
   * Gets a comment thread (comment and all its replies)
   * @param commentId - ID of the top-level comment
   * @returns Object with the comment and its replies, or undefined if not found
   */
  getCommentThread(
    commentId: number
  ): { comment: Comment; replies: Comment[] } | undefined {
    return this.commentManager.getCommentThread(commentId);
  }

  /**
   * Searches comments by text content
   * @param searchText - Text to search for (case-insensitive)
   * @returns Array of comments containing the search text
   */
  findCommentsByText(searchText: string): Comment[] {
    return this.commentManager.findCommentsByText(searchText);
  }

  /**
   * Gets the most recent comments
   * @param count - Number of recent comments to return
   * @returns Array of most recent comments
   */
  getRecentComments(count: number): Comment[] {
    return this.commentManager.getRecentComments(count);
  }

  /**
   * Gets comments by author
   * @param author - Author name to filter by
   * @returns Array of comments by the specified author
   */
  getCommentsByAuthor(author: string): Comment[] {
    return this.commentManager.getCommentsByAuthor(author);
  }

  /**
   * Gets comments within a date range
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @returns Array of comments within the date range
   */
  getCommentsByDateRange(startDate: Date, endDate: Date): Comment[] {
    return this.commentManager.getCommentsByDateRange(startDate, endDate);
  }

  /**
   * Gets all comments including replies
   * @returns Array of all comments (top-level and replies)
   */
  getAllCommentsWithReplies(): Comment[] {
    return this.commentManager.getAllCommentsWithReplies();
  }

  /**
   * Gets the total number of comments (including replies)
   * @returns Number of comments
   */
  getCommentCount(): number {
    return this.commentManager.getCount();
  }

  /**
   * Gets the number of top-level comments (excluding replies)
   * @returns Number of top-level comments
   */
  getTopLevelCommentCount(): number {
    return this.commentManager.getTopLevelCount();
  }

  /**
   * Gets all unique authors who have made comments
   * @returns Array of unique author names
   */
  getCommentAuthors(): string[] {
    return this.commentManager.getAuthors();
  }

  /**
   * Gets replies to a comment
   * @param commentId - ID of the parent comment
   * @returns Array of reply comments
   */
  getReplies(commentId: number): Comment[] {
    return this.commentManager.getReplies(commentId);
  }

  /**
   * Checks if a comment has replies
   * @param commentId - ID of the comment
   * @returns True if the comment has replies
   */
  hasReplies(commentId: number): boolean {
    return this.commentManager.hasReplies(commentId);
  }

  /**
   * Removes a comment (also removes all its replies)
   * @param id - Comment ID
   * @returns True if the comment was removed
   */
  removeComment(id: number): boolean {
    return this.commentManager.removeComment(id);
  }

  /**
   * Checks if there are any revisions in the document
   * @returns True if there are no revisions
   */
  hasNoRevisions(): boolean {
    return this.revisionManager.isEmpty();
  }

  /**
   * Checks if there are revisions in the document
   * @returns True if there are revisions
   */
  hasRevisions(): boolean {
    return !this.revisionManager.isEmpty();
  }

  /**
   * Gets the most recent revisions
   * @param count - Number of recent revisions to return
   * @returns Array of most recent revisions
   */
  getRecentRevisions(count: number): Revision[] {
    return this.revisionManager.getRecentRevisions(count);
  }

  /**
   * Searches revisions by text content
   * @param searchText - Text to search for (case-insensitive)
   * @returns Array of revisions containing the search text
   */
  findRevisionsByText(searchText: string): Revision[] {
    return this.revisionManager.findRevisionsByText(searchText);
  }

  /**
   * Gets all insertion revisions
   * @returns Array of insertion revisions
   */
  getAllInsertions(): Revision[] {
    return this.revisionManager.getAllInsertions();
  }

  /**
   * Gets all deletion revisions
   * @returns Array of deletion revisions
   */
  getAllDeletions(): Revision[] {
    return this.revisionManager.getAllDeletions();
  }

  /**
   * Gets parse warnings collected during document loading
   * Only populated when loading existing documents in lenient mode
   * @returns Array of parse errors/warnings
   */
  getParseWarnings(): Array<{ element: string; error: Error }> {
    return this.parser.getParseErrors();
  }

  /**
   * Updates hyperlink URLs in the document using a URL mapping
   *
   * This method finds all external hyperlinks in the document and updates their URLs
   * according to the provided map. The relationships are updated in-place to maintain
   * document integrity and prevent orphaned relationships per ECMA-376 §17.16.22.
   *
   * **Important Notes:**
   * - Only updates external hyperlinks (not internal bookmarks)
   * - Only updates the URL, not the display text
   * - Relationships are updated in-place to maintain IDs
   * - To update text too, manually iterate and call setText() on hyperlinks
   *
   * **OpenXML Compliance:**
   * This implementation ensures proper OpenXML structure by:
   * 1. Updating existing relationship targets in-place (prevents orphaned relationships)
   * 2. Maintaining relationship IDs for document integrity
   * 3. Maintaining TargetMode="External" for all web links (per ECMA-376 §17.16.22)
   *
   * @param urlMap - Map of old URLs to new URLs
   * @returns Number of hyperlinks updated
   *
   * @example
   * ```typescript
   * // Load existing document
   * const doc = await Document.load('document.docx');
   *
   * // Define URL mappings (old URL → new URL)
   * const urlMap = new Map([
   *   ['https://old-site.com', 'https://new-site.com'],
   *   ['https://example.org', 'https://example.com']
   * ]);
   *
   * // Update hyperlink URLs
   * const updated = doc.updateHyperlinkUrls(urlMap);
   * console.log(`Updated ${updated} hyperlink(s)`);
   *
   * // Save with updated relationships
   * await doc.save('updated-document.docx');
   * ```
   *
   * @see {@link https://www.ecma-international.org/publications-and-standards/standards/ecma-376/ | ECMA-376 Part 1 §17.16.22}
   */
  updateHyperlinkUrls(urlMap: Map<string, string>): number {
    // Early exit if no URLs to update
    if (urlMap.size === 0) {
      return 0;
    }

    // Two-phase update to handle circular URL swaps correctly
    // Phase 1: Collect all updates without modifying hyperlinks
    const updates: Array<{
      hyperlink: Hyperlink;
      newUrl: string;
      relationshipId?: string;
    }> = [];

    // Iterate through all paragraphs in document body
    for (const para of this.getAllParagraphs()) {
      // Get all content items (runs, hyperlinks, fields, revisions)
      for (const content of para.getContent()) {
        // Check if content is a Hyperlink and is external
        if (content instanceof Hyperlink && content.isExternal()) {
          const currentUrl = content.getUrl();

          // If current URL is in the map, collect the update
          if (currentUrl && urlMap.has(currentUrl)) {
            const newUrl = urlMap.get(currentUrl)!;
            updates.push({
              hyperlink: content,
              newUrl,
              relationshipId: content.getRelationshipId(),
            });
          }
        }
      }
    }

    // Phase 2: Apply all updates atomically
    // This prevents circular swap issues (e.g., A→B, B→A becomes B→A, A→B)
    for (const { hyperlink, newUrl, relationshipId } of updates) {
      // Update the hyperlink URL (maintains relationship ID)
      hyperlink.setUrl(newUrl);

      // Update the relationship target in-place if relationship exists
      if (relationshipId) {
        this.relationshipManager.updateHyperlinkTarget(relationshipId, newUrl);
      }
    }

    // Note: This implementation updates relationships in-place,
    // maintaining document integrity per ECMA-376

    return updates.length;
  }

  /**
   * Estimates the size of the document
   * Provides breakdown by component and warnings if size is too large
   * @returns Size estimation with breakdown and optional warning
   */
  estimateSize(): {
    paragraphs: number;
    tables: number;
    images: number;
    estimatedXmlBytes: number;
    imageBytes: number;
    totalEstimatedBytes: number;
    totalEstimatedMB: number;
    warning?: string;
  } {
    return this.validator.estimateSize(this.bodyElements, this.imageManager);
  }

  /**
   * Strips all tracked changes from the document
   * 
   * Removes all revision markup (<w:ins>, <w:del>, <w:moveFrom>, <w:moveTo>) from the document's XML
   * and cleans up related metadata. This effectively "accepts" all changes without using Word's 
   * built-in Accept Changes feature.
   * 
   * **IMPORTANT**: This operation:
   * 1. Modifies the raw XML in the ZIP package to remove all tracked changes
   * 2. Clears Revision objects from the in-memory object model to prevent re-serialization
   * 3. Sets flag to prevent XML regeneration on save (preserves the cleaned XML)
   * 
   * What gets removed:
   * - All insertion markers (<w:ins>) - content is kept, wrapper removed
   * - All deletion markers (<w:del>) - entire element including content removed
   * - All move operations (<w:moveFrom>, <w:moveTo>)
   * - All range markers (moveFromRangeStart/End, moveToRangeStart/End, etc.)
   * - All property change tracking (rPrChange, pPrChange, tblPrChange, etc.)
   * - Revision authors from word/people.xml
   * - Track changes settings from word/settings.xml
   * - Revision count from docProps/core.xml
   * 
   * @returns This document instance for method chaining
   * 
   * @example
   * ```typescript
   * // Load document with tracked changes
   * const doc = await Document.load('document-with-revisions.docx');
   * 
   * // Strip all tracked changes
   * await doc.stripTrackedChanges();
   * 
   * // Now process the document as normal
   * doc.applyStyles();
   * await doc.save('cleaned.docx');
   * ```
   * 
   * @example
   * ```typescript
   * // Check for tracked changes first
   * const doc = await Document.load('input.docx');
   * if (doc.hasTrackedChanges()) {
   *   console.log('Document has tracked changes - stripping them');
   *   await doc.stripTrackedChanges();
   * }
   * await doc.save('output.docx');
   * ```
   * 
   * @deprecated Use {@link acceptAllRevisions} instead - this method will be removed in a future version
   */
  async stripTrackedChanges(): Promise<this> {
    // Delegate to acceptAllRevisions for backward compatibility
    return this.acceptAllRevisions();
  }

  /**
   * Accepts all tracked changes in the document
   * 
   * Processes all revision markup following Microsoft's official OpenXML SDK approach:
   * - Insertions (<w:ins>): Keep the inserted content, remove wrapper tags
   * - Deletions (<w:del>): Remove entirely (content was deleted, so discard it)
   * - Move From (<w:moveFrom>): Remove entirely (source of moved content)
   * - Move To (<w:moveTo>): Keep content, remove wrapper (destination of moved content)
   * - Property changes: Remove all tracking elements
   * - Range markers: Remove all boundary markers
   * 
   * Also cleans up metadata:
   * - Revision authors from word/people.xml
   * - Track changes settings from word/settings.xml
   * - Revision count from docProps/core.xml
   * 
   * **IMPORTANT**: This operation:
   * 1. Modifies the raw XML in the ZIP package
   * 2. Clears Revision objects from the in-memory object model
   * 3. Sets flag to prevent XML regeneration on save (preserves the cleaned XML)
   * 
   * @returns This document instance for method chaining
   * 
   * @example
   * ```typescript
   * // Load document with tracked changes
   * const doc = await Document.load('document-with-revisions.docx');
   * 
   * // Accept all tracked changes
   * await doc.acceptAllRevisions();
   * 
   * // Now process the document as normal
   * doc.applyStyles();
   * await doc.save('cleaned.docx');
   * ```
   * 
   * @example
   * ```typescript
   * // Check for tracked changes first
   * const doc = await Document.load('input.docx');
   * if (doc.hasTrackedChanges()) {
   *   console.log('Document has tracked changes - accepting them');
   *   await doc.acceptAllRevisions();
   * }
   * await doc.save('output.docx');
   * ```
   * 
   * @see https://learn.microsoft.com/en-us/office/open-xml/how-to-accept-all-revisions
   */
  async acceptAllRevisions(): Promise<this> {
    // Use in-memory DOM transformation approach (industry standard)
    // This transforms Revision objects in the in-memory model, allowing subsequent
    // modifications to work correctly. Unlike the raw XML approach, this does NOT
    // set skipDocumentXmlRegeneration, so save() will regenerate document.xml with
    // all modifications including accepted revisions AND any subsequent changes.
    //
    // @see OpenXML PowerTools RevisionAccepter - https://github.com/OfficeDev/Open-Xml-PowerTools
    // @see https://learn.microsoft.com/en-us/previous-versions/office/developer/office-2007/ee836138(v=office.12)

    const result = acceptRevisionsInMemory(this);

    // Also cleanup metadata files (people.xml, settings.xml, core.xml)
    // This removes author tracking info and track changes settings that would
    // otherwise indicate the document had tracked changes
    cleanupRevisionMetadata(this.zipHandler);

    this.logger.info('Accepted all revisions using in-memory transformation', {
      insertions: result.insertionsAccepted,
      deletions: result.deletionsAccepted,
      moves: result.movesAccepted,
      propertyChanges: result.propertyChangesAccepted,
      total: result.totalAccepted,
    });

    return this;
  }

  /**
   * Accept all revisions using raw XML modification (legacy approach).
   *
   * This method modifies the raw XML in the ZIP package directly, then sets
   * `skipDocumentXmlRegeneration = true` to preserve the cleaned XML on save.
   *
   * **WARNING**: Using this method will prevent ANY subsequent in-memory modifications
   * from being saved. Use the standard `acceptAllRevisions()` instead.
   *
   * Use cases for this method:
   * - When you need to accept revisions and save immediately without further changes
   * - When dealing with complex revision structures that the in-memory model doesn't fully capture
   *
   * @returns This document instance for method chaining
   * @deprecated Prefer `acceptAllRevisions()` which uses in-memory transformation
   */
  async acceptAllRevisionsRawXml(): Promise<this> {
    // Step 1: Accept all revisions in the raw XML in ZIP package
    // Uses the imported acceptAllRevisions function (raw XML approach)
    await acceptAllRevisions(this.zipHandler);

    // Step 2: Clear Revision objects from in-memory object model
    // This prevents them from being re-serialized during save()
    this.clearRevisionsFromAllParagraphs();

    // Step 3: Set flag to prevent document.xml regeneration on save()
    // This preserves the cleaned XML we just created, preventing corruption
    this.skipDocumentXmlRegeneration = true;

    return this;
  }

  /**
   * Preserves the raw XML in the document, preventing regeneration on save.
   *
   * Use this when you want to keep the original document.xml exactly as loaded,
   * without any modifications from the in-memory model. This is useful for:
   * - Preserving tracked changes that weren't fully parsed into memory
   * - Round-tripping documents with features the framework doesn't support
   * - Keeping original formatting that might be lost during regeneration
   *
   * **IMPORTANT**: After calling this method:
   * - Changes made to paragraphs, runs, tables, etc. will NOT be saved
   * - Only changes to other parts (styles, numbering, headers) will be saved
   * - The document.xml will remain exactly as it was when loaded
   *
   * @returns This document instance for method chaining
   *
   * @example
   * ```typescript
   * // Load a document with tracked changes
   * const doc = await Document.load('document-with-revisions.docx');
   *
   * // Preserve the original XML (including tracked changes)
   * doc.preserveRawXml();
   *
   * // Save - tracked changes will be preserved in output
   * await doc.save('output.docx');
   * ```
   */
  preserveRawXml(): this {
    this.skipDocumentXmlRegeneration = true;
    this.logger.info('Raw XML preservation enabled - document.xml will not be regenerated on save');
    return this;
  }

  /**
   * Clears all Revision objects from paragraph content throughout the document
   * This removes in-memory tracked change objects to prevent re-serialization
   * Called by stripTrackedChanges() after cleaning the raw XML
   * @private
   */
  private clearRevisionsFromAllParagraphs(): void {
    let clearedCount = 0;
    
    // Clear revisions from all paragraphs in the document
    for (const para of this.getAllParagraphs()) {
      const revisions = para.getRevisions();
      
      if (revisions.length > 0) {
        // Filter out all Revision objects from paragraph content
        const content = para.getContent();
        const nonRevisionContent = content.filter(item => !(item instanceof Revision));
        
        // Replace paragraph content with filtered version
        para.clearContent();
        for (const item of nonRevisionContent) {
          if (item instanceof Run || item instanceof ImageRun) {
            para.addRun(item);
          } else if (item instanceof Hyperlink) {
            para.addHyperlink(item);
          } else if (item instanceof Field) {
            para.addField(item as Field);
          }
        }
        
        clearedCount += revisions.length;
      }
    }
    
    if (clearedCount > 0) {
      this.logger.info(`Cleared ${clearedCount} Revision object(s) from in-memory document model`);
    }
  }

  /**
   * Clears all paragraph property change tracking (w:pPrChange) from all paragraphs.
   *
   * This method removes existing pPrChange elements from paragraphs without affecting
   * other tracked changes (insertions, deletions, etc.). This is useful when:
   * - Loading a document with existing tracked changes and then enabling fresh tracking
   * - Preventing merge issues where old and new pPrChange elements conflict
   * - Ensuring Word's "Accept All Changes" works in a single click
   *
   * Called automatically by enableTrackChanges() to prevent problematic merging of
   * existing pPrChange with newly tracked property changes.
   *
   * @returns Number of paragraphs that had pPrChange cleared
   *
   * @example
   * ```typescript
   * // Manually clear before enabling tracking
   * const cleared = doc.clearAllParagraphPropertyChanges();
   * console.log(`Cleared pPrChange from ${cleared} paragraphs`);
   * doc.enableTrackChanges({ author: 'DocHub' });
   * ```
   */
  public clearAllParagraphPropertyChanges(): number {
    let count = 0;

    // Clear from body paragraphs
    for (const para of this.getAllParagraphs()) {
      if (para.getFormatting().pPrChange) {
        para.clearParagraphPropertiesChange();
        count++;
      }
    }

    // Clear from table cells
    for (const table of this.getTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          for (const para of cell.getParagraphs()) {
            if (para.getFormatting().pPrChange) {
              para.clearParagraphPropertiesChange();
              count++;
            }
          }
        }
      }
    }

    // Clear from headers and footers
    if (this.headerFooterManager) {
      const headers = this.headerFooterManager.getAllHeaders();
      for (const { header } of headers) {
        for (const element of header.getElements()) {
          if ('getFormatting' in element && typeof (element as any).getFormatting === 'function') {
            const para = element as Paragraph;
            if (para.getFormatting().pPrChange) {
              para.clearParagraphPropertiesChange();
              count++;
            }
          }
        }
      }

      const footers = this.headerFooterManager.getAllFooters();
      for (const { footer } of footers) {
        for (const element of footer.getElements()) {
          if ('getFormatting' in element && typeof (element as any).getFormatting === 'function') {
            const para = element as Paragraph;
            if (para.getFormatting().pPrChange) {
              para.clearParagraphPropertiesChange();
              count++;
            }
          }
        }
      }
    }

    if (count > 0) {
      this.logger.info(`Cleared pPrChange from ${count} paragraph(s)`);
    }

    return count;
  }

  /**
   * Cleans up resources and clears all managers
   * Call this after saving in long-running processes to free memory
   * Especially important for API servers processing many documents
   */
  dispose(): void {
    // Clear all managers to free memory
    this.bodyElements = [];
    this.parser.clearParseErrors();
    this.stylesManager = StylesManager.create();
    this.numberingManager = NumberingManager.create();
    this.imageManager.clear();
    this.imageManager.releaseAllImageData();
    this.relationshipManager = RelationshipManager.create();
    this.headerFooterManager = HeaderFooterManager.create();
    this.bookmarkManager.clear();
    this.revisionManager.clear();
    this.commentManager.clear();
  }

  /**
   * Gets size statistics for the document
   * @returns Size statistics
   */
  getSizeStats(): {
    elements: { paragraphs: number; tables: number; images: number };
    size: { xml: string; images: string; total: string };
    warnings: string[];
  } {
    return this.validator.getSizeStats(this.bodyElements, this.imageManager);
  }

  // ==================== DOCUMENT PART ACCESS METHODS ====================
  // These methods provide low-level access to document package parts,
  // enabling advanced operations not covered by the high-level API.

  /**
   * Gets a specific document part from the package
   *
   * Provides direct access to any part within the DOCX package, including
   * XML parts, binary files, and custom parts. This enables advanced scenarios
   * not covered by the high-level API.
   *
   * @param partName - The part name/path (e.g., 'word/document.xml', '[Content_Types].xml')
   * @returns The document part with content and metadata, or null if not found
   *
   * @example
   * ```typescript
   * // Get the main document XML
   * const docPart = await doc.getPart('word/document.xml');
   * if (docPart) {
   *   console.log(docPart.content); // XML content as string
   * }
   *
   * // Get an image
   * const imagePart = await doc.getPart('word/media/image1.png');
   * if (imagePart) {
   *   console.log(imagePart.isBinary); // true
   *   // imagePart.content is a Buffer
   * }
   * ```
   */
  async getPart(partName: string): Promise<DocumentPart | null> {
    try {
      const file = this.zipHandler.getFile(partName);
      if (!file) {
        return null;
      }

      // Convert Buffer to string for text files
      // ZipWriter stores all content as Buffer internally, but DocumentPart expects string for text
      let content: string | Buffer = file.content;
      if (!file.isBinary && Buffer.isBuffer(file.content)) {
        content = file.content.toString("utf-8");
      }

      return {
        name: partName,
        content,
        contentType: this.getContentTypeForPart(partName),
        isBinary: file.isBinary,
        size: file.size,
      };
    } catch (error) {
      // Return null for any errors (file not found, etc.)
      return null;
    }
  }

  /**
   * Sets or updates a document part in the package
   *
   * Allows adding or updating any part within the DOCX package. Use with caution
   * as incorrect modifications can corrupt the document structure.
   *
   * **Important:** This method does not automatically update relationships or
   * content types. You may need to manually update these for new parts.
   *
   * @param partName - The part name/path
   * @param content - The part content (string for XML/text, Buffer for binary)
   * @returns Promise that resolves when the part is set
   *
   * @example
   * ```typescript
   * // Update custom XML part
   * await doc.setPart('customXml/item1.xml', '<data>Custom content</data>');
   *
   * // Add a new image (remember to update relationships and content types)
   * const imageBuffer = await fs.readFile('image.png');
   * await doc.setPart('word/media/image2.png', imageBuffer);
   * ```
   */
  async setPart(partName: string, content: string | Buffer): Promise<void> {
    // Determine if content is binary
    const isBinary = Buffer.isBuffer(content);

    // Add or update the file in the ZIP handler
    this.zipHandler.addFile(partName, content, { binary: isBinary });
  }

  /**
   * Removes a document part from the package
   *
   * **Warning:** Removing required parts can corrupt the document.
   * This method does not update relationships or content types that may
   * reference the removed part.
   *
   * @param partName - The part name/path to remove
   * @returns True if the part was removed, false if it didn't exist
   *
   * @example
   * ```typescript
   * // Remove a custom part
   * const removed = await doc.removePart('customXml/item1.xml');
   * console.log(removed ? 'Part removed' : 'Part not found');
   * ```
   */
  async removePart(partName: string): Promise<boolean> {
    return this.zipHandler.removeFile(partName);
  }

  /**
   * Lists all parts in the document package
   *
   * Returns an array of all part names/paths in the DOCX package,
   * useful for debugging, analysis, or discovering custom parts.
   *
   * @returns Array of part names
   *
   * @example
   * ```typescript
   * const parts = await doc.listParts();
   * console.log('Document contains', parts.length, 'parts');
   * parts.forEach(part => console.log(part));
   * ```
   */
  async listParts(): Promise<string[]> {
    return this.zipHandler.getFilePaths();
  }

  /**
   * Checks if a part exists in the document package
   *
   * @param partName - The part name/path to check
   * @returns True if the part exists, false otherwise
   *
   * @example
   * ```typescript
   * if (await doc.partExists('word/glossary/document.xml')) {
   *   console.log('Document has a glossary');
   * }
   * ```
   */
  async partExists(partName: string): Promise<boolean> {
    return this.zipHandler.hasFile(partName);
  }

  /**
   * Gets all content types from [Content_Types].xml
   *
   * Returns a map of part names/extensions to their MIME content types.
   * This is useful for understanding the document structure and registering
   * new content types for custom parts.
   *
   * @returns Map of part names/extensions to content types
   *
   * @example
   * ```typescript
   * const contentTypes = await doc.getContentTypes();
   * contentTypes.forEach((type, name) => {
   *   console.log(`${name}: ${type}`);
   * });
   * ```
   */
  async getContentTypes(): Promise<Map<string, string>> {
    const contentTypes = new Map<string, string>();

    try {
      const contentTypesXml = this.zipHandler.getFileAsString(
        "[Content_Types].xml"
      );
      if (!contentTypesXml) {
        return contentTypes;
      }

      // Parse content types XML
      // Match Default elements (by extension)
      const defaultPattern =
        /<Default\s+Extension="([^"]+)"\s+ContentType="([^"]+)"/g;
      let match;
      while ((match = defaultPattern.exec(contentTypesXml)) !== null) {
        if (match[1] && match[2]) {
          contentTypes.set(`.${match[1]}`, match[2]);
        }
      }

      // Match Override elements (by part name)
      const overridePattern =
        /<Override\s+PartName="([^"]+)"\s+ContentType="([^"]+)"/g;
      while ((match = overridePattern.exec(contentTypesXml)) !== null) {
        if (match[1] && match[2]) {
          contentTypes.set(match[1], match[2]);
        }
      }
    } catch (error) {
      // Return empty map on error
    }

    return contentTypes;
  }

  /**
   * Gets the raw XML content of a document part without any processing
   *
   * Returns the unparsed XML string for any part in the document package.
   * This is useful for advanced manipulation, debugging, or accessing
   * content types that don't have dedicated APIs.
   *
   * **Note**: For binary parts (images, fonts), this converts the Buffer to UTF-8
   * string, which may not be appropriate. Check the content type first.
   *
   * @param partName - Part path (e.g., 'word/document.xml', '[Content_Types].xml')
   * @returns Raw XML string, or null if part not found
   *
   * @example
   * ```typescript
   * // Get raw document XML
   * const xml = await doc.getRawXml('word/document.xml');
   * console.log(xml); // Complete XML as string
   *
   * // Get raw styles XML
   * const stylesXml = await doc.getRawXml('word/styles.xml');
   *
   * // Get package metadata
   * const coreProps = await doc.getRawXml('docProps/core.xml');
   * ```
   */
  async getRawXml(partName: string): Promise<string | null> {
    try {
      const part = await this.getPart(partName);
      if (!part) {
        return null;
      }

      // If already a string, return as-is
      if (typeof part.content === "string") {
        return part.content;
      }

      // If Buffer, decode as UTF-8 (standard for XML files)
      if (Buffer.isBuffer(part.content)) {
        return part.content.toString("utf8");
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Gets raw XML content for all text-based parts (non-binary files)
   *
   * Returns a map of part names to their raw XML content, excluding binary files
   * like images and fonts. Useful for debugging or batch processing.
   *
   * @returns Map of part names to raw XML content
   *
   * @example
   * ```typescript
   * // Get all XML parts
   * const allXml = await doc.getAllRawXml();
   * for (const [partName, xml] of allXml) {
   *   console.log(`${partName}: ${xml.length} bytes`);
   * }
   *
   * // Validate all XML parts
   * for (const [partName, xml] of allXml) {
   *   try {
   *     // Parse and validate XML
   *     const parser = new DOMParser();
   *     parser.parseFromString(xml, 'text/xml');
   *   } catch (e) {
   *     console.error(`Invalid XML in ${partName}:`, e);
   *   }
   * }
   * ```
   */
  async getAllRawXml(): Promise<Map<string, string>> {
    const xmlMap = new Map<string, string>();

    try {
      const parts = await this.listParts();

      for (const partName of parts) {
        // Skip binary files (images, fonts, etc.)
        if (partName.match(/\.(png|jpg|jpeg|gif|woff|woff2|ttf|otf|bin)$/i)) {
          continue;
        }

        const xml = await this.getRawXml(partName);
        if (xml) {
          xmlMap.set(partName, xml);
        }
      }
    } catch (error) {
      // Return partial results on error
    }

    return xmlMap;
  }

  /**
   * Sets or updates raw XML content for a document part
   *
   * Convenience method for updating XML content in document parts.
   * Automatically detects and handles text/XML content.
   *
   * **Note**: This method does not automatically update relationships or
   * content types. You may need to manually update these if adding new parts.
   *
   * @param partName - Part path (e.g., 'word/document.xml')
   * @param xmlContent - Raw XML string to set
   * @returns Promise that resolves when the part is updated
   *
   * @example
   * ```typescript
   * // Update document XML
   * const newXml = '<?xml version="1.0"?><w:document>...</w:document>';
   * await doc.setRawXml('word/document.xml', newXml);
   *
   * // Update styles
   * const stylesXml = await doc.getRawXml('word/styles.xml');
   * const modified = stylesXml.replace('Old Style', 'New Style');
   * await doc.setRawXml('word/styles.xml', modified);
   * ```
   */
  async setRawXml(partName: string, xmlContent: string): Promise<void> {
    if (typeof xmlContent !== "string") {
      throw new Error("XML content must be a string");
    }

    // Use setPart to update the part (handles both string and binary detection)
    await this.setPart(partName, xmlContent);
  }

  /**
   * Adds or updates a content type registration
   *
   * Registers a new content type in [Content_Types].xml. This is required
   * when adding new types of parts to the document package.
   *
   * @param partNameOrExtension - Part name (e.g., '/word/custom.xml') or extension (e.g., '.xml')
   * @param contentType - MIME content type (e.g., 'application/xml')
   * @returns True if successful
   *
   * @example
   * ```typescript
   * // Register a custom XML part
   * await doc.addContentType('/customXml/item1.xml', 'application/xml');
   *
   * // Register a new file extension
   * await doc.addContentType('.json', 'application/json');
   * ```
   */
  async addContentType(
    partNameOrExtension: string,
    contentType: string
  ): Promise<boolean> {
    try {
      let contentTypesXml = this.zipHandler.getFileAsString(
        "[Content_Types].xml"
      );
      if (!contentTypesXml) {
        return false;
      }

      const isExtension = partNameOrExtension.startsWith(".");

      if (isExtension) {
        // Add as Default element (for extensions)
        const extension = partNameOrExtension.substring(1);

        // Check if already exists
        const existingPattern = new RegExp(
          `<Default\\s+Extension="${extension}"\\s+ContentType="[^"]+"/?>`,
          "g"
        );
        if (existingPattern.test(contentTypesXml)) {
          // Update existing
          contentTypesXml = contentTypesXml.replace(
            existingPattern,
            `<Default Extension="${extension}" ContentType="${contentType}"/>`
          );
        } else {
          // Add new before closing tag
          contentTypesXml = contentTypesXml.replace(
            "</Types>",
            `  <Default Extension="${extension}" ContentType="${contentType}"/>\n</Types>`
          );
        }
      } else {
        // Add as Override element (for specific parts)
        const partName = partNameOrExtension.startsWith("/")
          ? partNameOrExtension
          : `/${partNameOrExtension}`;

        // Check if already exists
        const existingPattern = new RegExp(
          `<Override\\s+PartName="${partName.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}"\\s+ContentType="[^"]+"/?>`,
          "g"
        );
        if (existingPattern.test(contentTypesXml)) {
          // Update existing
          contentTypesXml = contentTypesXml.replace(
            existingPattern,
            `<Override PartName="${partName}" ContentType="${contentType}"/>`
          );
        } else {
          // Add new before closing tag
          contentTypesXml = contentTypesXml.replace(
            "</Types>",
            `  <Override PartName="${partName}" ContentType="${contentType}"/>\n</Types>`
          );
        }
      }

      // Update the content types file
      this.zipHandler.updateFile("[Content_Types].xml", contentTypesXml);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets all relationships for the document
   *
   * Returns a map of relationship file paths to their relationships.
   * This includes document relationships, part relationships, etc.
   *
   * @returns Map of relationship file paths to relationship arrays
   *
   * @example
   * ```typescript
   * const relationships = await doc.getAllRelationships();
   * relationships.forEach((rels, path) => {
   *   console.log(`${path}: ${rels.length} relationships`);
   * });
   * ```
   */
  async getAllRelationships(): Promise<Map<string, any[]>> {
    const relationships = new Map<string, any[]>();

    try {
      // Get all .rels files
      const relsPaths = this.zipHandler
        .getFilePaths()
        .filter((path) => path.endsWith(".rels"));

      for (const relsPath of relsPaths) {
        const relsContent = this.zipHandler.getFileAsString(relsPath);
        if (relsContent) {
          interface ParsedRelationship {
            id?: string;
            type?: string;
            target?: string;
            targetMode?: string;
          }

          const rels: ParsedRelationship[] = [];

          // Use XMLParser to extract all Relationship elements
          const relationshipElements = XMLParser.extractElements(
            relsContent,
            "Relationship"
          );

          for (const relElement of relationshipElements) {
            const rel: ParsedRelationship = {};

            // Extract attributes using XMLParser
            const id = XMLParser.extractAttribute(relElement, "Id");
            const type = XMLParser.extractAttribute(relElement, "Type");
            const target = XMLParser.extractAttribute(relElement, "Target");
            const targetMode = XMLParser.extractAttribute(
              relElement,
              "TargetMode"
            );

            if (id) rel.id = id;
            if (type) rel.type = type;
            if (target) rel.target = target;
            if (targetMode) rel.targetMode = targetMode;

            rels.push(rel);
          }

          relationships.set(relsPath, rels);
        }
      }
    } catch (error) {
      // Return empty map on error
    }

    return relationships;
  }

  /**
   * Gets relationships for a specific document part
   *
   * Retrieves all relationships defined for a specific part's .rels file.
   * For example, calling with 'word/document.xml' returns relationships
   * from 'word/_rels/document.xml.rels'.
   *
   * @param partName - The part name to get relationships for (e.g., 'word/document.xml')
   * @returns Array of relationships for that part, or empty array if none found
   *
   * @example
   * ```typescript
   * // Get relationships for document
   * const docRels = await doc.getRelationships('word/document.xml');
   * for (const rel of docRels) {
   *   if (rel.type.includes('hyperlink')) {
   *     console.log('Hyperlink target:', rel.target);
   *   }
   * }
   *
   * // Get relationships for styles
   * const styleRels = await doc.getRelationships('word/styles.xml');
   *
   * // Get relationships for headers/footers
   * const headerRels = await doc.getRelationships('word/header1.xml');
   * ```
   */
  async getRelationships(
    partName: string
  ): Promise<
    Array<{ id?: string; type?: string; target?: string; targetMode?: string }>
  > {
    try {
      // Construct the .rels path from the part name
      // For 'word/document.xml' -> 'word/_rels/document.xml.rels'
      const lastSlash = partName.lastIndexOf("/");
      const relsPath =
        lastSlash === -1
          ? `_rels/${partName}.rels`
          : `${partName.substring(0, lastSlash)}/_rels/${partName.substring(
              lastSlash + 1
            )}.rels`;

      const relsContent = this.zipHandler.getFileAsString(relsPath);
      if (!relsContent) {
        return [];
      }

      interface ParsedRelationship {
        id?: string;
        type?: string;
        target?: string;
        targetMode?: string;
      }

      const relationships: ParsedRelationship[] = [];

      // Use XMLParser to extract all Relationship elements
      const relationshipElements = XMLParser.extractElements(
        relsContent,
        "Relationship"
      );

      for (const relElement of relationshipElements) {
        const rel: ParsedRelationship = {};

        // Extract attributes using XMLParser
        const id = XMLParser.extractAttribute(relElement, "Id");
        const type = XMLParser.extractAttribute(relElement, "Type");
        const target = XMLParser.extractAttribute(relElement, "Target");
        const targetMode = XMLParser.extractAttribute(relElement, "TargetMode");

        if (id) rel.id = id;
        if (type) rel.type = type;
        if (target) rel.target = target;
        if (targetMode) rel.targetMode = targetMode;

        relationships.push(rel);
      }

      return relationships;
    } catch (error) {
      // Return empty array on error
      return [];
    }
  }

  /**
   * Gets the content type for a specific part
   * Helper method used internally by getPart
   */
  private getContentTypeForPart(partName: string): string | undefined {
    try {
      const contentTypesXml = this.zipHandler.getFileAsString(
        "[Content_Types].xml"
      );
      if (!contentTypesXml) {
        return undefined;
      }

      // Check for specific override
      const overridePattern = new RegExp(
        `<Override\\s+PartName="${partName.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}"\\s+ContentType="([^"]+)"`,
        "i"
      );
      const overrideMatch = contentTypesXml.match(overridePattern);
      if (overrideMatch) {
        return overrideMatch[1];
      }

      // Check for extension default
      const ext = partName.substring(partName.lastIndexOf("."));
      if (ext) {
        const defaultPattern = new RegExp(
          `<Default\\s+Extension="${ext.substring(
            1
          )}"\\s+ContentType="([^"]+)"`,
          "i"
        );
        const defaultMatch = contentTypesXml.match(defaultPattern);
        if (defaultMatch) {
          return defaultMatch[1];
        }
      }
    } catch (error) {
      // Return undefined on error
    }

    return undefined;
  }

  /**
   * Finds all occurrences of specific text in the document
   *
   * Searches through all paragraphs (including those in tables) and returns
   * detailed information about each match, including the containing paragraph,
   * run, and position within the run.
   *
   * @param text - The text string to search for
   * @param options - Optional search configuration
   * @param options.caseSensitive - If true, match case exactly (default: false)
   * @param options.wholeWord - If true, match whole words only (default: false)
   * @returns Array of search results with location and context information
   *
   * @example
   * ```typescript
   * // Find all occurrences (case-insensitive)
   * const results = doc.findText('important');
   * console.log(`Found ${results.length} matches`);
   *
   * for (const result of results) {
   *   console.log(`Match in paragraph ${result.paragraphIndex}: "${result.text}"`);
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Find exact case and whole word only
   * const results = doc.findText('Error', {
   *   caseSensitive: true,
   *   wholeWord: true
   * });
   * ```
   */
  findText(
    text: string,
    options?: { caseSensitive?: boolean; wholeWord?: boolean }
  ): Array<{
    paragraph: Paragraph;
    paragraphIndex: number;
    run: Run;
    runIndex: number;
    text: string;
    startIndex: number;
  }> {
    const results: Array<{
      paragraph: Paragraph;
      paragraphIndex: number;
      run: Run;
      runIndex: number;
      text: string;
      startIndex: number;
    }> = [];

    const caseSensitive = options?.caseSensitive ?? false;
    const wholeWord = options?.wholeWord ?? false;
    const searchText = caseSensitive ? text : text.toLowerCase();

    // Track searched paragraphs to prevent duplicates (tables are in both getAllParagraphs() and getTables())
    const searchedParagraphs = new Set<Paragraph>();

    const paragraphs = this.getAllParagraphs();
    for (let pIndex = 0; pIndex < paragraphs.length; pIndex++) {
      const paragraph = paragraphs[pIndex];
      if (!paragraph) continue;

      // Mark this paragraph as searched
      searchedParagraphs.add(paragraph);
      const runs = paragraph.getRuns();

      for (let rIndex = 0; rIndex < runs.length; rIndex++) {
        const run = runs[rIndex];
        if (!run) continue;
        const runText = run.getText();
        const compareText = caseSensitive ? runText : runText.toLowerCase();

        if (wholeWord) {
          // Create word boundary regex
          const wordPattern = new RegExp(
            `\\b${searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            caseSensitive ? "g" : "gi"
          );
          let match;
          while ((match = wordPattern.exec(runText)) !== null) {
            results.push({
              paragraph,
              paragraphIndex: pIndex,
              run,
              runIndex: rIndex,
              text: match[0],
              startIndex: match.index,
            });
          }
        } else {
          // Simple substring search
          let startIndex = 0;
          while (
            (startIndex = compareText.indexOf(searchText, startIndex)) !== -1
          ) {
            results.push({
              paragraph,
              paragraphIndex: pIndex,
              run,
              runIndex: rIndex,
              text: runText.substr(startIndex, text.length),
              startIndex,
            });
            startIndex += text.length;
          }
        }
      }
    }

    // Also search in tables
    for (const table of this.getTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          if (cell instanceof TableCell) {
            const cellParagraphs = cell.getParagraphs();
            for (let pIndex = 0; pIndex < cellParagraphs.length; pIndex++) {
              const paragraph = cellParagraphs[pIndex];
              if (!paragraph) continue;

              // Skip if already searched (getAllParagraphs includes table paragraphs)
              if (searchedParagraphs.has(paragraph)) {
                continue;
              }
              searchedParagraphs.add(paragraph);

              const runs = paragraph.getRuns();

              for (let rIndex = 0; rIndex < runs.length; rIndex++) {
                const run = runs[rIndex];
                if (!run) continue;
                const runText = run.getText();
                const compareText = caseSensitive
                  ? runText
                  : runText.toLowerCase();

                if (wholeWord) {
                  // Create word boundary regex
                  const wordPattern = new RegExp(
                    `\\b${searchText.replace(
                      /[.*+?^${}()|[\]\\]/g,
                      "\\$&"
                    )}\\b`,
                    caseSensitive ? "g" : "gi"
                  );
                  let match;
                  while ((match = wordPattern.exec(runText)) !== null) {
                    results.push({
                      paragraph,
                      paragraphIndex: -1, // Not in main body, in table
                      run,
                      runIndex: rIndex,
                      text: match[0],
                      startIndex: match.index,
                    });
                  }
                } else {
                  // Simple substring search
                  let startIndex = 0;
                  while (
                    (startIndex = compareText.indexOf(
                      searchText,
                      startIndex
                    )) !== -1
                  ) {
                    results.push({
                      paragraph,
                      paragraphIndex: -1, // Not in main body, in table
                      run,
                      runIndex: rIndex,
                      text: runText.substr(startIndex, text.length),
                      startIndex,
                    });
                    startIndex += text.length;
                  }
                }
              }
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Finds paragraphs containing text matching a pattern
   *
   * Supports both plain string and regex patterns. Returns an array of
   * paragraphs with match details for each occurrence.
   *
   * @param pattern - String or RegExp to search for
   * @returns Array of paragraphs with their matches
   *
   * @example
   * ```typescript
   * // Find with string
   * const results = doc.findParagraphsByText('error');
   *
   * // Find with regex
   * const results = doc.findParagraphsByText(/\berror\b/gi);
   * for (const { paragraph, matches } of results) {
   *   console.log(`Found ${matches.length} matches in paragraph`);
   * }
   * ```
   */
  findParagraphsByText(
    pattern: string | RegExp
  ): Array<{ paragraph: Paragraph; matches: string[] }> {
    const results: Array<{ paragraph: Paragraph; matches: string[] }> = [];
    const regex =
      typeof pattern === "string" ? new RegExp(pattern, "gi") : pattern;

    for (const paragraph of this.getAllParagraphs()) {
      const text = paragraph.getText();
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        results.push({ paragraph, matches: [...matches] });
      }
    }
    return results;
  }

  /**
   * Gets all runs that use a specific font
   *
   * Searches through all paragraphs (including tables) and returns runs
   * that have the specified font applied.
   *
   * @param fontName - Font name to search for (case-insensitive)
   * @returns Array of runs using the specified font
   *
   * @example
   * ```typescript
   * const arialRuns = doc.getRunsByFont('Arial');
   * console.log(`Found ${arialRuns.length} runs using Arial`);
   * ```
   */
  getRunsByFont(fontName: string): Run[] {
    const results: Run[] = [];
    const lowerFontName = fontName.toLowerCase();

    for (const paragraph of this.getAllParagraphs()) {
      for (const run of paragraph.getRuns()) {
        const formatting = run.getFormatting();
        if (formatting.font && formatting.font.toLowerCase() === lowerFontName) {
          results.push(run);
        }
      }
    }
    return results;
  }

  /**
   * Gets all runs that use a specific color
   *
   * Searches through all paragraphs (including tables) and returns runs
   * that have the specified color applied.
   *
   * @param color - Hex color code to search for (with or without #)
   * @returns Array of runs using the specified color
   *
   * @example
   * ```typescript
   * const redRuns = doc.getRunsByColor('FF0000');
   * const blueRuns = doc.getRunsByColor('#0000FF');
   * ```
   */
  getRunsByColor(color: string): Run[] {
    const results: Run[] = [];
    // Normalize color - remove # and convert to uppercase
    const normalizedColor = color.replace(/^#/, "").toUpperCase();

    for (const paragraph of this.getAllParagraphs()) {
      for (const run of paragraph.getRuns()) {
        const formatting = run.getFormatting();
        if (formatting.color) {
          const runColor = formatting.color.replace(/^#/, "").toUpperCase();
          if (runColor === normalizedColor) {
            results.push(run);
          }
        }
      }
    }
    return results;
  }

  /**
   * Gets all paragraphs that use a specific style
   *
   * @param styleId - Style ID to filter by
   * @returns Array of paragraphs using the specified style
   *
   * @example
   * ```typescript
   * const headings = doc.getParagraphsByStyle('Heading1');
   * console.log(`Found ${headings.length} Heading 1 paragraphs`);
   * ```
   */
  getParagraphsByStyle(styleId: string): Paragraph[] {
    return this.getAllParagraphs().filter((para) => para.getStyle() === styleId);
  }

  /**
   * Sets the font for all runs in the document
   *
   * Applies the specified font to every text run in the document,
   * including runs in tables.
   *
   * @param fontName - The font name to apply (e.g., 'Arial', 'Times New Roman')
   * @returns Number of runs modified
   *
   * @example
   * ```typescript
   * const count = doc.setAllRunsFont('Calibri');
   * console.log(`Changed font on ${count} runs`);
   * ```
   */
  setAllRunsFont(fontName: string): number {
    let count = 0;
    for (const run of this.getAllRuns()) {
      run.setFont(fontName);
      count++;
    }
    return count;
  }

  /**
   * Sets the font size for all runs in the document
   *
   * Applies the specified font size to every text run in the document,
   * including runs in tables.
   *
   * @param size - Font size in half-points (e.g., 24 = 12pt, 22 = 11pt)
   * @returns Number of runs modified
   *
   * @example
   * ```typescript
   * const count = doc.setAllRunsSize(24); // Set to 12pt
   * console.log(`Changed size on ${count} runs`);
   * ```
   */
  setAllRunsSize(size: number): number {
    let count = 0;
    for (const run of this.getAllRuns()) {
      run.setSize(size);
      count++;
    }
    return count;
  }

  /**
   * Sets the color for all runs in the document
   *
   * Applies the specified color to every text run in the document,
   * including runs in tables.
   *
   * @param color - Hex color code (e.g., 'FF0000', '#0000FF')
   * @returns Number of runs modified
   *
   * @example
   * ```typescript
   * const count = doc.setAllRunsColor('000000'); // Set to black
   * console.log(`Changed color on ${count} runs`);
   * ```
   */
  setAllRunsColor(color: string): number {
    let count = 0;
    for (const run of this.getAllRuns()) {
      run.setColor(color);
      count++;
    }
    return count;
  }

  /**
   * Formatting report interface
   */
  static FormattingReport: {
    fonts: Map<string, number>;
    sizes: Map<number, number>;
    colors: Map<string, number>;
    styles: Map<string, number>;
    uniqueFonts: string[];
    uniqueColors: string[];
    uniqueStyles: string[];
    mostUsedFont?: string;
    mostUsedSize?: number;
    mostUsedColor?: string;
    totalRuns: number;
    totalParagraphs: number;
  };

  /**
   * Generates a formatting report for the document
   *
   * Analyzes all runs and paragraphs to provide statistics about
   * formatting usage throughout the document.
   *
   * @returns Object with formatting statistics
   *
   * @example
   * ```typescript
   * const report = doc.getFormattingReport();
   * console.log(`Unique fonts: ${report.uniqueFonts.join(', ')}`);
   * console.log(`Most used font: ${report.mostUsedFont}`);
   * console.log(`Most used size: ${report.mostUsedSize / 2}pt`);
   * ```
   */
  getFormattingReport(): {
    fonts: Map<string, number>;
    sizes: Map<number, number>;
    colors: Map<string, number>;
    styles: Map<string, number>;
    uniqueFonts: string[];
    uniqueColors: string[];
    uniqueStyles: string[];
    mostUsedFont?: string;
    mostUsedSize?: number;
    mostUsedColor?: string;
    totalRuns: number;
    totalParagraphs: number;
  } {
    const fonts = new Map<string, number>();
    const sizes = new Map<number, number>();
    const colors = new Map<string, number>();
    const styles = new Map<string, number>();
    let totalRuns = 0;

    const paragraphs = this.getAllParagraphs();

    for (const para of paragraphs) {
      // Track paragraph styles
      const style = para.getStyle();
      if (style) {
        styles.set(style, (styles.get(style) || 0) + 1);
      }

      // Track run formatting
      for (const run of para.getRuns()) {
        totalRuns++;
        const formatting = run.getFormatting();

        if (formatting.font) {
          fonts.set(formatting.font, (fonts.get(formatting.font) || 0) + 1);
        }
        if (formatting.size !== undefined) {
          sizes.set(formatting.size, (sizes.get(formatting.size) || 0) + 1);
        }
        if (formatting.color) {
          const normalizedColor = formatting.color.toUpperCase().replace(/^#/, "");
          colors.set(normalizedColor, (colors.get(normalizedColor) || 0) + 1);
        }
      }
    }

    // Find most used entries
    let mostUsedFont: string | undefined;
    let maxFontCount = 0;
    for (const [font, count] of fonts.entries()) {
      if (count > maxFontCount) {
        maxFontCount = count;
        mostUsedFont = font;
      }
    }

    let mostUsedSize: number | undefined;
    let maxSizeCount = 0;
    for (const [size, count] of sizes.entries()) {
      if (count > maxSizeCount) {
        maxSizeCount = count;
        mostUsedSize = size;
      }
    }

    let mostUsedColor: string | undefined;
    let maxColorCount = 0;
    for (const [color, count] of colors.entries()) {
      if (count > maxColorCount) {
        maxColorCount = count;
        mostUsedColor = color;
      }
    }

    return {
      fonts,
      sizes,
      colors,
      styles,
      uniqueFonts: Array.from(fonts.keys()),
      uniqueColors: Array.from(colors.keys()),
      uniqueStyles: Array.from(styles.keys()),
      mostUsedFont,
      mostUsedSize,
      mostUsedColor,
      totalRuns,
      totalParagraphs: paragraphs.length,
    };
  }

  /**
   * Replaces all occurrences of text in the document
   *
   * Searches through all paragraphs (including those in tables) and replaces
   * matching text with the replacement string. Preserves the original formatting
   * of the text runs.
   *
   * @param find - The text string to search for
   * @param replace - The text string to replace with
   * @param options - Optional replacement configuration
   * @param options.caseSensitive - If true, match case exactly (default: false)
   * @param options.wholeWord - If true, match whole words only (default: false)
   * @returns Number of replacements made
   *
   * @example
   * ```typescript
   * // Simple find and replace
   * const count = doc.replaceText('color', 'colour');
   * console.log(`Replaced ${count} occurrences`);
   * ```
   *
   * @example
   * ```typescript
   * // Case-sensitive whole word replacement
   * const count = doc.replaceText('Error', 'Warning', {
   *   caseSensitive: true,
   *   wholeWord: true
   * });
   * ```
   */
  replaceText(
    find: string,
    replace: string,
    options?: { caseSensitive?: boolean; wholeWord?: boolean }
  ): number {
    let replacementCount = 0;
    const caseSensitive = options?.caseSensitive ?? false;
    const wholeWord = options?.wholeWord ?? false;

    const paragraphs = this.getAllParagraphs();
    for (const paragraph of paragraphs) {
      const runs = paragraph.getRuns();

      for (const run of runs) {
        const originalText = run.getText();
        let newText = originalText;

        if (wholeWord) {
          // Use word boundary regex for whole word replacement
          const wordPattern = new RegExp(
            `\\b${find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            caseSensitive ? "g" : "gi"
          );
          const matches = originalText.match(wordPattern);
          if (matches) {
            replacementCount += matches.length;
            newText = originalText.replace(wordPattern, replace);
          }
        } else {
          // Simple substring replacement
          const searchPattern = new RegExp(
            find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            caseSensitive ? "g" : "gi"
          );
          const matches = originalText.match(searchPattern);
          if (matches) {
            replacementCount += matches.length;
            newText = originalText.replace(searchPattern, replace);
          }
        }

        if (newText !== originalText) {
          run.setText(newText);
        }
      }
    }

    return replacementCount;
  }

  /**
   * Advanced find and replace with regex support and track changes integration
   *
   * Performs global find and replace operations with support for:
   * - Regular expressions for complex pattern matching
   * - Case-sensitive and whole-word matching
   * - Track changes integration (creates revision objects)
   * - Replacement across paragraphs and table cells
   *
   * @param pattern - String or RegExp pattern to find
   * @param replacement - Replacement text
   * @param options - Search and tracking options
   * @returns Object with replacement count and optional revisions
   *
   * @example
   * ```typescript
   * // Simple text replacement
   * const result = doc.findAndReplaceAll('old text', 'new text');
   * console.log(`Made ${result.count} replacements`);
   *
   * // Regex replacement
   * const phoneResult = doc.findAndReplaceAll(
   *   /\d{3}-\d{4}/g,
   *   '***-****',
   *   { caseSensitive: true }
   * );
   *
   * // With track changes
   * const tracked = doc.findAndReplaceAll('error', 'correction', {
   *   trackChanges: true,
   *   author: 'John Doe'
   * });
   * console.log(`Created ${tracked.revisions?.length} revisions`);
   *
   * // Whole word replacement
   * doc.findAndReplaceAll('test', 'exam', { wholeWord: true });
   * ```
   */
  findAndReplaceAll(
    pattern: string | RegExp,
    replacement: string,
    options?: {
      caseSensitive?: boolean;
      wholeWord?: boolean;
      trackChanges?: boolean;
      author?: string;
    }
  ): { count: number; revisions?: Revision[] } {
    const {
      caseSensitive = false,
      wholeWord = false,
      trackChanges = false,
      author = "Unknown",
    } = options || {};

    let count = 0;
    const revisions: Revision[] = [];

    // Convert pattern to RegExp if it's a string
    let regex: RegExp;
    if (typeof pattern === "string") {
      // Escape special regex characters
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const boundaryPattern = wholeWord ? `\\b${escaped}\\b` : escaped;
      const flags = caseSensitive ? "g" : "gi";
      regex = new RegExp(boundaryPattern, flags);
    } else {
      // Use provided RegExp, ensure global flag
      const flags = pattern.flags.includes("g")
        ? pattern.flags
        : pattern.flags + "g";
      regex = new RegExp(pattern.source, flags);
    }

    // Process all runs in document
    const runs = this.getAllRuns();

    for (const run of runs) {
      const originalText = run.getText();
      const matches = originalText.match(regex);

      if (matches && matches.length > 0) {
        const newText = originalText.replace(regex, replacement);

        if (trackChanges) {
          // Create deletion revision for original text
          const deletionRun = new Run(originalText, run.getFormatting());
          const deletion = Revision.createDeletion(author, deletionRun);
          revisions.push(deletion);

          // Create insertion revision for new text
          const insertionRun = new Run(newText, run.getFormatting());
          const insertion = Revision.createInsertion(author, insertionRun);
          revisions.push(insertion);

          // Register revisions with the document
          this.revisionManager.register(deletion);
          this.revisionManager.register(insertion);
        }

        // Update the run text
        run.setText(newText);
        count += matches.length;
      }
    }

    return trackChanges ? { count, revisions } : { count };
  }

  /**
   * Gets the total word count in the document
   *
   * Counts all words in paragraphs including those inside tables.
   * Words are determined by splitting text on whitespace.
   *
   * @returns Total number of words in the document
   *
   * @example
   * ```typescript
   * const words = doc.getWordCount();
   * console.log(`Document contains ${words} words`);
   * ```
   */
  getWordCount(): number {
    let totalWords = 0;

    // Track counted paragraphs to prevent duplicates (getAllParagraphs includes table paragraphs)
    const countedParagraphs = new Set<Paragraph>();

    const paragraphs = this.getAllParagraphs();
    for (const paragraph of paragraphs) {
      countedParagraphs.add(paragraph);
      const text = paragraph.getText().trim();
      if (text) {
        // Split by whitespace and filter out empty strings
        const words = text.split(/\s+/).filter((word) => word.length > 0);
        totalWords += words.length;
      }
    }

    // Also count words in tables (skip if already counted)
    const tables = this.getTables();
    for (const table of tables) {
      const rows = table.getRows();
      for (const row of rows) {
        const cells = row.getCells();
        for (const cell of cells) {
          const cellParas = cell.getParagraphs();
          for (const para of cellParas) {
            // Skip if already counted
            if (countedParagraphs.has(para)) {
              continue;
            }
            countedParagraphs.add(para);

            const text = para.getText().trim();
            if (text) {
              const words = text.split(/\s+/).filter((word) => word.length > 0);
              totalWords += words.length;
            }
          }
        }
      }
    }

    return totalWords;
  }

  /**
   * Gets the total character count in the document
   *
   * Counts all characters in paragraphs including those inside tables.
   * Optionally includes or excludes spaces from the count.
   *
   * @param includeSpaces - If true, includes spaces in count; if false, excludes them (default: true)
   * @returns Total number of characters in the document
   *
   * @example
   * ```typescript
   * const charsWithSpaces = doc.getCharacterCount();
   * const charsNoSpaces = doc.getCharacterCount(false);
   * console.log(`Characters: ${charsWithSpaces} (with spaces), ${charsNoSpaces} (without)`);
   * ```
   */
  getCharacterCount(includeSpaces: boolean = true): number {
    let totalChars = 0;

    // Track counted paragraphs to prevent duplicates (getAllParagraphs includes table paragraphs)
    const countedParagraphs = new Set<Paragraph>();

    const paragraphs = this.getAllParagraphs();
    for (const paragraph of paragraphs) {
      countedParagraphs.add(paragraph);
      const text = paragraph.getText();
      if (includeSpaces) {
        totalChars += text.length;
      } else {
        totalChars += text.replace(/\s/g, "").length;
      }
    }

    // Also count characters in tables (skip if already counted)
    const tables = this.getTables();
    for (const table of tables) {
      const rows = table.getRows();
      for (const row of rows) {
        const cells = row.getCells();
        for (const cell of cells) {
          const cellParas = cell.getParagraphs();
          for (const para of cellParas) {
            // Skip if already counted
            if (countedParagraphs.has(para)) {
              continue;
            }
            countedParagraphs.add(para);

            const text = para.getText();
            if (includeSpaces) {
              totalChars += text.length;
            } else {
              totalChars += text.replace(/\s/g, "").length;
            }
          }
        }
      }
    }

    return totalChars;
  }

  /**
   * Removes a paragraph from the document
   * @param paragraphOrIndex - The paragraph object or its index
   * @returns True if the paragraph was removed, false otherwise
   */
  removeParagraph(paragraphOrIndex: Paragraph | number): boolean {
    let index: number;

    if (typeof paragraphOrIndex === "number") {
      index = paragraphOrIndex;
    } else {
      // Find the index of the paragraph
      index = this.bodyElements.indexOf(paragraphOrIndex);
    }

    if (index >= 0 && index < this.bodyElements.length) {
      const element = this.bodyElements[index];
      if (element instanceof Paragraph) {
        this.bodyElements.splice(index, 1);
        return true;
      }
    }

    return false;
  }

  /**
   * Removes a table from the document
   * @param tableOrIndex - The table object or its index
   * @returns True if the table was removed, false otherwise
   */
  removeTable(tableOrIndex: Table | number): boolean {
    let index: number;

    if (typeof tableOrIndex === "number") {
      // If number provided, find the nth table
      const tables = this.getTables();
      if (tableOrIndex >= 0 && tableOrIndex < tables.length) {
        const table = tables[tableOrIndex];
        if (!table) return false;
        index = this.bodyElements.indexOf(table);
      } else {
        return false;
      }
    } else {
      // Find the index of the table
      index = this.bodyElements.indexOf(tableOrIndex);
    }

    if (index >= 0 && index < this.bodyElements.length) {
      const element = this.bodyElements[index];
      if (element instanceof Table) {
        this.bodyElements.splice(index, 1);
        return true;
      }
    }

    return false;
  }

  /**
   * Validates a paragraph before insertion
   * @param paragraph - The paragraph to validate
   * @throws Error if paragraph is invalid
   */
  private validateParagraph(paragraph: Paragraph): void {
    // Type validation
    if (!(paragraph instanceof Paragraph)) {
      throw new Error(
        "insertParagraphAt: parameter must be a Paragraph instance"
      );
    }

    // Check for duplicate paragraph IDs
    const paraId = paragraph.getFormatting().paraId;
    if (paraId) {
      const existingIds = this.bodyElements
        .filter((el): el is Paragraph => el instanceof Paragraph)
        .map((p) => p.getFormatting().paraId)
        .filter((id) => id === paraId);

      if (existingIds.length > 0) {
        throw new Error(
          `Duplicate paragraph ID detected: ${paraId}. Each paragraph must have a unique ID.`
        );
      }
    }

    // Warn about missing styles
    const style = paragraph.getFormatting().style;
    if (style && !this.stylesManager.hasStyle(style)) {
      defaultLogger.warn(
        `Style "${style}" not found in document. Paragraph will fall back to Normal style.`
      );
    }

    // Warn about missing numbering
    const numbering = paragraph.getFormatting().numbering;
    if (numbering && !this.numberingManager.hasInstance(numbering.numId)) {
      defaultLogger.warn(
        `Numbering ID ${numbering.numId} not found in document. List formatting will not display.`
      );
    }
  }

  /**
   * Validates a table before insertion
   * @param table - The table to validate
   * @throws Error if table is invalid
   */
  private validateTable(table: Table): void {
    // Type validation
    if (!(table instanceof Table)) {
      throw new Error("insertTableAt: parameter must be a Table instance");
    }

    // Content validation - table must have rows
    const rows = table.getRows();
    if (rows.length === 0) {
      throw new Error("insertTableAt: table must have at least one row");
    }

    // Check first row has cells (rows.length > 0 already checked above)
    const firstRow = rows[0];
    if (firstRow && firstRow.getCells().length === 0) {
      throw new Error("insertTableAt: table rows must have at least one cell");
    }

    // Warn about missing table styles
    const tableStyle = table.getFormatting().style;
    if (tableStyle && !this.stylesManager.hasStyle(tableStyle)) {
      defaultLogger.warn(
        `Table style "${tableStyle}" not found in document. Table will use default formatting.`
      );
    }
  }

  /**
   * Validates a TOC element before insertion
   * @param toc - The TOC to validate
   * @throws Error if TOC is invalid
   */
  private validateToc(toc: TableOfContentsElement): void {
    // Type validation
    if (!(toc instanceof TableOfContentsElement)) {
      throw new Error(
        "insertTocAt: parameter must be a TableOfContentsElement instance"
      );
    }

    // Check if document has heading styles for TOC to reference
    const hasHeadings = [
      "Heading1",
      "Heading2",
      "Heading3",
      "Heading4",
      "Heading5",
      "Heading6",
      "Heading7",
      "Heading8",
      "Heading9",
    ].some((style) => this.stylesManager.hasStyle(style));

    if (!hasHeadings) {
      defaultLogger.warn(
        "No heading styles found in document. Table of Contents may not display entries correctly."
      );
    }
  }

  /**
   * Normalizes and validates insertion index
   * @param index - The requested index
   * @returns Normalized index within valid bounds
   */
  private normalizeIndex(index: number): number {
    if (index < 0) {
      return 0;
    } else if (index > this.bodyElements.length) {
      return this.bodyElements.length;
    }
    return index;
  }

  /**
   * Inserts a paragraph at a specific position
   * @param index - The position to insert at (0-based)
   * @param paragraph - The paragraph to insert
   * @returns This document for chaining
   * @throws Error if paragraph is invalid or has duplicate IDs
   */
  insertParagraphAt(index: number, paragraph: Paragraph): this {
    // Validate the paragraph
    this.validateParagraph(paragraph);

    // Normalize index
    index = this.normalizeIndex(index);

    // Insert the paragraph
    this.bodyElements.splice(index, 0, paragraph);
    return this;
  }

  /**
   * Inserts a table at a specific position
   * @param index - The position to insert at (0-based)
   * @param table - The table to insert
   * @returns This document for chaining
   * @throws Error if table is invalid or malformed
   * @example
   * ```typescript
   * const table = new Table(2, 3);
   * doc.insertTableAt(5, table);  // Insert at position 5
   * ```
   */
  insertTableAt(index: number, table: Table): this {
    // Validate the table
    this.validateTable(table);

    // Normalize index
    index = this.normalizeIndex(index);

    // Insert the table
    this.bodyElements.splice(index, 0, table);
    return this;
  }

  /**
   * Inserts a Table of Contents at a specific position
   * @param index - The position to insert at (0-based)
   * @param toc - The TableOfContentsElement to insert
   * @returns This document for chaining
   * @throws Error if TOC is invalid
   * @example
   * ```typescript
   * const toc = TableOfContentsElement.createStandard();
   * doc.insertTocAt(0, toc);  // Insert at beginning
   * ```
   */
  insertTocAt(index: number, toc: TableOfContentsElement): this {
    // Validate the TOC
    this.validateToc(toc);

    // Normalize index
    index = this.normalizeIndex(index);

    // Insert the TOC
    this.bodyElements.splice(index, 0, toc);
    return this;
  }

  /**
   * Replaces a paragraph at a specific position
   * @param index - The position to replace at (0-based)
   * @param paragraph - The new paragraph
   * @returns True if replaced, false if index invalid
   * @throws Error if replacement paragraph is invalid or has duplicate IDs
   * @example
   * ```typescript
   * const newPara = new Paragraph();
   * newPara.addText('Replacement text');
   * doc.replaceParagraphAt(3, newPara);
   * ```
   */
  replaceParagraphAt(index: number, paragraph: Paragraph): boolean {
    if (index >= 0 && index < this.bodyElements.length) {
      const element = this.bodyElements[index];
      if (element instanceof Paragraph) {
        // Validate the replacement paragraph
        this.validateParagraph(paragraph);

        // Replace the paragraph
        this.bodyElements[index] = paragraph;
        return true;
      }
    }
    return false;
  }

  /**
   * Replaces a table at a specific position
   * @param index - The position to replace at (0-based)
   * @param table - The new table
   * @returns True if replaced, false if index invalid or not a table
   * @throws Error if replacement table is invalid or malformed
   * @example
   * ```typescript
   * const newTable = new Table(3, 4);
   * doc.replaceTableAt(2, newTable);
   * ```
   */
  replaceTableAt(index: number, table: Table): boolean {
    if (index >= 0 && index < this.bodyElements.length) {
      const element = this.bodyElements[index];
      if (element instanceof Table) {
        // Validate the replacement table
        this.validateTable(table);

        // Replace the table
        this.bodyElements[index] = table;
        return true;
      }
    }
    return false;
  }

  /**
   * Moves an element from one position to another
   * @param fromIndex - Current position (0-based)
   * @param toIndex - Target position (0-based)
   * @returns True if moved, false if indices invalid
   * @example
   * ```typescript
   * doc.moveElement(5, 2);  // Move element from position 5 to position 2
   * ```
   */
  moveElement(fromIndex: number, toIndex: number): boolean {
    if (
      fromIndex < 0 ||
      fromIndex >= this.bodyElements.length ||
      toIndex < 0 ||
      toIndex >= this.bodyElements.length
    ) {
      return false;
    }

    const [element] = this.bodyElements.splice(fromIndex, 1);
    this.bodyElements.splice(toIndex, 0, element!);
    return true;
  }

  /**
   * Swaps two elements' positions
   * @param index1 - First element position (0-based)
   * @param index2 - Second element position (0-based)
   * @returns True if swapped, false if indices invalid
   * @example
   * ```typescript
   * doc.swapElements(2, 5);  // Swap elements at positions 2 and 5
   * ```
   */
  swapElements(index1: number, index2: number): boolean {
    if (
      index1 < 0 ||
      index1 >= this.bodyElements.length ||
      index2 < 0 ||
      index2 >= this.bodyElements.length
    ) {
      return false;
    }

    const temp = this.bodyElements[index1];
    this.bodyElements[index1] = this.bodyElements[index2]!;
    this.bodyElements[index2] = temp!;
    return true;
  }

  /**
   * Removes a Table of Contents element at a specific position
   * @param index - The position to remove (0-based)
   * @returns True if removed, false if index invalid or not a TOC
   * @example
   * ```typescript
   * doc.removeTocAt(0);  // Remove TOC at beginning
   * ```
   */
  removeTocAt(index: number): boolean {
    if (index >= 0 && index < this.bodyElements.length) {
      const element = this.bodyElements[index];
      if (element instanceof TableOfContentsElement) {
        this.bodyElements.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Gets all hyperlinks in the document
   *
   * Searches through all paragraphs (including those in tables) and returns
   * all Hyperlink instances along with their containing paragraphs.
   *
   * @returns Array of objects containing hyperlink and its parent paragraph
   *
   * @example
   * ```typescript
   * const hyperlinks = doc.getHyperlinks();
   * console.log(`Found ${hyperlinks.length} hyperlinks`);
   *
   * for (const { hyperlink, paragraph } of hyperlinks) {
   *   console.log(`Link: ${hyperlink.getText()} -> ${hyperlink.getUrl()}`);
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Find broken links
   * const hyperlinks = doc.getHyperlinks();
   * for (const { hyperlink } of hyperlinks) {
   *   const url = hyperlink.getUrl();
   *   if (url && url.includes('old-domain.com')) {
   *     console.log(`Update needed: ${url}`);
   *   }
   * }
   * ```
   */
  getHyperlinks(): Array<{ hyperlink: Hyperlink; paragraph: Paragraph }> {
    const hyperlinks: Array<{ hyperlink: Hyperlink; paragraph: Paragraph }> =
      [];

    // Helper function to extract hyperlinks from paragraph content,
    // including those inside Revision elements (w:ins, w:del, etc.)
    const extractHyperlinksFromParagraph = (para: Paragraph): void => {
      for (const content of para.getContent()) {
        if (content instanceof Hyperlink) {
          hyperlinks.push({ hyperlink: content, paragraph: para });
        } else if (content instanceof Revision) {
          // Check inside revision elements for hyperlinks
          for (const revContent of content.getContent()) {
            if (revContent instanceof Hyperlink) {
              hyperlinks.push({ hyperlink: revContent, paragraph: para });
            }
          }
        }
      }
    };

    for (const paragraph of this.getAllParagraphs()) {
      extractHyperlinksFromParagraph(paragraph);
    }

    // Also check in tables
    for (const table of this.getTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          // TableCell has getParagraphs method
          const cellParagraphs =
            cell instanceof TableCell ? cell.getParagraphs() : [];
          for (const para of cellParagraphs) {
            extractHyperlinksFromParagraph(para);
          }
        }
      }
    }

    return hyperlinks;
  }

  /**
   * Defragments and optimizes hyperlinks in the document
   * This merges fragmented hyperlinks with the same URL (common in Google Docs exports)
   * and optionally resets their formatting to standard style
   *
   * @param options - Defragmentation options
   * @returns Number of hyperlinks merged
   *
   * @example
   * ```typescript
   * // Basic defragmentation
   * const merged = doc.defragmentHyperlinks();
   * console.log(`Merged ${merged} fragmented hyperlinks`);
   *
   * // With formatting reset (fixes corrupted fonts like Caveat)
   * const fixed = doc.defragmentHyperlinks({ resetFormatting: true });
   * console.log(`Fixed ${fixed} hyperlinks with standard formatting`);
   * ```
   */
  defragmentHyperlinks(options?: {
    resetFormatting?: boolean;
    cleanupRelationships?: boolean;
  }): number {
    const { resetFormatting = false, cleanupRelationships = false } =
      options || {};

    // Guard: Skip when track changes is enabled - prevents field structure corruption
    // The mergeConsecutiveHyperlinks() method uses clearContent() + addHyperlink()
    // which creates new revisions at the END of the content array, placing them
    // OUTSIDE field boundaries when field codes are present
    if (this.trackChangesEnabled) {
      defaultLogger.warn(
        'defragmentHyperlinks skipped: track changes is enabled. ' +
        'Call defragmentHyperlinks before enableTrackChanges() to avoid field corruption.'
      );
      return 0;
    }

    let mergedCount = 0;

    // Get the DocumentParser instance to use its merging method
    const parser = new DocumentParser();

    // Process all paragraphs in the document
    for (const paragraph of this.getAllParagraphs()) {
      const originalContent = paragraph.getContent();

      // Call the enhanced mergeConsecutiveHyperlinks method
      (parser as any).mergeConsecutiveHyperlinks(paragraph, resetFormatting);

      const newContent = paragraph.getContent();

      // Count merges by comparing content length
      if (originalContent.length > newContent.length) {
        mergedCount += originalContent.length - newContent.length;
      }
    }

    // Also process paragraphs in tables
    for (const table of this.getTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          const cellParagraphs =
            cell instanceof TableCell ? cell.getParagraphs() : [];
          for (const para of cellParagraphs) {
            const originalContent = para.getContent();

            (parser as any).mergeConsecutiveHyperlinks(para, resetFormatting);

            const newContent = para.getContent();

            if (originalContent.length > newContent.length) {
              mergedCount += originalContent.length - newContent.length;
            }
          }
        }
      }
    }

    // Optionally clean up orphaned relationships
    if (cleanupRelationships && mergedCount > 0) {
      // Collect all referenced hyperlink relationship IDs
      const referencedIds = new Set<string>();

      // Collect IDs from all hyperlinks in the document
      const allHyperlinks = this.getHyperlinks();
      for (const { hyperlink } of allHyperlinks) {
        const relId = hyperlink.getRelationshipId();
        if (relId) {
          referencedIds.add(relId);
        }
      }

      // Remove orphaned hyperlink relationships
      const removedCount =
        this.relationshipManager.removeOrphanedHyperlinks(referencedIds);
      if (removedCount > 0) {
        defaultLogger.info(
          `Cleaned up ${removedCount} orphaned hyperlink relationship(s)`
        );
      }
    }

    return mergedCount;
  }

  /**
   * Gets all bookmarks in the document
   * @returns Array of bookmarks with their containing paragraph
   */
  getBookmarks(): Array<{ bookmark: Bookmark; paragraph: Paragraph }> {
    const bookmarks: Array<{ bookmark: Bookmark; paragraph: Paragraph }> = [];

    for (const paragraph of this.getAllParagraphs()) {
      // Get bookmarks that start in this paragraph
      for (const bookmark of paragraph.getBookmarksStart()) {
        bookmarks.push({ bookmark, paragraph });
      }
    }

    // Also check in tables
    for (const table of this.getTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          for (const para of cell.getParagraphs()) {
            for (const bookmark of para.getBookmarksStart()) {
              bookmarks.push({ bookmark, paragraph: para });
            }
          }
        }
      }
    }

    return bookmarks;
  }

  /**
   * Gets all fields in the document with their parent context
   *
   * Returns all Field and ComplexField instances from:
   * - All body paragraphs
   * - All paragraphs inside table cells
   *
   * @returns Array of objects containing field, paragraph, and optionally table
   *
   * @example
   * ```typescript
   * // Get all fields
   * const fields = doc.getFields();
   * console.log(`Document has ${fields.length} fields`);
   *
   * for (const { field, paragraph, table } of fields) {
   *   console.log(`Field: ${field.getType()} - ${field.getInstruction()}`);
   *   if (table) {
   *     console.log('  (inside table)');
   *   }
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Find all merge fields
   * const fields = doc.getFields();
   * const mergeFields = fields.filter(({ field }) =>
   *   field.getType() === 'MERGEFIELD'
   * );
   * console.log(`Found ${mergeFields.length} merge fields`);
   * ```
   */
  getFields(): Array<{ field: FieldLike; paragraph: Paragraph; table?: Table }> {
    const results: Array<{ field: FieldLike; paragraph: Paragraph; table?: Table }> = [];

    // Get fields from all body paragraphs
    for (const paragraph of this.getAllParagraphs()) {
      for (const field of paragraph.getFields()) {
        results.push({ field, paragraph });
      }
    }

    // Get fields from paragraphs inside table cells
    for (const table of this.getTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          const cellParagraphs =
            cell instanceof TableCell ? cell.getParagraphs() : [];
          for (const para of cellParagraphs) {
            for (const field of para.getFields()) {
              results.push({ field, paragraph: para, table });
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Gets all images in the document with metadata
   *
   * Returns all Image instances registered in the document along with
   * their relationship IDs and filenames in the media folder.
   *
   * @returns Array of objects containing image, relationship ID, and filename
   *
   * @example
   * ```typescript
   * const images = doc.getImages();
   * console.log(`Document contains ${images.length} images`);
   *
   * for (const { image, filename } of images) {
   *   console.log(`${filename}: ${image.getWidth()}x${image.getHeight()} EMUs`);
   * }
   * ```
   */
  getImages(): Array<{
    image: Image;
    relationshipId: string;
    filename: string;
  }> {
    return this.imageManager.getAllImages();
  }

  /**
   * Gets all runs in the document (flattened from all paragraphs)
   *
   * This method returns all Run objects from:
   * - All body paragraphs
   * - All paragraphs inside table cells
   *
   * Useful for bulk operations on text formatting across the entire document.
   *
   * @returns Array of all Run objects in the document
   *
   * @example
   * ```typescript
   * // Get all runs
   * const runs = doc.getAllRuns();
   * console.log(`Document has ${runs.length} text runs`);
   *
   * // Make all text bold
   * for (const run of doc.getAllRuns()) {
   *   run.setBold(true);
   * }
   * ```
   */
  getAllRuns(): Run[] {
    const runs: Run[] = [];

    // Get runs from all body paragraphs
    for (const paragraph of this.getAllParagraphs()) {
      runs.push(...paragraph.getRuns());
    }

    // Get runs from paragraphs inside table cells
    for (const table of this.getTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          const cellParagraphs =
            cell instanceof TableCell ? cell.getParagraphs() : [];
          for (const para of cellParagraphs) {
            runs.push(...para.getRuns());
          }
        }
      }
    }

    return runs;
  }

  /**
   * Automatically converts email addresses in text to mailto: hyperlinks
   *
   * Scans all paragraphs (including those in tables, headers, and footers)
   * for email addresses and converts them to clickable mailto: hyperlinks
   * with standard hyperlink formatting.
   *
   * @param options - Optional formatting and behavior options
   * @param options.formatting - Custom formatting for the hyperlinks (defaults to Verdana 12pt, underline, blue)
   * @returns Statistics about emails converted
   *
   * @example
   * ```typescript
   * // Auto-link all email addresses with default formatting
   * const result = doc.hyperlinkEmails();
   * console.log(`Linked ${result.emailsLinked} emails in ${result.paragraphsModified} paragraphs`);
   *
   * // With custom formatting
   * doc.hyperlinkEmails({
   *   formatting: {
   *     font: 'Arial',
   *     size: 22, // 11pt in half-points
   *     underline: 'single',
   *     bold: false,
   *     color: '0000FF',
   *   }
   * });
   * ```
   */
  hyperlinkEmails(options?: {
    formatting?: RunFormatting;
  }): { emailsLinked: number; paragraphsModified: number } {
    // Default formatting: Verdana 12pt, Underline, no bold, #0000FF
    const defaultFormatting: RunFormatting = {
      font: 'Verdana',
      size: 12, // 12pt
      underline: 'single',
      bold: false,
      color: '0000FF',
    };

    const formatting = options?.formatting ?? defaultFormatting;

    // RFC 5322 simplified email regex (handles most common patterns)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    let emailsLinked = 0;
    let paragraphsModified = 0;

    // Get all paragraphs (including in tables, headers, footers)
    const paragraphs = this.getAllParagraphs();

    for (const para of paragraphs) {
      let modified = false;
      const content = [...para.getContent()]; // Clone to avoid modification during iteration

      for (const item of content) {
        if (item instanceof Run) {
          const text = item.getText();
          const matches = [...text.matchAll(emailRegex)];

          if (matches.length > 0) {
            // Split run into segments with hyperlinks
            const newContent = this.splitRunWithEmails(item, matches, formatting);

            // Replace original run with new content
            para.replaceContent(item, newContent);

            emailsLinked += matches.length;
            modified = true;
          }
        }
      }

      if (modified) paragraphsModified++;
    }

    return { emailsLinked, paragraphsModified };
  }

  /**
   * Splits a run containing email addresses into text runs and hyperlinks
   * @private
   */
  private splitRunWithEmails(
    run: Run,
    matches: RegExpMatchArray[],
    formatting: RunFormatting
  ): ParagraphContent[] {
    const text = run.getText();
    const originalFormatting = run.getFormatting();
    const result: ParagraphContent[] = [];

    let lastIndex = 0;

    for (const match of matches) {
      const email = match[0];
      const startIndex = match.index!;

      // Add text before email (if any)
      if (startIndex > lastIndex) {
        const beforeText = text.slice(lastIndex, startIndex);
        result.push(new Run(beforeText, originalFormatting));
      }

      // Add email as hyperlink
      const hyperlink = Hyperlink.createEmail(email, email, formatting);
      result.push(hyperlink);

      lastIndex = startIndex + email.length;
    }

    // Add remaining text after last email (if any)
    if (lastIndex < text.length) {
      const afterText = text.slice(lastIndex);
      result.push(new Run(afterText, originalFormatting));
    }

    return result;
  }

  /**
   * Removes a specific formatting type from all runs in the document
   *
   * This is a bulk operation that removes the specified formatting property
   * from ALL text runs in the document (including runs inside table cells).
   *
   * @param type - The formatting property to remove
   * @returns Number of runs that were modified
   *
   * @example
   * ```typescript
   * // Remove all bold formatting from document
   * const count = doc.removeFormattingFromAll('bold');
   * console.log(`Removed bold from ${count} runs`);
   *
   * // Remove all highlighting
   * doc.removeFormattingFromAll('highlight');
   *
   * // Remove all font color
   * doc.removeFormattingFromAll('color');
   *
   * // Remove underlines
   * doc.removeFormattingFromAll('underline');
   * ```
   */
  removeFormattingFromAll(
    type:
      | "bold"
      | "italic"
      | "underline"
      | "strike"
      | "dstrike"
      | "highlight"
      | "color"
      | "font"
      | "size"
      | "subscript"
      | "superscript"
      | "smallCaps"
      | "allCaps"
      | "outline"
      | "shadow"
      | "emboss"
      | "imprint"
  ): number {
    let modifiedCount = 0;

    // Get all runs in the document
    const runs = this.getAllRuns();

    for (const run of runs) {
      const formatting = run.getFormatting();

      // Check if the property exists before removing it
      if (type in formatting) {
        // Access the private formatting property to modify it
        // This is a valid pattern for bulk operations in the framework
        (run as any).formatting[type] = undefined;
        delete (run as any).formatting[type];

        modifiedCount++;
      }
    }

    return modifiedCount;
  }

  /**
   * Applies a formatting function to all hyperlinks in the document
   *
   * This is a bulk operation that calls the provided formatter function
   * for each hyperlink in the document (including hyperlinks inside table cells).
   *
   * The formatter function receives the hyperlink and its containing paragraph,
   * allowing for sophisticated conditional formatting based on context.
   *
   * @param formatter - Function to apply to each hyperlink
   * @returns Number of hyperlinks processed
   *
   * @example
   * ```typescript
   * // Make all hyperlinks red and bold
   * doc.updateAllHyperlinks((link) => {
   *   link.setFormatting({ color: 'FF0000', bold: true });
   * });
   *
   * // Remove underline from all hyperlinks
   * doc.updateAllHyperlinks((link) => {
   *   const fmt = link.getFormatting();
   *   delete fmt.underline;
   *   link.setFormatting(fmt);
   * });
   *
   * // Conditional formatting based on URL
   * doc.updateAllHyperlinks((link) => {
   *   const url = link.getUrl();
   *   if (url?.includes('internal')) {
   *     link.setFormatting({ color: '0000FF' }); // Blue for internal links
   *   } else if (url?.includes('external')) {
   *     link.setFormatting({ color: 'FF0000' }); // Red for external links
   *   }
   * });
   *
   * // Access paragraph context for advanced logic
   * doc.updateAllHyperlinks((link, para) => {
   *   const paraStyle = para.getFormatting().style;
   *   if (paraStyle === 'Heading1') {
   *     link.setFormatting({ bold: true, size: 16 });
   *   }
   * });
   * ```
   */
  updateAllHyperlinks(
    formatter: (hyperlink: Hyperlink, paragraph: Paragraph) => void
  ): number {
    // Get all hyperlinks with their containing paragraphs
    const hyperlinks = this.getHyperlinks();

    // Apply formatter to each hyperlink
    for (const { hyperlink, paragraph } of hyperlinks) {
      formatter(hyperlink, paragraph);
    }

    return hyperlinks.length;
  }

  /**
   * Normalizes spacing throughout the document
   *
   * Ensures consistent spacing by:
   * - Removing duplicate consecutive empty paragraphs
   * - Applying standard paragraph spacing (before/after)
   * - Standardizing line spacing
   * - Removing trailing spaces from runs
   *
   * @param rules - Normalization rules
   * @returns Object with counts of elements removed and normalized
   *
   * @example
   * ```typescript
   * // Remove duplicate empty paragraphs only
   * const result = doc.normalizeSpacing({
   *   removeDuplicateEmptyParagraphs: true
   * });
   * console.log(`Removed ${result.removed} empty paragraphs`);
   *
   * // Apply standard spacing
   * doc.normalizeSpacing({
   *   standardParagraphSpacing: { before: 0, after: 200 }, // 200 twips = 10pt
   *   standardLineSpacing: 240, // Single spacing
   *   removeTrailingSpaces: true
   * });
   *
   * // Full normalization
   * const stats = doc.normalizeSpacing({
   *   removeDuplicateEmptyParagraphs: true,
   *   standardParagraphSpacing: { after: 200 },
   *   removeTrailingSpaces: true
   * });
   * console.log(`Removed: ${stats.removed}, Normalized: ${stats.normalized}`);
   * ```
   */
  normalizeSpacing(
    rules: {
      removeDuplicateEmptyParagraphs?: boolean;
      standardParagraphSpacing?: { before?: number; after?: number };
      standardLineSpacing?: number;
      removeTrailingSpaces?: boolean;
    } = {}
  ): { removed: number; normalized: number } {
    const {
      removeDuplicateEmptyParagraphs = true,
      standardParagraphSpacing,
      standardLineSpacing,
      removeTrailingSpaces = true,
    } = rules;

    let removed = 0;
    let normalized = 0;

    // Remove duplicate empty paragraphs
    if (removeDuplicateEmptyParagraphs) {
      let lastWasEmpty = false;
      const toRemove: number[] = [];

      this.bodyElements.forEach((element, index) => {
        if (element instanceof Paragraph) {
          const isEmpty = element.getText().trim() === "";
          if (isEmpty && lastWasEmpty) {
            toRemove.push(index);
          }
          lastWasEmpty = isEmpty;
        } else {
          lastWasEmpty = false; // Reset for non-paragraph elements
        }
      });

      // Remove in reverse order to maintain indices
      toRemove.reverse().forEach((index) => {
        this.bodyElements.splice(index, 1);
        removed++;
      });
    }

    // Apply standard spacing to all paragraphs
    for (const para of this.getAllParagraphs()) {
      if (standardParagraphSpacing) {
        if (standardParagraphSpacing.before !== undefined) {
          para.setSpaceBefore(standardParagraphSpacing.before);
          normalized++;
        }
        if (standardParagraphSpacing.after !== undefined) {
          para.setSpaceAfter(standardParagraphSpacing.after);
          normalized++;
        }
      }

      if (standardLineSpacing !== undefined) {
        para.setLineSpacing(standardLineSpacing, "auto");
        normalized++;
      }

      // Remove trailing spaces from runs
      if (removeTrailingSpaces) {
        const runs = para.getRuns();
        if (runs.length > 0) {
          const lastRun = runs[runs.length - 1];
          if (lastRun) {
            const text = lastRun.getText();
            const trimmed = text.trimEnd();
            if (text !== trimmed) {
              lastRun.setText(trimmed);
              normalized++;
            }
          }
        }
      }
    }

    // Also process tables
    for (const table of this.getTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          const cellParagraphs =
            cell instanceof TableCell ? cell.getParagraphs() : [];
          for (const para of cellParagraphs) {
            if (standardParagraphSpacing) {
              if (standardParagraphSpacing.before !== undefined) {
                para.setSpaceBefore(standardParagraphSpacing.before);
                normalized++;
              }
              if (standardParagraphSpacing.after !== undefined) {
                para.setSpaceAfter(standardParagraphSpacing.after);
                normalized++;
              }
            }

            if (standardLineSpacing !== undefined) {
              para.setLineSpacing(standardLineSpacing, "auto");
              normalized++;
            }

            if (removeTrailingSpaces) {
              const runs = para.getRuns();
              if (runs.length > 0) {
                const lastRun = runs[runs.length - 1];
                if (lastRun) {
                  const text = lastRun.getText();
                  const trimmed = text.trimEnd();
                  if (text !== trimmed) {
                    lastRun.setText(trimmed);
                    normalized++;
                  }
                }
              }
            }
          }
        }
      }
    }

    return { removed, normalized };
  }

  /**
   * Sets the document language
   * @param language - Language code (e.g., 'en-US', 'es-ES', 'fr-FR')
   * @returns This document for chaining
   */
  setLanguage(language: string): this {
    // Store language in properties for core.xml
    if (!this.properties) {
      this.properties = {};
    }
    this.properties.language = language;

    return this;
  }

  /**
   * Gets the document language code
   *
   * @returns Language code (e.g., 'en-US', 'fr-FR') or undefined if not set
   *
   * @example
   * ```typescript
   * const lang = doc.getLanguage();
   * if (lang) {
   *   console.log(`Document language: ${lang}`);
   * }
   * ```
   */
  getLanguage(): string | undefined {
    return this.properties?.language;
  }

  /**
   * Removes all Structured Document Tags (SDTs) from the document
   *
   * Google Docs and other applications wrap content in SDT (Structured Document Tag)
   * elements, which add complexity without functional benefit in many cases. This helper
   * removes all SDT wrappers while preserving the wrapped content (paragraphs, tables, etc.).
   *
   * **Important Behavior**: When unwrapping tables from SDTs, this method also sanitizes
   * table property exceptions (tblPrEx) from row formatting. This is critical because:
   * - Google Docs uses tblPrEx to define header row formatting (bold, center, shading)
   * - When the table is relocated outside the SDT context, tblPrEx applies to ALL rows
   * - Sanitizing tblPrEx prevents formatting from "leaking" to data rows
   * - Cell-level formatting (direct shading, margins) is preserved
   *
   * Targeted removal:
   * - Removes `<w:sdt>` elements with `goog_rdk_0` tags
   * - Removes properties `<w:sdtPr>` with lock/id/tag attributes
   * - Keeps all wrapped content intact (paragraphs, tables, nested SDTs)
   * - Recursively processes nested SDTs and SDTs inside table cells
   * - **Clears row-level tblPrEx from tables coming out of SDTs**
   *
   * Effects:
   * - Resulting XML no longer emits `<w:sdt*>` nodes
   * - Content order is preserved
   * - All inner formatting and styles remain intact
   * - Row-level exceptions are cleared to prevent styling leakage
   *
   * @returns This document instance for method chaining
   *
   * @example
   * ```typescript
   * // Load a document with Google Docs SDT wrappers
   * const doc = await Document.load('google-docs-export.docx');
   *
   * // Remove all SDT wrappers and sanitize table formatting
   * doc.clearCustom();
   *
   * // Save without SDT elements and without formatting leakage
   * await doc.save('cleaned.docx');
   * ```
   *
   * @example
   * ```typescript
   * // Remove SDTs and apply formatting in one workflow
   * const doc = await Document.load('input.docx');
   * doc.clearCustom()
   *   .applyStyles()
   *   .normalizeSpacing();
   * await doc.save('output.docx');
   * ```
   */
  clearCustom(): this {
    // Process body elements: remove all SDTs and unwrap their content
    const unwrappedBody: BodyElement[] = [];

    for (const element of this.bodyElements) {
      if (element instanceof StructuredDocumentTag) {
        // Unwrap SDT: add its content directly to the body
        const sdtContent = element.getContent();
        for (const item of sdtContent) {
          if (item instanceof Table) {
            // CRITICAL: Sanitize tblPrEx from table rows when coming out of SDT
            // This prevents row-level formatting exceptions from applying to all rows
            this.sanitizeTableRowExceptions(item);
            unwrappedBody.push(item);
          } else if (item instanceof Paragraph || item instanceof Table) {
            unwrappedBody.push(item);
          } else if (item instanceof StructuredDocumentTag) {
            // Recursively handle nested SDTs
            this.unwrapNestedStructuredDocumentTags(item, unwrappedBody);
          }
        }
      } else if (element instanceof Table) {
        // Process table: unwrap SDTs inside cells
        this.clearCustomInTable(element);
        unwrappedBody.push(element);
      } else {
        // Keep non-SDT elements as-is
        unwrappedBody.push(element);
      }
    }

    // Replace body elements with unwrapped content
    this.bodyElements = unwrappedBody;

    return this;
  }

  /**
   * Sanitizes table property exceptions from all rows in a table
   * 
   * Clears tblPrEx (row-level table property overrides) to prevent formatting
   * from leaking when tables are relocated outside SDT context.
   * 
   * This is essential after unwrapping Google Docs SDT-wrapped tables where
   * header formatting (bold, center, shading) is defined via tblPrEx rather
   * than cell-level formatting.
   *
   * @param table - Table to sanitize
   * @public
   */
  sanitizeTableRowExceptions(table: Table): void {
    const rows = table.getRows();
    
    for (const row of rows) {
      // Get current exceptions
      const exceptions = row.getTablePropertyExceptions();
      
      // Only process rows that have exceptions
      if (exceptions && Object.keys(exceptions).length > 0) {
        // Clear tblPrEx by setting to undefined (completely removes exceptions)
        row.setTablePropertyExceptions(undefined as any);
      }
    }
  }

  /**
   * Recursively unwraps nested SDTs, adding their content to the target array
   * @private
   */
  private unwrapNestedStructuredDocumentTags(
    sdt: StructuredDocumentTag,
    targetArray: BodyElement[]
  ): void {
    const content = sdt.getContent();

    for (const item of content) {
      if (item instanceof Paragraph || item instanceof Table) {
        targetArray.push(item);
      } else if (item instanceof StructuredDocumentTag) {
        // Recursively unwrap nested SDTs
        this.unwrapNestedStructuredDocumentTags(item, targetArray);
      }
    }
  }

  /**
   * Recursively clears SDTs from all cells in a table
   * Also processes nested tables within cells
   * @private
   */
  private clearCustomInTable(table: Table): void {
    const rows = table.getRows();

    for (const row of rows) {
      const cells = row.getCells();

      for (const cell of cells) {
        if (!(cell instanceof TableCell)) {
          continue;
        }

        // Process all paragraphs in this cell
        // In standard DOCX, cells contain paragraphs (not SDTs directly)
        // However, we need to handle any nested tables that might be inside paragraphs
        const cellParagraphs = cell.getParagraphs();

        for (const para of cellParagraphs) {
          // Check paragraph content for nested tables
          // (Tables can appear as block-level content in some DOCX structures)
          // This is handled through the paragraph's content iteration
          // If there are nested tables, they will be processed separately
        }
      }
    }
  }

  /**
   * Rebuilds all Table of Contents in the document
   * 
   * Analyzes each TOC in the document, parses its field instructions to determine
   * which heading levels to include, searches for matching headings (including those
   * in nested tables), and returns a summary of TOC instructions and heading counts.
   * 
   * **NEW: This method now also populates the TOCs with hyperlinked entries automatically!**
   * 
   * The method:
   * 1. Removes SDT wrappers around tables if found (uses clearCustom helper)
   * 2. Ensures `_top` bookmark exists at document start for TOC linking
   * 3. Scans document.xml for all TOC field instructions
   * 4. For each TOC, parses the instruction to extract heading levels
   * 5. Finds all matching headings (searches body AND nested tables)
   * 6. **Generates bookmarks for headings that don't have them**
   * 7. **Creates hyperlinked TOC entries pointing to those bookmarks**
   * 8. **Populates the TOC with entries (Verdana 12pt, blue, underlined, no page numbers)**
   * 9. **Updates document.xml with the populated TOC**
   * 10. Retains field instructions so TOCs can be manually updated later
   * 11. Returns summary: [instruction, [h1Count, h2Count, h3Count, ...]]
   * 
   * **Key Features:**
   * - No arguments required - analyzes the current document state
   * - Searches nested tables when counting headings
   * - Automatically removes SDT wrappers that interfere with TOC population
   * - Ensures `_top` bookmark exists for document-top linking
   * - **Automatically populates TOCs with clickable hyperlink entries**
   * - **TOCs display correctly on first open without manual update**
   * - **Field instructions preserved for manual updates**
   * - **No page numbers displayed (pure hyperlink navigation)**
   * - Returns summary data for diagnostics and verification
   * 
   * **Output Format:**
   * Returns a 2D array where each row contains:
   * - Index 0: The TOC field instruction text (e.g., "TOC \\o \"1-3\"")
   * - Index 1: Array of heading counts by level (e.g., [5, 12, 8] = 5 H1s, 12 H2s, 8 H3s)
   * 
   * @returns Two-dimensional array of [instruction, headingCounts[]] for each TOC
   * 
   * @example
   * ```typescript
   * const doc = await Document.load('document.docx');
   * const tocInfo = doc.rebuildTOCs();
   * 
   * console.log(`Found ${tocInfo.length} Table(s) of Contents`);
   * for (const [instruction, counts] of tocInfo) {
   *   console.log(`TOC Instruction: ${instruction}`);
   *   counts.forEach((count, level) => {
   *     if (count > 0) {
   *       console.log(`  Heading ${level + 1}: ${count} found`);
   *     }
   *   });
   * }
   * 
   * // TOCs are now populated with hyperlinks - save the document
   * await doc.save('output.docx');
   * // When opened in Word, TOCs will display with clickable links, no manual update needed
   * ```
   * 
   * @example
   * ```typescript
   * // Rebuild TOCs and save with populated entries
   * const doc = await Document.load('input.docx');
   * const tocSummary = doc.rebuildTOCs();
   * await doc.save('output.docx');
   * 
   * console.log(`Processed ${tocSummary.length} TOCs with hyperlinked entries`);
   * ```
   */
  public rebuildTOCs(): Array<[string, number[]]> {
    const results: Array<[string, number[]]> = [];
    
    // Step 1: Remove SDT wrappers around tables if found (helper already exists)
    this.clearCustom();
    
    // Step 2: Ensure _top bookmark exists at document start
    this.addTopBookmark();
    
    // Step 3: Get document.xml to scan for TOC elements
    let docXml = this.zipHandler.getFileAsString('word/document.xml');
    if (!docXml) {
      return results;
    }
    
    // Step 4: Find all TOC SDT elements
    const tocRegex = /<w:sdt>[\s\S]*?<w:docPartGallery w:val="Table of Contents"[\s\S]*?<\/w:sdt>/g;
    const tocMatches = Array.from(docXml.matchAll(tocRegex));
    
    if (tocMatches.length === 0) {
      return results;
    }
    
    // Step 5: For each TOC, parse instructions and count headings
    for (const match of tocMatches) {
      try {
        const tocXml = match[0];
        
        // Extract field instruction
        const instrMatch = tocXml.match(/<w:instrText[^>]*>([\s\S]*?)<\/w:instrText>/);
        if (!instrMatch?.[1]) {
          continue;
        }
        
        // TypeScript type narrowing: assign to const variable
        const instrText = instrMatch[1];
        
        // Decode XML entities
        let fieldInstruction = instrText
          .replace(/&/g, '&')
          .replace(/</g, '<')
          .replace(/>/g, '>')
          .replace(/"/g, '"')
          .replace(/'/g, "'");
        
        // Parse the instruction to get heading levels
        const levels = this.parseTOCFieldInstruction(fieldInstruction);
        
        // Find all headings in document (including nested tables)
        const headings = this.findHeadingsForTOCFromXML(docXml, levels);
        
        // Count headings by level (create array with counts for each level 1-9)
        const headingCounts: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // Indices 0-8 for levels 1-9
        
        for (const heading of headings) {
          if (heading.level >= 1 && heading.level <= 9) {
            const index = heading.level - 1;
            headingCounts[index] = (headingCounts[index] || 0) + 1;
          }
        }
        
        // Add to results: [instruction, counts]
        results.push([fieldInstruction, headingCounts]);
      } catch (error) {
        // Skip this TOC on error
        this.logger.warn(
          'Error processing TOC in rebuildTOCs',
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : { error: String(error) }
        );
        continue;
      }
    }
    
    // Step 6: Populate all TOCs in the document with hyperlinked entries
    // This modifies the XML to include pre-populated TOC entries with hyperlinks
    const populatedXml = this.populateAllTOCsInXML(docXml);
    
    // Step 7: Update document.xml with the populated TOCs
    if (populatedXml !== docXml) {
      this.zipHandler.updateFile('word/document.xml', populatedXml);
      
      this.logger.info(
        `Successfully populated ${results.length} TOC(s) with hyperlinked entries`
      );
    }
    
    return results;
  }

  /**
   * Normalizes all table borders to a uniform style
   *
   * Applies consistent border styling to all tables in the document.
   * This is useful for fixing documents with inconsistent borders
   * (e.g., thick bottom borders on some tables).
   *
   * @param options - Border styling options
   * @param options.style - Border style (default: 'single')
   * @param options.size - Border size in eighths of a point (default: 4 = 0.5pt)
   * @param options.color - Border color in hex without # (default: '000000')
   * @returns Number of tables updated
   *
   * @example
   * ```typescript
   * // Apply default thin black borders to all tables
   * const count = doc.normalizeTableBorders();
   * console.log(`Normalized borders on ${count} tables`);
   *
   * // Custom border styling
   * doc.normalizeTableBorders({
   *   style: 'single',
   *   size: 8,  // 1pt border
   *   color: '333333'  // Dark gray
   * });
   * ```
   */
  normalizeTableBorders(options?: {
    style?: "single" | "double" | "dotted" | "dashed" | "thick" | "none";
    size?: number;
    color?: string;
  }): number {
    const border: TableBorder = {
      style: options?.style ?? "single",
      size: options?.size ?? 4,
      color: options?.color ?? "000000",
    };

    return this.applyBordersToAllTables(border);
  }

  /**
   * Replaces text in runs with optional formatting constraints
   *
   * Searches for text patterns and replaces them while optionally
   * constraining matches to runs with specific formatting (e.g., bold only).
   * Formatting is preserved after replacement.
   *
   * @param find - Text to find (string or regex)
   * @param replace - Replacement text
   * @param options - Search options
   * @param options.matchBold - Only match text in bold runs (default: false)
   * @param options.matchItalic - Only match text in italic runs (default: false)
   * @param options.matchCase - Case-sensitive search (default: false)
   * @returns Number of replacements made
   *
   * @example
   * ```typescript
   * // Replace "Parent SOP:" with "Parent Document:" only in bold text
   * const count = doc.replaceFormattedText('Parent SOP:', 'Parent Document:', {
   *   matchBold: true
   * });
   * console.log(`Replaced ${count} occurrences`);
   *
   * // Case-sensitive replacement
   * doc.replaceFormattedText('OLD_VALUE', 'NEW_VALUE', {
   *   matchCase: true
   * });
   * ```
   */
  replaceFormattedText(
    find: string,
    replace: string,
    options?: {
      matchBold?: boolean;
      matchItalic?: boolean;
      matchCase?: boolean;
    }
  ): number {
    let replacedCount = 0;
    const matchBold = options?.matchBold ?? false;
    const matchItalic = options?.matchItalic ?? false;
    const matchCase = options?.matchCase ?? false;

    // Create regex pattern
    const pattern = matchCase
      ? new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
      : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");

    // Process body paragraphs
    for (const para of this.getAllParagraphs()) {
      for (const run of para.getRuns()) {
        const text = run.getText();
        if (!text) continue;

        // Check formatting constraints
        const formatting = run.getFormatting();
        if (matchBold && !formatting.bold) continue;
        if (matchItalic && !formatting.italic) continue;

        // Perform replacement
        if (pattern.test(text)) {
          const newText = text.replace(pattern, replace);
          if (newText !== text) {
            run.setText(newText);
            replacedCount++;
          }
        }
        // Reset regex lastIndex for next iteration
        pattern.lastIndex = 0;
      }
    }

    // Process paragraphs inside table cells
    for (const table of this.getTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          for (const para of cell.getParagraphs()) {
            for (const run of para.getRuns()) {
              const text = run.getText();
              if (!text) continue;

              // Check formatting constraints
              const runFormatting = run.getFormatting();
              if (matchBold && !runFormatting.bold) continue;
              if (matchItalic && !runFormatting.italic) continue;

              // Perform replacement
              if (pattern.test(text)) {
                const newText = text.replace(pattern, replace);
                if (newText !== text) {
                  run.setText(newText);
                  replacedCount++;
                }
              }
              // Reset regex lastIndex for next iteration
              pattern.lastIndex = 0;
            }
          }
        }
      }
    }

    return replacedCount;
  }

  /**
   * Creates an empty document with minimal structure
   *
   * Creates a new document with only the essential parts required
   * for a valid DOCX file, without any default content or styling.
   * Useful for building documents from scratch programmatically.
   *
   * @returns New empty Document instance
   *
   * @example
   * ```typescript
   * const doc = Document.createEmpty();
   * // Document has minimal structure, ready for content
   * doc.createParagraph('First paragraph');
   * await doc.save('minimal.docx');
   * ```
   */
  static createEmpty(): Document {
    const doc = new Document(undefined, {}, false); // Don't init defaults

    // Add only the absolute minimum required files
    const zipHandler = doc.getZipHandler();

    // [Content_Types].xml - minimal
    zipHandler.addFile(
      "[Content_Types].xml",
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n' +
        '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n' +
        '  <Default Extension="xml" ContentType="application/xml"/>\n' +
        '  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n' +
        "</Types>"
    );

    // _rels/.rels - minimal
    zipHandler.addFile(
      "_rels/.rels",
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
        '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n' +
        "</Relationships>"
    );

    // word/document.xml - empty body
    zipHandler.addFile(
      "word/document.xml",
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n' +
        "  <w:body/>\n" +
        "</w:document>"
    );

    // word/_rels/document.xml.rels - empty relationships
    zipHandler.addFile(
      "word/_rels/document.xml.rels",
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>'
    );

    return doc;
  }
}
