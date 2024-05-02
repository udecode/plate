import {
  deleteText,
  ELEMENT_DEFAULT,
  getEditorString,
  getRangeBefore,
  getRangeFromBlockStart,
  isBlock,
  isVoid,
  PlateEditor,
  setElements,
  someNode,
  Value,
} from '@udecode/plate-common/server';
import castArray from 'lodash/castArray.js';
import { Range } from 'slate';

import { AutoformatBlockRule } from '../types';
import { getMatchRange } from '../utils/getMatchRange';

export interface AutoformatBlockOptions<V extends Value = Value>
  extends AutoformatBlockRule<V> {
  text: string;
}

export const autoformatBlock = <V extends Value>(
  editor: PlateEditor<V>,
  {
    text,
    trigger,
    match: _match,
    type = ELEMENT_DEFAULT,
    allowSameTypeAbove = false,
    preFormat,
    format,
    triggerAtBlockStart = true,
  }: AutoformatBlockOptions<V>
) => {
  const matches = castArray(_match as string | string[]);

  for (const match of matches) {
    const { end, triggers } = getMatchRange({
      match: { start: '', end: match },
      trigger,
    });

    if (!triggers.includes(text)) continue;

    let matchRange: Range | undefined;

    if (triggerAtBlockStart) {
      matchRange = getRangeFromBlockStart(editor) as Range;

      // Don't autoformat if there is void nodes.
      const hasVoidNode = someNode(editor, {
        at: matchRange,
        match: (n) => isVoid(editor, n),
      });
      if (hasVoidNode) continue;

      const textFromBlockStart = getEditorString(editor, matchRange);

      if (end !== textFromBlockStart) continue;
    } else {
      matchRange = getRangeBefore(editor, editor.selection as Range, {
        matchString: end,
      });
      if (!matchRange) continue;
    }

    if (!allowSameTypeAbove) {
      // Don't autoformat if already in a block of the same type.
      const isBelowSameBlockType = someNode(editor, { match: { type } });
      if (isBelowSameBlockType) continue;
    }

    // if the trigger is only 1 char there is nothing to delete, so we'd delete unrelated text
    if (match.length > 1) {
      deleteText(editor, {
        at: matchRange,
      });
    }

    if (preFormat) {
      preFormat(editor);
    }

    if (format) {
      format(editor);
    } else {
      setElements(
        editor,
        { type },
        {
          match: (n) => isBlock(editor, n),
        }
      );
    }

    return true;
  }

  return false;
};
