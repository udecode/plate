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
}

export const createBlockSelectionPlugin =
  createPluginFactory<BlockSelectionPlugin>({
    key: KEY_BLOCK_SELECTION,
    options: {
      query: {
        maxLevel: 1,
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
    renderAboveEditable: ({ children }) => (
      <BlockSelectionArea>
        <BlockStartArea
          state={{
            size: 28,
            placement: 'left',
          }}
        />
        <BlockStartArea
          state={{
            size: 50,
            placement: 'top',
          }}
        />
        <BlockStartArea
          state={{
            size: 50,
            placement: 'right',
          }}
        />
        <BlockStartArea
          state={{
            size: 50,
            placement: 'bottom',
          }}
        />
        {children}
      </BlockSelectionArea>
    ),
  });
