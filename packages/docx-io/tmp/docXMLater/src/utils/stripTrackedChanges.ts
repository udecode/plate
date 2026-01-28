import { ZipHandler } from '../zip/ZipHandler';

/**
 * Strips all tracked changes markup from a Word document
 * This includes insertions, deletions, move operations, and property changes
 * Also cleans up related metadata in people.xml, settings.xml, and core.xml
 */
export class TrackedChangesStripper {
  private zipHandler: ZipHandler;

  constructor(zipHandler: ZipHandler) {
    this.zipHandler = zipHandler;
  }

  /**
   * Main method to strip all tracked changes from the document
   */
  public async stripTrackedChanges(): Promise<void> {
    // Strip revision elements from document.xml
    await this.stripDocumentRevisions();

    // Clean up metadata files
    await this.cleanupPeopleXml();
    await this.cleanupSettingsXml();
    await this.cleanupCorePropsXml();
  }

  /**
   * Strip ALL revision elements from word/document.xml
   */
  private async stripDocumentRevisions(): Promise<void> {
    const documentXml = this.zipHandler.getFileAsString('word/document.xml');
    if (!documentXml) {
      return;
    }

    let content = documentXml;

    // STEP 1: Remove all range markers (boundary markers for tracked changes)
    content = this.removeRangeMarkers(content);

    // STEP 2: Process insertions - keep content, remove wrapper
    content = this.processInsertions(content);

    // STEP 3: Process deletions - remove entirely
    content = this.processDeletions(content);

    // STEP 4: Process move operations
    content = this.processMoveFrom(content);
    content = this.processMoveTo(content);

    // STEP 5: Remove all property change tracking elements
    content = this.removePropertyChanges(content);

    // STEP 6: Remove any remaining self-closing revision tags
    content = this.removeSelfClosingRevisionTags(content);

    // Update the file in the zip
    this.zipHandler.updateFile('word/document.xml', content);
  }

  /**
   * Remove all range marker elements
   */
  private removeRangeMarkers(xml: string): string {
    const patterns = [
      /<w:moveFromRangeStart[^>]*\/>/g,
      /<w:moveFromRangeEnd[^>]*\/>/g,
      /<w:moveToRangeStart[^>]*\/>/g,
      /<w:moveToRangeEnd[^>]*\/>/g,
      /<w:customXmlInsRangeStart[^>]*\/>/g,
      /<w:customXmlInsRangeEnd[^>]*\/>/g,
      /<w:customXmlDelRangeStart[^>]*\/>/g,
      /<w:customXmlDelRangeEnd[^>]*\/>/g,
      /<w:customXmlMoveFromRangeStart[^>]*\/>/g,
      /<w:customXmlMoveFromRangeEnd[^>]*\/>/g,
      /<w:customXmlMoveToRangeStart[^>]*\/>/g,
      /<w:customXmlMoveToRangeEnd[^>]*\/>/g
    ];

    let result = xml;
    for (const pattern of patterns) {
      result = result.replace(pattern, '');
    }

    return result;
  }

  /**
   * Process <w:ins> elements - keep inner content, remove wrapper
   * Handles orphaned tags by removing opening and closing tags separately
   *
   * IMPORTANT: This method now handles relationship ID remapping for images inside insertions.
   * When Word tracks changes with images, it can reuse relationship IDs (like rId5) because
   * they're in separate tracked change contexts. But when we unwrap them, duplicate IDs
   * cause corruption. This method assigns new unique IDs to images inside insertions.
   */
  private processInsertions(xml: string): string {
    let result = xml;

    // Parse existing relationships
    const relationships = this.parseRelationships();
    const existingIds = new Set(relationships.keys());

    // Process each w:ins element and remap images one by one
    const insRegex = /<w:ins\b[^>]*>[\s\S]*?<\/w:ins>/g;

    result = result.replace(insRegex, (insMatch) => {
      // For each image reference inside this insertion, generate a unique new ID
      return insMatch.replace(/r:embed="(rId\d+)"/g, (embedMatch, oldId) => {
        // Generate new unique ID for THIS occurrence
        const newId = this.getNextRelationshipId(existingIds);
        existingIds.add(newId);

        // Add relationship with same target as original
        const target = relationships.get(oldId);
        if (target) {
          this.addRelationship(
            newId,
            target,
            'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image'
          );
        }

        return `r:embed="${newId}"`;
      });
    });

    // First, remove all closing tags
    result = result.replace(/<\/w:ins>/g, '');

    // Then, remove all opening tags (keeping any content that follows)
    result = result.replace(/<w:ins[\s>][^>]*>/g, '');

    return result;
  }

