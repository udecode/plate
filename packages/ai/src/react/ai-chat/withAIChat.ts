import type { ExtendEditor } from '@udecode/plate/react';

import type { AIChatPluginConfig } from './AIChatPlugin';

import { AIPlugin } from '../ai/AIPlugin';

export const withAIChat: ExtendEditor<AIChatPluginConfig> = ({
  api,
  editor,
  getOptions,
}) => {
  const tf = editor.getTransforms(AIPlugin);
  const { insertText, normalizeNode } = editor;

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

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (node[AIPlugin.key] && !getOptions().open) {
      tf.ai.removeMarks({ at: path });

      return;
    }

    return normalizeNode(entry);
  };

  editor.insertText = (text) => {
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

      const nodeEntry = editor.api.highestBlock();

      if (!nodeEntry || !editor.api.isEmpty(nodeEntry[0])) return;

      api.aiChat.show();

      return true;
    };

    if (fn()) return;

    return insertText(text);
  };

  return editor;
};
