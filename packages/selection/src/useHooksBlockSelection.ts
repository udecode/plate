import { useEffect } from 'react';
import {
  PlateEditor,
  Value,
  WithPlatePlugin,
  findNode,
  focusEditor,
  getEndPoint,
  isEditorReadOnly,
  removeNodes,
} from '@udecode/plate-common';
import isHotkey from 'is-hotkey';

import {
  blockSelectionActions,
  blockSelectionSelectors,
  useBlockSelectionSelectors,
} from './blockSelectionStore';
import { BlockSelectionPlugin } from './createBlockSelectionPlugin';
import { copySelectedBlocks } from './utils/copySelectedBlocks';
import { selectInsertedBlocks } from './utils/index';
import { pasteSelectedBlocks } from './utils/pasteSelectedBlocks';

export const useHooksBlockSelection = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  { options }: WithPlatePlugin<BlockSelectionPlugin>
) => {
  const { onKeyDownSelecting } = options;
  const isSelecting = useBlockSelectionSelectors().isSelecting();
  const selectedIds = useBlockSelectionSelectors().selectedIds();

  // TODO: test
  useEffect(() => {
    const el = document.querySelector('#slate-shadow-input');
    if (el) {
      el.remove();
    }

    const isReadonly = isEditorReadOnly(editor);

    if (isSelecting) {
      const input = document.createElement('input');
      input.setAttribute('id', 'slate-shadow-input');
      // no scrolling on focus
      input.style.position = 'fixed';
      input.style.zIndex = '10000';
      // hide
      input.style.top = '-300px';
      input.style.left = '-300px';
      input.style.opacity = '0';

      input.addEventListener('keydown', (e) => {
        onKeyDownSelecting?.(e);

        // selecting commands
        if (!blockSelectionSelectors.isSelecting()) return;

        if (isHotkey('escape')(e)) {
          blockSelectionActions.unselect();
        }

        if (isHotkey('mod+z')(e)) {
          editor.undo();
          selectInsertedBlocks(editor);
        }
        if (isHotkey('mod+shift+z')(e)) {
          editor.redo();
          selectInsertedBlocks(editor);
        }

        // selecting some commands
        if (!blockSelectionSelectors.isSelectingSome()) return;

        if (isHotkey('enter')(e)) {
          // get the first block in the selection
          const entry = findNode(editor, {
            match: (n) => blockSelectionSelectors.selectedIds().has(n.id),
          });

          if (entry) {
            const [, path] = entry;

            // focus the end of that block
            focusEditor(editor, getEndPoint(editor, path));
            e.preventDefault();
          }
        }

        if (isHotkey(['backspace', 'delete'])(e) && !isReadonly) {
          removeNodes(editor, {
            at: [],
            match: (n) => blockSelectionSelectors.selectedIds().has(n.id),
          });
        }
      });

      // TODO: paste + select blocks if selecting editor
      input.addEventListener('copy', (e) => {
        e.preventDefault();

        if (blockSelectionSelectors.isSelectingSome()) {
          copySelectedBlocks(editor);
        }
      });
      input.addEventListener('cut', (e) => {
        e.preventDefault();

        if (blockSelectionSelectors.isSelectingSome()) {
          copySelectedBlocks(editor);

          if (!isReadonly) {
            removeNodes(editor, {
              at: [],
              match: (n) => blockSelectionSelectors.selectedIds().has(n.id),
            });
          }
        }
      });
      input.addEventListener('paste', (e) => {
        e.preventDefault();

        if (!isReadonly) {
          pasteSelectedBlocks(editor, e);
        }
      });
      document.body.append(input);
      input.focus();
    }
  }, [editor, isSelecting, onKeyDownSelecting, selectedIds]);
};
