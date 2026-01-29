/**
 * CleanupHelper - Comprehensive document cleanup utilities
 *
 * Provides methods to clean up common issues in DOCX documents, including:
 * - Unlocking and removing SDTs
 * - Clearing preserve flags
 * - Defragmenting hyperlinks
 * - Cleaning unused elements
 * - Removing customXML
 * - Unlocking fields and frames
 * - Sanitizing tables
 *
 * Usage:
 * const cleanup = new CleanupHelper(doc);
 * cleanup.all(); // Run all cleanups
 */

import type { Document } from '../core/Document';
import { Field, ComplexField } from '../elements/Field';
import { Hyperlink } from '../elements/Hyperlink';
import { StructuredDocumentTag } from '../elements/StructuredDocumentTag';

export interface CleanupOptions {
  /** Unlock all SDTs to enable editing */
  unlockSDTs?: boolean;
  /** Remove all SDTs (unwrap content) */
  removeSDTs?: boolean;
  /** Clear paragraph preserve flags */
  clearPreserveFlags?: boolean;
  /** Merge fragmented hyperlinks */
  defragmentHyperlinks?: boolean;
  /** Reset hyperlink formatting to standard */
  resetHyperlinkFormatting?: boolean;
  /** Remove unused numbering definitions */
  cleanupNumbering?: boolean;
  /** Remove unused styles */
  cleanupStyles?: boolean;
  /** Remove orphaned relationships */
  cleanupRelationships?: boolean;
  /** Remove customXML elements */
  removeCustomXML?: boolean;
  /** Unlock field locks (enable field updates) */
  unlockFields?: boolean;
  /** Remove frame/text box locks */
  unlockFrames?: boolean;
  /** Sanitize table property exceptions (tblPrEx) */
  sanitizeTables?: boolean;
  /** Format internal anchor hyperlinks with standard styling (Verdana 12pt blue underlined) */
  formatInternalHyperlinks?: boolean;
  /** Format ALL hyperlinks (internal, external, and HYPERLINK fields) with standard styling (Verdana 12pt #0000FF underlined) */
  formatAllHyperlinks?: boolean;
}

export interface CleanupReport {
  sdtsUnlocked: number;
  sdtsRemoved: number;
  preserveFlagsCleared: number;
  hyperlinksDefragmented: number;
  numberingRemoved: number;
  stylesRemoved: number;
  relationshipsRemoved: number;
  customXMLRemoved: number;
  fieldsUnlocked: number;
  framesUnlocked: number;
  tablesProcessed: number;
  internalHyperlinksFormatted: number;
  allHyperlinksFormatted: number;
  warnings: string[];
}

export class CleanupHelper {
  private doc: Document;

  constructor(doc: Document) {
    this.doc = doc;
  }

  /**
   * Run all cleanup operations with default settings
   * @returns Cleanup report
   */
  all(): CleanupReport {
    return this.run({
      unlockSDTs: true,
      removeSDTs: true,
      clearPreserveFlags: true,
      defragmentHyperlinks: true,
      resetHyperlinkFormatting: true,
      cleanupNumbering: true,
      cleanupStyles: true,
      cleanupRelationships: true,
      removeCustomXML: true,
      unlockFields: true,
      unlockFrames: true,
      sanitizeTables: true,
      formatAllHyperlinks: true,
    });
  }

  /**
   * Run selective cleanup operations
   * @param options Cleanup options
   * @returns Cleanup report
   */
  run(options: CleanupOptions): CleanupReport {
    const report: CleanupReport = {
      sdtsUnlocked: 0,
      sdtsRemoved: 0,
      preserveFlagsCleared: 0,
      hyperlinksDefragmented: 0,
      numberingRemoved: 0,
      stylesRemoved: 0,
      relationshipsRemoved: 0,
      customXMLRemoved: 0,
      fieldsUnlocked: 0,
      framesUnlocked: 0,
      tablesProcessed: 0,
      internalHyperlinksFormatted: 0,
      allHyperlinksFormatted: 0,
      warnings: [],
    };

    if (options.unlockSDTs) {
      report.sdtsUnlocked = this.unlockSDTs();
    }

    if (options.removeSDTs) {
      report.sdtsRemoved = this.removeSDTs();
    }

    if (options.clearPreserveFlags) {
      report.preserveFlagsCleared = this.clearPreserveFlags();
    }

    if (options.defragmentHyperlinks) {
      report.hyperlinksDefragmented = this.defragmentHyperlinks(
        options.resetHyperlinkFormatting ?? false
      );
    }

    if (options.cleanupNumbering) {
      report.numberingRemoved = this.cleanupNumbering();
    }

    if (options.cleanupStyles) {
      report.stylesRemoved = this.cleanupStyles();
    }

    if (options.cleanupRelationships) {
      report.relationshipsRemoved = this.cleanupRelationships();
    }

    if (options.removeCustomXML) {
      report.customXMLRemoved = this.removeCustomXML();
    }

    if (options.unlockFields) {
      report.fieldsUnlocked = this.unlockFields();
    }

    if (options.unlockFrames) {
      report.framesUnlocked = this.unlockFrames();
    }

    if (options.sanitizeTables) {
      report.tablesProcessed = this.sanitizeTables();
    }

    if (options.formatInternalHyperlinks) {
      report.internalHyperlinksFormatted = this.formatInternalHyperlinks();
    }

    if (options.formatAllHyperlinks) {
      report.allHyperlinksFormatted = this.formatAllHyperlinks();
    }

    return report;
  }

