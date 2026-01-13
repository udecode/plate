/**
 * DOCX Export Plugin for Plate.js
 *
 * This plugin provides DOCX export functionality for Plate.js editors.
 * It converts editor content to a valid DOCX file that can be opened
 * in Microsoft Word, Google Docs, LibreOffice, and other word processors.
 *
 * ## Features
 *
 * - Export editor content to DOCX format
 * - Support for all common text formatting (bold, italic, underline, etc.)
 * - Support for headings (h1-h6)
 * - Support for lists (ordered, unordered, nested)
 * - Support for tables
 * - Support for blockquotes
 * - Support for code blocks and inline code
 * - Support for links
 * - Support for inline images (base64)
 * - Configurable page orientation (portrait/landscape)
 * - Configurable page margins
 * - Custom CSS styles support
 * - Font family customization
 *
 * ## Known Limitations
 *
 * - **Mobile browsers**: Export may not work reliably on mobile browsers
 *   due to limitations with blob handling and downloads. Desktop browsers
 *   are fully supported.
 *
 * @packageDocumentation
 */

'use client';

import type { SlatePlugin, Value } from 'platejs';
import { createSlateEditor } from 'platejs';
import { createPlatePlugin } from 'platejs/react';
import type { PlateStaticProps, SerializeHtmlOptions } from 'platejs/static';
import { serializeHtml } from 'platejs/static';

import type { DocumentMargins } from './lib/html-to-docx';

import { htmlToDocxBlob } from './lib/html-to-docx';

// =============================================================================
// CSS Styles for DOCX Export
// =============================================================================

/**
 * CSS styles optimized for Microsoft Word HTML rendering.
 *
 * These styles ensure consistent appearance across different versions
 * of Microsoft Word and other word processors that support HTML import.
 *
 * Key features:
 * - Uses Calibri as the primary font (Microsoft Office default)
 * - 11pt font size (standard document size)
 * - 1.5 line height for readability
 * - Proper heading hierarchy (24pt to 10pt)
 * - Table styles with borders
 * - Code block styling with monospace font
 * - Blockquote styling with left border
 *
 * You can override or extend these styles using the `customStyles` option.
 */
export const DOCX_EXPORT_STYLES = `
body {
  font-family: 'Calibri', 'Arial', sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  color: #000;
  margin: 0;
  padding: 20px;
}
h1 { font-size: 24pt; font-weight: bold; margin: 0 0 12pt 0; }
h2 { font-size: 18pt; font-weight: bold; margin: 0 0 10pt 0; }
h3 { font-size: 14pt; font-weight: bold; margin: 0 0 8pt 0; }
h4 { font-size: 12pt; font-weight: bold; margin: 0 0 6pt 0; }
h5 { font-size: 11pt; font-weight: bold; margin: 0 0 6pt 0; }
h6 { font-size: 10pt; font-weight: bold; margin: 0 0 6pt 0; }
p { margin: 0 0 8pt 0; }
ul, ol { margin: 0 0 8pt 0; padding-left: 20pt; }
li { margin: 0 0 4pt 0; }
strong, b { font-weight: bold; }
em, i { font-style: italic; }
u { text-decoration: underline; }
s, strike, del { text-decoration: line-through; }
code {
  font-family: 'Courier New', Consolas, monospace;
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
}
pre {
  font-family: 'Courier New', Consolas, monospace;
  background-color: #f5f5f5;
  padding: 10px;
  margin: 0 0 8pt 0;
  white-space: pre-wrap;
  border-radius: 4px;
}
blockquote {
  border-left: 3px solid #ccc;
  margin: 0 0 8pt 0;
  padding-left: 10pt;
  color: #666;
  font-style: italic;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin: 0 0 8pt 0;
}
th, td {
  border: 1px solid #ccc;
  padding: 6pt;
  text-align: left;
}
th {
  background-color: #f5f5f5;
  font-weight: bold;
}
a {
  color: #0066cc;
  text-decoration: underline;
}
img {
  max-width: 100%;
  height: auto;
}
hr {
  border: none;
  border-top: 1px solid #ccc;
  margin: 12pt 0;
}
sup { vertical-align: super; font-size: 8pt; }
sub { vertical-align: sub; font-size: 8pt; }
mark { background-color: #ffff00; }
`.trim();

