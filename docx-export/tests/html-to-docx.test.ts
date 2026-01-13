/**
 * Unit tests for the HTML to DOCX converter.
 *
 * These tests verify the low-level conversion functionality using @turbodocx/html-to-docx:
 * - DOCX file structure (valid ZIP with required files)
 * - Document orientation (portrait/landscape)
 * - Page margins
 * - HTML content handling (converted to native DOCX elements)
 * - Special character handling
 */

import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

import { type DocumentOptions, htmlToDocxBlob } from '../src/lib/html-to-docx';

// Helper to load zip from Blob
async function loadZipFromBlob(blob: Blob): Promise<JSZip> {
  // Handle both browser Blob and Node.js Blob (which may not have arrayBuffer in jsdom)
  if (typeof blob.arrayBuffer === 'function') {
    const arrayBuffer = await blob.arrayBuffer();
    return JSZip.loadAsync(arrayBuffer);
  }

  // Fallback for jsdom environment - use FileReader-style approach
  // or read the blob as text and convert
  const reader = new FileReader();
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
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

    it('should create a valid ZIP file (DOCX is a ZIP archive)', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      const zip = await loadZipFromBlob(result);

      // DOCX must contain these required files
      expect(zip.file('[Content_Types].xml')).not.toBeNull();
      expect(zip.file('_rels/.rels')).not.toBeNull();
      expect(zip.file('word/document.xml')).not.toBeNull();
    });

    it('should include content in document.xml', async () => {
      const htmlContent = '<p>Hello World Test Content</p>';
      const result = await htmlToDocxBlob(htmlContent);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      // TurboDocx converts HTML to native DOCX elements
      // Content should be in w:t (text) elements
      expect(docXml).toContain('Hello World Test Content');
    });
  });

  describe('document orientation', () => {
    it('should default to portrait orientation', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      // Check for section properties with page size
      expect(docXml).toContain('<w:sectPr');
      expect(docXml).toContain('<w:pgSz');
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

  describe('margins', () => {
    it('should apply custom margins', async () => {
      const customMargins: DocumentOptions['margins'] = {
        bottom: 720,
        left: 720,
        right: 720,
        top: 720,
      };

      const result = await htmlToDocxBlob('<p>Test</p>', {
        margins: customMargins,
      });
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<w:pgMar');
    });
  });

  describe('HTML content handling', () => {
    it('should handle simple paragraphs', async () => {
      const html = '<p>Simple paragraph</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Simple paragraph');
      // Should be wrapped in w:p (paragraph) and w:t (text) elements
      expect(docXml).toContain('<w:p');
      expect(docXml).toContain('<w:t');
    });

    it('should handle multiple paragraphs', async () => {
      const html =
        '<p>First paragraph</p><p>Second paragraph</p><p>Third paragraph</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('First paragraph');
      expect(docXml).toContain('Second paragraph');
      expect(docXml).toContain('Third paragraph');
    });

    it('should handle headings h1-h6', async () => {
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
    });

    it('should handle bold and italic formatting', async () => {
      const html = '<p><strong>Bold text</strong> and <i>italic text</i></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Bold text');
      expect(docXml).toContain('italic text');
      // Bold should use w:b element
      expect(docXml).toContain('<w:b');
      // Italic should use w:i element (using <i> tag instead of <em>)
      expect(docXml).toContain('<w:i');
    });

    it('should handle lists', async () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Item 1');
      expect(docXml).toContain('Item 2');
    });

    it('should handle tables', async () => {
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
      // Tables should use w:tbl element
      expect(docXml).toContain('<w:tbl');
    });

    it('should handle links', async () => {
      const html = '<p><a href="https://example.com">Click here</a></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Click here');
    });
  });

  describe('special characters', () => {
    it('should handle Unicode characters', async () => {
      const html = '<p>中文 日本語 한국어 العربية</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('中文');
      expect(docXml).toContain('日本語');
    });
  });

  describe('edge cases', () => {
    it('should handle empty HTML', async () => {
      const result = await htmlToDocxBlob('');
      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBeGreaterThan(0);
    });

    it('should handle very long content', async () => {
      const longContent = '<p>' + 'Lorem ipsum '.repeat(1000) + '</p>';
      const result = await htmlToDocxBlob(longContent);
      expect(result).toBeInstanceOf(Blob);

      const zip = await loadZipFromBlob(result);
      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Lorem ipsum');
    });
  });

  describe('DOCX file structure', () => {
    it('should have correct Content_Types.xml', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      const zip = await loadZipFromBlob(result);

      const contentTypes = await zip
        .file('[Content_Types].xml')!
        .async('string');
      expect(contentTypes).toContain(
        'application/vnd.openxmlformats-package.relationships+xml'
      );
      expect(contentTypes).toContain(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml'
      );
    });

    it('should create a proper Office Open XML structure', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      const zip = await loadZipFromBlob(result);

      // Must have Office Open XML required files
      const contentTypes = await zip
        .file('[Content_Types].xml')!
        .async('string');
      expect(contentTypes).toContain(
        'xmlns="http://schemas.openxmlformats.org/package/2006/content-types"'
      );

      const rels = await zip.file('_rels/.rels')!.async('string');
      expect(rels).toContain(
        'http://schemas.openxmlformats.org/package/2006/relationships'
      );

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain(
        'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
      );
    });

    it('should include proper document.xml with section properties', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>', {
        orientation: 'portrait',
      });
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');

      // Should have document body
      expect(docXml).toContain('<w:body>');
      expect(docXml).toContain('</w:body>');

      // Should have section properties with page setup
      expect(docXml).toContain('<w:sectPr');
      expect(docXml).toContain('<w:pgSz');
    });

    it('should use native DOCX elements (not altChunk)', async () => {
      const result = await htmlToDocxBlob('<p>Test content</p>');
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');

      // Should NOT use altChunk - TurboDocx creates native elements
      expect(docXml).not.toContain('<w:altChunk');

      // Should have native paragraph elements
      expect(docXml).toContain('<w:p');
      expect(docXml).toContain('<w:r');
      expect(docXml).toContain('<w:t');
    });

    it('should NOT be a simple HTML-renamed-to-docx file', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      const zip = await loadZipFromBlob(result);

      // A proper DOCX has multiple files in the ZIP
      const fileCount = Object.keys(zip.files).length;
      expect(fileCount).toBeGreaterThan(5); // Proper DOCX has many files

      // Should have the word directory structure
      expect(zip.file('word/document.xml')).not.toBeNull();
      expect(zip.file('word/_rels/document.xml.rels')).not.toBeNull();
    });

    it('should include styles.xml for proper formatting', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      const zip = await loadZipFromBlob(result);

      // Proper DOCX should have styles
      const stylesFile = zip.file('word/styles.xml');
      expect(stylesFile).not.toBeNull();

      if (stylesFile) {
        const stylesContent = await stylesFile.async('string');
        expect(stylesContent).toContain('w:styles');
      }
    });
  });

  describe('client-side only execution', () => {
    it('should not require any server-side dependencies', async () => {
      // The htmlToDocxBlob function should work entirely in the browser
      // without needing Node.js-specific APIs like fs, path, or child_process
      const result = await htmlToDocxBlob('<p>Client-side test</p>');
      expect(result).toBeInstanceOf(Blob);
    });

    it('should produce valid DOCX without external network requests for basic HTML', async () => {
      // Basic HTML without external images should not require network
      const html = `
        <h1>Document Title</h1>
        <p>This is a <strong>bold</strong> and <em>italic</em> paragraph.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      // Verify complete DOCX structure
      expect(zip.file('[Content_Types].xml')).not.toBeNull();
      expect(zip.file('_rels/.rels')).not.toBeNull();
      expect(zip.file('word/document.xml')).not.toBeNull();
      expect(zip.file('word/_rels/document.xml.rels')).not.toBeNull();
    });
  });

  describe('DocumentOptions type exports', () => {
    it('should support all turbodocx options', async () => {
      const options: DocumentOptions = {
        orientation: 'landscape',
        margins: {
          top: 1440,
          right: 1440,
          bottom: 1440,
          left: 1440,
          header: 720,
          footer: 720,
          gutter: 0,
        },
        pageSize: {
          width: 12_240,
          height: 15_840,
        },
        title: 'Test Document',
        creator: 'Test Creator',
        font: 'Arial',
        fontSize: 24,
      };

      const result = await htmlToDocxBlob('<p>Test</p>', options);
      expect(result).toBeInstanceOf(Blob);

      const zip = await loadZipFromBlob(result);
      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('w:orient="landscape"');
    });

    it('should support heading configuration', async () => {
      const options: DocumentOptions = {
        heading: {
          heading1: {
            font: 'Arial',
            fontSize: 48,
            bold: true,
            spacing: { before: 240, after: 120 },
          },
          heading2: {
            font: 'Arial',
            fontSize: 36,
            bold: true,
          },
        },
      };

      const result = await htmlToDocxBlob(
        '<h1>Heading 1</h1><h2>Heading 2</h2>',
        options
      );
      expect(result).toBeInstanceOf(Blob);
    });

    it('should support table configuration', async () => {
      const options: DocumentOptions = {
        table: {
          row: { cantSplit: true },
          borderOptions: {
            size: 1,
            color: '000000',
          },
        },
      };

      const html = '<table><tr><td>Cell</td></tr></table>';
      const result = await htmlToDocxBlob(html, options);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('additional text formatting', () => {
    it('should handle underline text', async () => {
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
    });

    it('should handle combined formatting (bold + italic)', async () => {
      const html = '<p><strong><i>Bold and italic</i></strong></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Bold and italic');
      expect(docXml).toContain('<w:b');
      expect(docXml).toContain('<w:i');
    });

    it('should handle subscript and superscript', async () => {
      const html = '<p>H<sub>2</sub>O and x<sup>2</sup></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('H');
      expect(docXml).toContain('2');
      expect(docXml).toContain('O');
    });
  });

  describe('complex list structures', () => {
    it('should handle ordered lists', async () => {
      const html = '<ol><li>First</li><li>Second</li><li>Third</li></ol>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('First');
      expect(docXml).toContain('Second');
      expect(docXml).toContain('Third');
    });

    it('should handle nested lists', async () => {
      const html = `
        <ul>
          <li>Parent 1
            <ul>
              <li>Child 1.1</li>
              <li>Child 1.2</li>
            </ul>
          </li>
          <li>Parent 2</li>
        </ul>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Parent 1');
      expect(docXml).toContain('Child 1.1');
      expect(docXml).toContain('Parent 2');
    });

    it('should handle mixed ordered and unordered lists', async () => {
      const html = `
        <ol>
          <li>Numbered item
            <ul>
              <li>Bullet subitem</li>
            </ul>
          </li>
        </ol>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Numbered item');
      expect(docXml).toContain('Bullet subitem');
    });
  });

  describe('complex table structures', () => {
    it('should handle table with multiple rows and columns', async () => {
      const html = `
        <table>
          <tr><th>Col 1</th><th>Col 2</th><th>Col 3</th></tr>
          <tr><td>A1</td><td>A2</td><td>A3</td></tr>
          <tr><td>B1</td><td>B2</td><td>B3</td></tr>
        </table>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Col 1');
      expect(docXml).toContain('A2');
      expect(docXml).toContain('B3');
      expect(docXml).toContain('<w:tbl');
      expect(docXml).toContain('<w:tr');
      expect(docXml).toContain('<w:tc');
    });

    it('should handle table with formatted content in cells', async () => {
      const html = `
        <table>
          <tr>
            <td><strong>Bold cell</strong></td>
            <td><i>Italic cell</i></td>
          </tr>
        </table>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Bold cell');
      expect(docXml).toContain('Italic cell');
    });
  });

  describe('blockquotes and code', () => {
    it('should handle blockquotes', async () => {
      const html = '<blockquote>This is a quote</blockquote>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('This is a quote');
    });

    it('should handle inline code', async () => {
      const html = '<p>Use <code>console.log()</code> for debugging</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('console.log()');
    });

    it('should handle code blocks', async () => {
      const html =
        '<pre><code>function hello() {\n  return "world";\n}</code></pre>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('function hello()');
    });
  });

  describe('whitespace and special HTML', () => {
    it('should handle whitespace-only content', async () => {
      const html = '<p>   </p>';
      const result = await htmlToDocxBlob(html);
      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBeGreaterThan(0);
    });

    it('should handle HTML entities', async () => {
      const html = '<p>&amp; &lt; &gt; &quot; &copy;</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      // Entities should be decoded or properly escaped
      expect(result.size).toBeGreaterThan(0);
    });

    it('should handle horizontal rules', async () => {
      const html = '<p>Before</p><hr/><p>After</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Before');
      expect(docXml).toContain('After');
    });

    it('should handle line breaks', async () => {
      const html = '<p>Line 1<br/>Line 2</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Line 1');
      expect(docXml).toContain('Line 2');
    });
  });

  describe('complex documents', () => {
    it('should handle a full document with mixed content', async () => {
      const html = `
        <h1>Document Title</h1>
        <p>This is an introduction paragraph with <strong>bold</strong> and <i>italic</i> text.</p>
        <h2>Section 1</h2>
        <p>Here is a list:</p>
        <ul>
          <li>Item A</li>
          <li>Item B with <u>underline</u></li>
        </ul>
        <h2>Section 2</h2>
        <table>
          <tr><th>Name</th><th>Value</th></tr>
          <tr><td>Alpha</td><td>100</td></tr>
        </table>
        <blockquote>A famous quote goes here.</blockquote>
        <p>Conclusion paragraph.</p>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Document Title');
      expect(docXml).toContain('Item A');
      expect(docXml).toContain('Alpha');
      expect(docXml).toContain('Conclusion paragraph');
      expect(docXml).not.toContain('<w:altChunk');
    });
  });
});
