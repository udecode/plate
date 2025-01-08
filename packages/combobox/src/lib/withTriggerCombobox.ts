import type {
  ExtendEditorTransforms,
  PluginConfig,
  SlateEditor,
  TElement,
} from '@udecode/plate';

import type { TriggerComboboxPluginOptions } from './types';

export const withTriggerCombobox: ExtendEditorTransforms<
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
    insertText(text) {
      const { createComboboxInput, triggerPreviousCharPattern, triggerQuery } =
        getOptions();

      if (
        !editor.selection ||
        !matchesTrigger(text) ||
        (triggerQuery && !triggerQuery(editor as SlateEditor))
      ) {
        return insertText(text);
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

        return editor.tf.insertNodes(inputNode);
      }

      return insertText(text);
    },
  };
};
