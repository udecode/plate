import type { CSSProperties } from 'react';
import type React from 'react';

import type {
  NodeEntry,
  OmitFirst,
  Path,
  PluginConfig,
  TElement,
} from '@udecode/plate';

import { bindFirst } from '@udecode/plate';
import { createTPlatePlugin } from '@udecode/plate/react';

import type { PartialSelectionOptions } from '../internal';

import { selectBlocks } from '../internal/transforms/selectBlocks';
import { BlockMenuPlugin } from './BlockMenuPlugin';
import { BlockSelectionAfterEditable } from './components/BlockSelectionAfterEditable';
import { useBlockSelectable } from './hooks/useBlockSelectable';
import { moveSelection } from './internal/api/moveSelection';
import { addSelectedRow, setSelectedIds } from './internal/api/setSelectedIds';
import { shiftSelection } from './internal/api/shiftSelection';
import { onKeyDownSelection } from './onKeyDownSelection';
import { duplicateBlockSelectionNodes } from './transforms/duplicateBlockSelectionNodes';
import { insertBlocksAndSelect } from './transforms/insertBlocksAndSelect';
import { removeBlockSelectionNodes } from './transforms/removeBlockSelectionNodes';
import { selectBlockSelectionNodes } from './transforms/selectBlockSelectionNodes';
import {
  setBlockSelectionIndent,
  setBlockSelectionNodes,
  setBlockSelectionTexts,
} from './transforms/setBlockSelectionNodes';

export type BlockSelectionConfig = PluginConfig<
  'blockSelection',
  {
    anchorId?: string | null;
    areaOptions?: PartialSelectionOptions;
    editorPaddingRight?: CSSProperties['width'];
    enableContextMenu?: boolean;
    isSelecting?: boolean;
    isSelectionAreaVisible?: boolean;
    rightSelectionAreaClassName?: string;
    selectedIds?: Set<string>;
    shadowInputRef?: React.RefObject<HTMLInputElement | null>;
    /** Check if a block is selectable */
    isSelectable?: (element: TElement, path: Path) => boolean;
    onKeyDownSelecting?: (e: KeyboardEvent) => void;
  },
  {
    blockSelection: {
      /** Set selected block ids */
      setSelectedIds: OmitFirst<typeof setSelectedIds>;
      /** Add a block to the selection. */
      add: (id: string[] | string) => void;
      /**
       * Select a block by id, with optional delay and clear options.
       *
       * @deprecated Use `add` or `set` instead.
       */
      addSelectedRow: (
        id: string,
        options?: { clear?: boolean; delay?: number }
      ) => void;
      /** Clear block selection */
      clear: () => void;
      /** Delete a block from the selection. */
      delete: (id: string[] | string) => void;
      /** Deselect all blocks */
      deselect: () => void;
      /** Focus block selection – that differs from the editor focus */
      focus: () => void;
      /** Get selected blocks */
      getNodes: () => NodeEntry<TElement & { id: string }>[];
      /** Check if a block is selected. */
      has: (id: string[] | string) => boolean;
      /** Check if a block is selectable. */
      isSelectable: (element: TElement, path: Path) => boolean;
      /** Arrow-based move selection */
      moveSelection: (direction: 'down' | 'up') => void;
      /** Reset selected block ids. @deprecated Use `clear` instead. */
      resetSelectedIds: () => void;
      /** Select all selectable blocks */
      selectAll: () => void;
      /** Set a block to be selected. */
      set: (id: string[] | string) => void;
      /** Shift-based expand/shrink selection */
      shiftSelection: (direction: 'down' | 'up') => void;
      /** Deselect all blocks. @deprecated Use `deselect` instead. */
      unselect: () => void;
    };
  },
  {},
  {
    /** Check if a block is selected by id */
    isSelected?: (id?: string) => boolean;
    /** Check if any blocks are selected */
    isSelectingSome?: () => boolean;
  }
>;

