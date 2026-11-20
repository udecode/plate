import type { EditorStaticApi } from '../interfaces/editor';
import {
  point as editorPoint,
  positions as editorPositions,
} from '../interfaces/editor';
import type { Point } from '../interfaces/point';
import {
  canUseAdjacentCharacterFastPath,
  getAdjacentCharacterPoint,
} from './adjacent-character-point';
import { type Reach, skipsPoint } from './reach';

const stepAfter =
  (reach: Reach): EditorStaticApi['after'] =>
  (editor, at, options = {}) => {
    const anchor = editorPoint(editor, at, { edge: 'end' });
    const { distance = 1, unit = 'offset', voids = false } = options;

    if (
      unit === 'character' &&
      canUseAdjacentCharacterFastPath(editor, anchor)
    ) {
      return getAdjacentCharacterPoint(editor, anchor, {
        direction: 'forward',
        distance,
        reach,
        voids,
      });
    }

    const focus = editorPoint(editor, [], { edge: 'end' });
    const range = { anchor, focus };
    let d = 0;
    let target: Point | undefined;

    for (const p of editorPositions(editor, {
      ...options,
      at: range,
    })) {
      if (skipsPoint(editor, p, reach)) {
        continue;
      }

      if (d > distance) {
        break;
      }

      if (d !== 0) {
        target = p;
      }

      d += 1;
    }

    return target;
  };

export const after = stepAfter('caret');

export const contentAfter = stepAfter('content');
