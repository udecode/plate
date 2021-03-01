import { useCallback } from 'react';
import { getBlockAbove, setDefaults } from '@udecode/slate-plugins';
import { Editor, Transforms } from 'slate';
import { IComboboxItem } from '../../combobox/components/Combobox.types';
import { useComboboxIsOpen } from '../../combobox/selectors/useComboboxIsOpen';
import { useComboboxStore } from '../../combobox/useComboboxStore';
import { DEFAULTS_TAG } from '../defaults';
import { UseTagOptions } from '../types';

/**
 * Select the target range, add a tag node and set the target range to null
 */
export const useTagOnSelectItem = (options: UseTagOptions = {}) => {
  const { tag } = setDefaults(options, DEFAULTS_TAG);
  const isOpen = useComboboxIsOpen();
  const targetRange = useComboboxStore((state) => state.targetRange);
  const closeMenu = useComboboxStore((state) => state.closeMenu);

  return useCallback(
    (editor: Editor, item: IComboboxItem) => {
      if (isOpen && targetRange) {
        const pathAbove = getBlockAbove(editor)?.[1];
        const isBlockEnd =
          editor.selection &&
          pathAbove &&
          Editor.isEnd(editor, editor.selection.anchor, pathAbove);

        // insert a space to fix the bug
        if (isBlockEnd) {
          Transforms.insertText(editor, ' ');
        }

        // select the tag text and insert the tag element
        Transforms.select(editor, targetRange);
        Transforms.insertNodes(editor, {
          type: tag.type,
          children: [{ text: '' }],
          value: item.text,
        });
        // move the selection after the tag element
        Transforms.move(editor);

        // delete the inserted space
        if (isBlockEnd) {
          Transforms.delete(editor);
        }

        return closeMenu();
      }
    },
    [closeMenu, isOpen, tag.type, targetRange]
  );
};