export const BlockSelectionPlugin = createTPlatePlugin<BlockSelectionConfig>({
  key: 'blockSelection',
  handlers: {
    onKeyDown: onKeyDownSelection,
    onMouseDown: ({ api, editor, event, getOptions }) => {
      const target = event.target as HTMLElement;

      if (
        // deprecated
        target.dataset.platePreventUnselect ||
        target.dataset.platePreventDeselect
      )
        return;
      if (
        event.button === 0 &&
        getOptions().selectedIds!.size > 0 &&
        !editor.getOption(BlockMenuPlugin, 'openId')
      ) {
        api.blockSelection.deselect();
      }
    },
  },
  inject: {
    isBlock: true,
    nodeProps: {
      transformProps: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useBlockSelectable().props;
      },
    },
  },
  options: {
    anchorId: null,
    areaOptions: {
      features: {
        singleTap: {
          allow: false,
        },
      },
    },
    enableContextMenu: false,
    isSelecting: false,
    isSelectionAreaVisible: false,
    selectedIds: new Set(),
    shadowInputRef: { current: null },
    isSelectable: () => true,
  },
  plugins: [BlockMenuPlugin],
  render: {
    afterEditable: BlockSelectionAfterEditable,
  },
})
  .extend(() => ({
    inject: {},
  }))
  .extendSelectors<BlockSelectionConfig['selectors']>(({ getOptions }) => ({
    isSelected: (id) => !!id && getOptions().selectedIds!.has(id),
    isSelectingSome: () => getOptions().selectedIds!.size > 0,
  }))
  .extendApi<Partial<BlockSelectionConfig['api']['blockSelection']>>(
    ({ editor, getOption, getOptions, setOption }) => ({
      moveSelection: bindFirst(moveSelection, editor),
      setSelectedIds: bindFirst(setSelectedIds, editor),
      shiftSelection: bindFirst(shiftSelection, editor),
      add: (id) => {
        const next = new Set(getOptions().selectedIds!);

        if (Array.isArray(id)) {
          id.forEach((i) => next.add(i));
        } else {
          next.add(id);
        }

        setOption('selectedIds', next);
      },
      clear: () => {
        setOption('selectedIds', new Set());
      },
      delete: (id) => {
        const next = new Set(getOptions().selectedIds!);

        if (Array.isArray(id)) {
          id.forEach((i) => next.delete(i));
        } else {
          next.delete(id);
        }

        setOption('selectedIds', next);
      },
      deselect: () => {
        setOption('selectedIds', new Set());
        setOption('isSelecting', false);
      },
      focus: () => {
        const shadowInputRef = getOption('shadowInputRef');

        if (shadowInputRef?.current) {
          shadowInputRef.current.focus({ preventScroll: true });
        }
      },
      getNodes: () => {
        const selectedIds = getOption('selectedIds');

        return editor.api.blocks<TElement & { id: string }>({
          at: [],
          match: (n) => !!n.id && selectedIds?.has(n.id as string),
        });
      },
      has: (id) => {
        if (Array.isArray(id)) {
          return id.every((i) => getOptions().selectedIds!.has(i));
        }

        return getOptions().selectedIds!.has(id);
      },
      isSelectable: (element, path) =>
        !!element.id &&
        editor.api.isBlock(element) &&
        getOptions().isSelectable!(element, path),
      resetSelectedIds: () => {
        setOption('selectedIds', new Set());
      },
      set: (id) => {
        setOption('selectedIds', new Set(Array.isArray(id) ? id : [id]));
      },
      unselect: () => {
        setOption('selectedIds', new Set());
        setOption('isSelecting', false);
      },
    })
  )
  .extendApi<Partial<BlockSelectionConfig['api']['blockSelection']>>(
    ({ api, editor, setOption }) => ({
      addSelectedRow: bindFirst(addSelectedRow, editor),
      selectAll: () => {
        const ids = api
          .blocks({
            at: [],
            mode: 'highest',
            match: (n, p) =>
              !!n.id && api.blockSelection.isSelectable(n as any, p),
          })
          .map((n) => n[0].id as string);

        setOption('selectedIds', new Set(ids));
        api.blockSelection.focus();
      },
    })
  )
  .extendTransforms(({ editor }) => ({
    /** Duplicate selected blocks */
    duplicate: bindFirst(duplicateBlockSelectionNodes, editor),
    /** Insert blocks and select */
    insertBlocksAndSelect: bindFirst(insertBlocksAndSelect, editor),
    /** Remove selected blocks */
    removeNodes: bindFirst(removeBlockSelectionNodes, editor),
    /** Set selection based on block selection */
    select: bindFirst(selectBlockSelectionNodes, editor),
    /**
     * Selects blocks in the editor based on the provided block ID.
     *
     * Uses block selection if any blocks are selected, otherwise falls back to
     * editor selection. If the provided block ID is already in the current
     * selection, maintains the existing selection. Otherwise, clears the
     * current selection and selects only the specified block.
     */
    selectBlocks: bindFirst(selectBlocks, editor),
    /** Set block indent */
    setIndent: bindFirst(setBlockSelectionIndent, editor),
    /** Set nodes on selected blocks */
    setNodes: bindFirst(setBlockSelectionNodes, editor),
    /** Set texts on selected blocks */
    setTexts: bindFirst(setBlockSelectionTexts, editor),
  }))
  .overrideEditor(({ api, editor, getOptions, tf: { setSelection } }) => ({
    transforms: {
      setSelection(props) {
        if (
          getOptions().selectedIds!.size > 0 &&
          !editor.getOption(BlockMenuPlugin, 'openId')
        ) {
          api.blockSelection.deselect();
        }

        setSelection(props);
      },
    },
  }));
