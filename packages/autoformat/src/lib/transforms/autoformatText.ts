import type { SlateEditor } from '@udecode/plate';

import castArray from 'lodash/castArray.js';

import type { AutoformatTextRule } from '../types';

import { getMatchPoints } from '../utils/getMatchPoints';
import { getMatchRange } from '../utils/getMatchRange';

export interface AutoformatTextOptions extends AutoformatTextRule {
  text: string;
}

export const autoformatText = (
  editor: SlateEditor,
  { format, match: _match, text, trigger }: AutoformatTextOptions
) => {
  const selection = editor.selection!;
  const matches = castArray(_match);

  // dup
  for (const match of matches) {
    const { end, start, triggers } = getMatchRange({
      match: Array.isArray(format)
        ? match
        : {
            end: match,
            start: '',
          },
      trigger,
    });

    if (!triggers.includes(text)) continue;

    const matched = getMatchPoints(editor, { end, start });

    if (!matched) continue;

    const { afterStartMatchPoint, beforeEndMatchPoint, beforeStartMatchPoint } =
      matched;

    if (end) {
      editor.tf.delete({
        at: {
          anchor: beforeEndMatchPoint,
          focus: selection.anchor,
        },
      });
    }
    if (typeof format === 'function') {
      format(editor, matched);
    } else {
      const formatEnd = Array.isArray(format) ? format[1] : format;
      editor.tf.insertText(formatEnd);

      if (beforeStartMatchPoint) {
        const formatStart = Array.isArray(format) ? format[0] : format;

        editor.tf.delete({
          at: {
            anchor: beforeStartMatchPoint!,
            focus: afterStartMatchPoint!,
          },
        });

        editor.tf.insertText(formatStart, {
          at: beforeStartMatchPoint,
        });
      }
    }

    return true;
  }

  return false;
};
