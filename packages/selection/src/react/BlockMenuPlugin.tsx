import type { DefinitionOf } from '@platejs/core';
import { definePlatePlugin } from '@platejs/core/react';
import type { NodeKey } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import { BlockSelectionPlugin } from './BlockSelectionPlugin';

export const BLOCK_CONTEXT_MENU_ID = 'context';

type OpenKey = NodeKey | typeof BLOCK_CONTEXT_MENU_ID;

type BlockMenuPosition = {
  x: number;
  y: number;
};

export type BlockMenuPluginState = {
  openKey: OpenKey | null;
  position: BlockMenuPosition;
};

const initialState: BlockMenuPluginState = {
  openKey: null,
  position: {
    x: -10_000,
    y: -10_000,
  },
};

export const BlockMenuPlugin = definePlatePlugin(PLUGINS.blockMenu, {
  initialState,

  editOnly: true,
  api: ({ editor, store }) => {
    const hide = () => {
      store.set({
        openKey: null,
        position: {
          x: -10_000,
          y: -10_000,
        },
      });
    };
    const show = (key: OpenKey, position?: BlockMenuPosition) => {
      if (position) {
        store.set({
          openKey: key,
          position,
        });
      } else {
        store.set({ openKey: key });
      }
    };

    return {
      hide,
      show,
      showContextMenu: (nodeKey: NodeKey, position: BlockMenuPosition) => {
        const blockSelection = editor.plugin(BlockSelectionPlugin);

        if (blockSelection.installed) {
          blockSelection.store.set({ selectedKeys: new Set([nodeKey]) });
        }
        show(BLOCK_CONTEXT_MENU_ID, position);
      },
    };
  },
}).extend(({ api }) => ({
  on: {
    mouseDown: ({ event, store }) => {
      if (event.button === 0 && store.get().openKey) {
        event.preventDefault();
        api.hide();
      }
      if (event.button === 2) event.preventDefault();
    },
  },
}));

export type BlockMenuDefinition = DefinitionOf<typeof BlockMenuPlugin>;
