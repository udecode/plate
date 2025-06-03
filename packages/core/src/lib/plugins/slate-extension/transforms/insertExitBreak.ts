import {
  type EditorAboveOptions,
  combineMatchOptions,
  PathApi,
} from '@udecode/slate';

import type { SlateEditor } from '../../../editor';

import { getPluginTypes } from '../../../plugin/getSlatePlugin';

export type InsertExitBreakOptions = {
  match?: EditorAboveOptions['match'];
  reverse?: boolean;
};

/**
 * Exits the current block structure by creating a new block next to the
 * appropriate ancestor.
 *
 * This function automatically determines the exit point by finding the first
 * ancestor that doesn't have strict sibling constraints (`isStrictSiblings:
 * false`), allowing standard text blocks to be inserted as siblings.
 *
 * For example:
 *
 * - In `column_group > column > codeblock > codeline`, exits after `codeblock`,
 *   then after `column_group`
 * - In `table > tr > td > p`, exits after `table`
 */
export const insertExitBreak = (
  editor: SlateEditor,
  { match, reverse }: InsertExitBreakOptions = {}
) => {
  if (!editor.selection || !editor.api.isCollapsed()) return;

  const block = editor.api.block();

  if (!block) return;

  // Find the nearest ancestor that allows arbitrary block siblings (isStrictSiblings: false)
  // We traverse up the tree until we find an element that can have paragraph siblings
  const target = editor.api.above({
    at: block[1],
    match: combineMatchOptions(
      editor,
      (n, p) =>
        p.length === 1 ||
        (p.length > 1 &&
          !!n.type &&
          !getPluginTypes(
            editor,
            editor.meta.pluginKeys.node.isStrictSiblings
          ).includes(n.type as string)),
      { match }
    ),
  });

  const ancestorPath = target?.[1] ?? block[1];

  const targetPath = reverse ? ancestorPath : PathApi.next(ancestorPath);

  if (!targetPath) return;

  editor.tf.insertNodes(editor.api.create.block(), {
    at: targetPath,
    select: true,
  });

  return true;
};
