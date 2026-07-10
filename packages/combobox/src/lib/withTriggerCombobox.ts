import type { ExtendPlateEditorExtension, PluginConfig } from '@platejs/core';
import type { Element } from '@platejs/plite';

import type { TriggerComboboxPluginOptions } from './types';

export const withTriggerCombobox: ExtendPlateEditorExtension<
  PluginConfig<string, TriggerComboboxPluginOptions>
> = ({ editor, getOptions, type }) => {
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
      insertText({ next, options, text, tx }) {
        const {
          createComboboxInput,
          triggerPreviousCharPattern,
          triggerQuery,
        } = getOptions();

        if (
          options?.at ||
          !editor.read.selection() ||
          !matchesTrigger(text) ||
          (triggerQuery && !triggerQuery(editor))
        ) {
          return next({ options, text });
        }

        // Make sure an input is created at the beginning of line or after a whitespace
        const selection = editor.read.selection();
        const before = selection && editor.read.points.before(selection);
        const previousChar =
          selection && before
            ? editor.read.text.string({
                anchor: before,
                focus: selection.anchor,
              })
            : '';

        const matchesPreviousCharPattern =
          triggerPreviousCharPattern?.test(previousChar);

        if (matchesPreviousCharPattern) {
          const inputNode: Element = createComboboxInput
            ? createComboboxInput(text)
            : { children: [{ text: '' }], type };

          // Only the creator sees the transient input in collaborative editors.
          const node = editor.runtime.userId
            ? { ...inputNode, userId: editor.runtime.userId }
            : inputNode;

          tx.nodes.insert(node, options);

          return true;
        }

        return next({ options, text });
      },
    },
  };
};
