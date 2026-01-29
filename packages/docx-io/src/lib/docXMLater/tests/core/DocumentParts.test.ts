/**
 * Tests for Document Part Access Methods
 *
 * Validates the new low-level document part access API that enables
 * advanced operations not covered by the high-level API.
 */

import { Document, Hyperlink } from '../../src';

describe('Document Part Access Methods', () => {
  let doc: Document;

  beforeEach(() => {
    doc = Document.create();
  });

  describe('getPart', () => {
    it('should retrieve an existing part', async () => {
      const part = await doc.getPart('word/document.xml');

      expect(part).not.toBeNull();
      expect(part!.name).toBe('word/document.xml');
      expect(part!.content).toContain('<w:document');
      expect(part!.isBinary).toBe(false);
      expect(part!.size).toBeGreaterThan(0);
    });

    it('should return null for non-existent part', async () => {
      const part = await doc.getPart('word/non-existent.xml');

      expect(part).toBeNull();
    });

    it('should handle binary parts correctly', async () => {
      // Add a binary part
      const binaryContent = Buffer.from([0xff, 0xd8, 0xff, 0xe0]); // JPEG magic bytes
      await doc.setPart('word/media/test.jpg', binaryContent);

      const part = await doc.getPart('word/media/test.jpg');

      expect(part).not.toBeNull();
      expect(part!.isBinary).toBe(true);
      expect(Buffer.isBuffer(part!.content)).toBe(true);
      expect(part!.size).toBe(4);
    });

    it('should retrieve content type for known parts', async () => {
      const part = await doc.getPart('[Content_Types].xml');

      expect(part).not.toBeNull();
      expect(part!.contentType).toBeDefined();
    });
  });

  describe('setPart', () => {
    it('should add a new part', async () => {
      const customXml = '<custom>Test Content</custom>';

      await doc.setPart('customXml/item1.xml', customXml);

      const part = await doc.getPart('customXml/item1.xml');
      expect(part).not.toBeNull();
      expect(part!.content).toBe(customXml);
    });

    it('should update an existing part', async () => {
      const originalContent = await doc.getPart('word/document.xml');
      const newContent =
        '<?xml version="1.0"?><w:document>Modified</w:document>';

      await doc.setPart('word/document.xml', newContent);

      const updatedPart = await doc.getPart('word/document.xml');
      expect(updatedPart!.content).toBe(newContent);
      expect(updatedPart!.content).not.toBe(originalContent!.content);
    });

    it('should handle binary content', async () => {
      const imageBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG magic bytes

      await doc.setPart('word/media/image.png', imageBuffer);

      const part = await doc.getPart('word/media/image.png');
      expect(part!.isBinary).toBe(true);
      expect(part!.content).toEqual(imageBuffer);
    });
  });

  describe('removePart', () => {
    it('should remove an existing part', async () => {
      await doc.setPart('custom/test.xml', '<test/>');

      const removed = await doc.removePart('custom/test.xml');
      expect(removed).toBe(true);

      const part = await doc.getPart('custom/test.xml');
      expect(part).toBeNull();
    });

    it('should return false for non-existent part', async () => {
      const removed = await doc.removePart('does/not/exist.xml');

      expect(removed).toBe(false);
    });

    it('should not break document when removing optional parts', async () => {
      // Create and save a document
      doc.createParagraph('Test content');
      const buffer = await doc.toBuffer();

      // Load and remove an optional part
      const loadedDoc = await Document.loadFromBuffer(buffer);
      await loadedDoc.removePart('docProps/app.xml');

      // Document should still be valid
      const newBuffer = await loadedDoc.toBuffer();
      expect(newBuffer.length).toBeGreaterThan(0);
    });
  });

  describe('listParts', () => {
    it('should list all parts in a new document', async () => {
      const parts = await doc.listParts();

      expect(parts).toContain('[Content_Types].xml');
      expect(parts).toContain('_rels/.rels');
      expect(parts).toContain('word/document.xml');
      expect(parts).toContain('word/_rels/document.xml.rels');
    });

    it('should include newly added parts', async () => {
      await doc.setPart('custom/new.xml', '<data/>');

      const parts = await doc.listParts();

      expect(parts).toContain('custom/new.xml');
    });

    it('should not include removed parts', async () => {
      await doc.setPart('temp/file.xml', '<temp/>');
      await doc.removePart('temp/file.xml');

      const parts = await doc.listParts();

      expect(parts).not.toContain('temp/file.xml');
    });
  });

  describe('partExists', () => {
    it('should return true for existing parts', async () => {
      const exists = await doc.partExists('word/document.xml');

      expect(exists).toBe(true);
    });

    it('should return false for non-existent parts', async () => {
      const exists = await doc.partExists('word/non-existent.xml');

      expect(exists).toBe(false);
    });

    it('should reflect changes after adding/removing parts', async () => {
      const partName = 'dynamic/part.xml';

      expect(await doc.partExists(partName)).toBe(false);

      await doc.setPart(partName, '<content/>');
      expect(await doc.partExists(partName)).toBe(true);

      await doc.removePart(partName);
      expect(await doc.partExists(partName)).toBe(false);
    });
  });

  describe('getContentTypes', () => {
    it('should retrieve default content types', async () => {
      const contentTypes = await doc.getContentTypes();

      expect(contentTypes.size).toBeGreaterThan(0);
      expect(contentTypes.get('.rels')).toBe(
        'application/vnd.openxmlformats-package.relationships+xml'
      );
      expect(contentTypes.get('.xml')).toBe('application/xml');
    });

    it('should retrieve override content types', async () => {
      const contentTypes = await doc.getContentTypes();

      expect(contentTypes.get('/word/document.xml')).toContain(
        'wordprocessingml.document.main'
      );
    });
  });

  describe('addContentType', () => {
    it('should add new extension content type', async () => {
      const added = await doc.addContentType('.json', 'application/json');

      expect(added).toBe(true);

      const contentTypes = await doc.getContentTypes();
      expect(contentTypes.get('.json')).toBe('application/json');
    });

    it('should add new override content type', async () => {
      const added = await doc.addContentType(
        '/custom/data.xml',
        'application/custom+xml'
      );

      expect(added).toBe(true);

      const contentTypes = await doc.getContentTypes();
      expect(contentTypes.get('/custom/data.xml')).toBe(
        'application/custom+xml'
      );
    });

    it('should update existing content type', async () => {
      // First add
      await doc.addContentType('.txt', 'text/plain');

      // Then update
      const updated = await doc.addContentType(
        '.txt',
        'text/plain; charset=utf-8'
      );

      expect(updated).toBe(true);

      const contentTypes = await doc.getContentTypes();
      expect(contentTypes.get('.txt')).toBe('text/plain; charset=utf-8');
    });
  });

  describe('getAllRelationships', () => {
    it('should retrieve all relationship files', async () => {
      const relationships = await doc.getAllRelationships();

      expect(relationships.size).toBeGreaterThan(0);
      expect(relationships.has('_rels/.rels')).toBe(true);
      expect(relationships.has('word/_rels/document.xml.rels')).toBe(true);
    });

    it('should parse relationship attributes correctly', async () => {
      const relationships = await doc.getAllRelationships();
      const packageRels = relationships.get('_rels/.rels');

      expect(packageRels).toBeDefined();
      expect(packageRels!.length).toBeGreaterThan(0);

      const docRel = packageRels!.find(
        (rel) => rel.target === 'word/document.xml'
      );
      expect(docRel).toBeDefined();
      expect(docRel.id).toBeDefined();
      expect(docRel.type).toContain('officeDocument');
    });

    it('should include external relationships', async () => {
      // Add a hyperlink which creates an external relationship
      const para = doc.createParagraph();
      para.addHyperlink(
        Hyperlink.createExternal('https://example.com', 'Link')
      );
      await doc.toBuffer(); // Process hyperlinks

      const relationships = await doc.getAllRelationships();
      const docRels = relationships.get('word/_rels/document.xml.rels');

      const externalRel = docRels?.find((rel) => rel.targetMode === 'External');
      expect(externalRel).toBeDefined();
      expect(externalRel?.target).toBe('https://example.com');
    });
  });

  describe('Document.createEmpty', () => {
    it('should create minimal valid DOCX structure', async () => {
      const emptyDoc = Document.createEmpty();

      const parts = await emptyDoc.listParts();

      // Should have only minimal required parts
      expect(parts).toContain('[Content_Types].xml');
      expect(parts).toContain('_rels/.rels');
      expect(parts).toContain('word/document.xml');
      expect(parts).toContain('word/_rels/document.xml.rels');

      // Should not have optional parts
      expect(parts).not.toContain('word/styles.xml');
      expect(parts).not.toContain('word/numbering.xml');
      expect(parts).not.toContain('docProps/core.xml');
    });

    it('should create a document that can be saved', async () => {
      const emptyDoc = Document.createEmpty();

      // Should be able to save without errors
      const buffer = await emptyDoc.toBuffer();
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should create a document that can be modified', async () => {
      const emptyDoc = Document.createEmpty();

      // Add content
      emptyDoc.createParagraph('Test paragraph');

      // Save and reload
      const buffer = await emptyDoc.toBuffer();
      const loadedDoc = await Document.loadFromBuffer(buffer);

      const paragraphs = loadedDoc.getParagraphs();
      expect(paragraphs.length).toBe(1);
      expect(paragraphs[0]?.getText()).toBe('Test paragraph');
    });
  });

  describe('Integration: URL replacement with relationship update', () => {
    it('should update hyperlink URLs and relationships correctly', async () => {
      // Create document with hyperlinks
      const para1 = doc.createParagraph();
      para1.addHyperlink(
        Hyperlink.createExternal('https://old-site.com', 'Old Site')
      );

      const para2 = doc.createParagraph();
      para2.addHyperlink(
        Hyperlink.createExternal('https://example.org', 'Example')
      );

      // Save to process hyperlinks
      let buffer = await doc.toBuffer();
      doc = await Document.loadFromBuffer(buffer);

      // Update URLs
      const urlMap = new Map([
        ['https://old-site.com', 'https://new-site.com'],
        ['https://example.org', 'https://example.com'],
      ]);

      const updated = doc.updateHyperlinkUrls(urlMap);
      expect(updated).toBe(2);

      // Save and check relationships
      buffer = await doc.toBuffer();
      const finalDoc = await Document.loadFromBuffer(buffer);

      const relationships = await finalDoc.getAllRelationships();
      const docRels = relationships.get('word/_rels/document.xml.rels');

      // Check that new URLs are in relationships
      const targets = docRels?.map((rel) => rel.target) || [];
      expect(targets).toContain('https://new-site.com');
      expect(targets).toContain('https://example.com');
      expect(targets).not.toContain('https://old-site.com');
      expect(targets).not.toContain('https://example.org');
    });

    it('should preserve hyperlink functionality when updating URLs', async () => {
      // Create document with hyperlink
      const para = doc.createParagraph();
      para.addHyperlink(Hyperlink.createExternal('https://test.com', 'Test'));

      // Save to process hyperlinks
      let buffer = await doc.toBuffer();
      doc = await Document.loadFromBuffer(buffer);

      // Get original relationship count
      const origRelsBefore = await doc.getAllRelationships();
      const origDocRels = origRelsBefore.get('word/_rels/document.xml.rels');
      const origRel = origDocRels?.find(
        (rel) => rel.target === 'https://test.com'
      );
      const origRelCount = origDocRels?.length || 0;

      expect(origRel).toBeDefined();
      expect(origRel?.type).toContain('hyperlink');

      // Update URL
      const urlMap = new Map([['https://test.com', 'https://updated.com']]);
      doc.updateHyperlinkUrls(urlMap);

      // Save and verify the hyperlink works correctly
      buffer = await doc.toBuffer();
      const updatedDoc = await Document.loadFromBuffer(buffer);

      const relsAfter = await updatedDoc.getAllRelationships();
      const docRelsAfter = relsAfter.get('word/_rels/document.xml.rels');
      const updatedRel = docRelsAfter?.find(
        (rel) => rel.target === 'https://updated.com'
      );

      // Verify the relationship exists and is valid
      expect(updatedRel).toBeDefined();
      expect(updatedRel?.type).toContain('hyperlink');
      expect(updatedRel?.id).toMatch(/^rId\d+$/); // Should be a valid rId

      // Verify the old URL is gone
      const oldRel = docRelsAfter?.find(
        (rel) => rel.target === 'https://test.com'
      );
      expect(oldRel).toBeUndefined();

      // Verify relationship count hasn't changed
      expect(docRelsAfter?.length).toBe(origRelCount);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle special characters in part names', async () => {
      const partName = 'custom/file with spaces.xml';
      const content = '<data>Test</data>';

      await doc.setPart(partName, content);

      const part = await doc.getPart(partName);
      expect(part).not.toBeNull();
      expect(part!.content).toBe(content);
    });

    it('should handle empty content', async () => {
      await doc.setPart('empty/file.xml', '');

      const part = await doc.getPart('empty/file.xml');
      expect(part).not.toBeNull();
      expect(part!.content).toBe('');
      expect(part!.size).toBe(0);
    });

    it('should handle large binary content', async () => {
      const largeBuffer = Buffer.alloc(1024 * 1024, 0xff); // 1MB

      await doc.setPart('large/binary.bin', largeBuffer);

      const part = await doc.getPart('large/binary.bin');
      expect(part).not.toBeNull();
      expect(part!.size).toBe(1024 * 1024);
    });

    it('should preserve XML content without modification', async () => {
      const xmlContent =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<root xmlns:custom="http://example.com">\n' +
        '  <item attr="value &amp; special">Content with &lt;tags&gt;</item>\n' +
        '</root>';

      await doc.setPart('preserve/test.xml', xmlContent);

      const part = await doc.getPart('preserve/test.xml');
      expect(part!.content).toBe(xmlContent);
    });
  });
});
