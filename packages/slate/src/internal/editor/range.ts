import { range as rangeBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { At } from '../../types';

import {
  type EditorBeforeOptions,
  type TRange,
  PointApi,
  RangeApi,
} from '../../interfaces';
import { getAt } from '../../utils';

export const range = (
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

    const focus = PointApi.get(to);

    if (!focus) return;

    return { anchor, focus };
  }
  if (to && from === 'before') {
    const anchor = editor.api.before(to, options?.before);

    from = anchor ?? getAt(editor, to);
  }

  return rangeBase(editor as any, from as any, getAt(editor, to));
};
