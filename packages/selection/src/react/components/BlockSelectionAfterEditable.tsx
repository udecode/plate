import React from 'react';
import ReactDOM from 'react-dom';

import { isHotkey } from '@platejs/core';
import { ElementApi, PathApi } from '@platejs/plite';
import {
  type EditableSiblingComponent,
  useEditorPlugin,
  usePluginOption,
} from '@platejs/core/react';
import { KEYS } from '@platejs/utils';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { useSelectionArea } from '../hooks';
import {
  copySelectedBlocks,
  pasteSelectedBlocks,
  selectInsertedBlocks,
} from '../utils';

export const BlockSelectionAfterEditable: EditableSiblingComponent = () => {
  const { api, editor, getOption, getOptions, setOption, update } =
    useEditorPlugin(BlockSelectionPlugin);

  const isSelectingSome = usePluginOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );

  const removeSelectedBlocks = React.useCallback(
    (options: { insertText?: string; selectPrevious?: boolean } = {}) => {
      const selectedIds = getOption('selectedIds');

      editor.update((tx, { afterCommit }) => {
        const entries = tx.nodes.toArray({
          at: [],
          match: (node) =>
            ElementApi.isElement(node) &&
            !!node.id &&
            !!selectedIds?.has(node.id as string),
        });

        if (entries.length === 0) return;

        const firstPath = entries[0]![1];
        for (const [, path] of [...entries].reverse()) {
          tx.nodes.remove({
            at: path,
          });
        }

        if (options.insertText !== undefined) {
          tx.nodes.insert(
            {
              children: [{ text: options.insertText }],
              type: editor.getType(KEYS.p),
            },
            { at: firstPath, select: true }
          );
        }

        const shouldFocus = tx.children().length === 0;
        const deletedIds = entries.map(([node]) => node.id as string);
        let previousId: string | null = null;

        if (!shouldFocus && options.selectPrevious) {
          const prevPath = PathApi.previous(firstPath);

          if (prevPath) {
            const prevEntry = tx.nodes.block({ at: prevPath });

            if (prevEntry) {
              previousId = prevEntry[0].id as string;
            }
          }
        }

        afterCommit(() => {
          for (const id of deletedIds) {
            api.delete(id);
          }

          if (options.insertText !== undefined || shouldFocus) {
            editor.api.dom.focus();
          } else if (previousId) {
            setOption('selectedIds', new Set([previousId]));
          }
        });
      });
    },
    [editor, getOption, api, setOption]
  );

  useSelectionArea();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    setOption('shadowInputRef', inputRef);

    return () => {
      setIsMounted(false);
    };
  }, [setOption]);

  React.useEffect(() => {
    if (!isSelectingSome) {
      setOption('anchorId', null);
    }
  }, [isSelectingSome, setOption]);

  React.useEffect(() => {
    if (isSelectingSome && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    } else if (inputRef.current) {
      inputRef.current.blur();
    }
  }, [isSelectingSome]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isReadonly = editor.read.view.isReadOnly();
      getOptions().onKeyDownSelecting?.(editor, e.nativeEvent);

      if (!getOption('isSelectingSome')) return;
      if (isHotkey('shift+up')(e)) {
        e.preventDefault();
        e.stopPropagation();
        api.shiftSelection('up');

        return;
      }
      if (isHotkey('shift+down')(e)) {
        e.preventDefault();
        e.stopPropagation();
        api.shiftSelection('down');

        return;
      }
      // ESC => clear block selection
      if (isHotkey('escape')(e)) {
        api.deselect();

        return;
      }
      // Undo/redo
      if (isHotkey('mod+z')(e)) {
        editor.update.history.undo();
        selectInsertedBlocks(editor);

        return;
      }
      if (isHotkey('mod+a')(e)) {
        api.selectAll();

        return;
      }

      if (isHotkey('mod+shift+z')(e)) {
        editor.update.history.redo();
        selectInsertedBlocks(editor);

        return;
      }
      // Mod+D => duplicate selected blocks
      if (isHotkey('mod+d')(e)) {
        e.preventDefault();
        update.duplicate();
        return;
      }
      // Only continue if we have "some" selection
      if (!getOption('isSelectingSome')) return;
      // Enter => focus first selected block
      if (isHotkey('enter')(e)) {
        const selectedIds = getOption('selectedIds');
        let handled = false;

        editor.update((tx, { afterCommit }) => {
          const entry = tx.nodes.find({
            at: [],
            match: (node) =>
              ElementApi.isElement(node) &&
              tx.schema.isBlock(node) &&
              !!node.id &&
              !!selectedIds?.has(node.id as string),
          });

          if (!entry) return;

          const [, path] = entry;
          const end = tx.points.end(path);

          if (!end) return;

          tx.selection.set(end);
          handled = true;
          afterCommit(() => editor.api.dom.focus());
        });

        if (handled) e.preventDefault();

        return;
      }
      // Backspace/Delete => remove selected blocks
      if (isHotkey(['backspace', 'delete'])(e) && !isReadonly) {
        e.preventDefault();
        removeSelectedBlocks({
          selectPrevious: isHotkey('backspace')(e),
        });
        return;
      }
      // If SHIFT not pressed => arrow up/down sets new anchor
      if (isHotkey('up')(e)) {
        e.preventDefault();
        e.stopPropagation();
        api.moveSelection('up');

        return;
      }
      if (isHotkey('down')(e)) {
        e.preventDefault();
        e.stopPropagation();
        api.moveSelection('down');

        return;
      }

      // Handle character input - remove selected blocks and insert character
      if (
        !isReadonly &&
        e.key.length === 1 && // Only handle single character keys
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        removeSelectedBlocks({ insertText: e.key });
        return;
      }
    },
    [editor, getOption, getOptions, api, removeSelectedBlocks]
  );

  /** Handle copy / cut / paste in block selection */
  const handleCopy = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (getOption('isSelectingSome')) {
        const copied = copySelectedBlocks(editor, e.clipboardData);

        if (copied) {
          e.preventDefault();
        }
      }
    },
    [editor, getOption]
  );

  const handleCut = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (getOption('isSelectingSome')) {
        const copied = copySelectedBlocks(editor, e.clipboardData);

        if (copied) {
          e.preventDefault();
        }

        if (copied && !editor.read.view.isReadOnly()) {
          removeSelectedBlocks();
        }
      }
    },
    [editor, getOption, removeSelectedBlocks]
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (!editor.read.view.isReadOnly()) {
        pasteSelectedBlocks(editor, e.nativeEvent);
      }
    },
    [editor]
  );

  if (!isMounted || typeof window === 'undefined') {
    return null;
  }

  return ReactDOM.createPortal(
    <input
      ref={inputRef}
      className="plite-shadow-input"
      style={{
        left: '-300px',
        opacity: 0,
        position: 'fixed',
        top: '-300px',
        zIndex: 999,
      }}
      onCopy={handleCopy}
      onCut={handleCut}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
    />,
    document.body
  );
};
