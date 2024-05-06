import React from 'react';

import {
  type QueryNodeOptions,
  createPluginFactory,
} from '@udecode/plate-common/server';

import { BlockSelectable } from './components/BlockSelectable';
import { BlockSelectionArea } from './components/BlockSelectionArea';
import { BlockStartArea } from './components/BlockStartArea';
import { onChangeBlockSelection } from './onChangeBlockSelection';
import { useHooksBlockSelection } from './useHooksBlockSelection';

export const KEY_BLOCK_SELECTION = 'blockSelection';

export interface BlockSelectionPlugin {
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
      onChange: onChangeBlockSelection,
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
  });
