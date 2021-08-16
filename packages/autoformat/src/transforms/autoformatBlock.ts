import {
  ELEMENT_DEFAULT,
  getRangeBefore,
  getRangeFromBlockStart,
  getText,
  setNodes,
  someNode,
} from '@udecode/plate-common';
import { TEditor, TElement } from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { Editor, Range, Transforms } from 'slate';
import { AutoformatBlockRule } from '../types';

export interface AutoformatBlockOptions extends AutoformatBlockRule {
  text: string;
}

export const autoformatBlock = (
  editor: TEditor,
  {
    text,
    trigger,
    markup,
    type = ELEMENT_DEFAULT,
    allowSameTypeAbove = false,
    preFormat,
    format,
    triggerAtBlockStart = true,
  }: AutoformatBlockOptions
) => {
  const triggers: string[] = trigger ? castArray(trigger) : [' '];
  if (!triggers.includes(text)) return false;

  const markups: string[] = castArray(markup);
  let markupRange: Range | undefined;

  if (triggerAtBlockStart) {
    markupRange = getRangeFromBlockStart(editor) as Range;

    // Don't autoformat if there is void nodes.
    const hasVoidNode = someNode(editor, {
      at: markupRange,
      match: (n) => Editor.isVoid(editor, n),
    });
    if (hasVoidNode) return false;

    const textFromBlockStart = getText(editor, markupRange);

    if (!markups.includes(textFromBlockStart)) return false;
  } else {
    markupRange = getRangeBefore(editor, editor.selection as Range, {
      matchString: markup,
    });
    if (!markupRange) return false;
  }

  if (!allowSameTypeAbove) {
    // Don't autoformat if already in a block of the same type.
    const isBelowSameBlockType = someNode(editor, { match: { type } });
    if (isBelowSameBlockType) return false;
  }

  Transforms.delete(editor, { at: markupRange });

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
};
