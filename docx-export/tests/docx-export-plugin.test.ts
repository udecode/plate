/**
 * Unit tests for the DOCX Export Plugin.
 *
 * These tests verify the high-level export functionality:
 * - DOCX_EXPORT_STYLES content
 * - DEFAULT_DOCX_MARGINS values
 * - exportToDocx function with various editor content
 * - downloadDocx function
 * - Plugin registration
 */

import JSZip from 'jszip';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_DOCX_MARGINS,
  DOCX_EXPORT_STYLES,
  type DocxExportOptions,
  DocxExportPlugin,
  downloadDocx,
  exportToDocx,
} from '../src/docx-export-plugin';

// Helper to convert Blob to ArrayBuffer (handles jsdom Blob without arrayBuffer method)
async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer();
  }

  // Fallback for jsdom environment
  const reader = new FileReader();
  return new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

describe('DOCX_EXPORT_STYLES', () => {
  it('should include body styles with Calibri font family', () => {
    expect(DOCX_EXPORT_STYLES).toContain("font-family: 'Calibri'");
  });

  it('should include standard font size of 11pt', () => {
    expect(DOCX_EXPORT_STYLES).toContain('font-size: 11pt');
  });

  it('should include line height of 1.5', () => {
    expect(DOCX_EXPORT_STYLES).toContain('line-height: 1.5');
  });

  it('should include heading styles h1-h6', () => {
    expect(DOCX_EXPORT_STYLES).toContain('h1 {');
    expect(DOCX_EXPORT_STYLES).toContain('h2 {');
    expect(DOCX_EXPORT_STYLES).toContain('h3 {');
    expect(DOCX_EXPORT_STYLES).toContain('h4 {');
    expect(DOCX_EXPORT_STYLES).toContain('h5 {');
    expect(DOCX_EXPORT_STYLES).toContain('h6 {');
  });

  it('should include heading font sizes in descending order', () => {
    expect(DOCX_EXPORT_STYLES).toContain('h1 { font-size: 24pt');
    expect(DOCX_EXPORT_STYLES).toContain('h2 { font-size: 18pt');
    expect(DOCX_EXPORT_STYLES).toContain('h3 { font-size: 14pt');
  });

  it('should include table styles with borders', () => {
    expect(DOCX_EXPORT_STYLES).toContain('table {');
    expect(DOCX_EXPORT_STYLES).toContain('border-collapse: collapse');
    expect(DOCX_EXPORT_STYLES).toContain('th, td {');
    expect(DOCX_EXPORT_STYLES).toContain('border: 1px solid');
  });

  it('should include list styles', () => {
    expect(DOCX_EXPORT_STYLES).toContain('ul, ol {');
    expect(DOCX_EXPORT_STYLES).toContain('li {');
    expect(DOCX_EXPORT_STYLES).toContain('padding-left: 20pt');
  });

  it('should include code block styles with monospace font', () => {
    expect(DOCX_EXPORT_STYLES).toContain('code {');
    expect(DOCX_EXPORT_STYLES).toContain('pre {');
    expect(DOCX_EXPORT_STYLES).toContain("font-family: 'Courier New'");
  });

  it('should include blockquote styles', () => {
    expect(DOCX_EXPORT_STYLES).toContain('blockquote {');
    expect(DOCX_EXPORT_STYLES).toContain('border-left: 3px solid');
  });

  it('should include link styles', () => {
    expect(DOCX_EXPORT_STYLES).toContain('a {');
    expect(DOCX_EXPORT_STYLES).toContain('color: #0066cc');
    expect(DOCX_EXPORT_STYLES).toContain('text-decoration: underline');
  });

  it('should include text formatting styles', () => {
    expect(DOCX_EXPORT_STYLES).toContain('strong, b {');
    expect(DOCX_EXPORT_STYLES).toContain('em, i {');
    expect(DOCX_EXPORT_STYLES).toContain('u {');
    expect(DOCX_EXPORT_STYLES).toContain('s, strike, del {');
  });

  it('should include superscript and subscript styles', () => {
    expect(DOCX_EXPORT_STYLES).toContain('sup {');
    expect(DOCX_EXPORT_STYLES).toContain('sub {');
  });

  it('should include image max-width constraint', () => {
    expect(DOCX_EXPORT_STYLES).toContain('img {');
    expect(DOCX_EXPORT_STYLES).toContain('max-width: 100%');
  });

  it('should include highlight/mark styles', () => {
    expect(DOCX_EXPORT_STYLES).toContain('mark {');
    expect(DOCX_EXPORT_STYLES).toContain('background-color: #ffff00');
  });
});

