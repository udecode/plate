/**
 * DocumentGenerator - Handles XML generation for DOCX files
 * Converts structured data to OpenXML format
 */

import { CommentManager } from "../elements/CommentManager";
import { FontManager } from "../elements/FontManager";
import { HeaderFooterManager } from "../elements/HeaderFooterManager";
import { Hyperlink } from "../elements/Hyperlink";
import { ImageManager } from "../elements/ImageManager";
import { Paragraph } from "../elements/Paragraph";
import { Revision } from "../elements/Revision";
import { isHyperlinkContent } from "../elements/RevisionContent";
import { Section } from "../elements/Section";
import { StructuredDocumentTag } from "../elements/StructuredDocumentTag";
import { Table } from "../elements/Table";
import { TableOfContentsElement } from "../elements/TableOfContentsElement";
import { getGlobalLogger, createScopedLogger, ILogger } from "../utils/logger";
import { XMLBuilder, XMLElement } from "../xml/XMLBuilder";
import { DocumentProperties } from "./Document";
import { RelationshipManager } from "./RelationshipManager";

// Create scoped logger for DocumentGenerator operations
function getLogger(): ILogger {
  return createScopedLogger(getGlobalLogger(), 'DocumentGenerator');
}

/**
 * Interface for ZipHandler methods used in content type generation
 * This provides type safety for the ZipHandler parameter without creating
 * a circular dependency with the zip module.
 */
export interface IZipHandlerReader {
  /** Get list of file paths in the archive */
  getFilePaths?(): string[];
  /** Check if a file exists in the archive */
  hasFile?(path: string): boolean;
}

/**
 * Body element types
 */
type BodyElement =
  | Paragraph
  | Table
  | TableOfContentsElement
  | StructuredDocumentTag;

/**
 * Normalizes toXML() output to always return an array.
 * Some elements (e.g., TableOfContentsElement) return XMLElement[], while others return XMLElement.
 * This helper provides consistent array handling.
 *
 * @param xml - XMLElement or XMLElement[] from toXML()
 * @returns XMLElement array
 */
function normalizeXmlOutput(xml: XMLElement | XMLElement[]): XMLElement[] {
  return Array.isArray(xml) ? xml : [xml];
}

/**
 * DocumentGenerator handles all XML generation logic
 */
export class DocumentGenerator {
  /**
   * Generates [Content_Types].xml
   */
  generateContentTypes(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
  }

  /**
   * Generates _rels/.rels
   */
  generateRels(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
  }

  /**
   * Generates word/document.xml with current body elements
   */
  generateDocumentXml(
    bodyElements: BodyElement[],
    section: Section,
    namespaces: Record<string, string>
  ): string {
    const logger = getLogger();
    logger.info('Generating document.xml', { elementCount: bodyElements.length });

    const bodyXmls: XMLElement[] = [];

    // Generate XML for each body element
    // Uses normalizeXmlOutput() to handle both single XMLElement and XMLElement[] returns
    for (const element of bodyElements) {
      const xmlElements = normalizeXmlOutput(element.toXML());
      bodyXmls.push(...xmlElements);
    }

    // Add section properties at the end
    bodyXmls.push(section.toXML());
    const result = XMLBuilder.createDocument(bodyXmls, namespaces);
    logger.info('Document.xml generated', { xmlSize: result.length });
    return result;
  }

