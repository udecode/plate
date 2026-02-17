import { describe, expect, it } from 'bun:test';

import {
  DocxIOKit,
  DocxIOPlugin,
  downloadDocx,
  exportEditorToDocx,
  exportToDocx,
  htmlToDocxBlob,
  importDocx,
} from './DocxIOPlugin';
import { DocxExportPlugin } from './docx-export-plugin';

describe('DocxIOPlugin', () => {
  it('should export DocxIOPlugin', () => {
    expect(DocxIOPlugin).toBeDefined();
  });

  it('should be the same as DocxExportPlugin', () => {
    expect(DocxIOPlugin).toBe(DocxExportPlugin);
  });

  it('should have a key property', () => {
    expect(DocxIOPlugin.key).toBeDefined();
  });
});

describe('DocxIOKit', () => {
  it('should be an array', () => {
    expect(Array.isArray(DocxIOKit)).toBe(true);
  });

  it('should contain DocxExportPlugin', () => {
    expect(DocxIOKit).toContain(DocxExportPlugin);
  });

  it('should have length of 1', () => {
    expect(DocxIOKit.length).toBe(1);
  });

  it('should be spreadable into plugins array', () => {
    const plugins = [...DocxIOKit];

    expect(plugins.length).toBe(1);
    expect(plugins[0]).toBe(DocxExportPlugin);
  });
});

describe('importDocx function', () => {
  it('should be exported as a function', () => {
    expect(typeof importDocx).toBe('function');
  });

  it('should be defined', () => {
    expect(importDocx).toBeDefined();
  });
});

describe('exportToDocx function', () => {
  it('should be exported as a function', () => {
    expect(typeof exportToDocx).toBe('function');
  });

  it('should be defined', () => {
    expect(exportToDocx).toBeDefined();
  });
});

describe('downloadDocx function', () => {
  it('should be exported as a function', () => {
    expect(typeof downloadDocx).toBe('function');
  });

  it('should be defined', () => {
    expect(downloadDocx).toBeDefined();
  });
});

describe('exportEditorToDocx function', () => {
  it('should be exported as a function', () => {
    expect(typeof exportEditorToDocx).toBe('function');
  });

  it('should be defined', () => {
    expect(exportEditorToDocx).toBeDefined();
  });
});

describe('htmlToDocxBlob function', () => {
  it('should be exported as a function', () => {
    expect(typeof htmlToDocxBlob).toBe('function');
  });

  it('should be defined', () => {
    expect(htmlToDocxBlob).toBeDefined();
  });

  it('should create a DOCX blob from basic HTML', async () => {
    const html = '<p>Hello world</p>';
    const blob = await htmlToDocxBlob(html);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should handle empty HTML', async () => {
    const html = '';
    const blob = await htmlToDocxBlob(html);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0); // Still creates a valid DOCX structure
  });

  it('should handle HTML with multiple paragraphs', async () => {
    const html = '<p>First paragraph</p><p>Second paragraph</p>';
    const blob = await htmlToDocxBlob(html);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should handle HTML with formatting', async () => {
    const html = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
    const blob = await htmlToDocxBlob(html);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should handle HTML with headings', async () => {
    const html = '<h1>Heading 1</h1><h2>Heading 2</h2><p>Body text</p>';
    const blob = await htmlToDocxBlob(html);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should create different blob sizes for different content', async () => {
    const shortHtml = '<p>Short</p>';
    const longHtml = `<p>${'Long text content '.repeat(100)}</p>`;

    const shortBlob = await htmlToDocxBlob(shortHtml);
    const longBlob = await htmlToDocxBlob(longHtml);

    expect(longBlob.size).toBeGreaterThan(shortBlob.size);
  });
});

describe('Module exports', () => {
  it('should export all expected functions', () => {
    expect(importDocx).toBeDefined();
    expect(exportToDocx).toBeDefined();
    expect(downloadDocx).toBeDefined();
    expect(exportEditorToDocx).toBeDefined();
    expect(htmlToDocxBlob).toBeDefined();
  });

  it('should export all expected plugins', () => {
    expect(DocxIOPlugin).toBeDefined();
    expect(DocxExportPlugin).toBeDefined();
    expect(DocxIOKit).toBeDefined();
  });
});

describe('DocxIOPlugin re-export', () => {
  it('should maintain plugin identity through re-export', () => {
    // DocxIOPlugin is a re-export of DocxExportPlugin
    // They should be the exact same object
    expect(DocxIOPlugin).toBe(DocxExportPlugin);

    // Any properties should be identical
    expect(DocxIOPlugin.key).toBe(DocxExportPlugin.key);
  });

  it('should support being used in plugin arrays', () => {
    const plugins1 = [DocxIOPlugin];
    const plugins2 = [DocxExportPlugin];

    // Both should work identically since they're the same plugin
    expect(plugins1[0]).toBe(plugins2[0]);
  });
});

describe('DocxIOKit usage patterns', () => {
  it('should work with spread operator', () => {
    const basePlugins: any[] = [];
    const allPlugins = [...basePlugins, ...DocxIOKit];

    expect(allPlugins.length).toBe(1);
    expect(allPlugins[0]).toBe(DocxExportPlugin);
  });

  it('should work with concat', () => {
    const basePlugins: any[] = [];
    const allPlugins = basePlugins.concat(DocxIOKit);

    expect(allPlugins.length).toBe(1);
    expect(allPlugins[0]).toBe(DocxExportPlugin);
  });

  it('should work when destructured', () => {
    const [plugin] = DocxIOKit;

    expect(plugin).toBe(DocxExportPlugin);
  });
});

describe('Package documentation compliance', () => {
  it('should provide both import and export functionality', () => {
    // As documented, this module provides both import and export
    expect(importDocx).toBeDefined(); // Import function
    expect(exportToDocx).toBeDefined(); // Export function
  });

  it('should provide plugin for easy integration', () => {
    // Plugin should be available for editor configuration
    expect(DocxIOPlugin).toBeDefined();
    expect(DocxIOKit).toBeDefined();
  });

  it('should provide helper functions', () => {
    // Additional helper functions for flexibility
    expect(downloadDocx).toBeDefined();
    expect(exportEditorToDocx).toBeDefined();
    expect(htmlToDocxBlob).toBeDefined();
  });
});
