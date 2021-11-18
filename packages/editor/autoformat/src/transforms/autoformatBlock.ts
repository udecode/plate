import {
  ELEMENT_DEFAULT,
  getRangeBefore,
  getRangeFromBlockStart,
  getText,
  setNodes,
  someNode,
  TEditor,
  TElement,
} from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { Editor, Range, Transforms } from 'slate';
import { AutoformatBlockRule } from '../types';
import { getMatchRange } from '../utils/getMatchRange';

export interface AutoformatBlockOptions extends AutoformatBlockRule {
  text: string;
}

export const autoformatBlock = (
  editor: TEditor,
  {
    text,
    trigger,
    match: _match,
    type = ELEMENT_DEFAULT,
    allowSameTypeAbove = false,
    preFormat,
    format,
    triggerAtBlockStart = true,
  }: AutoformatBlockOptions
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
        match: (n) => Editor.isVoid(editor, n),
      });
      if (hasVoidNode) continue;

      const textFromBlockStart = getText(editor, matchRange);

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

    Transforms.delete(editor, { at: matchRange });

    preFormat?.(editor);

    if (!format) {
      setNodes<TElement>(
        editor,
        { type },
        {
          match: (n) => Editor.isBlock(editor, n),
        }
      );
    } else {
      format(editor);
    }

    return true;
  }

  return false;
};
