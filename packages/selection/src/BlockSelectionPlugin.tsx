import React from 'react';

import {
  type QueryNodeOptions,
  createPlugin,
} from '@udecode/plate-common';

import { BlockSelectionArea, BlockStartArea } from './components';
import { BlockSelectable } from './components/BlockSelectable';
import {
  blockContextMenuActions,
  blockContextMenuSelectors,
} from './context-menu';
import { onKeyDownSelection } from './onKeyDownSelection';
import { useHooksBlockSelection } from './useHooksBlockSelection';
import { onCloseBlockSelection } from './utils';
import { withSelection } from './withSelection';

export const KEY_BLOCK_SELECTION = 'blockSelection';

export interface BlockSelectionPluginOptions {
  disableContextMenu?: boolean;
  onKeyDownSelecting?: (e: KeyboardEvent) => void;
  query?: QueryNodeOptions;
  scrollContainerSelector?: string;
  sizes?: {
    bottom?: number;
    left?: number;
    right?: number;
    top?: number;
  };
}

export const BlockSelectionPlugin = createPlugin<
  'blockSelection',
  BlockSelectionPluginOptions
>({
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
  key: KEY_BLOCK_SELECTION,
  options: {
    query: {
      maxLevel: 1,
    },
    sizes: {
      bottom: 4,
      left: 4,
      right: 4,
      top: 4,
    },
  },
  useHooks: useHooksBlockSelection,
  withOverrides: withSelection,
}).extend(({ plugin: { options } }) => ({
  renderAboveEditable: ({ children }) => (
    <BlockSelectionArea>
      <BlockStartArea
        state={{
          placement: 'left',
          size: options.sizes?.left,
        }}
      />
      <BlockStartArea
        state={{
          placement: 'top',
          size: options.sizes?.top,
        }}
      />
      <BlockStartArea
        state={{
          placement: 'right',
          size: options.sizes?.right,
        }}
      />
      <BlockStartArea
        state={{
          placement: 'bottom',
          size: options.sizes?.bottom,
        }}
      />
      {children}
    </BlockSelectionArea>
  ),
}));
