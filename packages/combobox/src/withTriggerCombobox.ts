import {
  getEditorString,
  getPointBefore,
  getRange,
  PlateEditor,
  TElement,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';

import { TriggerComboboxPlugin } from './types';

export const withTriggerCombobox = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  {
    type,
    options: {
      trigger,
      triggerPreviousCharPattern,
      triggerQuery,
      createComboboxInput,
    },
  }: WithPlatePlugin<TriggerComboboxPlugin, V, E>
) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    if (
      !editor.selection ||
      text !== trigger ||
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

    if (matchesPreviousCharPattern && text === trigger) {
      const inputNode: TElement = createComboboxInput
        ? createComboboxInput()
        : { type, children: [{ text: '' }] };

      return editor.insertNode(inputNode);
    }

    return insertText(text);
  };

  return editor;
};
