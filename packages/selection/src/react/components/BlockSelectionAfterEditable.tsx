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

  // Whether we're in the special "block selection" mode
  const isSelecting = useOption('isSelecting');
  // The set of currently selected block IDs
  const selectedIds = useOption('selectedIds');
  // The current anchor block ID
  const anchorId = getOption('anchorId');

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
   * Select all blocks in the path range between `anchorPath` and `siblingPath`.
   * Ensures anchorId remains selected.
   */
  const selectBetween = React.useCallback(
    (anchorPath, siblingPath) => {
      // If anchorPath is “before” siblingPath, that’s our ascending range, else swap.
      const [minPath, maxPath] = editor.api.path.isBefore(
        anchorPath,
        siblingPath
      )
        ? [anchorPath, siblingPath]
        : [siblingPath, anchorPath];

      // gather blocks in [minPath..maxPath]
      const inRange = editor.api.blocks({
        at: [minPath, maxPath],
        match: (n) => !!n.id,
      });

      const nextSelectedIds = new Set<string>();
      inRange.forEach(([node]) => {
        if (node.id) nextSelectedIds.add(node.id as string);
      });

      // Ensure anchor is never removed
      if (anchorId) nextSelectedIds.add(anchorId);

      setOption('selectedIds', nextSelectedIds);
    },
    [editor, anchorId, setOption]
  );

  /**
   * Extend selection upward from top-most selected block to the block above it,
   * while keeping the anchor constant if we already have one.
   */
  const extendSelectionUp = React.useCallback(() => {
    const blocks = api.blockSelection.getNodes();

    if (blocks.length === 0) return;

    // top-most block in the selection
    const [, topPath] = blocks[0];

    if (!PathApi.previous(topPath)) return;

    // find sibling above
    const aboveEntry = editor.api.node({ at: PathApi.previous(topPath) })!;

    let theAnchor = anchorId;

    if (!theAnchor) {
      // If anchor is unset, anchor is the block last selected by the user
      // (e.g. the bottom-most block in doc order if you prefer).
      // For demonstration, let's use bottom-most (like typical text selection).
      const [maybeBottomNode] = blocks.at(-1)!;
      theAnchor = maybeBottomNode.id;
      setOption('anchorId', theAnchor);
    }

    const anchorEntry = editor.api.node({ match: (n) => n.id === theAnchor });

    if (!anchorEntry) return;

    selectBetween(anchorEntry[1], aboveEntry[1]);
  }, [anchorId, editor, api.blockSelection, selectBetween, setOption]);

  /**
   * Extend selection downward from bottom-most selected block to the block
   * below it, while keeping the anchor constant if we already have one.
   */
  const extendSelectionDown = React.useCallback(() => {
    const blocks = api.blockSelection.getNodes();

    if (blocks.length === 0) return;

    // The bottom-most selected block in doc order
    const [, bottomPath] = blocks.at(-1)!;
    const belowEntry = editor.api.node({ at: PathApi.next(bottomPath) })!;

    if (!belowEntry) return; // no block below

    let theAnchor = anchorId;

    if (!theAnchor) {
      // If anchor is unset, anchor is the top-most or bottom-most block
      // in the current selection. Here we choose the top-most to replicate
      // typical text selection. For demonstration, we keep it consistent
      // with extendSelectionUp above.
      const [maybeTopNode] = blocks[0];
      theAnchor = maybeTopNode.id;
      setOption('anchorId', theAnchor);
    }

    const anchorEntry = editor.api.node({ match: (n) => n.id === theAnchor });

    if (!anchorEntry) return;

    selectBetween(anchorEntry[1], belowEntry[1]);
  }, [anchorId, editor, api.blockSelection, selectBetween, setOption]);

  /**
   * Example: if user presses arrow-up/down WITHOUT shift, we consider this a
   * new anchor. Or if user single-clicks, we can also set anchor. This snippet
   * sets anchor to the newly added block row. Adjust to your preference if
   * needed.
   */
  const moveSelectionUp = React.useCallback(() => {
    const blocks = api.blockSelection.getNodes();

    if (blocks.length === 0) return;

    const [, firstSelectedPath] = blocks[0];

    if (!PathApi.previous(firstSelectedPath)) return;

    const aboveEntry = editor.api.node<TElement & { id: string }>({
      at: PathApi.previous(firstSelectedPath),
    })!;

    // New anchor => newly selected block (aboveEntry)
    setOption('anchorId', aboveEntry[0].id ?? null);
    api.blockSelection.addSelectedRow(aboveEntry[0].id, { clear: true });
  }, [api, editor, setOption]);

  const moveSelectionDown = React.useCallback(() => {
    const blocks = api.blockSelection.getNodes();

    if (blocks.length === 0) return;

    const [, lastSelectedPath] = blocks.at(-1)!;
    const belowEntry = editor.api.node<TElement & { id: string }>({
      at: PathApi.next(lastSelectedPath),
    })!;

    if (!belowEntry) return;

    // New anchor => newly selected block (belowEntry)
    setOption('anchorId', belowEntry[0].id ?? null);
    api.blockSelection.addSelectedRow(belowEntry[0].id, { clear: true });
  }, [api, editor, setOption]);

  /** Keyboard logic */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isReadonly = editor.api.isReadOnly();
      getOptions().onKeyDownSelecting?.(e.nativeEvent);

      // Not in block selection mode
      if (!getOptions().isSelecting) return;
      // SHIFT+UP => extend selection upward
      if (e.shiftKey && isHotkey('up')(e)) {
        e.preventDefault();
        e.stopPropagation();
        extendSelectionUp();

        return;
      }
      // SHIFT+DOWN => extend selection downward
      if (e.shiftKey && isHotkey('down')(e)) {
        e.preventDefault();
        e.stopPropagation();
        extendSelectionDown();

        return;
      }
      // ESC => unselect everything
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
      // Nothing is selected? bail out
      if (!getOption('isSelectingSome')) return;
      // Enter => focus the first selected block (example)
      if (isHotkey('enter')(e)) {
        const entry = editor.api.node({
          at: [],
          block: true,
          match: (n) => !!n.id && selectedIds!.has(n.id),
        });

        if (entry) {
          const [, path] = entry;
          editor.tf.focus({ at: path, edge: 'end' });
          e.preventDefault();
        }

        return;
      }
      // Backspace / delete => remove selected blocks
      if (isHotkey(['backspace', 'delete'])(e) && !isReadonly) {
        e.preventDefault();
        editor.tf.withoutNormalizing(() => {
          editor.tf.removeNodes({
            at: [],
            block: true,
            match: (n) => !!n.id && selectedIds!.has(n.id),
          });

          if (editor.children.length === 0) {
            editor.tf.focus();
          }
        });

        return;
      }
      // If SHIFT is NOT pressed => arrow up/down re-anchors selection
      if (!e.shiftKey && isHotkey('up')(e)) {
        e.preventDefault();
        e.stopPropagation();
        moveSelectionUp();

        return;
      }
      if (!e.shiftKey && isHotkey('down')(e)) {
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
      moveSelectionUp,
      moveSelectionDown,
      extendSelectionUp,
      extendSelectionDown,
      setOption,
    ]
  );

  /** Handle copy/cut/paste while in block selection */
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
            match: (n) => selectedIds!.has(n.id),
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
