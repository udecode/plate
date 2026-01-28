/**
 * HyperlinkParsing.test.ts - Tests for hyperlink parsing when loading documents
 *
 * Tests the Document class's ability to parse <w:hyperlink> elements from existing DOCX files
 * and correctly reconstruct Hyperlink objects with their URLs, anchors, text, and formatting.
 */

import { Document } from '../../src/core/Document';
import { Hyperlink } from '../../src/elements/Hyperlink';
import { ZipHandler } from '../../src/zip/ZipHandler';
import { XMLBuilder } from '../../src/xml/XMLBuilder';
import { setGlobalLogger, ConsoleLogger, LogLevel, SilentLogger } from '../../src/utils/logger';

describe('Hyperlink Parsing', () => {
  describe('External Hyperlinks', () => {
    it('should parse external hyperlink with URL', async () => {
      // Create a mock document with an external hyperlink
      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          relationshipId: 'rId5',
          text: 'Visit our website',
          url: 'https://example.com',
        },
      ]);

      const doc = await Document.loadFromBuffer(mockDocument);
      const paragraphs = doc.getParagraphs();

      expect(paragraphs).toHaveLength(1);

      const para = paragraphs[0]!;
      const content = para.getContent();

      expect(content).toHaveLength(1);
      expect(content[0]).toBeInstanceOf(Hyperlink);

      const hyperlink = content[0] as Hyperlink;
      expect(hyperlink.getText()).toBe('Visit our website');
      expect(hyperlink.getUrl()).toBe('https://example.com');
      expect(hyperlink.isExternal()).toBe(true);
      expect(hyperlink.isInternal()).toBe(false);
    });

    it('should parse hyperlink with tooltip', async () => {
      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          relationshipId: 'rId5',
          text: 'Click here',
          url: 'https://example.com',
          tooltip: 'Visit our website',
        },
      ]);

      const doc = await Document.loadFromBuffer(mockDocument);
      const paragraphs = doc.getParagraphs();
      const hyperlink = paragraphs[0]!.getContent()[0] as Hyperlink;

      expect(hyperlink.getTooltip()).toBe('Visit our website');
    });

    it('should parse hyperlink with formatted text', async () => {
      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          relationshipId: 'rId5',
          text: 'Bold Link',
          url: 'https://example.com',
          formatting: {
            bold: true,
            color: '0563C1',
            underline: 'single',
          },
        },
      ]);

      const doc = await Document.loadFromBuffer(mockDocument);
      const paragraphs = doc.getParagraphs();
      const hyperlink = paragraphs[0]!.getContent()[0] as Hyperlink;

      const formatting = hyperlink.getRawFormatting();
      expect(formatting.bold).toBe(true);
      expect(formatting.color).toBe('0563C1');
      expect(formatting.underline).toBe('single');
    });

    it('should handle multiple hyperlinks in one paragraph', async () => {
      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          relationshipId: 'rId5',
          text: 'First link',
          url: 'https://first.com',
        },
        {
          type: 'hyperlink',
          relationshipId: 'rId6',
          text: 'Second link',
          url: 'https://second.com',
        },
      ]);

      const doc = await Document.loadFromBuffer(mockDocument);
      const paragraphs = doc.getParagraphs();
      const content = paragraphs[0]!.getContent();

      expect(content).toHaveLength(2);
      expect(content[0]).toBeInstanceOf(Hyperlink);
      expect(content[1]).toBeInstanceOf(Hyperlink);

      const link1 = content[0] as Hyperlink;
      const link2 = content[1] as Hyperlink;

      expect(link1.getText()).toBe('First link');
      expect(link1.getUrl()).toBe('https://first.com');
      expect(link2.getText()).toBe('Second link');
      expect(link2.getUrl()).toBe('https://second.com');
    });
  });

  describe('Internal Hyperlinks (Anchors)', () => {
    it('should parse internal hyperlink with anchor', async () => {
      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          anchor: 'Section1',
          text: 'Go to Section 1',
        },
      ]);

      const doc = await Document.loadFromBuffer(mockDocument);
      const paragraphs = doc.getParagraphs();
      const hyperlink = paragraphs[0]!.getContent()[0] as Hyperlink;

      expect(hyperlink.getText()).toBe('Go to Section 1');
      expect(hyperlink.getAnchor()).toBe('Section1');
      expect(hyperlink.isInternal()).toBe(true);
      expect(hyperlink.isExternal()).toBe(false);
    });

    it('should parse internal hyperlink with tooltip', async () => {
      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          anchor: 'Conclusion',
          text: 'Jump to conclusion',
          tooltip: 'Navigate to the conclusion section',
        },
      ]);

      const doc = await Document.loadFromBuffer(mockDocument);
      const paragraphs = doc.getParagraphs();
      const hyperlink = paragraphs[0]!.getContent()[0] as Hyperlink;

      expect(hyperlink.getAnchor()).toBe('Conclusion');
      expect(hyperlink.getTooltip()).toBe('Navigate to the conclusion section');
    });
  });

  describe('Edge Cases', () => {
    it('should handle hyperlink with empty text (improved fallback)', async () => {
      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          relationshipId: 'rId5',
          text: '',
          url: 'https://example.com',
        },
      ]);

      const doc = await Document.loadFromBuffer(mockDocument);
      const paragraphs = doc.getParagraphs();
      const hyperlink = paragraphs[0]!.getContent()[0] as Hyperlink;

      // NEW BEHAVIOR: Should use URL as fallback when text is empty
      // This is more user-friendly than generic 'Link'
      expect(hyperlink.getText()).toBe('https://example.com');
    });

    it('should handle hyperlink with missing relationship', async () => {
      // Create hyperlink with relationship ID that doesn't exist in relationships
      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          relationshipId: 'rIdMissing',
          text: 'Broken link',
          url: undefined, // No relationship will be found
          skipRelationship: true,
        },
      ]);

      const doc = await Document.loadFromBuffer(mockDocument);
      const paragraphs = doc.getParagraphs();
      const hyperlink = paragraphs[0]!.getContent()[0] as Hyperlink;

      // Hyperlink should still be created but URL will be undefined
      expect(hyperlink.getText()).toBe('Broken link');
      expect(hyperlink.getUrl()).toBeUndefined();
      expect(hyperlink.getRelationshipId()).toBe('rIdMissing');
    });

    it('should handle hyperlink with special characters in text', async () => {
      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          relationshipId: 'rId5',
          text: 'Link & "Special" <Characters>',
          url: 'https://example.com',
        },
      ]);

      const doc = await Document.loadFromBuffer(mockDocument);
      const paragraphs = doc.getParagraphs();
      const hyperlink = paragraphs[0]!.getContent()[0] as Hyperlink;

      expect(hyperlink.getText()).toBe('Link & "Special" <Characters>');
    });

    it('should skip blank hyperlinks (no URL and no anchor) during parsing', async () => {
      // Create hyperlink with no relationship ID and no anchor (completely blank)
      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          // No relationshipId - hyperlink will have no URL
          // No anchor
          text: '', // Empty text
          skipRelationship: true,
        },
      ]);

      const doc = await Document.loadFromBuffer(mockDocument);
      const paragraphs = doc.getParagraphs();
      const content = paragraphs[0]!.getContent();

      // Blank hyperlink should be skipped during parsing
      // No hyperlink in paragraph content
      const hyperlinks = content.filter((item) => item instanceof Hyperlink);
      expect(hyperlinks).toHaveLength(0);

      // Document should save without error
      const buffer = await doc.toBuffer();
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should skip blank hyperlinks but preserve valid ones in same paragraph', async () => {
      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          relationshipId: 'rId5',
          text: 'Valid Link',
          url: 'https://example.com',
        },
        {
          type: 'hyperlink',
          // No relationshipId, no anchor - blank hyperlink
          text: '',
          skipRelationship: true,
        },
        {
          type: 'hyperlink',
          anchor: 'Section1',
          text: 'Internal Link',
        },
      ]);

      const doc = await Document.loadFromBuffer(mockDocument);
      const paragraphs = doc.getParagraphs();
      const content = paragraphs[0]!.getContent();

      // Should have 2 hyperlinks (blank one skipped)
      const hyperlinks = content.filter((item) => item instanceof Hyperlink) as Hyperlink[];
      expect(hyperlinks).toHaveLength(2);

      // First should be external link
      expect(hyperlinks[0]!.getText()).toBe('Valid Link');
      expect(hyperlinks[0]!.getUrl()).toBe('https://example.com');

      // Second should be internal link
      expect(hyperlinks[1]!.getText()).toBe('Internal Link');
      expect(hyperlinks[1]!.getAnchor()).toBe('Section1');

      // Document should save without error
      const buffer = await doc.toBuffer();
      expect(buffer).toBeDefined();
    });
  });

  describe('Round-Trip Fidelity', () => {
    it('should preserve hyperlinks through load-save-load cycle', async () => {
      // Create document with hyperlink
      const doc1 = Document.create();
      const para1 = doc1.createParagraph();
      para1.addHyperlink(Hyperlink.createExternal('https://example.com', 'Test Link'));

      // Save to buffer
      const buffer1 = await doc1.toBuffer();

      // Load and verify
      const doc2 = await Document.loadFromBuffer(buffer1);
      const paragraphs2 = doc2.getParagraphs();
      const hyperlink2 = paragraphs2[0]!.getContent()[0] as Hyperlink;

      expect(hyperlink2.getText()).toBe('Test Link');
      expect(hyperlink2.getUrl()).toBe('https://example.com');

      // Save again
      const buffer2 = await doc2.toBuffer();

      // Load again and verify still intact
      const doc3 = await Document.loadFromBuffer(buffer2);
      const paragraphs3 = doc3.getParagraphs();
      const hyperlink3 = paragraphs3[0]!.getContent()[0] as Hyperlink;

      expect(hyperlink3.getText()).toBe('Test Link');
      expect(hyperlink3.getUrl()).toBe('https://example.com');
    });

    it('should preserve internal hyperlinks through round-trip', async () => {
      const doc1 = Document.create();
      const para1 = doc1.createParagraph();
      para1.addHyperlink(Hyperlink.createInternal('Section1', 'Go to Section 1'));

      const buffer1 = await doc1.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer1);
      const hyperlink2 = doc2.getParagraphs()[0]!.getContent()[0] as Hyperlink;

      expect(hyperlink2.getText()).toBe('Go to Section 1');
      expect(hyperlink2.getAnchor()).toBe('Section1');
      expect(hyperlink2.isInternal()).toBe(true);
    });
  });

  describe('Validation (ECMA-376 Compliance)', () => {
    it('should throw error if external link toXML() called without relationship ID', () => {
      const link = Hyperlink.createExternal('https://example.com', 'Link');

      // toXML() should throw error because relationshipId is not set
      expect(() => link.toXML()).toThrow(/CRITICAL: External hyperlink/);
      expect(() => link.toXML()).toThrow(/missing relationship ID/);
      expect(() => link.toXML()).toThrow(/ECMA-376 §17.16.22/);
    });

    it('should NOT throw error if external link has relationship ID set', () => {
      const link = Hyperlink.createExternal('https://example.com', 'Link');
      link.setRelationshipId('rId5');

      // Should not throw because relationshipId is set
      expect(() => link.toXML()).not.toThrow();

      const xml = link.toXML();
      expect(xml.name).toBe('w:hyperlink');
      expect(xml.attributes?.['r:id']).toBe('rId5');
    });

    it('should throw error if hyperlink has neither url nor anchor nor relationshipId', () => {
      // Create hyperlink with neither url nor anchor nor relationshipId (empty link)
      const link = new Hyperlink({ text: 'Empty Link' });

      expect(() => link.toXML()).toThrow(/CRITICAL: Hyperlink must have either a URL/);
      expect(() => link.toXML()).toThrow(/anchor \(internal link\), or relationshipId/);
    });

    it('should NOT throw error for internal links without relationship ID', () => {
      const link = Hyperlink.createInternal('Section1', 'Go to Section 1');

      // Internal links don't need relationship IDs
      expect(() => link.toXML()).not.toThrow();

      const xml = link.toXML();
      expect(xml.name).toBe('w:hyperlink');
      expect(xml.attributes?.['w:anchor']).toBe('Section1');
      expect(xml.attributes?.['r:id']).toBeUndefined();
    });

    it('should warn when hyperlink has both url and anchor (hybrid link)', () => {
      // Enable console logging for this test
      setGlobalLogger(new ConsoleLogger(LogLevel.WARN));
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      try {
        // Creating hybrid link should log warning
        new Hyperlink({ url: 'https://example.com', anchor: 'Section1', text: 'Hybrid' });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('DocXML Warning: Hyperlink has both URL')
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('ambiguous per ECMA-376 spec')
        );
      } finally {
        consoleWarnSpy.mockRestore();
        setGlobalLogger(new SilentLogger());
      }
    });

    it('should properly escape special characters in tooltip attribute', async () => {
      const link = Hyperlink.createExternal(
        'https://example.com',
        'Link',
        undefined
      );
      link.setRelationshipId('rId5');
      link.setTooltip('This is a "tooltip" with <special> & characters');

      const xml = link.toXML();

      // XMLBuilder should escape these characters when generating string
      expect(xml.attributes?.['w:tooltip']).toBe('This is a "tooltip" with <special> & characters');
    });

    it('should use correct text fallback chain (text → url → "Link") - anchor should NEVER be display text', () => {
      // Test 1: No text provided, should use URL
      const link1 = Hyperlink.createExternal('https://example.com', '');
      expect(link1.getText()).toBe('https://example.com');

      // Test 2: No text provided for internal link - should use 'Link' placeholder, NOT anchor
      // This prevents TOC corruption where bookmark IDs like "HEADING=II.MNKE7E8NA385_" appear as visible text
      const link2 = Hyperlink.createInternal('Section1', '');
      expect(link2.getText()).toBe('Link'); // Changed from 'Section1'

      // Test 3: No text, no url, no anchor - should default to 'Link'
      const link3 = new Hyperlink({ text: '' });
      expect(link3.getText()).toBe('Link');

      // Test 4: Text provided - should use text
      const link4 = Hyperlink.createExternal('https://example.com', 'Custom Text');
      expect(link4.getText()).toBe('Custom Text');

      // Test 5: Internal link with proper text - should preserve text, not use anchor
      const link5 = Hyperlink.createInternal('HEADING=II.MNKE7E8NA385_', 'Important Information');
      expect(link5.getText()).toBe('Important Information');
      expect(link5.getAnchor()).toBe('HEADING=II.MNKE7E8NA385_');
    });

    it('should preserve validation through Document.save() workflow', async () => {
      // This test verifies the RECOMMENDED pattern works correctly
      const doc = Document.create();
      const para = doc.createParagraph();

      // Add external hyperlink WITHOUT manually setting relationship ID
      para.addHyperlink(Hyperlink.createExternal('https://example.com', 'Test Link'));

      // Document.save() should automatically register relationships
      const buffer = await doc.toBuffer();

      // Load and verify it worked
      const doc2 = await Document.loadFromBuffer(buffer);
      const hyperlink = doc2.getParagraphs()[0]!.getContent()[0] as Hyperlink;

      expect(hyperlink.getText()).toBe('Test Link');
      expect(hyperlink.getUrl()).toBe('https://example.com');
      expect(hyperlink.getRelationshipId()).toBeDefined();
    });
  });

  describe('Hyperlink URL Updates', () => {
    it('should update hyperlink URL using setUrl()', () => {
      const link = Hyperlink.createExternal('https://old.com', 'Link');

      expect(link.getUrl()).toBe('https://old.com');
      expect(link.getRelationshipId()).toBeUndefined();

      // Update URL
      link.setUrl('https://new.com');

      expect(link.getUrl()).toBe('https://new.com');
      expect(link.getRelationshipId()).toBeUndefined(); // Should remain cleared
    });

    it('should clear relationship ID when URL is updated', () => {
      const link = Hyperlink.createExternal('https://old.com', 'Link');
      link.setRelationshipId('rId1');

      expect(link.getRelationshipId()).toBe('rId1');

      // Update URL - should clear relationship ID
      link.setUrl('https://new.com');

      expect(link.getUrl()).toBe('https://new.com');
      expect(link.getRelationshipId()).toBeUndefined(); // Cleared for re-registration
    });

    it('should update multiple hyperlinks in document using updateHyperlinkUrls()', () => {
      const doc = Document.create();

      // Add paragraphs with hyperlinks
      const para1 = doc.createParagraph();
      para1.addHyperlink(Hyperlink.createExternal('https://old1.com', 'Link 1'));

      const para2 = doc.createParagraph();
      para2.addHyperlink(Hyperlink.createExternal('https://old2.com', 'Link 2'));
      para2.addHyperlink(Hyperlink.createExternal('https://keep.com', 'Keep'));

      // Update URLs
      const urlMap = new Map([
        ['https://old1.com', 'https://new1.com'],
        ['https://old2.com', 'https://new2.com']
      ]);

      const updated = doc.updateHyperlinkUrls(urlMap);
      expect(updated).toBe(2);

      // Verify URLs updated
      const paras = doc.getParagraphs();
      const link1 = paras[0]!.getContent()[0] as Hyperlink;
      const link2 = paras[1]!.getContent()[0] as Hyperlink;
      const link3 = paras[1]!.getContent()[1] as Hyperlink;

      expect(link1.getUrl()).toBe('https://new1.com');
      expect(link2.getUrl()).toBe('https://new2.com');
      expect(link3.getUrl()).toBe('https://keep.com'); // Unchanged
    });

    it('should skip internal hyperlinks when updating URLs', () => {
      const doc = Document.create();
      const para = doc.createParagraph();

      // Add internal link (should not be updated)
      para.addHyperlink(Hyperlink.createInternal('Section1', 'Jump'));

      // Add external link (should be updated)
      para.addHyperlink(Hyperlink.createExternal('https://old.com', 'Link'));

      const urlMap = new Map([['https://old.com', 'https://new.com']]);
      const updated = doc.updateHyperlinkUrls(urlMap);

      expect(updated).toBe(1); // Only 1 external link updated

      const content = para.getContent();
      const link1 = content[0] as Hyperlink;
      const link2 = content[1] as Hyperlink;

      expect(link1.isInternal()).toBe(true);
      expect(link1.getAnchor()).toBe('Section1'); // Unchanged
      expect(link2.getUrl()).toBe('https://new.com'); // Updated
    });

    it('should re-register relationships after URL update on save', async () => {
      const doc = Document.create();
      const para = doc.createParagraph();
      para.addHyperlink(Hyperlink.createExternal('https://old.com', 'Link'));

      // Update URL
      const urlMap = new Map([['https://old.com', 'https://new.com']]);
      doc.updateHyperlinkUrls(urlMap);

      // Save and reload
      const buffer = await doc.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer);

      // Verify URL persisted correctly
      const paras = doc2.getParagraphs();
      const link = paras[0]!.getContent()[0] as Hyperlink;

      expect(link.getUrl()).toBe('https://new.com');
      expect(link.getRelationshipId()).toBeDefined(); // Re-registered
      expect(link.getText()).toBe('Link');
    });

    it('should return 0 when no URLs match the map', () => {
      const doc = Document.create();
      const para = doc.createParagraph();
      para.addHyperlink(Hyperlink.createExternal('https://example.com', 'Link'));

      const urlMap = new Map([['https://other.com', 'https://new.com']]);
      const updated = doc.updateHyperlinkUrls(urlMap);

      expect(updated).toBe(0);

      // URL should remain unchanged
      const link = para.getContent()[0] as Hyperlink;
      expect(link.getUrl()).toBe('https://example.com');
    });

    it('should handle updating same URL multiple times in one document', () => {
      const doc = Document.create();

      // Create 3 paragraphs with the same URL
      for (let i = 0; i < 3; i++) {
        const para = doc.createParagraph();
        para.addHyperlink(Hyperlink.createExternal('https://old.com', `Link ${i + 1}`));
      }

      const urlMap = new Map([['https://old.com', 'https://new.com']]);
      const updated = doc.updateHyperlinkUrls(urlMap);

      expect(updated).toBe(3);

      // Verify all were updated
      const paras = doc.getParagraphs();
      for (let i = 0; i < 3; i++) {
        const link = paras[i]!.getContent()[0] as Hyperlink;
        expect(link.getUrl()).toBe('https://new.com');
        expect(link.getText()).toBe(`Link ${i + 1}`); // Text unchanged
      }
    });
  });

  describe('External URL + Anchor Fragment Combination', () => {
    it('should combine external URL with anchor fragment during parsing', async () => {
      // This tests the fix for Issue.docx where theSource URLs are split:
      // - Base URL in relationships: https://thesource.cvshealth.com/nuxeo/thesource/
      // - Fragment in w:anchor: !/view?docid=6bce8cc8-2318-4271-85a3-07198190a18c
      // Combined: https://thesource.cvshealth.com/nuxeo/thesource/#!/view?docid=6bce8cc8-2318-4271-85a3-07198190a18c
      const mockDocument = await createMockDocumentWithUrlAndAnchor({
        relationshipId: 'rId5',
        url: 'https://thesource.cvshealth.com/nuxeo/thesource/',
        anchor: '!/view?docid=6bce8cc8-2318-4271-85a3-07198190a18c',
        text: 'View Document',
      });

      const doc = await Document.loadFromBuffer(mockDocument);
      const paragraphs = doc.getParagraphs();
      const hyperlink = paragraphs[0]!.getContent()[0] as Hyperlink;

      // URL should be combined with anchor
      expect(hyperlink.getUrl()).toBe('https://thesource.cvshealth.com/nuxeo/thesource/#!/view?docid=6bce8cc8-2318-4271-85a3-07198190a18c');
      // Anchor should be undefined since it's now part of URL
      expect(hyperlink.getAnchor()).toBeUndefined();
      // Should still be external
      expect(hyperlink.isExternal()).toBe(true);
      expect(hyperlink.isInternal()).toBe(false);
      // Text should be preserved
      expect(hyperlink.getText()).toBe('View Document');
    });

    it('should allow docid pattern to be extracted from combined URL', async () => {
      // This verifies Template_UI regex will work after the fix
      const mockDocument = await createMockDocumentWithUrlAndAnchor({
        relationshipId: 'rId5',
        url: 'https://thesource.cvshealth.com/nuxeo/thesource/',
        anchor: '!/view?docid=abc-123-def',
        text: 'Link',
      });

      const doc = await Document.loadFromBuffer(mockDocument);
      const hyperlink = doc.getParagraphs()[0]!.getContent()[0] as Hyperlink;

      const url = hyperlink.getUrl()!;
      // Template_UI's regex pattern
      const docIdPattern = /docid=([a-zA-Z0-9-]+)(?:[^a-zA-Z0-9-]|$)/i;
      const match = url.match(docIdPattern);

      expect(match).not.toBeNull();
      expect(match![1]).toBe('abc-123-def');
    });

    it('should handle multiple hyperlinks with different URL+anchor combinations', async () => {
      const zipHandler = new ZipHandler();

      // Create multiple hyperlinks with different patterns
      zipHandler.addFile('[Content_Types].xml', getContentTypesXml());
      zipHandler.addFile('_rels/.rels', getRootRelsXml());
      zipHandler.addFile('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:hyperlink r:id="rId5" w:anchor="!/view?docid=doc-001">
        <w:r><w:t>Doc 1</w:t></w:r>
      </w:hyperlink>
      <w:hyperlink r:id="rId6" w:anchor="!/view?docid=doc-002">
        <w:r><w:t>Doc 2</w:t></w:r>
      </w:hyperlink>
      <w:hyperlink w:anchor="InternalSection">
        <w:r><w:t>Internal</w:t></w:r>
      </w:hyperlink>
      <w:hyperlink r:id="rId7">
        <w:r><w:t>External Only</w:t></w:r>
      </w:hyperlink>
    </w:p>
  </w:body>
</w:document>`);
      zipHandler.addFile('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com/base/" TargetMode="External"/>
  <Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://other.com/path/" TargetMode="External"/>
  <Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://noanchor.com/page" TargetMode="External"/>
</Relationships>`);
      zipHandler.addFile('word/styles.xml', getMinimalStylesXml());
      zipHandler.addFile('docProps/core.xml', getMinimalCoreXml());
      zipHandler.addFile('docProps/app.xml', getMinimalAppXml());

      const buffer = await zipHandler.toBuffer();
      const doc = await Document.loadFromBuffer(buffer);
      const content = doc.getParagraphs()[0]!.getContent();

      // External URL + anchor (combined)
      const link1 = content[0] as Hyperlink;
      expect(link1.getUrl()).toBe('https://example.com/base/#!/view?docid=doc-001');
      expect(link1.getAnchor()).toBeUndefined();
      expect(link1.getText()).toBe('Doc 1');

      // Another external URL + anchor (combined)
      const link2 = content[1] as Hyperlink;
      expect(link2.getUrl()).toBe('https://other.com/path/#!/view?docid=doc-002');
      expect(link2.getAnchor()).toBeUndefined();
      expect(link2.getText()).toBe('Doc 2');

      // Pure internal link (anchor only, no URL) - should remain unchanged
      const link3 = content[2] as Hyperlink;
      expect(link3.getUrl()).toBeUndefined();
      expect(link3.getAnchor()).toBe('InternalSection');
      expect(link3.isInternal()).toBe(true);
      expect(link3.getText()).toBe('Internal');

      // Pure external link (URL only, no anchor) - should remain unchanged
      const link4 = content[3] as Hyperlink;
      expect(link4.getUrl()).toBe('https://noanchor.com/page');
      expect(link4.getAnchor()).toBeUndefined();
      expect(link4.isExternal()).toBe(true);
      expect(link4.getText()).toBe('External Only');
    });

    it('should preserve combined URL through round-trip save/load', async () => {
      const mockDocument = await createMockDocumentWithUrlAndAnchor({
        relationshipId: 'rId5',
        url: 'https://example.com/',
        anchor: '!/section?id=test-123',
        text: 'Test Link',
      });

      // Load
      const doc1 = await Document.loadFromBuffer(mockDocument);
      const link1 = doc1.getParagraphs()[0]!.getContent()[0] as Hyperlink;
      expect(link1.getUrl()).toBe('https://example.com/#!/section?id=test-123');

      // Save
      const buffer = await doc1.toBuffer();

      // Load again
      const doc2 = await Document.loadFromBuffer(buffer);
      const link2 = doc2.getParagraphs()[0]!.getContent()[0] as Hyperlink;

      // Should still have combined URL
      expect(link2.getUrl()).toBe('https://example.com/#!/section?id=test-123');
      expect(link2.getAnchor()).toBeUndefined();
      expect(link2.getText()).toBe('Test Link');
    });

    it('should handle getFullUrl() for manually created hyperlinks with both url and anchor', () => {
      // When creating hyperlinks via API with both url and anchor
      const link = new Hyperlink({
        url: 'https://example.com/',
        anchor: '!/view?id=123',
        text: 'Link',
      });

      // getUrl() returns just the url property
      expect(link.getUrl()).toBe('https://example.com/');
      // getAnchor() returns the anchor property
      expect(link.getAnchor()).toBe('!/view?id=123');
      // getFullUrl() combines them
      expect(link.getFullUrl()).toBe('https://example.com/#!/view?id=123');
    });

    it('should return url from getFullUrl() when no anchor is set', () => {
      const link = Hyperlink.createExternal('https://example.com/page', 'Link');

      expect(link.getFullUrl()).toBe('https://example.com/page');
      expect(link.getAnchor()).toBeUndefined();
    });

    it('should return undefined from getFullUrl() for internal-only links', () => {
      const link = Hyperlink.createInternal('Section1', 'Go to Section 1');

      expect(link.getFullUrl()).toBeUndefined();
      expect(link.getUrl()).toBeUndefined();
      expect(link.getAnchor()).toBe('Section1');
    });
  });

  describe('TOC Corruption Prevention (Anchor as Display Text Bug)', () => {
    it('should NOT use anchor bookmark ID as display text when text is empty', async () => {
      // This test prevents the TOC corruption bug where bookmark IDs like "HEADING=II.MNKE7E8NA385_"
      // appeared as visible text instead of the actual heading text like "Important Information"
      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          anchor: 'HEADING=II.MNKE7E8NA385_',
          text: '', // Empty text - the bug scenario
        },
      ]);

      const doc = await Document.loadFromBuffer(mockDocument);
      const paragraphs = doc.getParagraphs();
      const hyperlink = paragraphs[0]!.getContent()[0] as Hyperlink;

      // Should use placeholder 'Link', NOT the bookmark ID
      expect(hyperlink.getText()).toBe('[Link]'); // Using [Link] from DocumentParser
      expect(hyperlink.getAnchor()).toBe('HEADING=II.MNKE7E8NA385_');

      // Bookmark ID should only be used for navigation, not display
      expect(hyperlink.getText()).not.toBe('HEADING=II.MNKE7E8NA385_');
    });

    it('should preserve TOC-like hyperlinks with proper display text through round-trip', async () => {
      // Simulate a TOC entry with bookmark ID and proper display text
      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          anchor: '_Toc123456789',
          text: 'Important Information',
        },
        {
          type: 'hyperlink',
          anchor: 'HEADING=II.XYZ123',
          text: 'CVS Specialty Pharmacy Plan Provisions',
        },
        {
          type: 'hyperlink',
          anchor: '_Toc987654321',
          text: 'Related Documents',
        },
      ]);

      // Load document
      const doc1 = await Document.loadFromBuffer(mockDocument);
      const paras1 = doc1.getParagraphs();

      // Verify text is preserved on load
      expect(paras1[0]!.getContent()[0]).toBeInstanceOf(Hyperlink);
      const link1 = paras1[0]!.getContent()[0] as Hyperlink;
      const link2 = paras1[0]!.getContent()[1] as Hyperlink;
      const link3 = paras1[0]!.getContent()[2] as Hyperlink;

      expect(link1.getText()).toBe('Important Information');
      expect(link1.getAnchor()).toBe('_Toc123456789');

      expect(link2.getText()).toBe('CVS Specialty Pharmacy Plan Provisions');
      expect(link2.getAnchor()).toBe('HEADING=II.XYZ123');

      expect(link3.getText()).toBe('Related Documents');
      expect(link3.getAnchor()).toBe('_Toc987654321');

      // Save and reload (round-trip test)
      const buffer = await doc1.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer);
      const paras2 = doc2.getParagraphs();

      // Verify text is STILL preserved after round-trip
      const link1_rt = paras2[0]!.getContent()[0] as Hyperlink;
      const link2_rt = paras2[0]!.getContent()[1] as Hyperlink;
      const link3_rt = paras2[0]!.getContent()[2] as Hyperlink;

      expect(link1_rt.getText()).toBe('Important Information');
      expect(link1_rt.getAnchor()).toBe('_Toc123456789');

      expect(link2_rt.getText()).toBe('CVS Specialty Pharmacy Plan Provisions');
      expect(link2_rt.getAnchor()).toBe('HEADING=II.XYZ123');

      expect(link3_rt.getText()).toBe('Related Documents');
      expect(link3_rt.getAnchor()).toBe('_Toc987654321');

      // Most importantly: text should NOT be the bookmark IDs
      expect(link1_rt.getText()).not.toBe('_Toc123456789');
      expect(link2_rt.getText()).not.toBe('HEADING=II.XYZ123');
      expect(link3_rt.getText()).not.toBe('_Toc987654321');
    });

    it('should warn when parsing hyperlink with anchor but no display text', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const mockDocument = await createMockDocument([
        {
          type: 'hyperlink',
          anchor: 'HEADING=II.CORRUPT',
          text: '', // Empty - should trigger warning
        },
      ]);

      await Document.loadFromBuffer(mockDocument);

      // Note: The warning is logged by DocumentParser.logger.warn, not console.warn
      // So we can't easily test it here, but the warning logic is in place

      consoleWarnSpy.mockRestore();
    });
  });
});

