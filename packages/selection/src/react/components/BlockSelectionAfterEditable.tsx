import React from 'react';
import ReactDOM from 'react-dom';

import { isHotkey, KEYS, PathApi } from 'platejs';
import {
  type EditableSiblingComponent,
  useEditorPlugin,
  useEditorRef,
  usePluginOption,
} from 'platejs/react';

import {
  type BlockSelectionConfig,
  BlockSelectionPlugin,
} from '../BlockSelectionPlugin';
import { useSelectionArea } from '../hooks';
import {
  copySelectedBlocks,
  pasteSelectedBlocks,
  selectInsertedBlocks,
} from '../utils';

export const BlockSelectionAfterEditable: EditableSiblingComponent = () => {
  const editor = useEditorRef();
  const { api, getOption, getOptions, setOption } =
    useEditorPlugin<BlockSelectionConfig>({ key: KEYS.blockSelection });

  const isSelectingSome = usePluginOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );
  const selectedIds = usePluginOption(BlockSelectionPlugin, 'selectedIds');

  const removeSelectedBlocks = React.useCallback(
    (options: { selectPrevious?: boolean } = {}) => {
      const entries = [
        ...editor.api.nodes({
          at: [],
          match: (n) => !!n.id && selectedIds?.has(n.id as string),
        }),
      ];

      if (entries.length === 0) return null;

      const firstPath = entries[0]![1];

      editor.tf.withoutNormalizing(() => {
        for (const [node, path] of [...entries].reverse()) {
          editor.tf.removeNodes({
            at: path,
          });
          api.blockSelection.delete(node.id as string);
        }

        if (editor.children.length === 0) {
          editor.meta._forceFocus = true;
          editor.tf.focus();
          editor.meta._forceFocus = false;
        } else if (options.selectPrevious) {
          const prevPath = PathApi.previous(firstPath);

          if (prevPath) {
            const prevEntry = editor.api.block({ at: prevPath });

            if (prevEntry) {
              setOption('selectedIds', new Set([prevEntry[0].id as string]));
            }
          }
        }
      });

      return firstPath;
    },
    [editor, api.blockSelection, selectedIds, setOption]
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
      const isReadonly = editor.api.isReadOnly();
      getOptions().onKeyDownSelecting?.(editor, e.nativeEvent);

      if (!getOption('isSelectingSome')) return;
      if (isHotkey('shift+up')(e)) {
        e.preventDefault();
        e.stopPropagation();
        api.blockSelection.shiftSelection('up');

        return;
      }
      if (isHotkey('shift+down')(e)) {
        e.preventDefault();
        e.stopPropagation();
        api.blockSelection.shiftSelection('down');

        return;
      }
      // ESC => unselect all
      if (isHotkey('escape')(e)) {
        api.blockSelection.deselect();

        return;
      }
      // Undo/redo
      if (isHotkey('mod+z')(e)) {
        editor.undo();
        selectInsertedBlocks(editor);

        return;
      }
      if (isHotkey('mod+a')(e)) {
        api.blockSelection.selectAll();

        return;
      }

      if (isHotkey('mod+shift+z')(e)) {
        editor.redo();
        selectInsertedBlocks(editor);

        return;
      }
      // Mod+D => duplicate selected blocks
      if (isHotkey('mod+d')(e)) {
        e.preventDefault();
        editor.getTransforms(BlockSelectionPlugin).blockSelection.duplicate();
        return;
      }
      // Only continue if we have "some" selection
      if (!getOption('isSelectingSome')) return;
      // Enter => focus first selected block
      if (isHotkey('enter')(e)) {
        const entry = editor.api.node({
          at: [],
          block: true,
          match: (n) => !!n.id && selectedIds?.has(n.id as string),
        });

        if (entry) {
          const [, path] = entry;
          editor.meta._forceFocus = true;
          editor.tf.focus({ at: path, edge: 'end' });
          editor.meta._forceFocus = undefined;
          e.preventDefault();
        }

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
        api.blockSelection.moveSelection('up');

        return;
      }
      if (isHotkey('down')(e)) {
        e.preventDefault();
        e.stopPropagation();
        api.blockSelection.moveSelection('down');

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
        const firstPath = removeSelectedBlocks();

        if (firstPath) {
          editor.meta._forceFocus = true;
          editor.tf.insertNodes(
            editor.api.create.block({ children: [{ text: e.key }] }),
            { at: firstPath }
          );
          editor.tf.select(firstPath, { edge: 'end' });
          editor.meta._forceFocus = false;
          editor.tf.focus();
        }
        return;
      }
    },
    [
      editor,
      getOptions,
      getOption,
      api.blockSelection,
      removeSelectedBlocks,
      selectedIds,
    ]
  );

  /** Handle copy / cut / paste in block selection */
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

        if (!editor.api.isReadOnly()) {
          removeSelectedBlocks();
        }
      }
    },
    [editor, getOption, removeSelectedBlocks]
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();

      if (!editor.api.isReadOnly()) {
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