  /**
   * Generates docProps/core.xml with extended properties
   */
  generateCoreProps(properties: DocumentProperties): string {
    const now = new Date();
    const created = properties.created || now;
    const modified = properties.modified || now;

    const formatDate = (date: Date): string => {
      return date.toISOString();
    };

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${XMLBuilder.sanitizeXmlContent(properties.title || "")}</dc:title>
  <dc:subject>${XMLBuilder.sanitizeXmlContent(
    properties.subject || ""
  )}</dc:subject>
  <dc:creator>${XMLBuilder.sanitizeXmlContent(
    properties.creator || "DocXML"
  )}</dc:creator>
  <cp:keywords>${XMLBuilder.sanitizeXmlContent(
    properties.keywords || ""
  )}</cp:keywords>
  <dc:description>${XMLBuilder.sanitizeXmlContent(
    properties.description || ""
  )}</dc:description>
  <cp:lastModifiedBy>${XMLBuilder.sanitizeXmlContent(
    properties.lastModifiedBy || properties.creator || "DocXML"
  )}</cp:lastModifiedBy>
  <cp:revision>${properties.revision || 1}</cp:revision>${
    properties.category
      ? `\n  <cp:category>${XMLBuilder.sanitizeXmlContent(
          properties.category
        )}</cp:category>`
      : ""
  }${
    properties.contentStatus
      ? `\n  <cp:contentStatus>${XMLBuilder.sanitizeXmlContent(
          properties.contentStatus
        )}</cp:contentStatus>`
      : ""
  }${
    properties.language
      ? `\n  <dc:language>${XMLBuilder.sanitizeXmlContent(
          properties.language
        )}</dc:language>`
      : ""
  }
  <dcterms:created xsi:type="dcterms:W3CDTF">${formatDate(
    created
  )}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${formatDate(
    modified
  )}</dcterms:modified>
</cp:coreProperties>`;
  }

  /**
   * Generates docProps/app.xml with extended properties
   */
  generateAppProps(properties: DocumentProperties = {}): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
            xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>${XMLBuilder.sanitizeXmlContent(
    properties.application || "docxmlater"
  )}</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <Company>${XMLBuilder.sanitizeXmlContent(properties.company || "")}</Company>${
    properties.manager
      ? `\n  <Manager>${XMLBuilder.sanitizeXmlContent(
          properties.manager
        )}</Manager>`
      : ""
  }
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>${XMLBuilder.sanitizeXmlContent(
    properties.appVersion || properties.version || "1.0.0"
  )}</AppVersion>
</Properties>`;
  }