// =============================================================================
// Types
// =============================================================================

/**
 * Page margin configuration.
 * All values are in twentieths of a point (1 inch = 1440 twentieths).
 * Re-exported from html-to-docx for convenience.
 */
export type DocxExportMargins = DocumentMargins;

/**
 * Page orientation options.
 */
export type DocxExportOrientation = 'landscape' | 'portrait';

/**
 * Options for DOCX export operations.
 */
export interface DocxExportOperationOptions {
  /**
   * Additional CSS styles to include in the document.
   * These are appended after the default DOCX_EXPORT_STYLES.
   *
   * @example
   * ```typescript
   * customStyles: '.highlight { background-color: #ffeb3b; }'
   * ```
   */
  customStyles?: string;

  /**
   * Font family for the document body.
   * This overrides the default Calibri font.
   *
   * @example
   * ```typescript
   * fontFamily: 'Times New Roman'
   * ```
   */
  fontFamily?: string;

  /**
   * Page margins in twentieths of a point.
   * 1 inch = 1440 twentieths.
   *
   * @example
   * ```typescript
   * margins: { top: 720, bottom: 720 } // 0.5 inch top/bottom
   * ```
   */
  margins?: DocxExportMargins;

  /**
   * Page orientation.
   * @default 'portrait'
   */
  orientation?: DocxExportOrientation;

  /**
   * Document title (for metadata purposes).
   */
  title?: string;
}

/**
 * Plugin-level options for DocxExportPlugin.
 * These are stored in the plugin options store.
 */
export interface DocxExportPluginOptions {
  /**
   * The Plate.js editor plugins to use for HTML serialization.
   * If not provided, the editor's current plugins will be used.
   *
   * This should match the plugins used in your editor for accurate serialization.
   */
  editorPlugins?: SlatePlugin[];

  /**
   * The React component to use for static rendering.
   * If not provided, a default PlateStatic component will be used.
   */
  editorStaticComponent?: React.ComponentType<PlateStaticProps>;
}

/**
 * Options for DOCX export (combines plugin options and operation options).
 * @deprecated Use DocxExportOperationOptions for export functions
 */
export interface DocxExportOptions
  extends DocxExportOperationOptions,
    DocxExportPluginOptions {}

// =============================================================================
// Plugin Config Types
// =============================================================================

/**
 * API methods for the docxExport namespace on editor.api
 */
export interface DocxExportApiMethods {
  /**
   * Download the editor content as a DOCX file.
   *
   * @param blob - The DOCX blob to download
   * @param filename - The filename for the download (with or without .docx extension)
   */
  download: (blob: Blob, filename: string) => void;

  /**
   * Convert editor content to a DOCX blob.
   *
   * @param options - Export options (orientation, margins, styles, etc.)
   * @returns A Promise that resolves to a Blob containing the DOCX file
   */
  exportToBlob: (options?: DocxExportOperationOptions) => Promise<Blob>;
}

/**
 * Transform methods for the docxExport namespace on editor.tf
 */
export interface DocxExportTransformMethods {
  /**
   * Export and download the editor content as a DOCX file.
   *
   * @param filename - The filename for the download
   * @param options - Export options (orientation, margins, styles, etc.)
   */
  exportAndDownload: (
    filename: string,
    options?: DocxExportOperationOptions
  ) => Promise<void>;
}

// =============================================================================
// Default Values
// =============================================================================

/**
 * Default page margins (1 inch on all sides).
 * Values are in twentieths of a point.
 *
 * Common margin conversions:
 * - 1 inch = 1440
 * - 0.75 inch = 1080
 * - 0.5 inch = 720
 * - 0.25 inch = 360
 */
export const DEFAULT_DOCX_MARGINS: DocxExportMargins = {
  bottom: 1440,
  footer: 720,
  gutter: 0,
  header: 720,
  left: 1440,
  right: 1440,
  top: 1440,
};

// =============================================================================
// Export Functions
// =============================================================================

/**
 * Internal options for serializing to HTML.
 */