describe('DEFAULT_DOCX_MARGINS', () => {
  it('should have 1 inch top margin (1440 twentieths of a point)', () => {
    expect(DEFAULT_DOCX_MARGINS.top).toBe(1440);
  });

  it('should have 1 inch right margin', () => {
    expect(DEFAULT_DOCX_MARGINS.right).toBe(1440);
  });

  it('should have 1 inch bottom margin', () => {
    expect(DEFAULT_DOCX_MARGINS.bottom).toBe(1440);
  });

  it('should have 1 inch left margin', () => {
    expect(DEFAULT_DOCX_MARGINS.left).toBe(1440);
  });

  it('should have 0.5 inch header margin (720 twentieths)', () => {
    expect(DEFAULT_DOCX_MARGINS.header).toBe(720);
  });

  it('should have 0.5 inch footer margin', () => {
    expect(DEFAULT_DOCX_MARGINS.footer).toBe(720);
  });

  it('should have 0 gutter margin', () => {
    expect(DEFAULT_DOCX_MARGINS.gutter).toBe(0);
  });
});

describe('DocxExportOptions type', () => {
  it('should accept portrait orientation', () => {
    const options: DocxExportOptions = {
      orientation: 'portrait',
    };
    expect(options.orientation).toBe('portrait');
  });

  it('should accept landscape orientation', () => {
    const options: DocxExportOptions = {
      orientation: 'landscape',
    };
    expect(options.orientation).toBe('landscape');
  });

  it('should accept custom margins', () => {
    const options: DocxExportOptions = {
      margins: {
        bottom: 720,
        left: 720,
        right: 720,
        top: 720,
      },
    };
    expect(options.margins?.top).toBe(720);
  });

  it('should accept custom styles', () => {
    const options: DocxExportOptions = {
      customStyles: '.custom { color: red; }',
    };
    expect(options.customStyles).toBe('.custom { color: red; }');
  });

  it('should accept font family', () => {
    const options: DocxExportOptions = {
      fontFamily: 'Arial',
    };
    expect(options.fontFamily).toBe('Arial');
  });

  it('should accept title', () => {
    const options: DocxExportOptions = {
      title: 'My Document',
    };
    expect(options.title).toBe('My Document');
  });
});

