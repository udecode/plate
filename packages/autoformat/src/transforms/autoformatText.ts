import { getPointBefore } from '@udecode/plate-common';
import { TEditor } from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { Range, Transforms } from 'slate';
import { AutoformatTextRule } from '../types';
import { getMatchRange } from '../utils/getMatchRange';

export interface AutoformatTextOptions extends AutoformatTextRule {
  text: string;
}

export const autoformatText = (
  editor: TEditor,
  { text, match: _match, trigger, handler }: AutoformatTextOptions
) => {
  const selection = editor.selection as Range;

  const matches = castArray(_match);

  // dup
  for (const match of matches) {
    const { end, triggers } = getMatchRange({
      match: {
        start: '',
        end: match,
      },
      trigger,
    });

    if (!triggers.includes(text)) continue;

    let endMatchPointBefore = selection.anchor;
    if (end) {
      endMatchPointBefore = getPointBefore(editor, selection, {
        matchString: end,
      });

      if (!endMatchPointBefore) continue;

      Transforms.delete(editor, {
        at: {
          anchor: endMatchPointBefore,
          focus: selection.anchor,
        },
      });

      if (handler) {
        editor.insertText(handler);
      }

      return true;
    }
  }

  return false;
};
