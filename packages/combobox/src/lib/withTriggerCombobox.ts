import type {
  ExtendEditor,
  PluginConfig,
  SlateEditor,
  TElement,
} from '@udecode/plate-common';

import type { TriggerComboboxPluginOptions } from './types';

export const withTriggerCombobox: ExtendEditor<
  PluginConfig<any, TriggerComboboxPluginOptions>
> = ({ editor, getOptions, type }) => {
  const { insertText } = editor;

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

  editor.insertText = (text) => {
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

      return editor.insertNode(inputNode);
    }

    return insertText(text);
  };

  return editor;
};
