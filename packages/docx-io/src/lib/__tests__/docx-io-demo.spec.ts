/**
 * DOCX Import/Export Demo Tests
 *
 * These tests demonstrate the htmlToDocxBlob utility for
 * converting HTML to DOCX format.
 */

import { describe, expect, it } from 'bun:test';
import JSZip from 'jszip';

// Import directly from exportDocx to avoid platejs dependencies
import { htmlToDocxBlob } from '../exportDocx';

const loadZipFromBlob = async (blob: Blob): Promise<JSZip> => {
  const arrayBuffer = await blob.arrayBuffer();
  return JSZip.loadAsync(arrayBuffer);
};

describe('DOCX Import/Export Demo', () => {
  describe('htmlToDocxBlob utility', () => {
    it('should convert HTML string to DOCX blob', async () => {
      const html = `
        <h1>Document Title</h1>
        <p>This is a <strong>formatted</strong> paragraph.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `;

      const blob = await htmlToDocxBlob(html);

      expect(blob).toBeInstanceOf(Blob);

      const zip = await loadZipFromBlob(blob);
      const docXml = await zip.file('word/document.xml')!.async('string');

      expect(docXml).toContain('Document Title');
      expect(docXml).toContain('formatted');
      expect(docXml).toContain('Item 1');
      expect(docXml).toContain('Item 2');
    });

    it('should handle empty HTML', async () => {
      const blob = await htmlToDocxBlob('');

      expect(blob).toBeInstanceOf(Blob);
    });

    it('should apply document options', async () => {
      const html = '<p>Test content</p>';
      const blob = await htmlToDocxBlob(html, {
        orientation: 'landscape',
        margins: {
          top: 720, // 0.5 inch in TWIP
          bottom: 720,
          left: 720,
          right: 720,
        },
      });

      const zip = await loadZipFromBlob(blob);
      const docXml = await zip.file('word/document.xml')!.async('string');

      expect(docXml).toContain('landscape');
    });
  });

  describe('Complete HTML to DOCX workflow', () => {
    it('should produce valid DOCX with all required files', async () => {
      const html = `
        <h1>Test Document</h1>
        <p>This is a test paragraph with <strong>bold</strong> text.</p>
        <p>Second paragraph.</p>
      `;

      const blob = await htmlToDocxBlob(html);

      // Verify DOCX structure
      const zip = await loadZipFromBlob(blob);

      // Check required DOCX files exist
      expect(zip.file('word/document.xml')).not.toBeNull();
      expect(zip.file('[Content_Types].xml')).not.toBeNull();
      expect(zip.file('_rels/.rels')).not.toBeNull();

      // Verify content
      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Test Document');
      expect(docXml).toContain('bold');
      expect(docXml).toContain('Second paragraph');
    });

    it('should handle tables', async () => {
      const html = `
        <table>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
          <tr>
            <td>Cell 3</td>
            <td>Cell 4</td>
          </tr>
        </table>
      `;

      const blob = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(blob);
      const docXml = await zip.file('word/document.xml')!.async('string');

      expect(docXml).toContain('Cell 1');
      expect(docXml).toContain('Cell 4');
      expect(docXml).toContain('<w:tbl');
    });

    it('should handle links', async () => {
      const html =
        '<p>Visit <a href="https://example.com">our website</a>.</p>';

      const blob = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(blob);
      const docXml = await zip.file('word/document.xml')!.async('string');

      expect(docXml).toContain('our website');
      expect(docXml).toContain('<w:hyperlink');
    });
  });
});
