import { range } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { At } from '../../types';

import {
  type EditorBeforeOptions,
  type TRange,
  RangeApi,
} from '../../interfaces';
import { getPointFromLocation } from '../../queries/getPointFromLocation';
import { getAt } from '../../utils';

export const getRange = (
  editor: Editor,
  at: At | 'before' | 'start',
  to?: At | null,
  options?: { before?: EditorBeforeOptions }
): TRange | undefined => {
  let from = getAt(editor, at);

  if (RangeApi.isRange(from) && !to) {
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

    from = anchor ?? to;
  }

  return range(editor as any, from as any, getAt(editor, to));
};
