import React from 'react';
import ReactDOM from 'react-dom';

import { isHotkey, PathApi } from '@udecode/plate';
import {
  type EditableSiblingComponent,
  useEditorPlugin,
  useEditorRef,
  usePluginOption,
} from '@udecode/plate/react';

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
    useEditorPlugin<BlockSelectionConfig>({ key: 'blockSelection' });

  const isSelectingSome = usePluginOption(
    BlockSelectionPlugin,
    'isSelectingSome'
  );
  const selectedIds = usePluginOption(BlockSelectionPlugin, 'selectedIds');

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

  /** KeyDown logic */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isReadonly = editor.api.isReadOnly();
      getOptions().onKeyDownSelecting?.(e.nativeEvent);

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
          editor.tf.focus({ at: path, edge: 'end' });
          e.preventDefault();
        }

        return;
      }
      // Backspace/Delete => remove selected blocks
      if (isHotkey(['backspace', 'delete'])(e) && !isReadonly) {
        e.preventDefault();
        editor.tf.withoutNormalizing(() => {
          const entries = [
            ...editor.api.nodes({
              at: [],
              match: (n) => !!n.id && selectedIds?.has(n.id as string),
            }),
          ];

          for (const [, path] of [...entries].reverse()) {
            editor.tf.removeNodes({
              at: path,
            });
          }

          const entry = entries[0];

          if (entry) {
            if (editor.children.length === 0) {
              editor.tf.focus();
            } else {
              const prevPath = isHotkey('backspace')(e)
                ? PathApi.previous(entry[1])
                : entry[1];

              if (prevPath) {
                const prevEntry = editor.api.block({ at: prevPath });

                if (prevEntry) {
                  setOption(
                    'selectedIds',
                    new Set([prevEntry[0].id as string])
                  );
                }
              }
            }
          }
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
    },
    [editor, getOptions, getOption, api.blockSelection, selectedIds, setOption]
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
          const entries = [
            ...editor.api.nodes({
              at: [],
              match: (n) => selectedIds?.has(n.id as string),
            }),
          ];

          if (entries.length > 0) {
            editor.tf.withoutNormalizing(() => {
              for (const [, path] of [...entries].reverse()) {
                editor.tf.removeNodes({
                  at: path,
                });
              }
            });

            const prevEntry = editor.api.block({ at: entries[0][1] });
            if (prevEntry) {
              setOption('selectedIds', new Set([prevEntry[0].id as string]));
            }
          }
        }
      }
    },
    [getOption, editor, selectedIds, setOption]
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
