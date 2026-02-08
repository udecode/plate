/**
 * DOCX Import/Export Plugin Kit for Plate.js
 *
 * This module provides an easy-to-use plugin kit that combines both
 * import and export functionality for DOCX files.
 *
 * @example
 * ```tsx
 * import { DocxIOPlugin, importDocx, exportToDocx } from '@platejs/docx-io';
 *
 * // Use the plugin in your editor
 * const editor = createPlateEditor({
 *   plugins: [
 *     ...BaseEditorKit,
 *     DocxIOPlugin,
 *   ],
 * });
 *
 * // Import a DOCX file
 * const { nodes } = await importDocx(editor, arrayBuffer);
 * editor.tf.insertNodes(nodes);
 *
 * // Export to DOCX
 * const blob = await exportToDocx(editor.children, {
 *   editorPlugins: editor.plugins,
 * });
 * ```
 *
 * @packageDocumentation
 */

'use client';

import { DocxExportPlugin } from './docx-export-plugin';

export { importDocx } from './importDocx';
export {
  downloadDocx,
  exportEditorToDocx,
  exportToDocx,
} from './docx-export-plugin';
export { htmlToDocxBlob } from './exportDocx';

/**
 * DOCX Import/Export Plugin for Plate.js
 *
 * This plugin provides both import and export functionality for DOCX files.
 * It's a simple re-export of DocxExportPlugin with better discoverability.
 *
 * For import, use the `importDocx` function directly.
 * For export, use the plugin's `exportToDocx` or `downloadDocx` functions.
 *
 * @example
 * ```tsx
 * import { DocxIOPlugin } from '@platejs/docx-io';
 *
 * const editor = createPlateEditor({
 *   plugins: [DocxIOPlugin],
 * });
 * ```
 */
export const DocxIOPlugin = DocxExportPlugin;

/**
 * DOCX Import/Export Kit - array form for use with spread operator
 *
 * @example
 * ```tsx
 * import { DocxIOKit } from '@platejs/docx-io';
 *
 * const editor = createPlateEditor({
 *   plugins: [...BaseEditorKit, ...DocxIOKit],
 * });
 * ```
 */
export const DocxIOKit = [DocxExportPlugin];
