import { getEditorSchema } from '../core/editor-runtime';
import {
  above as editorAbove,
  point as editorPoint,
  positions as editorPositions,
} from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import type { Point } from '../interfaces/point';
import {
  canUseAdjacentCharacterFastPath,
  getAdjacentCharacterPoint,
} from './adjacent-character-point';

export const before: EditorStaticApi['before'] = (editor, at, options = {}) => {
  const anchor = editorPoint(editor, [], { edge: 'start' });
  const focus = editorPoint(editor, at, { edge: 'start' });
  const { distance = 1, unit = 'offset', voids = false } = options;

  if (unit === 'character' && canUseAdjacentCharacterFastPath(editor, focus)) {
    return getAdjacentCharacterPoint(editor, focus, {
      direction: 'backward',
      distance,
      voids,
    });
  }

  const range = { anchor, focus };
  let d = 0;
  let target: Point | undefined;

  for (const p of editorPositions(editor, {
    ...options,
    at: range,
    reverse: true,
  })) {
    const insideNonSelectable = editorAbove(editor, {
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
