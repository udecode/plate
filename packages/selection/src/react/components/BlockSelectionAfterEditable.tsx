import React from 'react';
import ReactDOM from 'react-dom';

import { isHotkey } from '@platejs/core';
import { ElementApi } from '@platejs/plite';
import {
  type EditableSiblingComponent,
  useEditorPlugin,
  usePluginStore,
} from '@platejs/core/react';
import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { useSelectionArea } from '../hooks';

export const BlockSelectionAfterEditable: EditableSiblingComponent = () => {
  const { api, editor, store, update } = useEditorPlugin(BlockSelectionPlugin);

  const isSelectingSome = usePluginStore(
    BlockSelectionPlugin,
    'isSelectingSome'
  );

  useSelectionArea();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    store.set({ shadowInputRef: inputRef });

    return () => {
      setIsMounted(false);
    };
  }, [store]);

  React.useEffect(() => {
    if (!isSelectingSome) {
      store.set({ anchorId: null });
    }
  }, [isSelectingSome, store]);

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
      store.get().onKeyDownSelecting?.(editor, e.nativeEvent);

      if (!store.get('isSelectingSome')) return;
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
        api.selectInserted();

        return;
      }
      if (isHotkey('mod+a')(e)) {
        api.selectAll();

        return;
      }

      if (isHotkey('mod+shift+z')(e)) {
        editor.update.history.redo();
        api.selectInserted();

        return;
      }
      // Mod+D => duplicate selected blocks
      if (isHotkey('mod+d')(e)) {
        e.preventDefault();
        update.duplicate();
        return;
      }
      // Only continue if we have "some" selection
      if (!store.get('isSelectingSome')) return;
      // Enter => focus first selected block
      if (isHotkey('enter')(e)) {
        const selectedIds = store.get('selectedIds');
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
        update.removeNodes({
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
        update.removeNodes({ insertText: e.key });
        return;
      }
    },
    [api, editor, store, update]
  );

  /** Handle copy / cut / paste in block selection */
  const handleCopy = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (store.get('isSelectingSome')) {
        const copied = api.copy(e.clipboardData);

        if (copied) {
          e.preventDefault();
        }
      }
    },
    [api, store]
  );

  const handleCut = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (store.get('isSelectingSome')) {
        const copied = api.copy(e.clipboardData);

        if (copied) {
          e.preventDefault();
        }

        if (copied && !editor.read.view.isReadOnly()) {
          update.removeNodes();
        }
      }
    },
    [api, editor, store, update]
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (!editor.read.view.isReadOnly()) {
        update.paste(e.clipboardData);
      }
    },
    [editor, update]
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
