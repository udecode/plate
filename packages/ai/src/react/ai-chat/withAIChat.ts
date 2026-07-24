import { type BaseEditor, getEditorPlugin } from '@platejs/core';
import type { PlateEditorExtension } from '@platejs/core/react';

import { defineEffect, editorCommands, ElementApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { removeAIMarks } from '../../lib/transforms/removeAIMarks';
import type { AIChatPluginConfig, AIChatPluginOptions } from './AIChatPlugin';

const aiChatShowEffect = defineEffect({
  key: 'ai.chat.show',
});

type AIChatExtensionContext = {
  editor: BaseEditor;
  getOptions: () => AIChatPluginOptions;
  type: string;
};

export const withAIChat = ({
  editor,
  getOptions,
  type,
}: AIChatExtensionContext): PlateEditorExtension => {
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
    commands: ({ handle }) => [
      handle(editorCommands.insertText, ({ input, state }) => {
        const { triggerPreviousCharPattern, triggerQuery } = getOptions();
        const selection = state.selection();

        if (
          !selection ||
          !matchesTrigger(input.text) ||
          (triggerQuery && !triggerQuery(editor))
        ) {
          return false;
        }

        const before = state.points.before(selection);
        const previousChar = before
          ? state.text.string({
              anchor: before,
              focus: selection.anchor,
            })
          : '';

        if (!triggerPreviousCharPattern?.test(previousChar)) return false;

        const nodeEntry = state.nodes.block({ mode: 'highest' });

        if (!nodeEntry || !state.nodes.isEmpty(nodeEntry[0])) return false;

        return state.transaction((tx) => {
          tx.effects.emit(aiChatShowEffect, null);
        });
      }),
    ],
    corrections: [
      {
        event: 'content',
        correct({ entry: [node, path], tx }) {
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
        },
      },
    ],
    effects: [aiChatShowEffect],
    onCommit({ commit }) {
      if (commit.effects.some((effect) => effect.type === aiChatShowEffect)) {
        getEditorPlugin<AIChatPluginConfig>(editor, {
          key: KEYS.aiChat,
        }).api.show();
      }
    },
  };
};
