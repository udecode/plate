/**
 * @platejs/docx-export
 *
 * A plugin for exporting Plate.js editor content to Microsoft Word (DOCX) format.
 *
 * ## Installation
 *
 * ```bash
 * npm install @platejs/docx-export jszip
 * # or
 * yarn add @platejs/docx-export jszip
 * # or
 * pnpm add @platejs/docx-export jszip
 * ```
 *
 * ## Quick Start
 *
 * ```tsx
 * import { exportEditorToDocx } from '@platejs/docx-export';
 *
 * // Export editor content to DOCX
 * await exportEditorToDocx(editor.children, 'my-document', {
 *   orientation: 'portrait',
 * });
 * ```
 *
 * ## Features
 *
 * - Export Plate.js editor content to DOCX format
 * - Support for all common formatting (bold, italic, underline, etc.)
 * - Support for headings, lists, tables, blockquotes, and code blocks
 * - Configurable page orientation (portrait/landscape)
 * - Configurable page margins
 * - Custom CSS styles support
 * - Fully browser-compatible (no server required)
 *
 * @packageDocumentation
 */

// Types
export type {
  DocxExportApiMethods,
  DocxExportMargins,
  DocxExportOperationOptions,
  DocxExportOptions,
  DocxExportOrientation,
  DocxExportPluginOptions,
  DocxExportTransformMethods,
  HtmlToDocxOptions,
} from './docx-export-plugin';
// Main plugin and export functions
export {
  DEFAULT_DOCX_MARGINS,
  DOCX_EXPORT_STYLES,
  DocxExportPlugin,
  downloadDocx,
  exportEditorToDocx,
  exportToDocx,
  htmlToDocxBlob,
} from './docx-export-plugin';

// Low-level HTML to DOCX converter types (re-exported from @turbodocx/html-to-docx)
export type {
  DocumentMargins,
  DocumentOptions,
  HeadingConfig,
  HeadingSpacing,
  HeadingStyle,
  LineNumberOptions,
  Margins,
  PageSize,
  Row,
  Table,
} from './lib/html-to-docx';

// UI Components
export {
  DocxExportToolbarButton,
  type DocxExportToolbarButtonProps,
} from './ui/docx-export-toolbar-button';