  /**
   * Generates docProps/custom.xml with custom properties
   */
  generateCustomProps(
    customProps: Record<string, string | number | boolean | Date>
  ): string {
    if (!customProps || Object.keys(customProps).length === 0) {
      return "";
    }

    const formatCustomValue = (
      key: string,
      value: string | number | boolean | Date,
      pid: number
    ): string => {
      if (typeof value === "string") {
        return `  <property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="${pid}" name="${XMLBuilder.sanitizeXmlContent(
          key
        )}">
    <vt:lpwstr>${XMLBuilder.sanitizeXmlContent(value)}</vt:lpwstr>
  </property>`;
      } else if (typeof value === "number") {
        return `  <property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="${pid}" name="${XMLBuilder.sanitizeXmlContent(
          key
        )}">
    <vt:r8>${value}</vt:r8>
  </property>`;
      } else if (typeof value === "boolean") {
        return `  <property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="${pid}" name="${XMLBuilder.sanitizeXmlContent(
          key
        )}">
    <vt:bool>${value ? "true" : "false"}</vt:bool>
  </property>`;
      } else if (value instanceof Date) {
        return `  <property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="${pid}" name="${XMLBuilder.sanitizeXmlContent(
          key
        )}">
    <vt:filetime>${value.toISOString()}</vt:filetime>
  </property>`;
      }
      return "";
    };

    const properties = Object.entries(customProps)
      .map(([key, value], index) => formatCustomValue(key, value, index + 2))
      .filter((prop) => prop !== "")
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties"
            xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
${properties}
</Properties>`;
  }

  /**
   * Generates [Content_Types].xml with image extensions, headers/footers, comments, and fonts
   * Preserves entries for files that exist in the loaded document (customXML, etc.)
   * Merges framework-generated entries with original entries for round-trip fidelity
   */
  generateContentTypesWithImagesHeadersFootersAndComments(
    imageManager: ImageManager,
    headerFooterManager: HeaderFooterManager,
    commentManager: CommentManager,
    zipHandler: IZipHandlerReader,
    fontManager?: FontManager,
    hasCustomProperties: boolean = false,
    originalContentTypes?: { defaults: Set<string>; overrides: Set<string> }
  ): string {
    const images = imageManager.getAllImages();
    const headers = headerFooterManager.getAllHeaders();
    const footers = headerFooterManager.getAllFooters();
    const hasComments = commentManager.getCount() > 0;

    // Build sets for framework-generated entries
    const generatedDefaults = new Set<string>();
    const generatedOverrides = new Set<string>();

    // Default types - always needed
    generatedDefaults.add('rels|application/vnd.openxmlformats-package.relationships+xml');
    generatedDefaults.add('xml|application/xml');

    // Image extensions
    for (const entry of images) {
      const ext = entry.image.getExtension();
      const mimeType = ImageManager.getMimeType(ext);
      generatedDefaults.add(`${ext}|${mimeType}`);
    }

    // Font extensions (if FontManager provided)
    if (fontManager && fontManager.getCount() > 0) {
      const fontEntries = fontManager.generateContentTypeEntries();
      for (const entry of fontEntries) {
        // Parse each entry and add to set (entries are XML strings)
        const extMatch = entry.match(/Extension="([^"]+)"/);
        const typeMatch = entry.match(/ContentType="([^"]+)"/);
        if (extMatch && typeMatch) {
          generatedDefaults.add(`${extMatch[1]}|${typeMatch[1]}`);
        }
      }
    }

    // Check for embedded .ttf fonts from original document
    // Also create a Set for efficient file existence checks
    const files = zipHandler.getFilePaths?.() || [];
    const filesInArchive = new Set(files);
    const hasTtfFonts = files.some((f: string) => f.endsWith(".ttf"));
    if (hasTtfFonts) {
      generatedDefaults.add('ttf|application/x-font-ttf');
    }

    // Override types - required files
    generatedOverrides.add('/word/document.xml|application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml');
    generatedOverrides.add('/word/styles.xml|application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml');
    generatedOverrides.add('/word/numbering.xml|application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml');
    generatedOverrides.add('/word/fontTable.xml|application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml');
    generatedOverrides.add('/word/settings.xml|application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml');
    generatedOverrides.add('/word/theme/theme1.xml|application/vnd.openxmlformats-officedocument.theme+xml');

    // Headers - only add if file actually exists in archive
    // This prevents corruption when HeaderFooterManager has stale entries for removed headers
    for (const entry of headers) {
      const filePath = `word/${entry.filename}`;
      if (filesInArchive.has(filePath)) {
        generatedOverrides.add(`/word/${entry.filename}|application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml`);
      }
    }

    // Footers - only add if file actually exists in archive
    // This prevents corruption when HeaderFooterManager has stale entries for removed footers
    for (const entry of footers) {
      const filePath = `word/${entry.filename}`;
      if (filesInArchive.has(filePath)) {
        generatedOverrides.add(`/word/${entry.filename}|application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml`);
      }
    }

    // Comments
    if (hasComments) {
      generatedOverrides.add('/word/comments.xml|application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml');
    }

    // Core properties (always needed)
    generatedOverrides.add('/docProps/core.xml|application/vnd.openxmlformats-package.core-properties+xml');

    // App.xml if it exists
    if (zipHandler.hasFile?.("docProps/app.xml")) {
      generatedOverrides.add('/docProps/app.xml|application/vnd.openxmlformats-officedocument.extended-properties+xml');
    }

    // Custom properties if exists or will be created
    if (zipHandler.hasFile?.("docProps/custom.xml") || hasCustomProperties) {
      generatedOverrides.add('/docProps/custom.xml|application/vnd.openxmlformats-officedocument.custom-properties+xml');
    }

    // CustomXML entries if they exist
    if (zipHandler.hasFile?.("customXML/item1.xml")) {
      generatedOverrides.add('/customXML/item1.xml|application/xml');
    }
    if (zipHandler.hasFile?.("customXML/itemProps1.xml")) {
      generatedOverrides.add('/customXML/itemProps1.xml|application/vnd.openxmlformats-officedocument.customXmlProperties+xml');
    }

    // Merge with original entries, but ONLY keep overrides for files that actually exist
    // This prevents corruption when headers/footers are removed but their Content_Types entries
    // from the original document would otherwise be preserved
    const allDefaults = new Set([
      ...generatedDefaults,
      ...(originalContentTypes?.defaults || [])
    ]);

    // filesInArchive was created earlier (line 318) for header/footer validation
    // Reuse it here to filter original overrides as well

    // Filter original overrides to only include files that exist in the archive
    const filteredOriginalOverrides: string[] = [];
    for (const entry of (originalContentTypes?.overrides || [])) {
      const parts = entry.split('|');
      const partName = parts[0] || '';
      // Convert /word/footer1.xml to word/footer1.xml for comparison
      const normalizedPath = partName.startsWith('/') ? partName.slice(1) : partName;
      if (filesInArchive.has(normalizedPath)) {
        filteredOriginalOverrides.push(entry);
      }
    }

    const allOverrides = new Set([
      ...generatedOverrides,
      ...filteredOriginalOverrides
    ]);

    // Build XML from merged sets
    let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    xml += '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n';

    // Add all default entries (escape attribute values for security)
    for (const entry of allDefaults) {
      const parts = entry.split('|');
      const ext = parts[0] || '';
      const contentType = parts[1] || '';
      const escapedExt = XMLBuilder.escapeXmlAttribute(ext);
      const escapedContentType = XMLBuilder.escapeXmlAttribute(contentType);
      xml += `  <Default Extension="${escapedExt}" ContentType="${escapedContentType}"/>\n`;
    }

    // Add all override entries (escape attribute values for security)
    for (const entry of allOverrides) {
      const parts = entry.split('|');
      const partName = parts[0] || '';
      const contentType = parts[1] || '';
      const escapedPartName = XMLBuilder.escapeXmlAttribute(partName);
      const escapedContentType = XMLBuilder.escapeXmlAttribute(contentType);
      xml += `  <Override PartName="${escapedPartName}" ContentType="${escapedContentType}"/>\n`;
    }

    xml += '</Types>';

    return xml;
  }

  /**
   * Clears ORPHANED hyperlink relationships from the RelationshipManager
   * Only removes relationships that don't have corresponding hyperlinks in the document
   *
   * This prevents corruption when paragraphs with hyperlinks are removed but
   * their relationships remain, causing Word's "unreadable content" error.
   * Preserves relationships for existing hyperlinks to maintain round-trip integrity.
   */
  private clearOrphanedHyperlinkRelationships(
    bodyElements: BodyElement[],
    headerFooterManager: HeaderFooterManager,
    relationshipManager: RelationshipManager
  ): void {
    // Step 1: Collect all relationship IDs currently used by hyperlinks
    const usedRelIds = new Set<string>();

    // Helper to scan paragraphs for hyperlink relationship IDs
    const scanParagraph = (para: Paragraph) => {
      for (const item of para.getContent()) {
        // Direct hyperlinks in paragraph
        if (item instanceof Hyperlink && item.isExternal()) {
          const relId = item.getRelationshipId();
          if (relId) {
            usedRelIds.add(relId);
          }
        }
        // Hyperlinks inside Revision objects (tracked changes)
        if (item instanceof Revision) {
          for (const revContent of item.getContent()) {
            if (isHyperlinkContent(revContent)) {
              const hyperlink = revContent as Hyperlink;
              if (hyperlink.isExternal()) {
                const relId = hyperlink.getRelationshipId();
                if (relId) {
                  usedRelIds.add(relId);
                }
              }
            }
          }
        }
      }
    };

    // Helper to recursively scan any element type for hyperlinks
    const scanElement = (element: BodyElement | Paragraph | Table | StructuredDocumentTag): void => {
      if (element instanceof Paragraph) {
        // Scan paragraph content for hyperlinks
        scanParagraph(element);
      }
      else if (element instanceof Table) {
        // Scan all cells in the table
        for (let row = 0; row < element.getRowCount(); row++) {
          for (let col = 0; col < element.getColumnCount(); col++) {
            const cell = element.getCell(row, col);
            if (cell) {
              // Scan each paragraph in the cell
              const paragraphs = cell.getParagraphs();
              for (const para of paragraphs) {
                scanParagraph(para);
              }
            }
          }
        }
      }
      else if (element instanceof StructuredDocumentTag) {
        // Recursively scan SDT content (can contain Paragraphs, Tables, or nested SDTs)
        const content = element.getContent();
        for (const item of content) {
          scanElement(item); // Recursive call handles nested structures
        }
      }
      // TableOfContentsElement is for programmatic TOCs - real TOCs come as SDTs
    };

    // Scan body elements (handles all nested structures)
    for (const element of bodyElements) {
      scanElement(element);
    }

    // Scan headers (including tables and SDTs in headers)
    const headers = headerFooterManager.getAllHeaders();
    for (const header of headers) {
      for (const element of header.header.getElements()) {
        scanElement(element);
      }
    }

    // Scan footers (including tables and SDTs in footers)
    const footers = headerFooterManager.getAllFooters();
    for (const footer of footers) {
      for (const element of footer.footer.getElements()) {
        scanElement(element);
      }
    }

    // Step 2: Remove ONLY orphaned relationships (not used by any hyperlink)
    const allHyperlinkRels = relationshipManager.getRelationshipsByType(
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"
    );

    for (const rel of allHyperlinkRels) {
      if (!usedRelIds.has(rel.getId())) {
        // This relationship is orphaned - remove it
        relationshipManager.removeRelationship(rel.getId());
      }
    }
  }

  /**
   * Processes all hyperlinks in paragraphs and registers them with RelationshipManager
   * Clears orphaned hyperlink relationships to prevent corruption while preserving valid ones
   *
   * **IMPORTANT:** This method recursively processes ALL element types including:
   * - Top-level paragraphs
   * - Tables (all cells)
   * - StructuredDocumentTags (SDTs / content controls)
   * - Headers and footers
   *
   * This ensures hyperlinks with URL+anchor combinations (like theSource links)
   * that have their relationshipId cleared during parsing get new relationships
   * registered before XML generation.
   */
  processHyperlinks(
    bodyElements: BodyElement[],
    headerFooterManager: HeaderFooterManager,
    relationshipManager: RelationshipManager
  ): void {
    const logger = getLogger();
    logger.info('Processing hyperlinks');

    // Clear ORPHANED hyperlink relationships to prevent corruption
    // This is critical when paragraphs are removed (e.g., via clearParagraphs())
    // but preserves relationships for existing hyperlinks (round-trip integrity)
    this.clearOrphanedHyperlinkRelationships(
      bodyElements,
      headerFooterManager,
      relationshipManager
    );

    // Helper to recursively process any element type for hyperlinks
    // Mirrors the pattern in clearOrphanedHyperlinkRelationships() for consistency
    const processElement = (element: BodyElement | Paragraph | Table | StructuredDocumentTag): void => {
      if (element instanceof Paragraph) {
        this.processHyperlinksInParagraph(element, relationshipManager);
      }
      else if (element instanceof Table) {
        // Process all cells in the table
        for (let row = 0; row < element.getRowCount(); row++) {
          for (let col = 0; col < element.getColumnCount(); col++) {
            const cell = element.getCell(row, col);
            if (cell) {
              // Scan each paragraph in the cell
              const paragraphs = cell.getParagraphs();
              for (const para of paragraphs) {
                this.processHyperlinksInParagraph(para, relationshipManager);
              }
            }
          }
        }
      }
      else if (element instanceof StructuredDocumentTag) {
        // Recursively process SDT content (can contain Paragraphs, Tables, or nested SDTs)
        const content = element.getContent();
        for (const item of content) {
          processElement(item); // Recursive call handles nested structures
        }
      }
      // TableOfContentsElement is for programmatic TOCs - real TOCs come as SDTs
    };

    // Process body elements (handles all nested structures)
    for (const element of bodyElements) {
      processElement(element);
    }

    // Process headers (including tables and SDTs in headers)
    const headers = headerFooterManager.getAllHeaders();
    for (const header of headers) {
      for (const element of header.header.getElements()) {
        processElement(element);
      }
    }

    // Process footers (including tables and SDTs in footers)
    const footers = headerFooterManager.getAllFooters();
    for (const footer of footers) {
      for (const element of footer.footer.getElements()) {
        processElement(element);
      }
    }

    logger.info('Hyperlinks processed');
  }

  /**
   * Processes hyperlinks in a single paragraph
   *
   * **Validation:** Throws error if external hyperlink has no URL to prevent
   * document corruption per ECMA-376 §17.16.22.
   *
   * Also processes hyperlinks inside Revision objects (tracked changes).
   *
   * @throws {Error} If external hyperlink has undefined/empty URL
   */
  private processHyperlinksInParagraph(
    paragraph: Paragraph,
    relationshipManager: RelationshipManager
  ): void {
    const content = paragraph.getContent();

    for (const item of content) {
      // Direct hyperlink in paragraph
      if (
        item instanceof Hyperlink &&
        item.isExternal() &&
        !item.getRelationshipId()
      ) {
        this.registerHyperlinkRelationship(item, relationshipManager);
      }

      // Hyperlinks inside Revision objects (tracked changes)
      if (item instanceof Revision) {
        for (const revContent of item.getContent()) {
          if (isHyperlinkContent(revContent)) {
            const hyperlink = revContent as Hyperlink;
            if (hyperlink.isExternal() && !hyperlink.getRelationshipId()) {
              this.registerHyperlinkRelationship(hyperlink, relationshipManager);
            }
          }
        }
      }
    }
  }

  /**
   * Registers a hyperlink with the relationship manager
   *
   * @throws {Error} If hyperlink has no URL
   */
  private registerHyperlinkRelationship(
    hyperlink: Hyperlink,
    relationshipManager: RelationshipManager
  ): void {
    const url = hyperlink.getUrl();

    // Validate that external hyperlink has a URL
    // This prevents invalid document generation and fails early with clear error
    if (!url) {
      throw new Error(
        `Invalid hyperlink in paragraph: External hyperlink "${hyperlink.getText()}" has no URL. ` +
          `This would create a corrupted document per ECMA-376 §17.16.22. ` +
          `Fix the hyperlink by providing a valid URL before saving.`
      );
    }

    const relationship = relationshipManager.addHyperlink(url);
    hyperlink.setRelationshipId(relationship.getId());
  }

  /**
   * Generates word/fontTable.xml
   * Required for DOCX compliance - defines fonts used in the document
   */
  generateFontTable(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
         xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:font w:name="Calibri">
    <w:panose1 w:val="020F0502020204030204"/>
    <w:charset w:val="00"/>
    <w:family w:val="swiss"/>
    <w:pitch w:val="variable"/>
    <w:sig w:usb0="E10002FF" w:usb1="4000ACFF" w:usb2="00000009" w:usb3="00000000" w:csb0="0000019F" w:csb1="00000000"/>
  </w:font>
  <w:font w:name="Times New Roman">
    <w:panose1 w:val="02020603050405020304"/>
    <w:charset w:val="00"/>
    <w:family w:val="roman"/>
    <w:pitch w:val="variable"/>
    <w:sig w:usb0="E0002AFF" w:usb1="C000785B" w:usb2="00000009" w:usb3="00000000" w:csb0="000001FF" w:csb1="00000000"/>
  </w:font>
  <w:font w:name="Arial">
    <w:panose1 w:val="020B0604020202020204"/>
    <w:charset w:val="00"/>
    <w:family w:val="swiss"/>
    <w:pitch w:val="variable"/>
    <w:sig w:usb0="E0002AFF" w:usb1="C000247B" w:usb2="00000009" w:usb3="00000000" w:csb0="000001FF" w:csb1="00000000"/>
  </w:font>
  <w:font w:name="Courier New">
    <w:panose1 w:val="02070309020205020404"/>
    <w:charset w:val="00"/>
    <w:family w:val="modern"/>
    <w:pitch w:val="fixed"/>
    <w:sig w:usb0="E0002AFF" w:usb1="C0007843" w:usb2="00000009" w:usb3="00000000" w:csb0="000001FF" w:csb1="00000000"/>
  </w:font>
  <w:font w:name="Calibri Light">
    <w:panose1 w:val="020F0302020204030204"/>
    <w:charset w:val="00"/>
    <w:family w:val="swiss"/>
    <w:pitch w:val="variable"/>
    <w:sig w:usb0="E10002FF" w:usb1="4000ACFF" w:usb2="00000009" w:usb3="00000000" w:csb0="0000019F" w:csb1="00000000"/>
  </w:font>
  <w:font w:name="Georgia">
    <w:panose1 w:val="02040502050204030303"/>
    <w:charset w:val="00"/>
    <w:family w:val="roman"/>
    <w:pitch w:val="variable"/>
    <w:sig w:usb0="E0002AFF" w:usb1="00000000" w:usb2="00000000" w:usb3="00000000" w:csb0="000001FF" w:csb1="00000000"/>
  </w:font>
</w:fonts>`;
  }

