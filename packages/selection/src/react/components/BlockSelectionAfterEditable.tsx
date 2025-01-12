import React from 'react';
import ReactDOM from 'react-dom';

import { PathApi, isHotkey } from '@udecode/plate';
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
   * Utility: given an anchor block’s path and a sibling block’s path, select
   * all blocks in-between (inclusive).
   */
  const selectBetween = React.useCallback(
    (anchorPath, siblingPath) => {
      const [minPath, maxPath] = editor.api.path.isBefore(
        anchorPath,
        siblingPath
      )
        ? [anchorPath, siblingPath]
        : [siblingPath, anchorPath];

      // gather all blocks in [minPath, maxPath]
      const inRange = editor.api.blocks({
        at: [minPath, maxPath],
        match: (n) => !!n.id,
      });

      const nextSelectedIds = new Set<string>([]);
      inRange.forEach(([node]) => node.id && nextSelectedIds.add(node.id));

      // ensure anchor never gets removed if present
      const anchorNode = editor.api.node({ match: (n) => n.id === anchorId });

      if (anchorNode) {
        nextSelectedIds.add(anchorId!);
      }

      setOption('selectedIds', nextSelectedIds);
    },
    [editor, anchorId, setOption]
  );

  /** Extended selection with SHIFT+UP or SHIFT+DOWN */
  const extendSelectionUp = React.useCallback(() => {
    const blocks = api.blockSelection.getNodes();

    if (blocks.length === 0) return;

    // top-most block in the selection
    const [, topPath] = blocks[0];

    if (!PathApi.previous(topPath)) return;

    // find sibling above
    const aboveEntry = editor.api.node({ at: PathApi.previous(topPath) })!;

    // ensure we have an anchor
    let newAnchor = anchorId;

    if (!newAnchor) {
      // default anchor is the last selected in doc order
      const [maybeLastNode] = blocks.at(-1)!;
      newAnchor = maybeLastNode.id;
      setOption('anchorId', newAnchor);
    }

    const anchorEntry = editor.api.node({ match: (n) => n.id === newAnchor });

    if (!anchorEntry) return;

    selectBetween(anchorEntry[1], aboveEntry[1]);
  }, [anchorId, api.blockSelection, editor.api, selectBetween, setOption]);

  const extendSelectionDown = React.useCallback(() => {
    const blocks = api.blockSelection.getNodes();

    if (blocks.length === 0) return;

    // bottom-most block in the selection
    const [, bottomPath] = blocks.at(-1)!;
    // find sibling below
    const belowEntry = editor.api.node({ at: PathApi.next(bottomPath) });

    if (!belowEntry) return; // no block below

    // ensure we have an anchor
    let newAnchor = anchorId;

    if (!newAnchor) {
      // default anchor is the first selected in doc order
      const [maybeFirstNode] = blocks[0];
      newAnchor = maybeFirstNode.id;
      setOption('anchorId', newAnchor);
    }

    const anchorEntry = editor.api.node({ match: (n) => n.id === newAnchor });

    if (!anchorEntry) return;

    selectBetween(anchorEntry[1], belowEntry[1]);
  }, [anchorId, api.blockSelection, editor.api, selectBetween, setOption]);

  /** Handle keyboard events while in "block selection" mode. */
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const isReadonly = editor.api.isReadOnly();
      getOptions().onKeyDownSelecting?.(e.nativeEvent);

      // Not in block selection mode
      if (!getOptions().isSelecting) return;
      // SHIFT + ArrowUp => Extend selection upward
      if (e.shiftKey && isHotkey('up')(e)) {
        e.preventDefault();
        e.stopPropagation();
        extendSelectionUp();

        return;
      }
      // SHIFT + ArrowDown => Extend selection downward
      if (e.shiftKey && isHotkey('down')(e)) {
        e.preventDefault();
        e.stopPropagation();
        extendSelectionDown();

        return;
      }
      // Pressing Escape => unselect everything
      if (isHotkey('escape')(e)) {
        api.blockSelection.unselect();

        return;
      }
      // Undo/Redo
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
      // If no blocks are “some” selected, bail out
      if (!getOption('isSelectingSome')) return;
      // Pressing Enter => focus the first selected block
      if (isHotkey('enter')(e)) {
        // get the first block in the selection
        const entry = editor.api.node({
          at: [],
          block: true,
          match: (n) => !!n.id && selectedIds!.has(n.id),
        });

        if (entry) {
          const [, path] = entry;
          // focus the end of that block
          editor.tf.focus({ at: path, edge: 'end' });
          e.preventDefault();
        }

        return;
      }
      // Pressing Backspace/Delete => remove selected blocks
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
      // Single up/down with no shift => select next/prev single block
      if (!e.shiftKey && isHotkey('up')(e)) {
        e.preventDefault();
        const firstId = [...selectedIds!][0];
        const node = editor.api.node({
          at: [],
          block: true,
          match: (n) => !!n.id && n.id === firstId,
        });
        const prev = editor.api.previous({ at: node?.[1] });

        if (prev?.[0].id) {
          api.blockSelection.addSelectedRow(prev[0].id as string);
        }
      }
      if (!e.shiftKey && isHotkey('down')(e)) {
        e.preventDefault();
        const lastId = [...selectedIds!].pop();
        const node = editor.api.node({
          at: [],
          block: true,
          match: (n) => !!n.id && n.id === lastId,
        });
        const next = editor.api.next({ at: node?.[1] });

        if (next?.[0].id) {
          api.blockSelection.addSelectedRow(next[0].id as string);
        }
      }
    },
    [
      editor,
      selectedIds,
      api,
      getOptions,
      getOption,
      extendSelectionUp,
      extendSelectionDown,
    ]
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
