import type { CSSProperties } from 'react';

import {
  type PluginConfig,
  type QueryNodeOptions,
  type TNodeEntry,
  getNodeEntries,
} from '@udecode/plate-common';
import { createTPlatePlugin } from '@udecode/plate-common/react';

import type { ChangedElements, PartialSelectionOptions } from '../internal';

import { getAllSelectableDomNode, getSelectedDomNode } from '../lib';
import { extractSelectableIds } from '../lib/extractSelectableIds';
import { BlockContextMenuPlugin } from './BlockContextMenuPlugin';
import { BlockSelectable } from './components/BlockSelectable';
import { onKeyDownSelection } from './onKeyDownSelection';
import { useHooksBlockSelection } from './useHooksBlockSelection';
import { onChangeBlockSelection } from './utils';

export type BlockSelectionConfig = PluginConfig<
  'blockSelection',
  {
    areaOptions?: PartialSelectionOptions;
    editorPaddingRight?: CSSProperties['width'];
    enableContextMenu?: boolean;
    isSelecting?: boolean;
    query?: QueryNodeOptions;
    rightSelectionAreaClassName?: string;
    selectedIds?: Set<string>;
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
    options?: { aboveHtmlNode?: HTMLDivElement; clear?: boolean }
  ) => void;
  getSelectedBlocks: () => TNodeEntry[];
  resetSelectedIds: () => void;
  selectedAll: () => void;
  setSelectedIds: (options: ChangedElements) => void;
  unselect: () => void;
};

export const BlockSelectionPlugin = createTPlatePlugin<BlockSelectionConfig>({
  key: 'blockSelection',
  options: {
    areaOptions: {
      behaviour: {
        scrolling: {
          speedDivider: 5,
          startScrollMargins: { x: 20, y: 0 },
        },
        startThreshold: 5,
      },
      features: {
        singleTap: {
          allow: false,
        },
      },
    },
    enableContextMenu: false,
    isSelecting: false,
    query: {
      maxLevel: 1,
    },
    rightSelectionAreaClassName: 'slate-right-selection-area',
    selectedIds: new Set(),
  },
  plugins: [BlockContextMenuPlugin],
  render: {
    aboveNodes:
      () =>
      ({ children, element }) =>
        BlockSelectable({
          children,
          options: {
            element,
          },
        }),
  },
  useHooks: useHooksBlockSelection,
  handlers: {
    onChange: onChangeBlockSelection,
    onKeyDown: onKeyDownSelection,
  },
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
  );