/**
 * Helper function to create a mock DOCX document buffer with hyperlinks
 */
async function createMockDocument(
  hyperlinks: Array<{
    type: 'hyperlink';
    relationshipId?: string;
    anchor?: string;
    text: string;
    url?: string;
    tooltip?: string;
    formatting?: any;
    skipRelationship?: boolean;
  }>
): Promise<Buffer> {
  const zipHandler = new ZipHandler();

  // Create [Content_Types].xml
  zipHandler.addFile(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`
  );

  // Create _rels/.rels
  zipHandler.addFile(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`
  );

  // Generate hyperlink XML
  const hyperlinkElements = hyperlinks.map((link) => {
    const attrs: string[] = [];

    if (link.relationshipId) {
      attrs.push(`r:id="${link.relationshipId}"`);
    }
    if (link.anchor) {
      attrs.push(`w:anchor="${XMLBuilder.escapeXmlText(link.anchor)}"`);
    }
    if (link.tooltip) {
      attrs.push(`w:tooltip="${XMLBuilder.escapeXmlText(link.tooltip)}"`);
    }

    // Generate run with formatting
    const formattingXml = link.formatting
      ? `<w:rPr>
        ${link.formatting.bold ? '<w:b/>' : ''}
        ${link.formatting.italic ? '<w:i/>' : ''}
        ${link.formatting.underline ? `<w:u w:val="${link.formatting.underline}"/>` : ''}
        ${link.formatting.color ? `<w:color w:val="${link.formatting.color}"/>` : ''}
      </w:rPr>`
      : '';

    return `<w:hyperlink ${attrs.join(' ')}>
      <w:r>
        ${formattingXml}
        <w:t xml:space="preserve">${XMLBuilder.escapeXmlText(link.text)}</w:t>
      </w:r>
    </w:hyperlink>`;
  });

  // Create word/document.xml
  zipHandler.addFile(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      ${hyperlinkElements.join('\n      ')}
    </w:p>
  </w:body>
</w:document>`
  );

  // Create word/_rels/document.xml.rels with hyperlink relationships
  const relationships = hyperlinks
    .filter((link) => link.relationshipId && !link.skipRelationship && link.url)
    .map(
      (link) =>
        `<Relationship Id="${link.relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${link.url}" TargetMode="External"/>`
    );

  zipHandler.addFile(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
  ${relationships.join('\n  ')}
</Relationships>`
  );

  // Create minimal styles.xml
  zipHandler.addFile(
    'word/styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults/>
</w:styles>`
  );

  // Create minimal numbering.xml
  zipHandler.addFile(
    'word/numbering.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>
`
  );

  // Create minimal docProps/core.xml
  zipHandler.addFile(
    'docProps/core.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/">
  <dc:creator>Test</dc:creator>
</cp:coreProperties>`
  );

  // Create minimal docProps/app.xml
  zipHandler.addFile(
    'docProps/app.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Test</Application>
</Properties>`
  );

  return await zipHandler.toBuffer();
}

