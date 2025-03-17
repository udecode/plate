import castArray from 'lodash/castArray.js';
import map from 'lodash/map.js';
import { before as beforeBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { EditorBeforeOptions, Point } from '../../interfaces/index';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getPointBefore = (
  editor: Editor,
  at: At,
  options?: EditorBeforeOptions
): Point | undefined => {
  if (!options || (!options.match && !options.matchString)) {
    try {
      return beforeBase(editor as any, getAt(editor, at)!, options as any);
    } catch {}

    return;
  }

  const unitOffset = !options.unit || options.unit === 'offset';

  const matchStrings: string[] = options.matchString
    ? castArray(options.matchString)
    : [''];

  const matchByRegex = options.matchByRegex ?? false;

  let point: any;

  matchStrings.some((matchString) => {
    let beforeAt = at;
    let previousBeforePoint = editor.api.point(at, { edge: 'end' })!;

    const stackLength = matchString.length + 1;
    const stack: any[] = Array.from({ length: stackLength });

    let count = 0;

    while (true) {
      const beforePoint = beforeBase(
        editor as any,
        getAt(editor, beforeAt)!,
        options as any
      );

      // not found
      if (!beforePoint) {
        if (options.matchBlockStart) {
          point = previousBeforePoint;
        }

        return;
      }
      // stop looking outside of current block
      if (
        editor.api.isAt({
          at: {
            anchor: beforePoint,
            focus: previousBeforePoint,
          },
          blocks: true,
        })
      ) {
        if (options.matchBlockStart) {
          point = previousBeforePoint;
        }

        return;
      }

      const beforeString = editor.api.string({
        anchor: beforePoint,
        focus: previousBeforePoint,
      });

      let beforeStringToMatch = beforeString;

      if (unitOffset && stackLength) {
        stack.unshift({
          point: beforePoint,
          text: beforeString,
        });
        stack.pop();

        beforeStringToMatch = map(stack.slice(0, -1), 'text').join('');
      }

      const isMatched = matchByRegex
        ? !!matchString.match(beforeStringToMatch)
        : beforeStringToMatch === matchString;

      if (
        isMatched ||
        options.match?.({ at, beforePoint, beforeString: beforeStringToMatch })
      ) {
        if (options.afterMatch) {
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

      if (!options.skipInvalid && (!matchString || count >= matchString.length))
        return;
    }
  });

  return point;
};