  private unlockSDTs(): number {
    let count = 0;
    const bodyElements = this.doc.getBodyElements();

    for (const element of bodyElements) {
      if (element instanceof StructuredDocumentTag && element.isLocked()) {
        element.unlock();
        count++;
      }
    }

    // Also unlock in tables
    for (const table of this.doc.getAllTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          for (const para of cell.getParagraphs()) {
            // SDTs can wrap paragraphs in cells
            const content = para.getContent();
            for (const item of content) {
              if (item instanceof StructuredDocumentTag && item.isLocked()) {
                item.unlock();
                count++;
              }
            }
          }
        }
      }
    }

    return count;
  }

  private removeSDTs(): number {
    // Delegate to existing clearCustom() which removes SDTs and unwraps content
    const before = this.doc.getBodyElements().length;
    this.doc.clearCustom();
    const after = this.doc.getBodyElements().length;
    return Math.abs(after - before); // Approximate count of removed SDTs
  }

  private clearPreserveFlags(): number {
    return this.doc.removeAllPreserveFlags();
  }

  private defragmentHyperlinks(resetFormatting: boolean): number {
    return this.doc.defragmentHyperlinks({
      resetFormatting,
      cleanupRelationships: true,
    });
  }

  private cleanupNumbering(): number {
    const before = this.doc.getNumberingManager().getAllInstances().length;
    this.doc.cleanupUnusedNumbering();
    const after = this.doc.getNumberingManager().getAllInstances().length;
    return before - after;
  }

  private cleanupStyles(): number {
    // Implementation for unused styles removal
    // Scan all paragraphs and runs for used styles
    const usedStyles = new Set<string>();
    for (const para of this.doc.getAllParagraphs()) {
      const paraStyle = para.getFormatting().style;
      if (paraStyle) usedStyles.add(paraStyle);
      for (const run of para.getRuns()) {
        const runStyle = run.getFormatting().characterStyle;
        if (runStyle) usedStyles.add(runStyle);
      }
    }

    // Remove unused styles
    let removed = 0;
    const allStyles = this.doc.getStylesManager().getAllStyles();
    for (const style of allStyles) {
      if (!usedStyles.has(style.getStyleId())) {
        this.doc.getStylesManager().removeStyle(style.getStyleId());
        removed++;
      }
    }

    return removed;
  }

  private cleanupRelationships(): number {
    // Collect referenced IDs
    const referencedIds = new Set<string>();
    const hyperlinks = this.doc.getHyperlinks();
    for (const { hyperlink } of hyperlinks) {
      const relId = hyperlink.getRelationshipId();
      if (relId) referencedIds.add(relId);
    }

    // Remove orphaned hyperlink relationships
    return this.doc
      .getRelationshipManager()
      .removeOrphanedHyperlinks(referencedIds);
  }

  private removeCustomXML(): number {
    const zipHandler = this.doc.getZipHandler();
    let removed = 0;

    // Remove customXML files
    const files = zipHandler.getFilePaths();
    for (const file of files) {
      if (file.startsWith('customXml/') || file.startsWith('customXML/')) {
        zipHandler.removeFile(file);
        removed++;
      }
    }

    // Remove customXML relationships
    const relManager = this.doc.getRelationshipManager();
    const customRels = relManager.getRelationshipsByType(
      'http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml'
    );
    for (const rel of customRels) {
      relManager.removeRelationship(rel.getId());
      removed++;
    }

    // Remove custom.xml if present (docProps/custom.xml)
    if (zipHandler.hasFile('docProps/custom.xml')) {
      zipHandler.removeFile('docProps/custom.xml');
      removed++;
    }

    return removed;
  }

  private unlockFields(): number {
    const zipHandler = this.doc.getZipHandler();
    const docXml = zipHandler.getFileAsString('word/document.xml');
    if (!docXml) return 0;

    // Count matches first, then replace (avoid regex re-execution)
    const pattern = /w:fldLock="(1|true)"/g;
    const matches = docXml.match(pattern) || [];
    if (matches.length === 0) return 0;

    // Remove w:fldLock="1" or w:fldLock="true"
    const updatedXml = docXml.replace(pattern, '');
    zipHandler.updateFile('word/document.xml', updatedXml);

    return matches.length;
  }

  private unlockFrames(): number {
    const zipHandler = this.doc.getZipHandler();
    const docXml = zipHandler.getFileAsString('word/document.xml');
    if (!docXml) return 0;

    // Count matches first, then replace (avoid regex re-execution)
    const pattern = /w:anchorLock="(1|true)"/g;
    const matches = docXml.match(pattern) || [];
    if (matches.length === 0) return 0;

    // Remove w:anchorLock="1" or w:anchorLock="true"
    const updatedXml = docXml.replace(pattern, '');
    zipHandler.updateFile('word/document.xml', updatedXml);

    return matches.length;
  }

  private sanitizeTables(): number {
    const tables = this.doc.getAllTables();
    let processed = 0;
    for (const table of tables) {
      this.doc.sanitizeTableRowExceptions(table);
      processed++;
    }
    return processed;
  }

  private formatInternalHyperlinks(): number {
    let count = 0;
    const formatting = {
      font: 'Verdana',
      size: 12,
      color: '0000FF',
      underline: 'single' as const,
    };

    // Process body paragraphs
    for (const paragraph of this.doc.getAllParagraphs()) {
      for (const item of paragraph.getContent()) {
        if (item instanceof Hyperlink && item.isInternal()) {
          item.setFormatting(formatting, { replace: true });
          count++;
        }
      }
    }

    // Process table paragraphs
    for (const table of this.doc.getAllTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          for (const para of cell.getParagraphs()) {
            for (const item of para.getContent()) {
              if (item instanceof Hyperlink && item.isInternal()) {
                item.setFormatting(formatting, { replace: true });
                count++;
              }
            }
          }
        }
      }
    }

    return count;
  }

  /**
   * Formats ALL hyperlinks in the document with standard styling
   * This includes:
   * - Internal w:hyperlink elements (bookmarks)
   * - External w:hyperlink elements (URLs)
   * - HYPERLINK fields (both simple w:fldSimple and complex fields)
   *
   * Standard formatting: Verdana 12pt, #0000FF blue, single underline
   * @returns Number of hyperlinks formatted
   */
  private formatAllHyperlinks(): number {
    let count = 0;
    const formatting = {
      font: 'Verdana',
      size: 12,
      color: '0000FF',
      underline: 'single' as const,
    };

    // Helper to process paragraph content
    const processParagraph = (paragraph: any): void => {
      for (const item of paragraph.getContent()) {
        // Process all Hyperlink instances (both internal AND external)
        if (item instanceof Hyperlink) {
          item.setFormatting(formatting, { replace: true });
          count++;
        }
        // Process simple HYPERLINK fields
        if (item instanceof Field && item.isHyperlinkField()) {
          item.setFormatting(formatting);
          count++;
        }
        // Process complex HYPERLINK fields
        if (item instanceof ComplexField && item.isHyperlinkField()) {
          item.setResultFormatting(formatting);
          count++;
        }
      }
    };

    // Process body paragraphs
    for (const paragraph of this.doc.getAllParagraphs()) {
      processParagraph(paragraph);
    }

    // Process table paragraphs
    for (const table of this.doc.getAllTables()) {
      for (const row of table.getRows()) {
        for (const cell of row.getCells()) {
          for (const para of cell.getParagraphs()) {
            processParagraph(para);
          }
        }
      }
    }

    return count;
  }

  /**
   * Preset: Google Docs cleanup
   */
  static googleDocsPreset(): CleanupOptions {
    return {
      unlockSDTs: true,
      removeSDTs: true,
      defragmentHyperlinks: true,
      resetHyperlinkFormatting: true,
      cleanupRelationships: true,
      removeCustomXML: true,
      sanitizeTables: true,
    };
  }

  /**
   * Preset: Full cleanup
   */
  static fullCleanupPreset(): CleanupOptions {
    return {
      unlockSDTs: true,
      removeSDTs: true,
      clearPreserveFlags: true,
      defragmentHyperlinks: true,
      resetHyperlinkFormatting: true,
      cleanupNumbering: true,
      cleanupStyles: true,
      cleanupRelationships: true,
      removeCustomXML: true,
      unlockFields: true,
      unlockFrames: true,
      sanitizeTables: true,
      formatAllHyperlinks: true,
    };
  }

  /**
   * Preset: Minimal cleanup
   */
  static minimalPreset(): CleanupOptions {
    return {
      cleanupRelationships: true,
      removeCustomXML: true,
    };
  }
}
