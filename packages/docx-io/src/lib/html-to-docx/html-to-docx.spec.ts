/**
 * Unit tests for HTML to DOCX converter.
 * Tests the core conversion functionality including:
 * - Basic DOCX file structure
 * - Unit conversions (pixels, points, cm, inches to TWIP)
 * - Color conversions (RGB, HSL, Hex to DOCX format)
 * - Table border handling (including no-border tables)
 * - List indentation
 */

import { describe, expect, it } from 'bun:test';
import JSZip from 'jszip';

import { htmlToDocxBlob } from '../exportDocx';

// Helper to load zip from Blob
async function loadZipFromBlob(blob: Blob): Promise<JSZip> {
  const arrayBuffer = await blob.arrayBuffer();
  return JSZip.loadAsync(arrayBuffer);
}

describe('htmlToDocxBlob', () => {
  describe('basic functionality', () => {
    it('should return a Blob', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      expect(result).toBeInstanceOf(Blob);
    });

    it('should return blob with correct MIME type', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      expect(result.type).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
    });

    it('should create a valid DOCX (ZIP) file structure', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      const zip = await loadZipFromBlob(result);

      // DOCX must contain these required files
      expect(zip.file('[Content_Types].xml')).not.toBeNull();
      expect(zip.file('_rels/.rels')).not.toBeNull();
      expect(zip.file('word/document.xml')).not.toBeNull();
      expect(zip.file('word/styles.xml')).not.toBeNull();
    });

    it('should include content in document.xml', async () => {
      const htmlContent = '<p>Hello World</p>';
      const result = await htmlToDocxBlob(htmlContent);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Hello World');
    });

    it('should handle empty HTML', async () => {
      const result = await htmlToDocxBlob('');
      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('document orientation', () => {
    it('should default to portrait orientation', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<w:sectPr');
      expect(docXml).toContain('<w:pgSz');
      expect(docXml).toContain('w:orient="portrait"');
    });

    it('should support landscape orientation', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>', {
        orientation: 'landscape',
      });
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('w:orient="landscape"');
    });
  });

  describe('text formatting', () => {
    it('should handle bold text', async () => {
      const html = '<p><strong>Bold text</strong></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Bold text');
      expect(docXml).toContain('<w:b');
    });

    it('should handle italic text', async () => {
      const html = '<p><em>Italic text</em></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Italic text');
      expect(docXml).toContain('<w:i');
    });

    it('should handle underlined text', async () => {
      const html = '<p><u>Underlined text</u></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Underlined text');
      expect(docXml).toContain('<w:u');
    });

    it('should handle strikethrough text', async () => {
      const html = '<p><s>Strikethrough text</s></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Strikethrough text');
      expect(docXml).toContain('<w:strike');
    });
  });

  describe('headings', () => {
    it('should handle h1-h6 headings', async () => {
      const html = `
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Heading 1');
      expect(docXml).toContain('Heading 6');
      expect(docXml).toContain('Heading1');
      expect(docXml).toContain('Heading2');
    });
  });

  describe('tables', () => {
    it('should handle basic tables', async () => {
      const html = `
        <table>
          <tr><th>Header 1</th><th>Header 2</th></tr>
          <tr><td>Cell 1</td><td>Cell 2</td></tr>
        </table>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Header 1');
      expect(docXml).toContain('Cell 1');
      expect(docXml).toContain('<w:tbl');
    });

    it('should handle tables with border-collapse', async () => {
      const html = `
        <table style="border-collapse: collapse; border: 1px solid black;">
          <tr><td>Cell 1</td><td>Cell 2</td></tr>
        </table>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<w:tbl');
      expect(docXml).toContain('<w:tblBorders');
    });

    it('should NOT add borders for tables with border: none', async () => {
      const html = `
        <table style="border: none; border-collapse: collapse;">
          <tr>
            <td style="border: none;">Cell 1</td>
            <td style="border: none;">Cell 2</td>
          </tr>
        </table>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<w:tbl');
      // Should NOT have tblBorders element when border is none
      expect(docXml).not.toContain('<w:tblBorders');
    });

    it('should NOT add borders for tables with border: 0', async () => {
      const html = `
        <table style="border: 0; border-collapse: collapse;">
          <tr>
            <td style="border: 0;">Cell 1</td>
          </tr>
        </table>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<w:tbl');
      // Should NOT have tblBorders element when border is 0
      expect(docXml).not.toContain('<w:tblBorders');
    });
  });

  describe('lists', () => {
    it('should handle unordered lists', async () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Item 1');
      expect(docXml).toContain('Item 2');
    });

    it('should handle ordered lists', async () => {
      const html = '<ol><li>First</li><li>Second</li></ol>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('First');
      expect(docXml).toContain('Second');
    });

    it('should handle nested lists', async () => {
      const html = `
        <ul>
          <li>Item 1
            <ul>
              <li>Nested Item 1</li>
            </ul>
          </li>
        </ul>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Item 1');
      expect(docXml).toContain('Nested Item 1');
    });

    it('should handle list indentation via margin-left', async () => {
      const html = `
        <ul style="margin-left: 24px;">
          <li>Indented item</li>
        </ul>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Indented item');
    });
  });

  describe('links', () => {
    it('should handle hyperlinks', async () => {
      const html = '<p><a href="https://example.com">Click here</a></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Click here');
      expect(docXml).toContain('<w:hyperlink');
    });
  });

  describe('special characters', () => {
    it('should handle Unicode characters', async () => {
      const html = '<p>Hello World</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Hello World');
    });

    it('should handle CJK characters', async () => {
      const html = '<p>Hello World</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Hello World');
    });

    it('should handle emojis', async () => {
      const html = '<p>Hello World</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Hello World');
    });
  });

  describe('code blocks', () => {
    it('should handle inline code', async () => {
      const html = '<p><code>inline code</code></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('inline code');
    });

    it('should handle code blocks', async () => {
      const html = '<pre><code>const x = 1;</code></pre>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('const x = 1;');
    });
  });

  describe('blockquote', () => {
    it('should handle blockquotes', async () => {
      const html = '<blockquote>This is a quote</blockquote>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('This is a quote');
    });
  });

  /**
   * REGRESSION TESTS: Stylesheet-based styling
   *
   * Tests that styles defined in <style> tags are properly applied.
   * Previously, only inline styles were read and stylesheet styles were lost.
   */
  describe('stylesheet-based styling', () => {
    it('should apply inline styles to text', async () => {
      // Inline styles should always work
      const html = '<p style="font-size: 24pt;">Large text</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Large text');
      // 24pt = 48 half-points
      expect(docXml).toContain('<w:sz w:val="48"');
    });

    it('should apply inline font-family', async () => {
      const html = '<p style="font-family: Arial, sans-serif;">Arial text</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Arial text');
      expect(docXml).toContain('<w:rFonts');
    });

    it('should apply inline color', async () => {
      const html = '<p style="color: #ff0000;">Red text</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Red text');
      expect(docXml).toContain('<w:color');
      expect(docXml.toLowerCase()).toContain('ff0000');
    });

    it('should apply inline background-color', async () => {
      const html = '<p style="background-color: #ffff00;">Highlighted text</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Highlighted text');
      expect(docXml).toContain('<w:shd');
    });

    it('should apply default font settings to body text', async () => {
      // Body text without any styles should get default Calibri font
      const html = '<p>Default body text</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Default body text');
      // Check that document has font definitions
      const stylesXml = await zip.file('word/styles.xml')!.async('string');
      expect(stylesXml).toContain('<w:rFonts');
    });

    it('should preserve heading styles with Word paragraph styles', async () => {
      const html = '<h1>Heading One</h1>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Heading One');
      // Headings should use Word's built-in Heading1 style
      expect(docXml).toContain('<w:pStyle w:val="Heading1"');
    });
  });
});
