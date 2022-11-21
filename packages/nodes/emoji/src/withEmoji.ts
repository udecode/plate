import data from '@emoji-mart/data';
import { comboboxActions } from '@udecode/plate-combobox';
import {
  isCollapsed,
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { IndexSearch } from './utils/IndexSearch';
import { EmojiPluginOptions } from './types';
import { FindTheTriggeringInput } from './utils';

export const withEmoji = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  {
    options: { id, emojiTriggeringController },
  }: WithPlatePlugin<EmojiPluginOptions, V, E>
) => {
  const { apply, insertText } = editor;
  const indexSearch = new IndexSearch(data);

  const findTheTriggeringInput = FindTheTriggeringInput(
    editor,
    emojiTriggeringController
  );

  editor.insertText = (text) => {
    // console.log('==========>>>>>> INSERT TEXT:', text);
    const { selection } = editor;
    if (!selection || !isCollapsed(selection)) return insertText(text);

    findTheTriggeringInput(text);
    // console.log('emojiTriggeringController', emojiTriggeringController);
    // console.log('EC ==>', JSON.stringify(emojiTriggeringController, null, 2));

    return insertText(text);
  };

  editor.apply = (operation) => {
    // console.log('==========>>>>>> APPLY ->');
    // console.log(operation);

    apply(operation);

    switch (operation.type) {
      case 'set_selection':
        emojiTriggeringController.reset();
        comboboxActions.reset();
        break;

      case 'insert_text':
        if (emojiTriggeringController.isTriggering) {
          indexSearch.search(emojiTriggeringController.getText());
          comboboxActions.items(indexSearch.get());
          comboboxActions.open({
            activeId: id!,
            text: '',
            targetRange: editor.selection,
          });
        }
        break;

      case 'remove_text':
        findTheTriggeringInput();
        if (emojiTriggeringController.isTriggering) {
          indexSearch.search(emojiTriggeringController.getText());
          comboboxActions.items(indexSearch.get());
          comboboxActions.open({
            activeId: id!,
            text: '',
            targetRange: editor.selection,
          });
          break;
        }

        emojiTriggeringController.reset();
        comboboxActions.reset();
        break;
    }
  };

  return editor;
};
