import {
  type PlateEditor,
  type PluginConfig,
  type TElement,
  type WithOverride,
  getEditorString,
  getPointBefore,
  getRange,
} from '@udecode/plate-common';

import type { TriggerComboboxPluginOptions } from './types';

export const withTriggerCombobox: WithOverride<
  PluginConfig<any, TriggerComboboxPluginOptions>
> = ({
  editor,
  plugin: {
    options: {
      createComboboxInput,
      trigger,
      triggerPreviousCharPattern,
      triggerQuery,
    },
    type,
  },
}) => {
  const { insertText } = editor;

  const matchesTrigger = (text: string) => {
    if (trigger instanceof RegExp) {
      return trigger.test(text);
    }
    if (Array.isArray(trigger)) {
      return trigger.includes(text);
    }

    return text === trigger;
  };

  editor.insertText = (text) => {
    if (
      !editor.selection ||
      !matchesTrigger(text) ||
      (triggerQuery && !triggerQuery(editor as PlateEditor))
    ) {
      return insertText(text);
    }

    // Make sure an input is created at the beginning of line or after a whitespace
    const previousChar = getEditorString(
      editor,
      getRange(
        editor,
        editor.selection,
        getPointBefore(editor, editor.selection)
      )
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
