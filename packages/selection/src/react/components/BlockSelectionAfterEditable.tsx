import React from 'react';
import ReactDOM from 'react-dom';

import {
  findNode,
  getEndPoint,
  getNextNode,
  getPreviousNode,
  isHotkey,
  removeNodes,
} from '@udecode/plate-common';
import {
  type EditableSiblingComponent,
  focusEditor,
  isEditorReadOnly,
  useEditorPlugin,
  useEditorRef,
} from '@udecode/plate-common/react';

import type { BlockSelectionConfig } from '../BlockSelectionPlugin';

import { useSelectionArea } from '../hooks';
import {
  copySelectedBlocks,
  pasteSelectedBlocks,
  selectInsertedBlocks,
} from '../utils';

export const BlockSelectionAfterEditable: EditableSiblingComponent = () => {
  const editor = useEditorRef();
  const { api, getOption, getOptions, setOption, useOption } =
    useEditorPlugin<BlockSelectionConfig>({ key: 'blockSelection' });
  const isSelecting = useOption('isSelecting');
  const selectedIds = useOption('selectedIds');

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
    if (isSelecting && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    } else if (inputRef.current) {
      inputRef.current.blur();
    }
  }, [isSelecting]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isReadonly = isEditorReadOnly(editor);
      getOptions().onKeyDownSelecting?.(e.nativeEvent);

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
          match: (n) => n.id && selectedIds!.has(n.id),
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
          match: (n) => !!n.id && selectedIds!.has(n.id),
        });
      }
      // TODO: skip toggle child
      if (isHotkey('up')(e)) {
        const firstId = [...selectedIds!][0];
        const node = findNode(editor, {
          at: [],
          match: (n) => n.id && n.id === firstId,
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
          match: (n) => n.id && n.id === lastId,
        });
        const next = getNextNode(editor, {
          at: node?.[1],
        });
        const nextId = next?.[0].id;
        api.blockSelection.addSelectedRow(nextId);
      }
    },
    [editor, selectedIds, api, getOptions, getOption]
  );

  const handleCopy = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (getOption('isSelectingSome')) {
        copySelectedBlocks(editor);
      }
    },
    [editor, getOption]
  );

  const handleCut = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (getOption('isSelectingSome')) {
        copySelectedBlocks(editor);

        if (!isEditorReadOnly(editor)) {
          removeNodes(editor, {
            at: [],
            match: (n) => selectedIds!.has(n.id),
          });

          focusEditor(editor);
        }
      }
    },
    [editor, selectedIds, getOption]
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (!isEditorReadOnly(editor)) {
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
      // eslint-disable-next-line tailwindcss/no-custom-classname
      className="slate-shadow-input"
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