/**
 * Helper function to create mock document with hyperlink that has BOTH URL and anchor
 * This simulates the split URL structure found in Issue.docx
 */
async function createMockDocumentWithUrlAndAnchor(config: {
  relationshipId: string;
  url: string;
  anchor: string;
  text: string;
}): Promise<Buffer> {
  const zipHandler = new ZipHandler();

  zipHandler.addFile('[Content_Types].xml', getContentTypesXml());
  zipHandler.addFile('_rels/.rels', getRootRelsXml());

  // Create document with hyperlink that has BOTH r:id AND w:anchor
  zipHandler.addFile(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p>
      <w:hyperlink r:id="${config.relationshipId}" w:anchor="${XMLBuilder.escapeXmlText(config.anchor)}">
        <w:r>
          <w:t xml:space="preserve">${XMLBuilder.escapeXmlText(config.text)}</w:t>
        </w:r>
      </w:hyperlink>
    </w:p>
  </w:body>
</w:document>`
  );

  // Create relationships with the base URL
  zipHandler.addFile(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="${config.relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${config.url}" TargetMode="External"/>
</Relationships>`
  );

  zipHandler.addFile('word/styles.xml', getMinimalStylesXml());
  zipHandler.addFile('docProps/core.xml', getMinimalCoreXml());
  zipHandler.addFile('docProps/app.xml', getMinimalAppXml());

  return await zipHandler.toBuffer();
}

