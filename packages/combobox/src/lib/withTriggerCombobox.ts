import type {
  OverrideEditor,
  PluginConfig,
  SlateEditor,
  TElement,
} from '@udecode/plate';

import type { TriggerComboboxPluginOptions } from './types';

export const withTriggerCombobox: OverrideEditor<
  PluginConfig<any, TriggerComboboxPluginOptions>
> = ({ editor, getOptions, tf: { insertText }, type }) => {
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
        const {
          createComboboxInput,
          triggerPreviousCharPattern,
          triggerQuery,
        } = getOptions();

        if (
          options?.at ||
          !editor.selection ||
          !matchesTrigger(text) ||
          (triggerQuery && !triggerQuery(editor as SlateEditor))
        ) {
          return insertText(text, options);
        }

        // Make sure an input is created at the beginning of line or after a whitespace
        const previousChar = editor.api.string(
          editor.api.range('before', editor.selection)
        );

        const matchesPreviousCharPattern =
          triggerPreviousCharPattern?.test(previousChar);

        if (matchesPreviousCharPattern) {
          const inputNode: TElement = createComboboxInput
            ? createComboboxInput(text)
            : { children: [{ text: '' }], type };

          return editor.tf.insertNodes(inputNode, options);
        }

        return insertText(text, options);
      },
    },
  };
};
