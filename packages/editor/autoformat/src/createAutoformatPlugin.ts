import { isCollapsed } from '@udecode/plate-common';
import { createPlugin, getPlugin, WithOverride } from '@udecode/plate-core';
import { autoformatBlock } from './transforms/autoformatBlock';
import { autoformatMark } from './transforms/autoformatMark';
import { autoformatText } from './transforms/autoformatText';
import { AutoformatPlugin } from './types';

export const KEY_AUTOFORMAT = 'autoformat';

/**
 * Enables support for autoformatting actions.
 * Once a match rule is validated, it does not check the following rules.
 */
export const withAutoformat = (): WithOverride => (editor) => {
  const { insertText } = editor;

  const { rules } = getPlugin<AutoformatPlugin>(editor, KEY_AUTOFORMAT);

  editor.insertText = (text) => {
    if (!isCollapsed(editor.selection)) return insertText(text);

    for (const rule of rules) {
      const { mode = 'text', insertTrigger, query } = rule;

      if (query && !query(editor, { ...rule, text })) continue;

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
export const createAutoformatPlugin = createPlugin<AutoformatPlugin>({
  key: KEY_AUTOFORMAT,
  withOverrides: withAutoformat(),
});
