import {
  getPointBefore,
  getRangeBefore,
  getText,
  removeMark,
} from '@udecode/plate-common';
import { TEditor } from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { Range, Transforms } from 'slate';
import { AutoformatMarkRule } from '../types';
import { getMatchRange } from '../utils/getMatchRange';

export interface AutoformatMarkOptions extends AutoformatMarkRule {
  text: string;
}

export const autoformatMark = (
  editor: TEditor,
  { type, text, trigger, match: _match, ignoreTrim }: AutoformatMarkOptions
) => {
  if (!type) return false;

  const matches = castArray(_match);

  for (const match of matches) {
    const { end, start, triggers } = getMatchRange({
      match,
      trigger,
    });

    if (!triggers.includes(text)) continue;

    const selection = editor.selection as Range;

    let endMatchPointBefore = selection.anchor;
    if (end) {
      endMatchPointBefore = getPointBefore(editor, selection, {
        matchString: end,
      });

      if (!endMatchPointBefore) continue;
    }

    const startMatchPointAfter = getPointBefore(editor, endMatchPointBefore, {
      matchString: start,
      skipInvalid: true,
      afterMatch: true,
    });

    if (!startMatchPointAfter) continue;

    const startMatchPointBefore = getPointBefore(editor, endMatchPointBefore, {
      matchString: start,
      skipInvalid: true,
    });

    // Continue if there is no character before start match
    const rangeBeforeStartMatch = getRangeBefore(editor, startMatchPointBefore);
    if (rangeBeforeStartMatch) {
      const textBeforeStartMatch = getText(editor, rangeBeforeStartMatch);
      if (textBeforeStartMatch) {
        const noWhiteSpaceRegex = new RegExp(`\\S+`);
        if (textBeforeStartMatch.match(noWhiteSpaceRegex)) {
          continue;
        }
      }
    }

    // found

    const matchRange: Range = {
      anchor: startMatchPointAfter,
      focus: endMatchPointBefore,
    };

    if (!ignoreTrim) {
      const matchText = getText(editor, matchRange);
      if (matchText.trim() !== matchText) continue;
    }

    // delete end match
    if (end) {
      Transforms.delete(editor, {
        at: {
          anchor: endMatchPointBefore,
          focus: selection.anchor,
        },
      });
    }

    const marks = castArray(type);

    // add mark to the text between the matches
    Transforms.select(editor, matchRange);
    marks.forEach((mark) => {
      editor.addMark(mark, true);
    });
    Transforms.collapse(editor, { edge: 'end' });
    marks.forEach((mark) => {
      removeMark(editor, { key: mark, shouldChange: false });
    });

    Transforms.delete(editor, {
      at: {
        anchor: startMatchPointBefore,
        focus: startMatchPointAfter,
      },
    });

    return true;
  }

  return false;
};
