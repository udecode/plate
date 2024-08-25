import React from 'react';

import {
  type PluginConfig,
  type QueryNodeOptions,
  type TNodeEntry,
  getNodeEntries,
} from '@udecode/plate-common';
import { createTPlatePlugin } from '@udecode/plate-common/react';

import type { ChangedElements } from './components/SelectionArea';

import { getAllSelectableDomNode, getSelectedDomNode } from '../lib';
import { extractSelectableIds } from '../lib/extractSelectableIds';
import { BlockSelectionArea, BlockStartArea } from './components';
import { BlockSelectable } from './components/BlockSelectable';
import {
  blockContextMenuActions,
  blockContextMenuSelectors,
} from './context-menu';
import { onKeyDownSelection } from './onKeyDownSelection';
import { useHooksBlockSelection } from './useHooksBlockSelection';
import { onCloseBlockSelection } from './utils';

export type BlockSelectionConfig = PluginConfig<
  'blockSelection',
  {
    disableContextMenu?: boolean;
    isSelecting?: boolean;
    onKeyDownSelecting?: (e: KeyboardEvent) => void;
    query?: QueryNodeOptions;
    scrollContainerSelector?: string;
    selectedIds?: Set<string>;
    sizes?: {
      bottom?: number;
      left?: number;
      right?: number;
      top?: number;
    };
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
    options?: { aboveHtmlNode?: HTMLDivElement; clear?: boolean }
  ) => void;
  getSelectedBlocks: () => TNodeEntry[];
  resetSelectedIds: () => void;
  selectedAll: () => void;
  setSelectedIds: (options: ChangedElements) => void;
  unselect: () => void;
};

export const BlockSelectionPlugin = createTPlatePlugin<BlockSelectionConfig>({
  handlers: {
    onChange: onCloseBlockSelection,
    onKeyDown: onKeyDownSelection,
    onMouseDown: ({ editor, event }) => {
      if (event.button === 0 && blockContextMenuSelectors.isOpen(editor.id)) {
        event.preventDefault();
        blockContextMenuActions.hide();
      }
      if (event.button === 2) event.preventDefault();
    },
  },
  inject: {
    aboveComponent:
      () =>
      ({ children, element }) =>
        BlockSelectable({
          children,
          options: {
            element,
          },
        }),
  },
  key: 'blockSelection',
  options: {
    isSelecting: false,
    query: {
      maxLevel: 1,
    },
    selectedIds: new Set(),
    sizes: {
      bottom: 4,
      left: 4,
      right: 4,
      top: 4,
    },
  },
  useHooks: useHooksBlockSelection,
})
  .extendOptions(({ getOptions }) => ({
    isSelected: (id?: string) => !!id && getOptions().selectedIds!.has(id),
    isSelectingSome: () => getOptions().selectedIds!.size > 0,
  }))
  .extendApi<Partial<BlockSelectionApi>>(({ getOptions, setOption }) => ({
    resetSelectedIds: () => {
      setOption('selectedIds', new Set());
    },
    setSelectedIds: ({ added, removed }) => {
      const { selectedIds: prev } = getOptions();
      const next = new Set(prev);
      extractSelectableIds(added).forEach((id) => next.add(id));
      extractSelectableIds(removed).forEach((id) => next.delete(id));

      setOption('selectedIds', next);
      setOption('isSelecting', true);
    },
    unselect: () => {
      setOption('selectedIds', new Set());
      setOption('isSelecting', false);
    },
  }))
  .extendApi<Partial<BlockSelectionApi>>(
    ({ api, editor, getOption, getOptions, setOption }) => ({
      addSelectedRow: (id, options = {}) => {
        const { aboveHtmlNode, clear = true } = options;

        const element = aboveHtmlNode ?? getSelectedDomNode(id);

        if (!element) return;
        if (!getOptions().selectedIds!.has(id) && clear) {
          setOption('selectedIds', new Set());
        }

        api.blockSelection.setSelectedIds({
          added: [element],
          removed: [],
        });
      },
      getSelectedBlocks: () => {
        return [
          ...getNodeEntries(editor, {
            at: [],
            match: (n) => getOption('isSelected', n.id),
          }),
        ];
      },

      selectedAll: () => {
        const all = getAllSelectableDomNode();
        setOption('selectedIds', new Set());

        api.blockSelection.setSelectedIds({
          added: Array.from(all),
          removed: [],
        });
      },
    })
  )
  .extend(({ getOptions }) => ({
    renderAboveEditable: ({ children }) => (
      <BlockSelectionArea>
        <BlockStartArea
          state={{
            placement: 'left',
            size: getOptions().sizes?.left,
          }}
        />
        <BlockStartArea
          state={{
            placement: 'top',
            size: getOptions().sizes?.top,
          }}
        />
        <BlockStartArea
          state={{
            placement: 'right',
            size: getOptions().sizes?.right,
          }}
        />
        <BlockStartArea
          state={{
            placement: 'bottom',
            size: getOptions().sizes?.bottom,
          }}
        />
        {children}
      </BlockSelectionArea>
    ),
  }));