  /**
   * Process <w:del> elements - remove entire element
   * Uses iterative replacement to handle nested deletions
   */
  private processDeletions(xml: string): string {
    let result = xml;
    let previousLength = 0;
    
    // Keep replacing until no more changes (handles nested revisions)
    while (result.length !== previousLength) {
      previousLength = result.length;
      
      // Match entire deletion element and remove it
      // Use [\s>] to match either space or closing bracket
      result = result.replace(/<w:del[\s>][^>]*>.*?<\/w:del>/gs, '');
    }
    
    return result;
  }

  /**
   * Process <w:moveFrom> elements - remove entire element (source of move)
   * Uses iterative replacement to handle nested moves
   */
  private processMoveFrom(xml: string): string {
    let result = xml;
    let previousLength = 0;
    
    // Keep replacing until no more changes
    while (result.length !== previousLength) {
      previousLength = result.length;
      
      // Use [\s>] to match either space or closing bracket
      result = result.replace(/<w:moveFrom[\s>][^>]*>.*?<\/w:moveFrom>/gs, '');
    }
    
    return result;
  }

  /**
   * Process <w:moveTo> elements - keep inner content (destination of move)
   * Handles orphaned tags by removing opening and closing tags separately
   */
  private processMoveTo(xml: string): string {
    let result = xml;
    
    // First, remove all closing tags
    result = result.replace(/<\/w:moveTo>/g, '');
    
    // Then, remove all opening tags (keeping any content that follows)
    result = result.replace(/<w:moveTo[\s>][^>]*>/g, '');
    
    return result;
  }

  /**
   * Remove all property change tracking elements
   */
  private removePropertyChanges(xml: string): string {
    const patterns = [
      /<w:rPrChange[^>]*>.*?<\/w:rPrChange>/gs,      // Run property changes
      /<w:pPrChange[^>]*>.*?<\/w:pPrChange>/gs,      // Paragraph property changes
      /<w:tblPrChange[^>]*>.*?<\/w:tblPrChange>/gs,  // Table property changes
      /<w:tblPrExChange[^>]*>.*?<\/w:tblPrExChange>/gs, // Table property exception changes
      /<w:tcPrChange[^>]*>.*?<\/w:tcPrChange>/gs,    // Table cell property changes
      /<w:trPrChange[^>]*>.*?<\/w:trPrChange>/gs,    // Table row property changes
      /<w:sectPrChange[^>]*>.*?<\/w:sectPrChange>/gs, // Section property changes
      /<w:tblGridChange[^>]*>.*?<\/w:tblGridChange>/gs, // Table grid changes
      /<w:numberingChange[^>]*>.*?<\/w:numberingChange>/gs // Numbering changes
    ];

    let result = xml;
    for (const pattern of patterns) {
      result = result.replace(pattern, '');
    }

    return result;
  }

  /**
   * Remove self-closing revision tags
   */
  private removeSelfClosingRevisionTags(xml: string): string {
    const patterns = [
      /<w:ins\s+[^>]*\/>/g,
      /<w:del\s+[^>]*\/>/g,
      /<w:moveFrom\s+[^>]*\/>/g,
      /<w:moveTo\s+[^>]*\/>/g
    ];

    let result = xml;
    for (const pattern of patterns) {
      result = result.replace(pattern, '');
    }

    return result;
  }

