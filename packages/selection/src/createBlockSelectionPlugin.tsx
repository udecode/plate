import React from 'react';

import {
  type QueryNodeOptions,
  createPluginFactory,
} from '@udecode/plate-common/server';

import { BlockSelectionArea, BlockStartArea } from './components';
import { BlockSelectable } from './components/BlockSelectable';
import { onKeyDownSelection } from './onKeyDownSelection';
import { useHooksBlockSelection } from './useHooksBlockSelection';
import { onCloseBlockSelection } from './utils';
import { withSelection } from './withSelection';

export const KEY_BLOCK_SELECTION = 'blockSelection';

export interface BlockSelectionPlugin {
  disableContextMenu?: boolean;
  onKeyDownSelecting?: (e: KeyboardEvent) => void;
  query?: QueryNodeOptions;
  sizes?: {
    bottom?: number;
    left?: number;
    right?: number;
    top?: number;
  };
}

export const createBlockSelectionPlugin =
  createPluginFactory<BlockSelectionPlugin>({
    handlers: {
      onChange: onCloseBlockSelection,
      // onFocus: onCloseBlockSelection,
      onKeyDown: onKeyDownSelection,
      onMouseDown: () => (e) => {
        if (e.button === 2) e.preventDefault();
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
              selectedColor: 'rgb(219 234 254)',
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
    then: (editor, { options }) => ({
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
    }),
    useHooks: useHooksBlockSelection,
    withOverrides: withSelection,
  });
