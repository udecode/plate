import { select as selectBase } from 'slate';

import type { At } from '../../types';

import { type Editor, type SelectOptions, PathApi } from '../../interfaces';
import { getAt } from '../../utils/getAt';

export const select = (
  editor: Editor,
  target?: At,
  options: SelectOptions = {}
) => {
  const { edge, focus, next, previous } = options;

  if (focus) {
    editor.tf.focus();
  }
  // Handle sibling selection
  if (next || previous) {
    const at = getAt(editor, target) ?? editor.selection;

    if (!at) return;

    const path = editor.api.path(at);

    if (!path) return;

    const point = previous
      ? editor.api.end(path, { previous: true })
      : editor.api.start(path, { next: true });

    if (!point) return;

    selectBase(editor as any, point);

    return;
  }
  // Handle edge selection
  if (edge) {
    const at = getAt(editor, target) ?? editor.selection;

    if (!at) return;

    const path = PathApi.isPath(at)
      ? at
      : editor.api.node({ at, block: true })?.[1];

    if (!path) return;

    const point =
      edge === 'end' ? editor.api.end(path) : editor.api.start(path);

    if (!point) return;

    selectBase(editor as any, point);

    return;
  }

  const at = getAt(editor, target);

  if (!at) return;

  selectBase(editor as any, at);
};
