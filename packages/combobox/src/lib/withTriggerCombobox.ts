import type {
  BasePluginContext,
  PlateEditorExtensionInput,
  PluginConfig,
} from '@platejs/core';
import { editorCommands, type Element } from '@platejs/plite';

import type { TriggerComboboxPluginOptions } from './types';

export const withTriggerCombobox = <
  C extends PluginConfig<string, TriggerComboboxPluginOptions>,
>({
  editor,
  getOptions,
  type,
}: BasePluginContext<C>): PlateEditorExtensionInput => {
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
        const {
          createComboboxInput,
          triggerPreviousCharPattern,
          triggerQuery,
        } = getOptions();

        if (
          input.options?.at ||
          !state.selection() ||
          !matchesTrigger(input.text) ||
          (triggerQuery && !triggerQuery(editor))
        ) {
          return false;
        }

        // Make sure an input is created at the beginning of line or after a whitespace
        const selection = state.selection();
        const before = selection && state.points.before(selection);
        const previousChar =
          selection && before
            ? state.text.string({
                anchor: before,
                focus: selection.anchor,
              })
            : '';

        const matchesPreviousCharPattern =
          triggerPreviousCharPattern?.test(previousChar);

        if (matchesPreviousCharPattern) {
          const inputNode: Element = createComboboxInput
            ? createComboboxInput(input.text)
            : { children: [{ text: '' }], type };

          // Only the creator sees the transient input in collaborative editors.
          const node = editor.runtime.userId
            ? { ...inputNode, userId: editor.runtime.userId }
            : inputNode;

          return state.transaction((tx) => {
            tx.nodes.insert(node, input.options);
          });
        }

        return false;
      }),
    ],
  };
};
