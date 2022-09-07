import React from 'react';
import { createPluginFactory, QueryNodeOptions } from '@udecode/plate-core';
import { BlockSelectable } from './components/BlockSelectable';
import { BlockSelectionArea } from './components/BlockSelectionArea';
import { BlockStartArea } from './components/BlockStartArea';
import { blockSelectionActions } from './blockSelectionStore';

export const KEY_BLOCK_SELECTION = 'blockSelection';

export interface BlockSelectionPlugin {
  query?: QueryNodeOptions;
}

export const createBlockSelectionPlugin = createPluginFactory<BlockSelectionPlugin>(
  {
    key: KEY_BLOCK_SELECTION,
    options: {
      query: {
        maxLevel: 1,
      },
    },
    inject: {
      aboveComponent: () => ({ element, children }) =>
        BlockSelectable({
          element,
          children,
          selectedColor: 'rgb(219 234 254)',
        }),
    },
    handlers: {
      onFocus: () => () => {
        blockSelectionActions.reset();
      },
    },
    renderAboveEditable: ({ children }) => (
      <BlockSelectionArea>
        <BlockStartArea size={28} placement="left" />
        <BlockStartArea size={50} placement="top" />
        <BlockStartArea size={50} placement="right" />
        <BlockStartArea size={50} placement="bottom" />
        {children}
      </BlockSelectionArea>
    ),
  }
);
