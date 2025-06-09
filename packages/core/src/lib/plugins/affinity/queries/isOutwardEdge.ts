import { type Path, PathApi } from '@udecode/slate';

import type { SlateEditor } from '../../../editor';

/**
 * Whether the cursor is at the outside edge of a node.
 *
 * - Outward end: <node>text</node><cursor/> returns true
 * - Outward start: <cursor/><node>text</node> returns true
 *
 * The cursor is inside a node: <node>te<cursor/>xt</node> returns false
 */
export const isOutwardEdge = (
  editor: SlateEditor,
  { affinity, at }: { affinity: 'backward' | 'forward'; at: Path }
) => {
  if (affinity === 'forward') {
    const cursor = editor.selection?.focus;
    const previous = PathApi.previous(at);

    if (!previous || !cursor) return false;

    return editor.api.isEnd(cursor, previous);
  }

  if (affinity === 'backward') {
    const cursor = editor.selection?.focus;
    const next = PathApi.next(at);

    if (!next || !cursor) return false;

    return editor.api.isStart(cursor, next);
  }

  return false;
};
