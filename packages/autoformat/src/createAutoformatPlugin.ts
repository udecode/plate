import {
  getRangeBefore,
  getRangeFromBlockStart,
  getText,
  isCollapsed,
  someNode,
} from '@udecode/plate-common';
import { getPlatePluginWithOverrides, WithOverride } from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { Editor, Range } from 'slate';
import { autoformatBlock } from './transforms/autoformatBlock';
import { autoformatInline } from './transforms/autoformatInline';
import { WithAutoformatOptions } from './types';

/**
 * Enables support for autoformatting actions.
 * Once a markup rule is validated, it does not check the following rules.
 */
export const withAutoformat = ({
  rules,
}: WithAutoformatOptions): WithOverride => (editor) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    if (!isCollapsed(editor.selection)) return insertText(text);

    for (const rule of rules) {
      const {
        trigger = ' ',
        mode = 'block',
        allowSameTypeAbove = false,
        triggerAtBlockStart = true,
        type,
        markup,
        preFormat,
        format,
        between,
        ignoreTrim,
        insertTrigger,
        query,
      } = rule;

      if (query && !query(editor, rule)) continue;

      const triggers: string[] = castArray(trigger);

      // Check trigger
      if (!triggers.includes(text)) continue;

      const insertTriggerText = () => insertTrigger && insertText(text);

      if (type) {
        if (mode === 'block') {
          const markups: string[] = castArray(markup);
          let markupRange: Range | undefined;

          if (triggerAtBlockStart) {
            markupRange = getRangeFromBlockStart(editor) as Range;

            // Don't autoformat if there is void nodes.
            const hasVoidNode = someNode(editor, {
              at: markupRange,
              match: (n) => Editor.isVoid(editor, n),
            });
            if (hasVoidNode) continue;

            const textFromBlockStart = getText(editor, markupRange);

            if (!markups.includes(textFromBlockStart)) continue;
          } else {
            markupRange = getRangeBefore(editor, editor.selection as Range, {
              matchString: markup,
            });
            if (!markupRange) continue;
          }

          if (!allowSameTypeAbove) {
            // Don't autoformat if already in a block of the same type.
            const isBelowSameBlockType = someNode(editor, { match: { type } });
            if (isBelowSameBlockType) continue;
          }

          // Start of the block
          autoformatBlock(editor, type, markupRange, {
            preFormat,
            format,
          });
          return insertTriggerText();
        }

        if (mode === 'inline') {
          if (
            autoformatInline(editor, {
              type,
              between,
              ignoreTrim,
              markup: Array.isArray(markup) ? markup[0] : markup,
            })
          ) {
            return insertTriggerText();
          }
        }
      }
    }

    insertText(text);
  };

  return editor;
};

/**
 * @see {@link withAutoformat}
 */
export const createAutoformatPlugin = getPlatePluginWithOverrides(
  withAutoformat
);
