import React from 'react';
import { createPluginFactory } from '@udecode/plate-core';
import { BlockSelectionArea } from './components/BlockSelectionArea';
import { blockSelectionActions } from './blockSelectionStore';
import { injectBlockSelectionComponent } from './injectBlockSelectionComponent';

export const KEY_SELECTION = 'selection';

export const createBlockSelectionPlugin = createPluginFactory({
  key: KEY_SELECTION,
  inject: {
    aboveComponent: injectBlockSelectionComponent,
  },
  handlers: {
    onFocus: () => () => {
      blockSelectionActions.reset();
    },
  },
  then: (editor) => ({
    renderAboveEditable: ({ children }) => {
      return BlockSelectionArea({ children, editor });
    },
  }),
});
