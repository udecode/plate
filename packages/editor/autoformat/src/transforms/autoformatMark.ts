import {
  collapseSelection,
  deleteText,
  getEditorString,
  removeMark,
  select,
  TEditor,
  Value,
} from '@udecode/plate-common';
import castArray from 'lodash/castArray';
import { Point, Range } from 'slate';
import { AutoformatMarkRule } from '../types';
import { getMatchPoints } from '../utils/getMatchPoints';
import { getMatchRange } from '../utils/getMatchRange';

export interface AutoformatMarkOptions extends AutoformatMarkRule {
  text: string;
}

export const autoformatMark = <V extends Value>(
  editor: TEditor<V>,
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
      const matchText = getEditorString(editor, matchRange);
      if (matchText.trim() !== matchText) continue;
    }

    // delete end match
    if (end) {
      deleteText(editor, {
        at: {
          anchor: beforeEndMatchPoint,
          focus: selection.anchor,
        },
      });
    }

    const marks = castArray(type);

    // add mark to the text between the matches
    select(editor, matchRange as Range);
    marks.forEach((mark) => {
      editor.addMark(mark, true);
    });
    collapseSelection(editor, { edge: 'end' });
    removeMark(editor, { key: marks as any, shouldChange: false });

    deleteText(editor, {
      at: {
        anchor: beforeStartMatchPoint as Point,
        focus: afterStartMatchPoint as Point,
      },
    });

    return true;
  }

  return false;
};