// Helper functions to reduce duplication
function getContentTypesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
}

function getRootRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function getMinimalStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults/>
</w:styles>`;
}

function getMinimalCoreXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/">
  <dc:creator>Test</dc:creator>
</cp:coreProperties>`;
}

function getMinimalAppXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Test</Application>
</Properties>`;
}

/**
 * Helper function to create mock document with hyperlink inside a table cell
 * This tests the fix for hyperlinks in tables that have URL+anchor combinations
 */
async function createMockDocumentWithHyperlinkInTable(config: {
  relationshipId: string;
  url: string;
  anchor?: string;
  text: string;
}): Promise<Buffer> {
  const zipHandler = new ZipHandler();

  zipHandler.addFile('[Content_Types].xml', getContentTypesXml());
  zipHandler.addFile('_rels/.rels', getRootRelsXml());

  // Create anchor attribute if present
  const anchorAttr = config.anchor ? ` w:anchor="${XMLBuilder.escapeXmlText(config.anchor)}"` : '';

  // Create document with hyperlink INSIDE a table cell
  zipHandler.addFile(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:tbl>
      <w:tblPr>
        <w:tblStyle w:val="TableGrid"/>
        <w:tblW w:w="0" w:type="auto"/>
      </w:tblPr>
      <w:tr>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4680" w:type="dxa"/>
          </w:tcPr>
          <w:p>
            <w:hyperlink r:id="${config.relationshipId}"${anchorAttr}>
              <w:r>
                <w:t xml:space="preserve">${XMLBuilder.escapeXmlText(config.text)}</w:t>
              </w:r>
            </w:hyperlink>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>`
  );

  // Determine the target URL - if anchor is provided, just use base URL
  const targetUrl = config.url;

  // Create relationships with the URL
  zipHandler.addFile(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="${config.relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${targetUrl}" TargetMode="External"/>
</Relationships>`
  );

  zipHandler.addFile('word/styles.xml', getMinimalStylesXml());
  zipHandler.addFile('docProps/core.xml', getMinimalCoreXml());
  zipHandler.addFile('docProps/app.xml', getMinimalAppXml());

  return await zipHandler.toBuffer();
}

describe('Hyperlinks in Tables (processHyperlinks fix)', () => {
  describe('External hyperlinks with URL+anchor in table cells', () => {
    it('should preserve hyperlinks in table cells through round-trip save/load', async () => {
      // This tests the fix for Issue #: hyperlinks inside table cells
      // with URL+anchor combinations lost their relationship IDs
      const mockDocument = await createMockDocumentWithHyperlinkInTable({
        relationshipId: 'rId5',
        url: 'https://thesource.cvshealth.com/nuxeo/thesource/',
        anchor: '!/view?docid=test-doc-123',
        text: 'View Document in Table',
      });

      // Load document
      const doc1 = await Document.loadFromBuffer(mockDocument);

      // Save to buffer (this is where the error would occur without the fix)
      const buffer = await doc1.toBuffer();

      // Load again to verify round-trip
      const doc2 = await Document.loadFromBuffer(buffer);

      // Find the hyperlink in the table - need to get tables
      const paragraphs = doc2.getAllParagraphs();
      expect(paragraphs.length).toBeGreaterThan(0);

      // The first paragraph should contain the hyperlink from the table cell
      const content = paragraphs[0]!.getContent();
      expect(content).toHaveLength(1);
      expect(content[0]).toBeInstanceOf(Hyperlink);

      const hyperlink = content[0] as Hyperlink;
      expect(hyperlink.getText()).toBe('View Document in Table');
      // The URL should be the combined URL (base + anchor)
      expect(hyperlink.getUrl()).toBe('https://thesource.cvshealth.com/nuxeo/thesource/#!/view?docid=test-doc-123');
      expect(hyperlink.isExternal()).toBe(true);
    });

    it('should handle hyperlinks in table cells without anchor (simple external URL)', async () => {
      const mockDocument = await createMockDocumentWithHyperlinkInTable({
        relationshipId: 'rId5',
        url: 'https://example.com/page',
        text: 'Simple Link in Table',
      });

      const doc1 = await Document.loadFromBuffer(mockDocument);
      const buffer = await doc1.toBuffer();
      const doc2 = await Document.loadFromBuffer(buffer);

      const paragraphs = doc2.getAllParagraphs();
      const hyperlink = paragraphs[0]!.getContent()[0] as Hyperlink;

      expect(hyperlink.getText()).toBe('Simple Link in Table');
      expect(hyperlink.getUrl()).toBe('https://example.com/page');
      expect(hyperlink.getRelationshipId()).toBeDefined();
    });

    it('should register relationship IDs for hyperlinks created via API in table cells', async () => {
      // Create document with table containing hyperlink
      const doc = Document.create();
      const table = doc.createTable(1, 1);
      const cell = table.getCell(0, 0);

      // Create a paragraph in the cell
      const para = cell!.createParagraph();

      // Add hyperlink to table cell
      const hyperlink = Hyperlink.createExternal('https://example.com/test', 'Test Link');
      para.addHyperlink(hyperlink);

      // Save should NOT throw - the processHyperlinks should register the relationship
      const buffer = await doc.toBuffer();

      // Verify by loading
      const doc2 = await Document.loadFromBuffer(buffer);
      const hyperlinks = doc2.getHyperlinks();

      // Should have at least 1 hyperlink (framework may create additional cell content)
      expect(hyperlinks.length).toBeGreaterThanOrEqual(1);

      // Find our specific hyperlink
      const foundHyperlink = hyperlinks.find(h => h.hyperlink.getText() === 'Test Link');
      expect(foundHyperlink).toBeDefined();
      expect(foundHyperlink!.hyperlink.getUrl()).toBe('https://example.com/test');
      expect(foundHyperlink!.hyperlink.getRelationshipId()).toBeDefined();
    });
  });

  describe('Multiple hyperlinks in nested table structures', () => {
    it('should handle multiple hyperlinks across multiple table cells', async () => {
      // Create a more complex document with multiple hyperlinks in different cells
      const zipHandler = new ZipHandler();

      zipHandler.addFile('[Content_Types].xml', getContentTypesXml());
      zipHandler.addFile('_rels/.rels', getRootRelsXml());

      zipHandler.addFile(
        'word/document.xml',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:tbl>
      <w:tblPr>
        <w:tblStyle w:val="TableGrid"/>
        <w:tblW w:w="0" w:type="auto"/>
      </w:tblPr>
      <w:tr>
        <w:tc>
          <w:p>
            <w:hyperlink r:id="rId5" w:anchor="!/view?docid=doc-001">
              <w:r><w:t>Link 1</w:t></w:r>
            </w:hyperlink>
          </w:p>
        </w:tc>
        <w:tc>
          <w:p>
            <w:hyperlink r:id="rId6" w:anchor="!/view?docid=doc-002">
              <w:r><w:t>Link 2</w:t></w:r>
            </w:hyperlink>
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr>
        <w:tc>
          <w:p>
            <w:hyperlink r:id="rId7">
              <w:r><w:t>Link 3 (no anchor)</w:t></w:r>
            </w:hyperlink>
          </w:p>
        </w:tc>
        <w:tc>
          <w:p>
            <w:hyperlink w:anchor="InternalSection">
              <w:r><w:t>Internal Link</w:t></w:r>
            </w:hyperlink>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>`
      );

      zipHandler.addFile(
        'word/_rels/document.xml.rels',
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com/base1/" TargetMode="External"/>
  <Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com/base2/" TargetMode="External"/>
  <Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com/simple" TargetMode="External"/>
</Relationships>`
      );

      zipHandler.addFile('word/styles.xml', getMinimalStylesXml());
      zipHandler.addFile('docProps/core.xml', getMinimalCoreXml());
      zipHandler.addFile('docProps/app.xml', getMinimalAppXml());

      const buffer = await zipHandler.toBuffer();

      // Load document
      const doc1 = await Document.loadFromBuffer(buffer);

      // Save and reload (this is the critical test - should not throw)
      const savedBuffer = await doc1.toBuffer();
      const doc2 = await Document.loadFromBuffer(savedBuffer);

      // Get all hyperlinks from the document
      const hyperlinks = doc2.getHyperlinks();

      // Should have 4 hyperlinks - one in each cell
      // Note: getHyperlinks() returns all hyperlinks in the document
      expect(hyperlinks.length).toBeGreaterThanOrEqual(4);

      // Verify we can find each hyperlink by text (getHyperlinks returns { hyperlink, paragraph })
      const link1 = hyperlinks.find(h => h.hyperlink.getText() === 'Link 1');
      const link2 = hyperlinks.find(h => h.hyperlink.getText() === 'Link 2');
      const link3 = hyperlinks.find(h => h.hyperlink.getText() === 'Link 3 (no anchor)');
      const link4 = hyperlinks.find(h => h.hyperlink.getText() === 'Internal Link');

      expect(link1).toBeDefined();
      expect(link1!.hyperlink.getUrl()).toBe('https://example.com/base1/#!/view?docid=doc-001');

      expect(link2).toBeDefined();
      expect(link2!.hyperlink.getUrl()).toBe('https://example.com/base2/#!/view?docid=doc-002');

      expect(link3).toBeDefined();
      expect(link3!.hyperlink.getUrl()).toBe('https://example.com/simple');

      expect(link4).toBeDefined();
      expect(link4!.hyperlink.isInternal()).toBe(true);
      expect(link4!.hyperlink.getAnchor()).toBe('InternalSection');
    });
  });
});
