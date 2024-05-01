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

export const withInsertTextTriggerCombobox = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  {
    type,
    options: {
      combobox: {
        trigger,
        triggerPreviousCharPattern,
        query,
        createInputNode,
      } = {},
    },
  }: WithPlatePlugin<TriggerComboboxPlugin, V, E>
) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    if (
      !editor.selection ||
      text !== trigger ||
      (query && !query(editor as PlateEditor))
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
      const inputNode: TElement = createInputNode
        ? createInputNode()
        : { type, children: [{ text: '' }] };

      return editor.insertNode(inputNode);
    }

    return insertText(text);
  };

  return editor;
};
