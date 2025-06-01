import { type Path, PathApi } from '@udecode/slate';

import type { SlateEditor } from '../../../editor';

/**
 * Returns true when the cursor is at the boundary of a element:
 *
 * - At the end of a element: <element>text</element><cursor/> returns true
 * - At the start of a element: <cursor/><element>text</element> returns true
 *
 *   The cursor is inside a element: <element>te<cursor/>xt</element> returns
 *   false
 */
export const isFocusBoundaryEdge = (
  editor: SlateEditor,
  options: { affinity: 'backward' | 'forward'; at: Path }
) => {
  if (options.affinity === 'forward') {
    const previous = PathApi.previous(options.at);
    const focus = editor.selection?.focus;

    if (!previous || !focus) return false;

    return editor.api.isEnd(focus, previous);
  }

  if (options.affinity === 'backward') {
    const next = PathApi.next(options.at);
    const focus = editor.selection?.focus;

    if (!next || !focus) return false;

    return editor.api.isStart(focus, next);
  }

  return false;
};
