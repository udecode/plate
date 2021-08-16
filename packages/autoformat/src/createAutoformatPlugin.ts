import { isCollapsed } from '@udecode/plate-common';
import { getPlatePluginWithOverrides, WithOverride } from '@udecode/plate-core';
import { autoformatBlock } from './transforms/autoformatBlock';
import { autoformatMark } from './transforms/autoformatMark';
import { autoformatText } from './transforms/autoformatText';
import { WithAutoformatOptions } from './types';

/**
 * Enables support for autoformatting actions.
 * Once a match rule is validated, it does not check the following rules.
 */
export const withAutoformat = ({
  rules,
}: WithAutoformatOptions): WithOverride => (editor) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    if (!isCollapsed(editor.selection)) return insertText(text);

    for (const rule of rules) {
      const { mode = 'text', insertTrigger, query } = rule;

      if (query && !query(editor, rule)) continue;

      const autoformatter: Record<typeof mode, Function> = {
        block: autoformatBlock,
        mark: autoformatMark,
        text: autoformatText,
      };

      if (
        autoformatter[mode]?.(editor, {
          ...(rule as any),
          text,
        })
      ) {
        return insertTrigger && insertText(text);
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
