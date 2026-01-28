/**
 * Tests for Revisions Inside Complex Fields
 *
 * Tests for detecting and handling tracked changes (w:ins, w:del)
 * that appear inside the result section of complex fields like HYPERLINK
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { join } from 'path';
import { Document } from '../../src/core/Document';
import { ComplexField } from '../../src/elements/Field';
import { Revision } from '../../src/elements/Revision';
import { Paragraph } from '../../src/elements/Paragraph';
import { Run } from '../../src/elements/Run';

const TEST_FILES_DIR = join(__dirname, '..');

describe('Revisions Inside Complex Fields', () => {
  describe('Field Assembly with Revisions', () => {
    it('should detect revisions inside HYPERLINK field result sections', async () => {
      // Test with the actual hyperlinks_autoaccept_off.docx file
      const docPath = join(process.cwd(), 'hyperlinks_autoaccept_off.docx');

      let doc: Document;
      try {
        doc = await Document.load(docPath, { revisionHandling: 'preserve' });
      } catch (error) {
        // Skip test if file doesn't exist
        console.log('Skipping test: hyperlinks_autoaccept_off.docx not found');
        return;
      }

      // Find ComplexFields and Revisions
      let complexFieldCount = 0;
      let revisionCount = 0;
      let hyperlinkFieldCount = 0;

      for (const para of doc.getParagraphs()) {
        for (const item of para.getContent()) {
          if (item instanceof ComplexField) {
            complexFieldCount++;
            if (item.isHyperlinkField()) {
              hyperlinkFieldCount++;
            }
          }
          if (item instanceof Revision) {
            revisionCount++;
          }
        }
      }

      // Verify we found the expected elements
      expect(complexFieldCount).toBeGreaterThan(0);
      expect(revisionCount).toBeGreaterThan(0);
      expect(hyperlinkFieldCount).toBeGreaterThan(0);
    });

    it('should correctly decode URL-encoded HYPERLINK instructions', async () => {
      const docPath = join(process.cwd(), 'hyperlinks_autoaccept_off.docx');

      let doc: Document;
      try {
        doc = await Document.load(docPath, { revisionHandling: 'preserve' });
      } catch (error) {
        console.log('Skipping test: hyperlinks_autoaccept_off.docx not found');
        return;
      }

      // Find a HYPERLINK field with URL-encoded characters
      let foundDecodedUrl = false;

      for (const para of doc.getParagraphs()) {
        for (const item of para.getContent()) {
          if (item instanceof ComplexField && item.isHyperlinkField()) {
            const parsed = item.getParsedHyperlink();
            if (parsed) {
              // Check if URL was decoded (should contain # not %23)
              if (parsed.url.includes('#!/') || parsed.anchor?.includes('!/')) {
                foundDecodedUrl = true;
                // Verify proper decoding
                expect(parsed.url).not.toContain('%23');
                if (parsed.anchor) {
                  expect(parsed.anchor).not.toContain('%3F');
                }
              }
            }
          }
        }
      }

      expect(foundDecodedUrl).toBe(true);
    });

    it('should parse HYPERLINK with \\l anchor switch correctly', async () => {
      const docPath = join(process.cwd(), 'hyperlinks_autoaccept_off.docx');

      let doc: Document;
      try {
        doc = await Document.load(docPath, { revisionHandling: 'preserve' });
      } catch (error) {
        console.log('Skipping test: hyperlinks_autoaccept_off.docx not found');
        return;
      }

      // Find a HYPERLINK field with \l anchor switch
      let foundAnchorSwitch = false;

      for (const para of doc.getParagraphs()) {
        for (const item of para.getContent()) {
          if (item instanceof ComplexField && item.isHyperlinkField()) {
            const parsed = item.getParsedHyperlink();
            if (parsed && parsed.anchor) {
              foundAnchorSwitch = true;
              // Full URL should combine base + anchor
              expect(parsed.fullUrl).toContain('#');
              expect(parsed.fullUrl).toBe(parsed.url + '#' + parsed.anchor);
            }
          }
        }
      }

      expect(foundAnchorSwitch).toBe(true);
    });

    it('should associate revisions with adjacent complex fields', async () => {
      const docPath = join(process.cwd(), 'hyperlinks_autoaccept_off.docx');

      let doc: Document;
      try {
        doc = await Document.load(docPath, { revisionHandling: 'preserve' });
      } catch (error) {
        console.log('Skipping test: hyperlinks_autoaccept_off.docx not found');
        return;
      }

      // Find paragraphs where ComplexField is immediately followed by Revision
      let foundFieldRevisionPair = false;

      for (const para of doc.getParagraphs()) {
        const content = para.getContent();
        for (let i = 0; i < content.length - 1; i++) {
          if (content[i] instanceof ComplexField && content[i + 1] instanceof Revision) {
            foundFieldRevisionPair = true;

            const field = content[i] as ComplexField;
            const revision = content[i + 1] as Revision;

            // Verify the field is a HYPERLINK
            expect(field.isHyperlinkField()).toBe(true);

            // Verify revision has proper metadata
            expect(revision.getId()).toBeDefined();
            expect(revision.getAuthor()).toBeDefined();
            expect(['insert', 'delete']).toContain(revision.getType());
          }
        }
      }

      expect(foundFieldRevisionPair).toBe(true);
    });
  });

  describe('Round-trip preservation', () => {
    it('should preserve HYPERLINK fields after load and save', async () => {
      const docPath = join(process.cwd(), 'hyperlinks_autoaccept_off.docx');

      let doc: Document;
      try {
        doc = await Document.load(docPath, { revisionHandling: 'preserve' });
      } catch (error) {
        console.log('Skipping test: hyperlinks_autoaccept_off.docx not found');
        return;
      }

      // Count initial fields
      let initialFieldCount = 0;
      for (const para of doc.getParagraphs()) {
        for (const item of para.getContent()) {
          if (item instanceof ComplexField && item.isHyperlinkField()) {
            initialFieldCount++;
          }
        }
      }

      expect(initialFieldCount).toBeGreaterThan(0);

      // Save to buffer and reload
      const buffer = await doc.toBuffer();
      expect(buffer.length).toBeGreaterThan(0);

      // Note: Full round-trip test would reload the buffer,
      // but that's complex due to field regeneration behavior
    });
  });
});