describe('exportToDocx function', () => {
  describe('with simple paragraph content', () => {
    it('should export a simple paragraph', async () => {
      const value = [
        {
          children: [{ text: 'Hello World' }],
          type: 'p',
        },
      ];

      const blob = await exportToDocx(value);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
    });

    it('should export multiple paragraphs', async () => {
      const value = [
        { children: [{ text: 'First paragraph' }], type: 'p' },
        { children: [{ text: 'Second paragraph' }], type: 'p' },
        { children: [{ text: 'Third paragraph' }], type: 'p' },
      ];

      const blob = await exportToDocx(value);
      const arrayBuffer = await blobToArrayBuffer(blob);
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')!.async('string');

      // TurboDocx converts to native DOCX elements
      expect(docXml).toContain('First paragraph');
      expect(docXml).toContain('Second paragraph');
      expect(docXml).toContain('Third paragraph');
    });

    it('should export empty paragraph', async () => {
      const value = [{ children: [{ text: '' }], type: 'p' }];

      const blob = await exportToDocx(value);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('export options', () => {
    it('should export with portrait orientation by default', async () => {
      const value = [{ children: [{ text: 'Test' }], type: 'p' }];

      const blob = await exportToDocx(value);
      const arrayBuffer = await blobToArrayBuffer(blob);
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')!.async('string');

      // Check for section properties
      expect(docXml).toContain('<w:sectPr');
      expect(docXml).toContain('<w:pgSz');
    });

    it('should export with landscape orientation when specified', async () => {
      const value = [{ children: [{ text: 'Test' }], type: 'p' }];

      const blob = await exportToDocx(value, { orientation: 'landscape' });
      const arrayBuffer = await blobToArrayBuffer(blob);
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')!.async('string');

      expect(docXml).toContain('w:orient="landscape"');
    });

    it('should apply custom margins', async () => {
      const value = [{ children: [{ text: 'Test' }], type: 'p' }];

      const blob = await exportToDocx(value, {
        margins: { bottom: 720, top: 720 },
      });
      const arrayBuffer = await blobToArrayBuffer(blob);
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')!.async('string');

      expect(docXml).toContain('<w:pgMar');
    });
  });

  describe('special content', () => {
    it('should handle content with special characters', async () => {
      const value = [
        { children: [{ text: 'Special chars: <>&"\'' }], type: 'p' },
      ];

      const blob = await exportToDocx(value);
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should handle content with unicode characters', async () => {
      const value = [
        {
          children: [{ text: 'Unicode: 中文 日本語 한국어 العربية' }],
          type: 'p',
        },
      ];

      const blob = await exportToDocx(value);
      const arrayBuffer = await blobToArrayBuffer(blob);
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')!.async('string');

      expect(docXml).toContain('中文');
    });

    it('should handle very long paragraphs', async () => {
      const longText = 'Lorem ipsum dolor sit amet. '.repeat(100);
      const value = [{ children: [{ text: longText }], type: 'p' }];

      const blob = await exportToDocx(value);
      const arrayBuffer = await blobToArrayBuffer(blob);
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')!.async('string');

      expect(docXml).toContain('Lorem ipsum');
    });
  });

  describe('native DOCX structure', () => {
    it('should create native DOCX elements (not altChunk)', async () => {
      const value = [{ children: [{ text: 'Test content' }], type: 'p' }];

      const blob = await exportToDocx(value);
      const arrayBuffer = await blobToArrayBuffer(blob);
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')!.async('string');

      // Should NOT use altChunk - TurboDocx creates native elements
      expect(docXml).not.toContain('<w:altChunk');

      // Should have native paragraph elements
      expect(docXml).toContain('<w:p');
      expect(docXml).toContain('<w:r');
      expect(docXml).toContain('<w:t');
    });

    it('should have proper Office Open XML structure', async () => {
      const value = [{ children: [{ text: 'Test' }], type: 'p' }];

      const blob = await exportToDocx(value);
      const arrayBuffer = await blobToArrayBuffer(blob);
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Must have required DOCX files
      expect(zip.file('[Content_Types].xml')).not.toBeNull();
      expect(zip.file('_rels/.rels')).not.toBeNull();
      expect(zip.file('word/document.xml')).not.toBeNull();
      expect(zip.file('word/_rels/document.xml.rels')).not.toBeNull();
      expect(zip.file('word/styles.xml')).not.toBeNull();
    });
  });
});

describe('downloadDocx function', () => {
  const origCreateElement = document.createElement.bind(document);
  let createObjectURLSpy: MockInstance;
  let revokeObjectURLSpy: MockInstance;
  let clickSpy: ReturnType<typeof vi.fn>;
  let mockAnchor: {
    click: ReturnType<typeof vi.fn>;
    download: string;
    href: string;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Ensure URL.createObjectURL and revokeObjectURL exist in jsdom
    if (!URL.createObjectURL) {
      (URL as unknown as Record<string, unknown>).createObjectURL = () => '';
    }
    if (!URL.revokeObjectURL) {
      (URL as unknown as Record<string, unknown>).revokeObjectURL = () => {};
    }

    createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:test-url');
    revokeObjectURLSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    clickSpy = vi.fn();
    mockAnchor = {
      click: clickSpy,
      download: '',
      href: '',
      remove: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockAnchor as unknown as HTMLAnchorElement;
      }

      return origCreateElement(tagName);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create download link with correct filename', () => {
    const blob = new Blob(['test'], { type: 'application/octet-stream' });
    downloadDocx(blob, 'test-document');

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    // downloadDocx appends .docx extension
    expect(mockAnchor.download).toBe('test-document.docx');
  });

  it('should trigger download click', () => {
    const blob = new Blob(['test'], { type: 'application/octet-stream' });
    downloadDocx(blob, 'test');

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should cleanup resources after download', () => {
    const blob = new Blob(['test'], { type: 'application/octet-stream' });
    downloadDocx(blob, 'test');

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');
  });
});

describe('DocxExportPlugin', () => {
  it('should have key "docxExport"', () => {
    expect(DocxExportPlugin.key).toBe('docxExport');
  });

  it('should be a valid Plate plugin', () => {
    expect(DocxExportPlugin).toBeDefined();
    expect(typeof DocxExportPlugin).toBe('object');
  });
});
