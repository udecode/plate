import { comboboxActions } from '@udecode/plate-combobox';
import {
  isCollapsed,
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { getFindTriggeringInput } from './handlers';
import { EmojiPlugin } from './types';
import { EmojiInlineIndexSearch } from './utils';

export const withEmoji = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  {
    options: { id, emojiTriggeringController },
  }: WithPlatePlugin<EmojiPlugin, V, E>
) => {
  const emojiInlineIndexSearch = EmojiInlineIndexSearch.getInstance();

  const findTheTriggeringInput = getFindTriggeringInput(
    editor,
    emojiTriggeringController!
  );

  const { apply, insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;
    if (!selection || !isCollapsed(selection)) return insertText(text);

    findTheTriggeringInput(text);

    return insertText(text);
  };

  editor.apply = (operation) => {
    apply(operation);

    if (!emojiTriggeringController?.hasTriggeringMark) {
      return;
    }

    switch (operation.type) {
      case 'set_selection':
        emojiTriggeringController!.reset();
        comboboxActions.reset();
        break;

      case 'insert_text':
        if (emojiTriggeringController!.isTriggering) {
          const searchText = emojiTriggeringController!.getText();
          comboboxActions.items(
            emojiInlineIndexSearch.search(searchText).get()
          );
          comboboxActions.open({
            activeId: id!,
            text: '',
            targetRange: editor.selection,
          });
        }
        break;

      case 'remove_text':
        findTheTriggeringInput();
        if (emojiTriggeringController!.isTriggering) {
          const searchText = emojiTriggeringController!.getText();
          comboboxActions.items(
            emojiInlineIndexSearch.search(searchText).get()
          );
          comboboxActions.open({
            activeId: id!,
            text: '',
            targetRange: editor.selection,
          });
          break;
        }

        emojiTriggeringController!.reset();
        comboboxActions.reset();
        break;
    }
  };

  return editor;
};
