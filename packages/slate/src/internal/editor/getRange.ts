import { Range, range } from 'slate';

import type { GetPointBeforeOptions } from '../../interfaces';
import type { TEditor } from '../../interfaces/editor/TEditor';
import type { At, TRange } from '../../types';

import { getPointFromLocation } from '../../queries/getPointFromLocation';
import { getAt } from '../../utils';

export const getRange = (
  editor: TEditor,
  at: At | 'before' | 'start',
  to?: At | null,
  options?: { before?: GetPointBeforeOptions }
): TRange | undefined => {
  let from = getAt(editor, at);

  if (Range.isRange(from) && !to) {
    return from;
  }
  if (from === 'start') {
    const path = editor.api.block({ at: to! })?.[1];

    if (!path) return;

    const anchor = editor.api.start(path);

    if (!anchor) return;

    const focus = getPointFromLocation({
      at: to,
    });

    if (!focus) return;

    return { anchor, focus };
  }
  if (to && from === 'before') {
    const anchor = editor.api.before(to, options?.before);

    console.log({ anchor });

    from = anchor ?? to;
  }

  return range(editor as any, from as any, getAt(editor, to));
};
