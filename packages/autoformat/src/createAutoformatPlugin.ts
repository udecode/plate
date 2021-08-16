import { isCollapsed } from '@udecode/plate-common';
import { getPlatePluginWithOverrides, WithOverride } from '@udecode/plate-core';
import { autoformatBlock } from './transforms/autoformatBlock';
import { autoformatMark } from './transforms/autoformatMark';
import { autoformatText } from './transforms/autoformatText';
import {
  AutoformatBlockRule,
  AutoformatMarkRule,
  AutoformatTextRule,
  WithAutoformatOptions,
} from './types';

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
      const { mode = 'text', markup, insertTrigger, query } = rule;

      if (query && !query(editor, rule)) continue;

      const insertTriggerText = () => insertTrigger && insertText(text);

      if (mode === 'block') {
        // Start of the block
        if (
          autoformatBlock(editor, {
            ...(rule as AutoformatBlockRule),
            text,
          })
        ) {
          return insertTriggerText();
        }
      }

      if (mode === 'mark') {
        if (
          autoformatMark(editor, {
            ...(rule as AutoformatMarkRule),
            text,
          })
        ) {
          // console.log('yuupp', type);
          return insertTriggerText();
          // return
        }
      }

      if (mode === 'text') {
        if (
          autoformatText(editor, {
            ...(rule as AutoformatTextRule),
            text,
          })
        ) {
          return insertTriggerText();
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
