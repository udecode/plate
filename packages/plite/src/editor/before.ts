import { isEditorNodeSelectable } from '../core/editor-read-execution';
import { getEditorSchema } from '../core/editor-runtime';
import {
  above as editorAbove,
  point as editorPoint,
  positions as editorPositions,
  string as editorString,
} from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import { PathApi } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import {
  canUseAdjacentCharacterFastPath,
  getAdjacentCharacterPoint,
} from './adjacent-character-point';

const beforeBase: EditorStaticApi['before'] = (editor, at, options = {}) => {
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
        NodeApi.isElement(node) && !isEditorNodeSelectable(editor, node),
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

    d += 1;
  }

  return target;
};

export const before: EditorStaticApi['before'] = (editor, at, options = {}) => {
  if (!options.match && options.matchString === undefined) {
    return beforeBase(editor, at, options);
  }

  const { afterMatch, match, matchBlockStart, matchByRegex, matchString } =
    options;
  const stepOptions = {
    distance: options.distance,
    unit: options.unit,
    voids: options.voids,
  };
  const unitOffset = !options.unit || options.unit === 'offset';
  const matchStrings = matchString
    ? Array.isArray(matchString)
      ? matchString
      : [matchString]
    : [''];
  let point: Point | undefined;

  const initialPoint = (() => {
    try {
      return editorPoint(editor, at, { edge: 'end' });
    } catch {
      // Missing or detached locations have no fallback endpoint.
    }

    return undefined;
  })();

  if (!initialPoint) return undefined;

  const blockEntry = editorAbove(editor, {
    at: initialPoint,
    match: (node) =>
      NodeApi.isElement(node) && getEditorSchema(editor).isBlock(node),
  });

  // oxlint-disable-next-line array-callback-return -- [P1 local-invariant] The infinite scan returns on every exit; a sentinel return is unreachable.
  matchStrings.some((currentMatchString) => {
    let beforeAt = at;
    let previousBeforePoint = initialPoint;
    const stackLength = currentMatchString.length + 1;
    const stack: Array<{ point: Point; text: string }> = Array.from({
      length: stackLength,
    });
    let count = 0;

    while (true) {
      const beforePoint = beforeBase(editor, beforeAt, stepOptions);

      if (!beforePoint) {
        if (matchBlockStart) {
          point = previousBeforePoint;
        }

        return false;
      }

      const beforeBlockEntry = editorAbove(editor, {
        at: beforePoint,
        match: (node) =>
          NodeApi.isElement(node) && getEditorSchema(editor).isBlock(node),
      });

      if (
        blockEntry &&
        beforeBlockEntry &&
        !PathApi.equals(blockEntry[1], beforeBlockEntry[1])
      ) {
        if (matchBlockStart) {
          point = previousBeforePoint;
        }

        return false;
      }

      const beforeString = editorString(editor, {
        anchor: beforePoint,
        focus: previousBeforePoint,
      });
      let beforeStringToMatch = beforeString;

      if (
        unitOffset &&
        beforeString === '' &&
        !PathApi.equals(beforePoint.path, previousBeforePoint.path)
      ) {
        previousBeforePoint = beforePoint;
        beforeAt = beforePoint;
        continue;
      }

      if (unitOffset && stackLength) {
        stack.unshift({
          point: beforePoint,
          text: beforeString,
        });
        stack.pop();

        beforeStringToMatch = stack
          .slice(0, -1)
          .map((entry) => entry?.text ?? '')
          .join('');
      }

      const isMatched = matchByRegex
        ? new RegExp(currentMatchString).test(beforeStringToMatch)
        : beforeStringToMatch === currentMatchString;

      if (
        isMatched ||
        match?.({ at, beforePoint, beforeString: beforeStringToMatch })
      ) {
        if (afterMatch) {
          if (stackLength && unitOffset) {
            point = stack.at(-1)?.point;

            return !!point;
          }

          point = previousBeforePoint;

          return true;
        }

        point = beforePoint;

        return true;
      }

      previousBeforePoint = beforePoint;
      beforeAt = beforePoint;
      count += 1;

      if (
        !options.skipInvalid &&
        (!currentMatchString || count >= currentMatchString.length)
      ) {
        return false;
      }
    }
  });

  return point;
};
