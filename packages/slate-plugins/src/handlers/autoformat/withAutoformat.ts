import castArray from 'lodash/castArray';
import { Editor, Range } from 'slate';
import {
  getRangeBefore,
  getRangeFromBlockStart,
  someNode,
} from '../../common/queries';
import { getText } from '../../common/queries/getText';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { autoformatBlock } from './transforms/autoformatBlock';
import { autoformatInline } from './transforms/autoformatInline';
import { WithAutoformatOptions } from './types';

/**
 * Enables support for autoformatting actions.
 * Once a markup rule is validated, it does not check the following rules.
 */
export const withAutoformat = ({ rules }: WithAutoformatOptions) => <
  T extends Editor
>(
  editor: T
) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    if (!isCollapsed(editor.selection)) return insertText(text);

    for (const { query, ...rule } of rules) {
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
      } = rule;

      if (query && !query(editor, rule)) continue;

      const triggers: string[] = castArray(trigger);

      // Check trigger
      if (!triggers.includes(text)) continue;

      const valid = () => insertTrigger && insertText(text);

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
        return valid();
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
          return valid();
        }
      }
    }

    insertText(text);
  };

  return editor;
};
