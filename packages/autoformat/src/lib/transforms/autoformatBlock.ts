import {
  type SlateEditor,
  type TRange,
  BaseParagraphPlugin,
  ElementApi,
} from '@udecode/plate';
import castArray from 'lodash/castArray.js';

import type { AutoformatBlockRule } from '../types';

import { getMatchRange } from '../utils/getMatchRange';

export interface AutoformatBlockOptions extends AutoformatBlockRule {
  text: string;
}

export const autoformatBlock = (
  editor: SlateEditor,
  {
    allowSameTypeAbove = false,
    format,
    match: _match,
    matchByRegex = false,
    preFormat,
    text,
    trigger,
    triggerAtBlockStart = true,
    type = BaseParagraphPlugin.key,
  }: AutoformatBlockOptions
) => {
  const matches = castArray(_match as string[] | string);

  for (const match of matches) {
    const { end, triggers } = getMatchRange({
      match: { end: match, start: '' },
      trigger,
    });

    if (!triggers.includes(text)) continue;

    let matchRange: TRange | undefined;

    if (triggerAtBlockStart) {
      matchRange = editor.api.range('start', editor.selection);

      // Don't autoformat if there is void nodes.
      const hasVoidNode = editor.api.some({
        at: matchRange,
        match: (n) => ElementApi.isElement(n) && editor.api.isVoid(n),
      });

      if (hasVoidNode) continue;

      const textFromBlockStart = editor.api.string(matchRange);

      const isMatched = matchByRegex
        ? !!textFromBlockStart.match(end)
        : end === textFromBlockStart;

      if (!isMatched) continue;
    } else {
      matchRange = editor.api.range('before', editor.selection!, {
        before: {
          matchByRegex,
          matchString: end,
        },
      });

      if (!matchRange) continue;
    }
    if (!allowSameTypeAbove) {
      // Don't autoformat if already in a block of the same type.
      const isBelowSameBlockType = editor.api.some({ match: { type } });

      if (isBelowSameBlockType) continue;
    }
    // if the trigger is only 1 char there is nothing to delete, so we'd delete unrelated text
    if (match.length > 1) {
      editor.tf.delete({
        at: matchRange,
      });
    }
    if (preFormat) {
      preFormat(editor);
    }
    if (format) {
      format(editor);
    } else {
      editor.tf.setNodes(
        { type },
        {
          match: (n) => editor.api.isBlock(n),
        }
      );
    }

    return true;
  }

  return false;
};