interface SerializeToHtmlInternalOptions {
  EditorStaticComponent?: React.ComponentType<PlateStaticProps>;
  fontFamily?: string;
  plugins?: SlatePlugin[];
  value: Value;
}

/**
 * Serializes Plate.js editor value to HTML string.
 *
 * @param options - Serialization options
 * @returns HTML string representation of the editor content
 */
async function serializeToHtml(
  options: SerializeToHtmlInternalOptions
): Promise<string> {
  const { EditorStaticComponent, fontFamily, plugins, value } = options;

  const editorStatic = createSlateEditor({
    plugins: plugins ?? [],
    value,
  });

  const htmlOptions: Partial<SerializeHtmlOptions> = {};

  if (EditorStaticComponent) {
    htmlOptions.editorComponent = EditorStaticComponent;
    htmlOptions.props = {
      style: {
        padding: '0',
        ...(fontFamily ? { fontFamily } : {}),
      },
    };
  }

  const html = await serializeHtml(editorStatic, htmlOptions);

  return html;
}

/**
 * Wraps HTML body content in a complete HTML document with styles.
 *
 * @param bodyHtml - The HTML content for the body
 * @param customStyles - Optional additional CSS styles
 * @returns Complete HTML document string
 */
function wrapHtmlForDocx(bodyHtml: string, customStyles?: string): string {
  const styles = customStyles
    ? `${DOCX_EXPORT_STYLES}\n${customStyles}`
    : DOCX_EXPORT_STYLES;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
${styles}
    </style>
  </head>
  <body>
${bodyHtml}
  </body>
</html>`;
}

/**
 * Internal options for exportToDocxInternal.
 */
interface ExportToDocxInternalOptions extends DocxExportOperationOptions {
  editorPlugins?: SlatePlugin[];
  editorStaticComponent?: React.ComponentType<PlateStaticProps>;
  value: Value;
}

/**
 * Internal function to convert Plate.js editor content to a DOCX blob.
 *
 * @param options - Export options including value and configuration
 * @returns A Promise that resolves to a Blob containing the DOCX file
 */
async function exportToDocxInternal(
  options: ExportToDocxInternalOptions
): Promise<Blob> {
  const {
    customStyles,
    editorPlugins,
    editorStaticComponent,
    fontFamily,
    margins = DEFAULT_DOCX_MARGINS,
    orientation = 'portrait',
    value,
  } = options;

  // Serialize editor content to HTML
  const bodyHtml = await serializeToHtml({
    EditorStaticComponent: editorStaticComponent,
    fontFamily,
    plugins: editorPlugins,
    value,
  });

  // Wrap in complete HTML document
  const fullHtml = wrapHtmlForDocx(bodyHtml, customStyles);

  // Convert to DOCX using browser-compatible implementation
  const blob = await htmlToDocxBlob(fullHtml, {
    margins: {
      ...DEFAULT_DOCX_MARGINS,
      ...margins,
    },
    orientation,
  });

  return blob;
}

/**
 * Convert Plate.js editor content to a DOCX blob.
 *
 * This is the main export function. It:
 * 1. Serializes the editor value to HTML
 * 2. Wraps the HTML in a complete document with styles
 * 3. Converts the HTML to a DOCX blob
 *
 * @param value - The Plate.js editor value (array of nodes)
 * @param options - Export options (orientation, margins, styles, etc.)
 * @returns A Promise that resolves to a Blob containing the DOCX file
 *
 * @example
 * ```typescript
 * import { exportToDocx } from '@platejs/docx-export';
 *
 * const blob = await exportToDocx(editor.children, {
 *   orientation: 'portrait',
 *   margins: { top: 720, bottom: 720 },
 *   fontFamily: 'Arial',
 * });
 * ```
 */
export async function exportToDocx(
  value: Value,
  options: DocxExportOptions = {}
): Promise<Blob> {
  const { editorPlugins, editorStaticComponent, ...operationOptions } = options;

  return exportToDocxInternal({
    ...operationOptions,
    editorPlugins,
    editorStaticComponent,
    value,
  });
}

/**
 * Download a blob as a file in the browser.
 *
 * Creates a temporary anchor element, triggers a click to start
 * the download, then cleans up.
 *
 * @param blob - The blob to download
 * @param filename - The filename for the download (with or without .docx extension)
 *
 * @example
 * ```typescript
 * const blob = await exportToDocx(editor.children);
 * downloadDocx(blob, 'my-document'); // Downloads as my-document.docx
 * ```
 */
export function downloadDocx(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Export editor content directly to a DOCX file download.
 *
 * This is a convenience function that combines `exportToDocx` and `downloadDocx`.
 *
 * @param value - The Plate.js editor value (array of nodes)
 * @param filename - The filename for the download
 * @param options - Export options (orientation, margins, styles, etc.)
 *
 * @example
 * ```typescript
 * import { exportEditorToDocx } from '@platejs/docx-export';
 *
 * // In a click handler:
 * await exportEditorToDocx(editor.children, 'my-document', {
 *   orientation: 'portrait',
 * });
 * ```
 */
export async function exportEditorToDocx(
  value: Value,
  filename: string,
  options: DocxExportOptions = {}
): Promise<void> {
  const blob = await exportToDocx(value, options);
  downloadDocx(blob, filename);
}

// =============================================================================
// Plate.js Plugins
// =============================================================================

/**
 * DOCX Export Plugin for Plate.js
 *
 * This plugin provides the core DOCX export functionality with typed API
 * and transforms following Plate.js plugin patterns.
 *
 * ## Usage with Plugin API (Recommended)
 *
 * @example
 * ```typescript
 * import { DocxExportPlugin } from '@platejs/docx-export';
 *
 * // In your editor setup:
 * const editor = createPlateEditor({
 *   plugins: [
 *     // ... other plugins
 *     DocxExportPlugin.configure({
 *       options: {
 *         // Optional: provide plugins for serialization
 *         editorPlugins: myPlugins,
 *       },
 *     }),
 *   ],
 * });
 *
 * // Export using the plugin API:
 * const blob = await editor.api.docxExport.exportToBlob({
 *   orientation: 'portrait',
 * });
 *
 * // Download the blob:
 * editor.api.docxExport.download(blob, 'my-document');
 *
 * // Or use the transform for export + download in one call:
 * await editor.tf.docxExport.exportAndDownload('my-document', {
 *   orientation: 'landscape',
 * });
 * ```
 *
 * ## Standalone Usage
 *
 * You can also use the exported functions directly without the plugin:
 *
 * @example
 * ```typescript
 * import { exportToDocx, downloadDocx } from '@platejs/docx-export';
 *
 * const blob = await exportToDocx(editor.children, { orientation: 'portrait' });
 * downloadDocx(blob, 'my-document.docx');
 * ```
 */
export const DocxExportPlugin = createPlatePlugin({
  key: 'docxExport',
  options: {
    editorPlugins: undefined as SlatePlugin[] | undefined,
    editorStaticComponent: undefined as
      | React.ComponentType<PlateStaticProps>
      | undefined,
  },
})
  .extendEditorApi(({ editor, getOptions }) => ({
    docxExport: {
      download: (blob: Blob, filename: string): void => {
        downloadDocx(blob, filename);
      },
      exportToBlob: async (
        options: DocxExportOperationOptions = {}
      ): Promise<Blob> => {
        const pluginOptions = getOptions();

        return exportToDocxInternal({
          ...options,
          editorPlugins: pluginOptions.editorPlugins,
          editorStaticComponent: pluginOptions.editorStaticComponent,
          value: editor.children,
        });
      },
    },
  }))
  .extendEditorTransforms(({ editor }) => ({
    docxExport: {
      exportAndDownload: async (
        filename: string,
        options: DocxExportOperationOptions = {}
      ): Promise<void> => {
        const api = editor.api as unknown as {
          docxExport: DocxExportApiMethods;
        };
        const blob = await api.docxExport.exportToBlob(options);
        api.docxExport.download(blob, filename);
      },
    },
  }));

// =============================================================================
// Re-exports
// =============================================================================

export type { DocumentOptions as HtmlToDocxOptions } from './lib/html-to-docx';
export { htmlToDocxBlob } from './lib/html-to-docx';
