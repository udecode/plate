import {
  deleteText,
  insertText,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import castArray from 'lodash/castArray';
import { Point, Range } from 'slate';
import { AutoformatTextRule } from '../types';
import { getMatchPoints } from '../utils/getMatchPoints';
import { getMatchRange } from '../utils/getMatchRange';

export interface AutoformatTextOptions<V extends Value = Value>
  extends AutoformatTextRule<V> {
  text: string;
}

export const autoformatText = <V extends Value>(
  editor: PlateEditor<V>,
  { text, match: _match, trigger, format }: AutoformatTextOptions<V>
) => {
  const selection = editor.selection as Range;
  const matches = castArray(_match);

  // dup
  for (const match of matches) {
    const { start, end, triggers } = getMatchRange({
      match: Array.isArray(format)
        ? match
        : {
            start: '',
            end: match,
          },
      trigger,
    });

    if (!triggers.includes(text)) continue;

    const matched = getMatchPoints(editor, { start, end });
    if (!matched) continue;

    const { afterStartMatchPoint, beforeEndMatchPoint, beforeStartMatchPoint } =
      matched;

    if (end) {
      deleteText(editor, {
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
      editor.insertText(formatEnd);

      if (beforeStartMatchPoint) {
        const formatStart = Array.isArray(format) ? format[0] : format;

        deleteText(editor, {
          at: {
            anchor: beforeStartMatchPoint as Point,
            focus: afterStartMatchPoint as Point,
          },
        });

        insertText(editor, formatStart, {
          at: beforeStartMatchPoint,
        });
      }
    }

    return true;
  }

  return false;
};
