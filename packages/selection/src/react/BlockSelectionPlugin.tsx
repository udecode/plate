import type { CSSProperties } from 'react';
import type React from 'react';

import type { PluginConfig, TElement, TNodeEntry } from '@udecode/plate-common';

import { bindFirst, getNodeEntries } from '@udecode/plate-common';
import { createTPlatePlugin } from '@udecode/plate-common/react';

import type { ChangedElements, PartialSelectionOptions } from '../internal';

import { getAllSelectableDomNode, getSelectedDomNode } from '../lib';
import { extractSelectableIds } from '../lib/extractSelectableIds';
import { BlockMenuPlugin } from './BlockMenuPlugin';
import { BlockSelectionAfterEditable } from './components/BlockSelectionAfterEditable';
import { useBlockSelectable } from './hooks/useBlockSelectable';
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
    areaOptions?: PartialSelectionOptions;
    editorPaddingRight?: CSSProperties['width'];
    enableContextMenu?: boolean;
    isSelecting?: boolean;
    isSelectionAreaVisible?: boolean;
    rightSelectionAreaClassName?: string;
    selectedIds?: Set<string>;
    shadowInputRef?: React.RefObject<HTMLInputElement>;
    onKeyDownSelecting?: (e: KeyboardEvent) => void;
  } & BlockSelectionSelectors,
  {
    blockSelection: BlockSelectionApi;
  }
>;

export type BlockSelectionSelectors = {
  isSelected?: (id?: string) => boolean;
  isSelectingSome?: () => boolean;
};

export type BlockSelectionApi = {
  addSelectedRow: (
    id: string,
    options?: { clear?: boolean; duration?: number }
  ) => void;
  setSelectedIds: (
    options: Partial<ChangedElements> & { ids?: string[] }
  ) => void;
  focus: () => void;
  getNodes: () => TNodeEntry[];
  resetSelectedIds: () => void;
  selectedAll: () => void;
  unselect: () => void;
};

export const BlockSelectionPlugin = createTPlatePlugin<BlockSelectionConfig>({
  key: 'blockSelection',
  extendEditor: ({ api, editor, getOptions }) => {
    const { setSelection } = editor;

    editor.setSelection = (...args) => {
      if (
        getOptions().selectedIds!.size > 0 &&
        !editor.getOption(BlockMenuPlugin, 'openId')
      ) {
        api.blockSelection.unselect();
      }

      setSelection(...args);
    };

    return editor;
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
  },
  plugins: [BlockMenuPlugin],
  render: {
    afterEditable: BlockSelectionAfterEditable,
  },
  handlers: {
    onKeyDown: onKeyDownSelection,
    onMouseDown: ({ api, editor, event, getOptions }) => {
      const target = event.target as HTMLElement;

      if (target.dataset.platePreventUnselect) return;
      if (
        event.button === 0 &&
        getOptions().selectedIds!.size > 0 &&
        !editor.getOption(BlockMenuPlugin, 'openId')
      ) {
        api.blockSelection.unselect();
      }
    },
  },
})
  .extend(() => ({
    inject: {},
  }))
  .extendOptions(({ getOptions }) => ({
    isSelected: (id?: string) => !!id && getOptions().selectedIds!.has(id),
    isSelectingSome: () => getOptions().selectedIds!.size > 0,
  }))
  .extendApi<Partial<BlockSelectionApi>>(
    ({ editor, getOption, getOptions, setOption }) => ({
      focus: () => {
        const shadowInputRef = getOption('shadowInputRef');

        if (shadowInputRef?.current) {
          shadowInputRef.current.focus({ preventScroll: true });
        }
      },
      getNodes: () => {
        const selectedIds = getOption('selectedIds');

        return [
          ...getNodeEntries<TElement>(editor, {
            at: [],
            match: (n) => selectedIds?.has(n.id),
          }),
        ];
      },
      resetSelectedIds: () => {
        setOption('selectedIds', new Set());
      },
      setSelectedIds: ({ added, ids, removed }) => {
        if (ids) {
          setOption('selectedIds', new Set(ids));
        }
        if (added || removed) {
          const { selectedIds: prev } = getOptions();
          const next = new Set(prev);

          if (added) {
            extractSelectableIds(added).forEach((id) => next.add(id));
          }
          if (removed) {
            extractSelectableIds(removed).forEach((id) => next.delete(id));
          }

          setOption('selectedIds', next);
        }

        setOption('isSelecting', true);
      },
      unselect: () => {
        setOption('selectedIds', new Set());
        setOption('isSelecting', false);
      },
    })
  )
  .extendApi<Partial<BlockSelectionApi>>(({ api, getOptions, setOption }) => ({
    addSelectedRow: (id, options = {}) => {
      const { clear = true, duration } = options;

      const element = getSelectedDomNode(id);

      if (!element) return;
      if (!getOptions().selectedIds!.has(id) && clear) {
        setOption('selectedIds', new Set());
      }

      api.blockSelection.setSelectedIds({
        added: [element],
        removed: [],
      });

      if (duration) {
        setTimeout(() => {
          api.blockSelection.setSelectedIds({
            added: [],
            removed: [element],
          });
        }, duration);
      }
    },

    selectedAll: () => {
      const all = getAllSelectableDomNode();
      setOption('selectedIds', new Set());

      api.blockSelection.setSelectedIds({
        added: Array.from(all),
        removed: [],
      });
    },
  }))
  .extendTransforms(({ editor }) => ({
    duplicate: bindFirst(duplicateBlockSelectionNodes, editor),
    insertBlocksAndSelect: bindFirst(insertBlocksAndSelect, editor),
    removeNodes: bindFirst(removeBlockSelectionNodes, editor),
    select: bindFirst(selectBlockSelectionNodes, editor),
    setIndent: bindFirst(setBlockSelectionIndent, editor),
    setNodes: bindFirst(setBlockSelectionNodes, editor),
    setTexts: bindFirst(setBlockSelectionTexts, editor),
  }));
