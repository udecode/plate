import { MarkdownPlugin } from '@platejs/markdown';
import type { SlateEditor, TNode } from 'platejs';

import type { ImportMarkdownResult } from './types';

/**
 * Import Markdown and convert it to Plate editor nodes.
 *
 * Requires MarkdownPlugin to be registered in the editor.
 *
 * @param editor - The Plate editor instance (must have MarkdownPlugin)
 * @param markdown - The Markdown string to import
 * @returns Import result with nodes
 *
 * @example
 * ```ts
 * const file = await picker.getFile();
 * const markdown = await file.text();
 * const result = importMarkdown(editor, markdown);
 *
 * // Insert nodes into editor
 * editor.tf.insertNodes(result.nodes);
 * ```
 */
export function importMarkdown(
  editor: SlateEditor,
  markdown: string
): ImportMarkdownResult {
  const nodes = editor
    .getApi(MarkdownPlugin)
    .markdown.deserialize(markdown) as TNode[];

  return { nodes };
}
