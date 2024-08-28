import React from 'react';

import {
  findNode,
  getEndPoint,
  getNextNode,
  getPreviousNode,
  isHotkey,
  removeNodes,
} from '@udecode/plate-common';
import {
  type UseHooks,
  focusEditor,
  isEditorReadOnly,
  useEditorPlugin,
} from '@udecode/plate-common/react';

import type { BlockSelectionConfig } from './BlockSelectionPlugin';

import { BlockContextMenuPlugin } from './BlockContextMenuPlugin';
import { useSelectionArea } from './useSelectionArea';
import { selectInsertedBlocks } from './utils';
import { copySelectedBlocks } from './utils/copySelectedBlocks';
import { pasteSelectedBlocks } from './utils/pasteSelectedBlocks';

export const useHooksBlockSelection: UseHooks<BlockSelectionConfig> = ({
  api,
  editor,
  getOption,
  getOptions,
  useOption,
}) => {
  const isSelecting = useOption('isSelecting');
  const selectedIds = useOption('selectedIds');
  const blockContextMenu = useEditorPlugin(BlockContextMenuPlugin);
  const isOpen = blockContextMenu.useOption('isOpen', editor.id);

  useSelectionArea();

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
        getOptions().onKeyDownSelecting?.(e);

        // selecting commands
        if (!getOptions().isSelecting) return;
        if (isHotkey('escape')(e)) {
          api.blockSelection.unselect();
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
        if (!getOption('isSelectingSome')) return;
        if (isHotkey('enter')(e)) {
          // get the first block in the selection
          const entry = findNode(editor, {
            at: [],
            match: (n) => selectedIds!.has(n.id),
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
            match: (n) => selectedIds!.has(n.id),
          });
        }
        // TODO: skip toggle child
        if (isHotkey('up')(e)) {
          const firstId = [...selectedIds!][0];
          const node = findNode(editor, {
            at: [],
            match: (n) => n.id === firstId,
          });
          const prev = getPreviousNode(editor, {
            at: node?.[1],
          });

          const prevId = prev?.[0].id;
          api.blockSelection.addSelectedRow(prevId);
        }
        if (isHotkey('down')(e)) {
          const lastId = [...selectedIds!].pop();
          const node = findNode(editor, {
            at: [],
            match: (n) => n.id === lastId,
          });
          const next = getNextNode(editor, {
            at: node?.[1],
          });
          const nextId = next?.[0].id;
          api.blockSelection.addSelectedRow(nextId);
        }
      });

      // TODO: paste + select blocks if selecting editor
      input.addEventListener('copy', (e) => {
        e.preventDefault();

        if (getOption('isSelectingSome')) {
          copySelectedBlocks(editor);
        }
      });
      input.addEventListener('cut', (e) => {
        e.preventDefault();

        if (getOption('isSelectingSome')) {
          copySelectedBlocks(editor);

          if (!isReadonly) {
            removeNodes(editor, {
              at: [],
              match: (n) => selectedIds!.has(n.id),
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
  }, [editor, isSelecting, selectedIds, isOpen, api, getOptions, getOption]);
};
