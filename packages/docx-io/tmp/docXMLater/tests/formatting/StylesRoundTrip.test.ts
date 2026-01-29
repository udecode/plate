/**
 * Style Round-Trip Tests
 * Tests that styles are correctly preserved through load -> save -> load cycles
 */

import { Document } from '../../src/core/Document';
import { Style } from '../../src/formatting/Style';
import * as path from 'path';
import * as fs from 'fs/promises';

describe('Style Round-Trip Tests', () => {
  const TEMP_DIR = path.join(__dirname, '..', '..', 'temp-test-output');

  beforeAll(async () => {
    // Create temp directory for test outputs
    try {
      await fs.mkdir(TEMP_DIR, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  });

  afterAll(async () => {
    // Clean up temp directory
    try {
      const files = await fs.readdir(TEMP_DIR);
      for (const file of files) {
        await fs.unlink(path.join(TEMP_DIR, file));
      }
      await fs.rmdir(TEMP_DIR);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Style Name Parsing', () => {
    it('should correctly parse style name from self-closing w:name tag', async () => {
      const doc = Document.create();

      // Create ListParagraph style with proper name (space included)
      const listParaStyle = new Style({
        type: 'paragraph',
        styleId: 'ListParagraph',
        name: 'List Paragraph', // Name has space
        basedOn: 'Normal',
        paragraphFormatting: {
          indentation: { left: 720 },
        },
      });

      doc.addStyle(listParaStyle);

      // Save and reload
      const tempFile = path.join(TEMP_DIR, 'list-paragraph-name-test.docx');
      await doc.save(tempFile);

      const doc2 = await Document.load(tempFile);
      const styles = doc2.getStyles();
      const reloadedStyle = styles.find((s) => s.getStyleId() === 'ListParagraph');

      expect(reloadedStyle).toBeDefined();
      const props = reloadedStyle!.getProperties();
      // The name should be "List Paragraph" (with space), NOT "ListParagraph"
      expect(props.name).toBe('List Paragraph');
      expect(props.styleId).toBe('ListParagraph');
    });

    it('should preserve style name with spaces through round-trip', async () => {
      const doc = Document.create();

      // Create style with name containing spaces
      const customStyle = new Style({
        type: 'paragraph',
        styleId: 'MyCustomStyle',
        name: 'My Custom Style Name',
        runFormatting: {
          color: '000000',
          size: 12,
        },
      });

      doc.addStyle(customStyle);

      // Save and reload
      const tempFile = path.join(TEMP_DIR, 'style-name-spaces-test.docx');
      await doc.save(tempFile);

      const doc2 = await Document.load(tempFile);
      const styles = doc2.getStyles();
      const reloadedStyle = styles.find((s) => s.getStyleId() === 'MyCustomStyle');

      expect(reloadedStyle).toBeDefined();
      const props = reloadedStyle!.getProperties();
      expect(props.name).toBe('My Custom Style Name');
    });
  });

  describe('Created Styles', () => {
    it('should preserve colors in programmatically created styles', async () => {
      const doc = Document.create();

      // Create style with specific color
      const customStyle = new Style({
        type: 'paragraph',
        styleId: 'CustomRed',
        name: 'Custom Red Style',
        runFormatting: {
          color: 'FF0000',
          size: 14,
        },
      });

      doc.addStyle(customStyle);

      // Save and reload
      const tempFile = path.join(TEMP_DIR, 'custom-style-test.docx');
      await doc.save(tempFile);

      const doc2 = await Document.load(tempFile);
      const styles = doc2.getStyles();
      const reloadedStyle = styles.find((s) => s.getStyleId() === 'CustomRed');

      expect(reloadedStyle).toBeDefined();
      const props = reloadedStyle!.getProperties();
      expect(props.runFormatting?.color).toBe('FF0000');
      expect(props.runFormatting?.size).toBe(14);
      expect(props.runFormatting?.color).not.toBe('14'); // NOT the size!
    });

    it('should handle black color (000000) without converting to 0', async () => {
      const doc = Document.create();

      const blackStyle = new Style({
        type: 'paragraph',
        styleId: 'BlackText',
        name: 'Black Text',
        runFormatting: {
          color: '000000',
          size: 12,
        },
      });

      doc.addStyle(blackStyle);

      const tempFile = path.join(TEMP_DIR, 'black-color-test.docx');
      await doc.save(tempFile);

      const doc2 = await Document.load(tempFile);
      const reloadedStyle = doc2
        .getStyles()
        .find((s) => s.getStyleId() === 'BlackText');

      expect(reloadedStyle).toBeDefined();
      const props = reloadedStyle!.getProperties();
      expect(props.runFormatting?.color).toBe('000000');
      expect(typeof props.runFormatting?.color).toBe('string');
    });
  });

  describe('Contextual Spacing (List Paragraph)', () => {
    it('should preserve contextualSpacing in programmatically created styles', async () => {
      const doc = Document.create();

      // Create a List Paragraph style with contextual spacing enabled
      // This is the "Don't add space between paragraphs of the same style" setting
      const listParagraphStyle = new Style({
        type: 'paragraph',
        styleId: 'ListParagraph',
        name: 'List Paragraph',
        paragraphFormatting: {
          indentation: { left: 720 },
          contextualSpacing: true,  // The critical setting
        },
      });

      doc.addStyle(listParagraphStyle);

      // Save and reload
      const tempFile = path.join(TEMP_DIR, 'contextual-spacing-test.docx');
      await doc.save(tempFile);

      const doc2 = await Document.load(tempFile);
      const styles = doc2.getStyles();
      const reloadedStyle = styles.find((s) => s.getStyleId() === 'ListParagraph');

      expect(reloadedStyle).toBeDefined();
      const props = reloadedStyle!.getProperties();
      expect(props.paragraphFormatting?.contextualSpacing).toBe(true);
    });

    it('should preserve contextualSpacing through multiple round-trips', async () => {
      const doc = Document.create();

      const listStyle = new Style({
        type: 'paragraph',
        styleId: 'CustomList',
        name: 'Custom List',
        paragraphFormatting: {
          contextualSpacing: true,
        },
      });

      doc.addStyle(listStyle);

      // First round-trip
      const tempFile = path.join(TEMP_DIR, 'contextual-spacing-roundtrip-test.docx');
      await doc.save(tempFile);

      let doc2 = await Document.load(tempFile);
      let reloadedStyle = doc2.getStyles().find((s) => s.getStyleId() === 'CustomList');
      expect(reloadedStyle).toBeDefined();
      expect(reloadedStyle!.getProperties().paragraphFormatting?.contextualSpacing).toBe(true);

      // Second round-trip - verify no degradation
      await doc2.save(tempFile);
      doc2 = await Document.load(tempFile);
      reloadedStyle = doc2.getStyles().find((s) => s.getStyleId() === 'CustomList');
      expect(reloadedStyle!.getProperties().paragraphFormatting?.contextualSpacing).toBe(true);
    });

    it('should NOT have contextualSpacing when not set', async () => {
      const doc = Document.create();

      // Style without contextualSpacing
      const normalStyle = new Style({
        type: 'paragraph',
        styleId: 'NormalStyle',
        name: 'Normal Style',
        paragraphFormatting: {
          spacing: { after: 200 },
        },
      });

      doc.addStyle(normalStyle);

      const tempFile = path.join(TEMP_DIR, 'no-contextual-spacing-test.docx');
      await doc.save(tempFile);

      const doc2 = await Document.load(tempFile);
      const reloadedStyle = doc2.getStyles().find((s) => s.getStyleId() === 'NormalStyle');

      expect(reloadedStyle).toBeDefined();
      const props = reloadedStyle!.getProperties();

      // contextualSpacing should be undefined or falsy
      expect(props.paragraphFormatting?.contextualSpacing).toBeFalsy();
    });
  });
});
