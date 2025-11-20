import type { OverrideEditor } from 'platejs/react';

import { ElementApi, KEYS } from 'platejs';

import { AIPlugin } from '../ai/AIPlugin';
import { type AIChatPluginConfig, AIChatPlugin } from './AIChatPlugin';

export const withAIChat: OverrideEditor<AIChatPluginConfig> = ({
  api,
  editor,
  getOptions,
  tf: { insertText, normalizeNode },
  type,
}) => {
  const tf = editor.getTransforms(AIPlugin);

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
    transforms: {
      insertText(text, options) {
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

        if (fn()) return;

        return insertText(text, options);
      },
      normalizeNode(entry) {
        const [node, path] = entry;

        if (node[KEYS.ai] && !getOptions().open) {
          tf.ai.removeMarks({ at: path });

          return;
        }

        if (
          ElementApi.isElement(node) &&
          node.type === type &&
          !getOptions().open
        ) {
          editor.getTransforms(AIChatPlugin).aiChat.removeAnchor({ at: path });

          return;
        }

        return normalizeNode(entry);
      },
    },
  };
};
