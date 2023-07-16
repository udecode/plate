import React from 'react';
import { createPluginFactory, QueryNodeOptions } from '@udecode/plate-common';

import { BlockSelectable } from './components/BlockSelectable';
import { BlockSelectionArea } from './components/BlockSelectionArea';
import { BlockStartArea } from './components/BlockStartArea';
import { onChangeBlockSelection } from './onChangeBlockSelection';
import { useHooksBlockSelection } from './useHooksBlockSelection';

export const KEY_BLOCK_SELECTION = 'blockSelection';

export interface BlockSelectionPlugin {
  query?: QueryNodeOptions;
  onKeyDownSelecting?: (e: KeyboardEvent) => void;
  sizes?: {
    left?: number;
    top?: number;
    bottom?: number;
    right?: number;
  };
}

export const createBlockSelectionPlugin =
  createPluginFactory<BlockSelectionPlugin>({
    key: KEY_BLOCK_SELECTION,
    options: {
      query: {
        maxLevel: 1,
      },
      sizes: {
        left: 4,
        top: 4,
        right: 4,
        bottom: 4,
      },
    },
    inject: {
      aboveComponent:
        () =>
        ({ element, children }) =>
          BlockSelectable({
            options: {
              element,
              selectedColor: 'rgb(219 234 254)',
            },
            children,
          }),
    },
    handlers: {
      onChange: onChangeBlockSelection,
    },
    useHooks: useHooksBlockSelection,
    then: (editor, { options }) => ({
      renderAboveEditable: ({ children }) => (
        <BlockSelectionArea>
          <BlockStartArea
            state={{
              size: options.sizes?.left,
              placement: 'left',
            }}
          />
          <BlockStartArea
            state={{
              size: options.sizes?.top,
              placement: 'top',
            }}
          />
          <BlockStartArea
            state={{
              size: options.sizes?.right,
              placement: 'right',
            }}
          />
          <BlockStartArea
            state={{
              size: options.sizes?.bottom,
              placement: 'bottom',
            }}
          />
          {children}
        </BlockSelectionArea>
      ),
    }),
  });
