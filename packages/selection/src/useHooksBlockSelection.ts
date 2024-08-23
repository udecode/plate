import React from 'react';

import {
  deselectEditor,
  focusEditor,
  isEditorReadOnly,
} from '@udecode/plate-common';
import {
  type PlateEditor,
  type Value,
  type WithPlatePlugin,
  findNode,
  getEndPoint,
  getNextNode,
  getPreviousNode,
  isHotkey,
  removeNodes,
} from '@udecode/plate-common/server';

import type { BlockSelectionPlugin } from './createBlockSelectionPlugin';

import {
  blockSelectionActions,
  blockSelectionSelectors,
  useBlockSelectionSelectors,
} from './blockSelectionStore';
import { useBlockContextMenuSelectors } from './context-menu';
import { SelectionArea } from './internal';
import { copySelectedBlocks } from './utils/copySelectedBlocks';
import { selectInsertedBlocks } from './utils/index';
import { pasteSelectedBlocks } from './utils/pasteSelectedBlocks';

let called = false;

export const useHooksBlockSelection = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  { options }: WithPlatePlugin<BlockSelectionPlugin>
) => {
  React.useEffect(() => {
    if (called) return;

    called = true;

    const selection = new SelectionArea({
      boundaries: ['#selection-demo  #scroll_container'],
      container: ['#selection-demo #scroll_container'],
      document: window.document,
      selectables: ['#selection-demo #scroll_container .slate-selectable'],
      selectionAreaClass: 'slate-selection-area',
    })
      .on('start', ({ event, store }) => {
        deselectEditor(editor);

        if (!event?.shiftKey) {
          selection.clearSelection();
          blockSelectionActions.resetSelectedIds();
        }
      })
      .on('move', ({ store: { changed } }) => {
        if (changed.added.length === 0 && changed.removed.length === 0) return;

        for (const el of changed.added) {
          el.classList.add('selected');
        }

        for (const el of changed.removed) {
          el.classList.remove('selected');
        }

        blockSelectionActions.setSelectedIds(changed);
      });
  }, []);

  const { onKeyDownSelecting } = options;
  const isSelecting = useBlockSelectionSelectors().isSelecting();
  const selectedIds = useBlockSelectionSelectors().selectedIds();
  const isOpen = useBlockContextMenuSelectors().isOpen(editor.id);

  // TODO: test
  React.useEffect(() => {
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
      input.style.zIndex = '999';
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
            at: [],
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
        // TODO: skip toggle child
        if (isHotkey('up')(e)) {
          const firstId = [...blockSelectionSelectors.selectedIds()][0];
          const node = findNode(editor, {
            at: [],
            match: (n) => n.id === firstId,
          });
          const prev = getPreviousNode(editor, {
            at: node?.[1],
          });

          const prevId = prev?.[0].id;
          blockSelectionActions.addSelectedRow(prevId);
        }
        if (isHotkey('down')(e)) {
          const lastId = [...blockSelectionSelectors.selectedIds()].pop();
          const node = findNode(editor, {
            at: [],
            match: (n) => n.id === lastId,
          });
          const next = getNextNode(editor, {
            at: node?.[1],
          });
          const nextId = next?.[0].id;
          blockSelectionActions.addSelectedRow(nextId);
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

            focusEditor(editor);
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
  }, [editor, isSelecting, onKeyDownSelecting, selectedIds, isOpen]);
};