  /**
   * Parse relationship IDs from word/_rels/document.xml.rels
   * Returns a map of relationship ID to target path
   */
  private parseRelationships(): Map<string, string> {
    const relsXml = this.zipHandler.getFileAsString('word/_rels/document.xml.rels');
    if (!relsXml) return new Map();

    const map = new Map<string, string>();
    const relationshipRegex = /<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/>/g;
    let match;

    while ((match = relationshipRegex.exec(relsXml)) !== null) {
      if (match[1] && match[2]) {
        map.set(match[1], match[2]); // rId -> target path
      }
    }

    return map;
  }

  /**
   * Get the next available relationship ID
   * Finds the highest numeric ID and increments it
   */
  private getNextRelationshipId(existingIds: Set<string>): string {
    let maxId = 0;
    for (const id of existingIds) {
      const num = parseInt(id.replace('rId', ''));
      if (!isNaN(num) && num > maxId) {
        maxId = num;
      }
    }
    return `rId${maxId + 1}`;
  }

  /**
   * Add a new relationship to word/_rels/document.xml.rels
   */
  private addRelationship(rId: string, target: string, type: string): void {
    const relsXml = this.zipHandler.getFileAsString('word/_rels/document.xml.rels');
    if (!relsXml) return;

    // Insert new relationship before closing tag
    const newRel = `<Relationship Id="${rId}" Type="${type}" Target="${target}"/>`;
    const updated = relsXml.replace('</Relationships>', `${newRel}\n</Relationships>`);

    this.zipHandler.updateFile('word/_rels/document.xml.rels', updated);
  }

  /**
   * Clean up word/people.xml - remove revision authors
   */
  private async cleanupPeopleXml(): Promise<void> {
    const peopleXml = this.zipHandler.getFileAsString('word/people.xml');
    if (!peopleXml) {
      return;
    }

    let content = peopleXml;

    // Remove all <w:person> elements (standard namespace)
    content = content.replace(/<w:person[^>]*>.*?<\/w:person>/gs, '');

    // Remove all <w15:person> elements (Word 2013+ namespace)
    content = content.replace(/<w15:person[^>]*>.*?<\/w15:person>/gs, '');

    // Remove any other namespace variants of person elements
    content = content.replace(/<w\d*:person[^>]*>.*?<\/w\d*:person>/gs, '');

    this.zipHandler.updateFile('word/people.xml', content);
  }

  /**
   * Clean up word/settings.xml - disable track changes
   */
  private async cleanupSettingsXml(): Promise<void> {
    const settingsXml = this.zipHandler.getFileAsString('word/settings.xml');
    if (!settingsXml) {
      return;
    }

    let content = settingsXml;

    // Remove track changes settings
    content = content.replace(/<w:trackRevisions[^>]*\/>/g, '');
    content = content.replace(/<w:trackRevisions[^>]*>.*?<\/w:trackRevisions>/gs, '');

    // Remove revision view settings
    content = content.replace(/<w:revisionView[^>]*\/>/g, '');
    content = content.replace(/<w:revisionView[^>]*>.*?<\/w:revisionView>/gs, '');

    this.zipHandler.updateFile('word/settings.xml', content);
  }

  /**
   * Clean up docProps/core.xml - reset revision count
   */
  private async cleanupCorePropsXml(): Promise<void> {
    const coreXml = this.zipHandler.getFileAsString('docProps/core.xml');
    if (!coreXml) {
      return;
    }

    // Reset revision count to 1
    const content = coreXml.replace(/<cp:revision>\d+<\/cp:revision>/g, '<cp:revision>1</cp:revision>');

    this.zipHandler.updateFile('docProps/core.xml', content);
  }
}

/**
 * Convenience function to strip tracked changes from a ZipHandler
 */
export async function stripTrackedChanges(zipHandler: ZipHandler): Promise<void> {
  const stripper = new TrackedChangesStripper(zipHandler);
  await stripper.stripTrackedChanges();
}
