import type { Editor, TRange } from '@udecode/plate';

import castArray from 'lodash/castArray.js';

import type { AutoformatMarkRule } from '../types';

import { getMatchPoints } from '../utils/getMatchPoints';
import { getMatchRange } from '../utils/getMatchRange';

export interface AutoformatMarkOptions extends AutoformatMarkRule {
  text: string;
}

export const autoformatMark = (
  editor: Editor,
  { ignoreTrim, match: _match, text, trigger, type }: AutoformatMarkOptions
) => {
  if (!type) return false;

  const selection = editor.selection!;
  const matches = castArray(_match);

  for (const match of matches) {
    const { end, start, triggers } = getMatchRange({
      match,
      trigger,
    });

    if (!triggers.includes(text)) continue;

    const matched = getMatchPoints(editor, { end, start });

    if (!matched) continue;

    const { afterStartMatchPoint, beforeEndMatchPoint, beforeStartMatchPoint } =
      matched;

    const matchRange: TRange = {
      anchor: afterStartMatchPoint!,
      focus: beforeEndMatchPoint,
    };

    if (!ignoreTrim) {
      const matchText = editor.api.string(matchRange);

      if (matchText.trim() !== matchText) continue;
    }
    // delete end match
    if (end) {
      editor.tf.delete({
        at: {
          anchor: beforeEndMatchPoint,
          focus: selection.anchor,
        },
      });
    }

    const marks = castArray(type);

    // add mark to the text between the matches
    editor.tf.select(matchRange as TRange);
    marks.forEach((mark) => {
      editor.tf.addMark(mark, true);
    });
    editor.tf.collapse({ edge: 'end' });
    editor.tf.removeMarks(marks, { shouldChange: false });

    editor.tf.delete({
      at: {
        anchor: beforeStartMatchPoint!,
        focus: afterStartMatchPoint!,
      },
    });

    return true;
  }

  return false;
};
