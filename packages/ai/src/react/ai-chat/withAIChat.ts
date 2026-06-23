import {
  type EditorExtensionInput,
  ElementApi,
  KEYS,
  defineEditorExtension,
  getPluginType,
} from 'platejs';
import type { PlatePluginContext } from 'platejs/react';

import type { AIChatPluginConfig } from './AIChatPlugin';

export const createAIChatExtension = ({
  api,
  editor,
  getOptions,
  type,
}: PlatePluginContext<AIChatPluginConfig>): EditorExtensionInput => {
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

  return defineEditorExtension({
    name: 'plate:ai-chat',
    normalizers: {
      node({ entry, next, tx }) {
        const [node, path] = entry;

        if (
          Boolean((node as Record<string, unknown>)[KEYS.ai]) &&
          !getOptions().open
        ) {
          const nodeType = getPluginType(editor, KEYS.ai);

          tx.nodes.unset(nodeType, {
            at: path,
            match: (candidate) =>
              Boolean((candidate as Record<string, unknown>)[nodeType]),
          });

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
      insertText({ next, options, text }) {
        const { triggerPreviousCharPattern, triggerQuery } = getOptions();

        const fn = () => {
          if (
            !editor.selection ||
            !matchesTrigger(text) ||
            (triggerQuery && !triggerQuery(editor))
          ) {
            return;
          }

          // Make sure an input is created at the beginning of line or after a whitespace
          const previousChar = editor.api.string(
            editor.api.range('before', editor.selection)
          );

          const matchesPreviousCharPattern =
            triggerPreviousCharPattern?.test(previousChar);

          if (!matchesPreviousCharPattern) return;

          const nodeEntry = editor.api.block({ highest: true });

          if (!nodeEntry || !editor.api.isEmpty(nodeEntry[0])) return;

          api.aiChat.show();

          return true;
        };

        if (fn()) return true;

        return next({ options, text });
      },
    },
  });
};
