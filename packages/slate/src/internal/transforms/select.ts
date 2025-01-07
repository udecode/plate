import { select as selectBase } from 'slate';

import type { Editor, SelectOptions } from '../../interfaces';
import type { At } from '../../types';

import { getAt } from '../../utils/getAt';

export const select = (
  editor: Editor,
  target?: At,
  options: SelectOptions = {}
) => {
  const { edge } = options;

  if (edge) {
    const path = editor.api.find({ at: target, block: true })?.[1];

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
