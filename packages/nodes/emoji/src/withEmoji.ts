import { comboboxActions } from '@udecode/plate-combobox';
import {
  isCollapsed,
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { getEmojiOnSelectItem, getFindTriggeringInput } from './handlers';
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

  const { apply, insertText, deleteBackward, deleteForward } = editor;

  editor.insertText = (char) => {
    const { selection } = editor;

    if (!isCollapsed(selection)) {
      return insertText(char);
    }

    findTheTriggeringInput({ char });

    return insertText(char);
  };

  editor.deleteBackward = (unit) => {
    findTheTriggeringInput({ action: 'delete' });
    return deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    findTheTriggeringInput();
    return deleteForward(unit);
  };

  editor.apply = (operation) => {
    apply(operation);

    if (!emojiTriggeringController?.hasTriggeringMark) {
      return;
    }

    const searchText = emojiTriggeringController.getText();

    switch (operation.type) {
      case 'set_selection':
        emojiTriggeringController.reset();
        comboboxActions.reset();
        break;

      case 'insert_text':
        if (
          emojiTriggeringController.hasEnclosingTriggeringMark() &&
          emojiInlineIndexSearch.search(searchText).hasFound()
        ) {
          const item = emojiInlineIndexSearch.getEmoji();
          item && getEmojiOnSelectItem()(editor, item);
          break;
        }

        if (
          emojiTriggeringController.isTriggering &&
          emojiInlineIndexSearch.search(searchText).hasFound()
        ) {
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

        emojiTriggeringController.reset();
        comboboxActions.reset();
        break;

      case 'remove_text':
        if (
          emojiTriggeringController.isTriggering &&
          emojiInlineIndexSearch.search(searchText).hasFound()
        ) {
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

        emojiTriggeringController.reset();
        comboboxActions.reset();
        break;
    }
  };

  return editor;
};
