import { getText, removeMark } from '@udecode/plate-common';
import { TEditor } from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { Point, Range, Transforms } from 'slate';
import { AutoformatMarkRule } from '../types';
import { getMatchPoints } from '../utils/getMatchPoints';
import { getMatchRange } from '../utils/getMatchRange';

export interface AutoformatMarkOptions extends AutoformatMarkRule {
  text: string;
}

export const autoformatMark = (
  editor: TEditor,
  { type, text, trigger, match: _match, ignoreTrim }: AutoformatMarkOptions
) => {
  if (!type) return false;

  const selection = editor.selection as Range;
  const matches = castArray(_match);

  for (const match of matches) {
    const { start, end, triggers } = getMatchRange({
      match,
      trigger,
    });

    if (!triggers.includes(text)) continue;

    const matched = getMatchPoints(editor, { start, end });
    if (!matched) continue;

    const {
      afterStartMatchPoint,
      beforeEndMatchPoint,
      beforeStartMatchPoint,
    } = matched;

    const matchRange = {
      anchor: afterStartMatchPoint,
      focus: beforeEndMatchPoint,
    } as Range;

    if (!ignoreTrim) {
      const matchText = getText(editor, matchRange);
      if (matchText.trim() !== matchText) continue;
    }

    // delete end match
    if (end) {
      Transforms.delete(editor, {
        at: {
          anchor: beforeEndMatchPoint,
          focus: selection.anchor,
        },
      });
    }

    const marks = castArray(type);

    // add mark to the text between the matches
    Transforms.select(editor, matchRange as Range);
    marks.forEach((mark) => {
      editor.addMark(mark, true);
    });
    Transforms.collapse(editor, { edge: 'end' });
    removeMark(editor, { key: marks, shouldChange: false });

    Transforms.delete(editor, {
      at: {
        anchor: beforeStartMatchPoint as Point,
        focus: afterStartMatchPoint as Point,
      },
    });

    return true;
  }

  return false;
};
