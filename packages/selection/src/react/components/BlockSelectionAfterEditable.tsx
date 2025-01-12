import React from 'react';
import ReactDOM from 'react-dom';

import { type TElement, PathApi, isHotkey } from '@udecode/plate';
import {
  type EditableSiblingComponent,
  useEditorPlugin,
  useEditorRef,
} from '@udecode/plate/react';

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

  /**
   * SHIFT-based expand-or-shrink selection.
   *
   * - 'up': expand top if anchor is top-most, else shrink from bottom
   * - 'down': expand bottom if anchor is bottom-most, else shrink from top
   */
  const shiftSelection = React.useCallback(
    (direction: 'down' | 'up') => {
      const blocks = api.blockSelection.getNodes();

      const [topNode, topPath] = blocks[0];
      const [bottomNode, bottomPath] = blocks.at(-1)!;

      let anchorId = getOptions().anchorId as string;

      if (!anchorId) {
        anchorId = bottomNode.id;
        setOption('anchorId', anchorId);
      }

      // Find anchor block in `blocks`
      const anchorIndex = blocks.findIndex(([n]) => n.id === anchorId);

      // Is anchor the top-most or bottom-most block in the selection?
      const anchorIsTop = anchorIndex === 0;
      const anchorIsBottom = anchorIndex === blocks.length - 1;

      // Expand or shrink
      // SHIFT+UP
      if (direction === 'up') {
        if (anchorIsTop) {
          // Expand up => add block above the top-most (if any)
          const abovePath = PathApi.previous(topPath);

          if (!abovePath) return; // none above

          const aboveEntry = editor.api.block({ at: abovePath });

          if (!aboveEntry) return;

          const [aboveNode] = aboveEntry;
          const newSelected = new Set(selectedIds);

          if (aboveNode.id) newSelected.add(aboveNode.id as string);

          // Always ensure anchor is included
          newSelected.add(anchorId);
          setOption('selectedIds', newSelected);
        } else {
          // Shrink => remove the bottom-most (unless it's the anchor)
          if (bottomNode.id !== anchorId) {
            const newSelected = new Set(selectedIds);
            newSelected.delete(bottomNode.id as string);
            newSelected.add(anchorId);
            setOption('selectedIds', newSelected);
          }
        }
      }

      // SHIFT+DOWN
      else {
        if (anchorIsBottom) {
          // Expand down => add block below the bottom-most
          const belowPath = PathApi.next(bottomPath);

          if (!belowPath) return;

          const belowEntry = editor.api.block({ at: belowPath });

          if (!belowEntry) return;

          const [belowNode] = belowEntry;
          const newSelected = new Set(selectedIds);

          if (belowNode.id) newSelected.add(belowNode.id as string);

          newSelected.add(anchorId);
          setOption('selectedIds', newSelected);
        } else {
          // Shrink => remove the top-most (unless it's the anchor)
          if (topNode.id !== anchorId) {
            const newSelected = new Set(selectedIds);
            newSelected.delete(topNode.id as string);
            newSelected.add(anchorId);
            setOption('selectedIds', newSelected);
          }
        }
      }
    },
    [api.blockSelection, getOptions, setOption, editor.api, selectedIds]
  );

  /** If user presses arrowUp/Down WITHOUT shift => new anchor */
  const moveSelectionUp = React.useCallback(() => {
    const blocks = api.blockSelection.getNodes();

    if (blocks.length === 0) return;

    const [, firstPath] = blocks[0];
    const abovePath = PathApi.previous(firstPath);

    if (!abovePath) return;

    const aboveEntry = editor.api.block<TElement & { id: string }>({
      at: abovePath,
    });

    if (!aboveEntry) return;

    const [aboveNode] = aboveEntry;
    setOption('anchorId', aboveNode.id ?? null);
    api.blockSelection.addSelectedRow(aboveNode.id, { clear: true });
  }, [api, editor, setOption]);

  const moveSelectionDown = React.useCallback(() => {
    const blocks = api.blockSelection.getNodes();

    if (blocks.length === 0) return;

    const [, lastPath] = blocks.at(-1)!;
    const belowPath = PathApi.next(lastPath);

    if (!belowPath) return;

    const belowEntry = editor.api.block<TElement & { id: string }>({
      at: belowPath,
    });

    if (!belowEntry) return;

    const [belowNode] = belowEntry;
    setOption('anchorId', belowNode.id ?? null);
    api.blockSelection.addSelectedRow(belowNode.id, { clear: true });
  }, [api, editor, setOption]);

  /** KeyDown logic */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isReadonly = editor.api.isReadOnly();
      getOptions().onKeyDownSelecting?.(e.nativeEvent);

      if (!getOptions().isSelecting) return;
      if (isHotkey('shift+up')(e)) {
        e.preventDefault();
        e.stopPropagation();
        shiftSelection('up');

        return;
      }
      if (isHotkey('shift+down')(e)) {
        e.preventDefault();
        e.stopPropagation();
        shiftSelection('down');

        return;
      }
      // ESC => unselect all
      if (isHotkey('escape')(e)) {
        api.blockSelection.unselect();
        setOption('anchorId', null);

        return;
      }
      // Undo/redo
      if (isHotkey('mod+z')(e)) {
        editor.undo();
        selectInsertedBlocks(editor);

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
          match: (n) => !!n.id && selectedIds?.has(n.id),
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
          editor.tf.removeNodes({
            at: [],
            block: true,
            match: (n) => !!n.id && selectedIds?.has(n.id),
          });

          if (editor.children.length === 0) {
            editor.tf.focus();
          }
        });

        return;
      }
      // If SHIFT not pressed => arrow up/down sets new anchor
      if (isHotkey('up')(e)) {
        e.preventDefault();
        e.stopPropagation();
        moveSelectionUp();

        return;
      }
      if (isHotkey('down')(e)) {
        e.preventDefault();
        e.stopPropagation();
        moveSelectionDown();

        return;
      }
    },
    [
      editor,
      selectedIds,
      api,
      getOptions,
      getOption,
      shiftSelection,
      moveSelectionUp,
      moveSelectionDown,
      setOption,
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
          editor.tf.removeNodes({
            at: [],
            match: (n) => selectedIds?.has(n.id),
          });
          editor.tf.focus();
        }
      }
    },
    [editor, selectedIds, getOption]
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
