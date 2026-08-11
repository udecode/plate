import React from 'react';
import ReactDOM from 'react-dom';

import { isHotkey } from '@platejs/core';
import {
  type EditableSiblingComponent,
  useEditor,
  useEditorPlugin,
  usePluginStore,
} from '@platejs/core/react';
import { ElementApi } from '@platejs/plite';

import { BlockSelectionPlugin } from './BlockSelectionPlugin';
import { useSelectionArea } from './useBlockSelection';

export const BlockSelectionAfterEditable: EditableSiblingComponent = () => {
  const editor = useEditor();
  const { api, store, update } = useEditorPlugin(BlockSelectionPlugin);
  const [selectionAreaElement, setSelectionAreaElement] =
    React.useState<HTMLDivElement | null>(null);
  const isSelectingSome = usePluginStore(
    BlockSelectionPlugin,
    'isSelectingSome'
  );

  useSelectionArea(selectionAreaElement);

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
    if (!isSelectingSome) store.set({ anchorKey: null });
  }, [isSelectingSome, store]);

  React.useEffect(() => {
    if (isSelectingSome) {
      inputRef.current?.focus({ preventScroll: true });
    } else {
      inputRef.current?.blur();
    }
  }, [isSelectingSome]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isReadonly = editor.read.view.isReadOnly();
      store.get().onKeyDownSelecting?.(editor, event.nativeEvent);

      if (!store.get('isSelectingSome')) return;
      if (isHotkey('shift+up')(event)) {
        event.preventDefault();
        event.stopPropagation();
        api.shiftSelection('up');
        return;
      }
      if (isHotkey('shift+down')(event)) {
        event.preventDefault();
        event.stopPropagation();
        api.shiftSelection('down');
        return;
      }
      if (isHotkey('escape')(event)) {
        api.deselect();
        return;
      }
      if (isHotkey('mod+z')(event)) {
        editor.update.history.undo();
        api.selectInserted();
        return;
      }
      if (isHotkey('mod+a')(event)) {
        api.selectAll();
        return;
      }
      if (isHotkey('mod+shift+z')(event)) {
        editor.update.history.redo();
        api.selectInserted();
        return;
      }
      if (isHotkey('mod+d')(event)) {
        event.preventDefault();
        update.duplicate();
        return;
      }
      if (isHotkey('enter')(event)) {
        const selectedKeys = store.get('selectedKeys');
        let handled = false;

        editor.update((tx, { afterCommit }) => {
          const entry = tx.nodes.find({
            at: [],
            match: (node) =>
              ElementApi.isElement(node) &&
              tx.schema.isBlock(node) &&
              selectedKeys.has(tx.key(node)!),
          });

          if (!entry) return;

          const end = tx.points.end(entry[1]);

          if (!end) return;

          tx.selection.set(end);
          handled = true;
          afterCommit(() => editor.api.dom.focus());
        });

        if (handled) event.preventDefault();
        return;
      }
      if (isHotkey(['backspace', 'delete'])(event) && !isReadonly) {
        event.preventDefault();
        update.removeNodes({
          selectPrevious: isHotkey('backspace')(event),
        });
        return;
      }
      if (isHotkey('up')(event)) {
        event.preventDefault();
        event.stopPropagation();
        api.moveSelection('up');
        return;
      }
      if (isHotkey('down')(event)) {
        event.preventDefault();
        event.stopPropagation();
        api.moveSelection('down');
        return;
      }
      if (
        !isReadonly &&
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();
        update.removeNodes({ insertText: event.key });
      }
    },
    [api, editor, store, update]
  );

  const handleCopy = React.useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      if (!store.get('isSelectingSome')) return;

      if (api.copy(event.clipboardData)) event.preventDefault();
    },
    [api, store]
  );

  const handleCut = React.useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      if (!store.get('isSelectingSome')) return;

      const copied = api.copy(event.clipboardData);

      if (copied) event.preventDefault();
      if (copied && !editor.read.view.isReadOnly()) update.removeNodes();
    },
    [api, editor, store, update]
  );

  const handlePaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      event.preventDefault();

      if (!editor.read.view.isReadOnly()) {
        update.paste(event.clipboardData);
      }
    },
    [editor, update]
  );

  return (
    <>
      {isMounted &&
        typeof window !== 'undefined' &&
        ReactDOM.createPortal(
          <div
            ref={setSelectionAreaElement}
            aria-hidden
            className="plite-selection-area"
            data-slot="block-selection-area"
            style={{
              backgroundColor:
                'color-mix(in srgb, var(--brand, Highlight) 15%, transparent)',
              border:
                '1px solid color-mix(in srgb, var(--brand, Highlight) 25%, transparent)',
              pointerEvents: 'none',
              position: 'fixed',
              willChange: 'top, left, bottom, right, width, height',
              zIndex: 50,
            }}
          />,
          document.body
        )}
      {isMounted &&
        typeof window !== 'undefined' &&
        ReactDOM.createPortal(
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
        )}
    </>
  );
};
