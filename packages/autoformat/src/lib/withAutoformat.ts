import type { OverrideEditor } from '@udecode/plate';

import type { AutoformatConfig } from './BaseAutoformatPlugin';

import { autoformatBlock } from './transforms/autoformatBlock';
import { autoformatMark } from './transforms/autoformatMark';
import { autoformatText } from './transforms/autoformatText';

/**
 * Enables support for autoformatting actions. Once a match rule is validated,
 * it does not check the following rules.
 */
export const withAutoformat: OverrideEditor<AutoformatConfig> = ({
  editor,
  getOptions,
  tf: { insertText },
}) => {
  return {
    transforms: {
      insertText(text, options) {
        if (!editor.api.isCollapsed()) return insertText(text, options);

        for (const rule of getOptions().rules!) {
          const { insertTrigger, mode = 'text', query } = rule;

          if (query && !query(editor as any, { ...rule, text })) continue;

          const autoformatter: Record<typeof mode, any> = {
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

        insertText(text, options);
      },
    },
  };
};
