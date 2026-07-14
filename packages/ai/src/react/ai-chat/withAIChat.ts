import type { ExtendPlateEditorExtension } from '@platejs/core/react';

import { ElementApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { removeAIMarks } from '../../lib/transforms/removeAIMarks';
import type { AIChatPluginConfig } from './AIChatPlugin';

export const withAIChat: ExtendPlateEditorExtension<AIChatPluginConfig> = ({
  api,
  editor,
  getOptions,
  type,
}) => {
  const matchesTrigger = (text: string) => {
    const { trigger } = getOptions();

    if (trigger instanceof RegExp) {
      return trigger.test(text);
    }
    if (Array.isArray(trigger)) {
      return trigger.includes(text);
    }

    return text === trigger;
  };

  return {
    normalizers: {
      node({ entry: [node, path], next, tx }) {
        if (Reflect.get(node, KEYS.ai) && !getOptions().open) {
          removeAIMarks(editor, tx, { at: path });

          return;
        }

        if (
          ElementApi.isElement(node) &&
          node.type === type &&
          !getOptions().open
        ) {
          tx.nodes.remove({ at: path });

          return;
        }

        next();
      },
    },
    transforms: {
      insertText({ next, options, text, tx }) {
        const { triggerPreviousCharPattern, triggerQuery } = getOptions();
        const selection = tx.selection();

        const fn = () => {
          if (
            !selection ||
            !matchesTrigger(text) ||
            (triggerQuery && !triggerQuery(editor))
          ) {
            return;
          }

          // Make sure an input is created at the beginning of line or after a whitespace
          const before = tx.points.before(selection);
          const previousChar = before
            ? tx.text.string({
                anchor: before,
                focus: selection.anchor,
              })
            : '';

          const matchesPreviousCharPattern =
            triggerPreviousCharPattern?.test(previousChar);

          if (!matchesPreviousCharPattern) return;

          const nodeEntry = tx.nodes.block({ mode: 'highest' });

          if (!nodeEntry || !tx.nodes.isEmpty(nodeEntry[0])) return;

          api.show();

          return true;
        };

        if (fn()) return true;

        return next({ options, text });
      },
    },
  };
};
