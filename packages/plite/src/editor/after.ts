import { getEditorSchema } from '../core/editor-runtime';
import { Editor, type EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import type { Point } from '../interfaces/point';
import {
  canUseAdjacentCharacterFastPath,
  getAdjacentCharacterPoint,
} from './adjacent-character-point';

export const after: EditorStaticApi['after'] = (editor, at, options = {}) => {
  const anchor = Editor.point(editor, at, { edge: 'end' });
  const { distance = 1, unit = 'offset', voids = false } = options;

  if (unit === 'character' && canUseAdjacentCharacterFastPath(editor, anchor)) {
    return getAdjacentCharacterPoint(editor, anchor, {
      direction: 'forward',
      distance,
      voids,
    });
  }

  const focus = Editor.point(editor, [], { edge: 'end' });
  const range = { anchor, focus };
  let d = 0;
  let target: Point | undefined;

  for (const p of Editor.positions(editor, {
    ...options,
    at: range,
  })) {
    const insideNonSelectable = Editor.above(editor, {
      at: p,
      match: (node) =>
        NodeApi.isElement(node) && !getEditorSchema(editor).isSelectable(node),
      mode: 'highest',
      voids: true,
    });

    if (insideNonSelectable) {
      continue;
    }

    if (d > distance) {
      break;
    }

    if (d !== 0) {
      target = p;
    }

    d++;
  }

  return target;
};