  /**
   * Generates word/settings.xml
   * Required for DOCX compliance - defines document settings
   * @param trackChangesSettings - Optional track changes settings
   */
  generateSettings(trackChangesSettings?: {
    trackChangesEnabled?: boolean;
    trackFormatting?: boolean;
    revisionView?: {
      showInsertionsAndDeletions: boolean;
      showFormatting: boolean;
      showInkAnnotations: boolean;
    };
    rsidRoot?: string;
    rsids?: string[];
    documentProtection?: {
      edit: 'readOnly' | 'comments' | 'trackedChanges' | 'forms';
      enforcement: boolean;
      cryptProviderType?: string;
      cryptAlgorithmClass?: string;
      cryptAlgorithmType?: string;
      cryptAlgorithmSid?: number;
      cryptSpinCount?: number;
      hash?: string;
      salt?: string;
    };
  }): string {
    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:zoom w:percent="100"/>
  <w:updateFields w:val="true"/>`;

    // Track changes settings
    if (trackChangesSettings?.trackChangesEnabled) {
      xml += '\n  <w:trackRevisions/>';
    }

    if (trackChangesSettings?.trackFormatting !== undefined) {
      if (trackChangesSettings.trackFormatting) {
        xml += '\n  <w:trackFormatting/>';
      } else {
        xml += '\n  <w:doNotTrackFormatting/>';
      }
    }

    // Revision view settings
    if (trackChangesSettings?.revisionView) {
      const view = trackChangesSettings.revisionView;
      xml += `\n  <w:revisionView w:insDel="${view.showInsertionsAndDeletions ? '1' : '0'}" w:formatting="${view.showFormatting ? '1' : '0'}"`;
      if (view.showInkAnnotations !== undefined) {
        xml += ` w:inkAnnotations="${view.showInkAnnotations ? '1' : '0'}"`;
      }
      xml += '/>';
    }

    // Document protection
    if (trackChangesSettings?.documentProtection) {
      const prot = trackChangesSettings.documentProtection;
      xml += `\n  <w:documentProtection w:edit="${prot.edit}" w:enforcement="${prot.enforcement ? '1' : '0'}"`;
      if (prot.cryptProviderType) {
        xml += ` w:cryptProviderType="${prot.cryptProviderType}"`;
      }
      if (prot.cryptAlgorithmClass) {
        xml += ` w:cryptAlgorithmClass="${prot.cryptAlgorithmClass}"`;
      }
      if (prot.cryptAlgorithmType) {
        xml += ` w:cryptAlgorithmType="${prot.cryptAlgorithmType}"`;
      }
      if (prot.cryptAlgorithmSid) {
        xml += ` w:cryptAlgorithmSid="${prot.cryptAlgorithmSid}"`;
      }
      if (prot.cryptSpinCount) {
        xml += ` w:cryptSpinCount="${prot.cryptSpinCount}"`;
      }
      if (prot.hash) {
        xml += ` w:hash="${prot.hash}"`;
      }
      if (prot.salt) {
        xml += ` w:salt="${prot.salt}"`;
      }
      xml += '/>';
    }

    xml += `
  <w:defaultTabStop w:val="720"/>
  <w:characterSpacingControl w:val="doNotCompress"/>`;

    // RSIDs (Revision Save IDs)
    if (trackChangesSettings?.rsids && trackChangesSettings.rsids.length > 0) {
      xml += '\n  <w:rsids>';
      if (trackChangesSettings.rsidRoot) {
        xml += `\n    <w:rsidRoot w:val="${trackChangesSettings.rsidRoot}"/>`;
      }
      for (const rsid of trackChangesSettings.rsids) {
        xml += `\n    <w:rsid w:val="${rsid}"/>`;
      }
      xml += '\n  </w:rsids>';
    }

    xml += `
  <w:compat>
    <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/>
    <w:compatSetting w:name="overrideTableStyleFontSizeAndJustification" w:uri="http://schemas.microsoft.com/office/word" w:val="1"/>
    <w:compatSetting w:name="enableOpenTypeFeatures" w:uri="http://schemas.microsoft.com/office/word" w:val="1"/>
    <w:compatSetting w:name="doNotFlipMirrorIndents" w:uri="http://schemas.microsoft.com/office/word" w:val="1"/>
    <w:compatSetting w:name="differentiateMultirowTableHeaders" w:uri="http://schemas.microsoft.com/office/word" w:val="1"/>
  </w:compat>
  <w:themeFontLang w:val="en-US"/>
  <w:clrSchemeMapping w:bg1="light1" w:t1="dark1" w:bg2="light2" w:t2="dark2" w:accent1="accent1" w:accent2="accent2" w:accent3="accent3" w:accent4="accent4" w:accent5="accent5" w:accent6="accent6" w:hyperlink="hyperlink" w:followedHyperlink="followedHyperlink"/>
</w:settings>`;

    return xml;
  }

  /**
   * Generates word/theme/theme1.xml
   * Required for DOCX compliance - defines color and font theme
   */
  generateTheme(): string {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
  <a:themeElements>
    <a:clrScheme name="Office">
      <a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
      <a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="44546A"/></a:dk2>
      <a:lt2><a:srgbClr val="E7E6E6"/></a:lt2>
      <a:accent1><a:srgbClr val="5B9BD5"/></a:accent1>
      <a:accent2><a:srgbClr val="ED7D31"/></a:accent2>
      <a:accent3><a:srgbClr val="A5A5A5"/></a:accent3>
      <a:accent4><a:srgbClr val="FFC000"/></a:accent4>
      <a:accent5><a:srgbClr val="4472C4"/></a:accent5>
      <a:accent6><a:srgbClr val="70AD47"/></a:accent6>
      <a:hlink><a:srgbClr val="0563C1"/></a:hlink>
      <a:folHlink><a:srgbClr val="954F72"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Office">
      <a:majorFont>
        <a:latin typeface="Calibri Light" panose="020F0302020204030204"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:majorFont>
      <a:minorFont>
        <a:latin typeface="Calibri" panose="020F0502020204030204"/>
        <a:ea typeface=""/>
        <a:cs typeface=""/>
      </a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Office">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:lumMod val="110000"/><a:satMod val="105000"/><a:tint val="67000"/></a:schemeClr></a:gs>
            <a:gs pos="50000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="103000"/><a:tint val="73000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="105000"/><a:satMod val="109000"/><a:tint val="81000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="5400000" scaled="0"/>
        </a:gradFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:satMod val="103000"/><a:lumMod val="102000"/><a:tint val="94000"/></a:schemeClr></a:gs>
            <a:gs pos="50000"><a:schemeClr val="phClr"><a:satMod val="110000"/><a:lumMod val="100000"/><a:shade val="100000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:lumMod val="99000"/><a:satMod val="120000"/><a:shade val="78000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="5400000" scaled="0"/>
        </a:gradFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln>
        <a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln>
        <a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/><a:miter lim="800000"/></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle>
          <a:effectLst>
            <a:outerShdw blurRad="57150" dist="19050" dir="5400000" algn="ctr" rotWithShape="0">
              <a:srgbClr val="000000"><a:alpha val="63000"/></a:srgbClr>
            </a:outerShdw>
          </a:effectLst>
        </a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill>
        <a:gradFill rotWithShape="1">
          <a:gsLst>
            <a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="93000"/><a:satMod val="150000"/><a:shade val="98000"/><a:lumMod val="102000"/></a:schemeClr></a:gs>
            <a:gs pos="50000"><a:schemeClr val="phClr"><a:tint val="98000"/><a:satMod val="130000"/><a:shade val="90000"/><a:lumMod val="103000"/></a:schemeClr></a:gs>
            <a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="63000"/><a:satMod val="120000"/></a:schemeClr></a:gs>
          </a:gsLst>
          <a:lin ang="5400000" scaled="0"/>
        </a:gradFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
  <a:extLst>
    <a:ext uri="{05A4C25C-085E-4340-85A3-A5531E510DB2}">
      <thm15:themeFamily xmlns:thm15="http://schemas.microsoft.com/office/thememl/2012/main" name="Office Theme" id="{62F939B6-93AF-4DB8-9C6B-D6C7DFDC589F}" vid="{4A3C46E8-61CC-4603-A589-7422A47A8E4A}"/>
    </a:ext>
  </a:extLst>
</a:theme>`;
  }
}
