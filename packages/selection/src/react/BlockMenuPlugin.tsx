import type { InferConfig } from '@platejs/core';

import { createPlatePlugin } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import type { BlockSelectionConfig } from './BlockSelectionPlugin';

export const BLOCK_CONTEXT_MENU_ID = 'context';

type OpenId = (string & {}) | typeof BLOCK_CONTEXT_MENU_ID;

type BlockMenuPosition = {
  x: number;
  y: number;
};

export type BlockMenuPluginState = {
  openId: OpenId | null;
  position: BlockMenuPosition;
};

const initialState: BlockMenuPluginState = {
  openId: null,
  position: {
    x: -10_000,
    y: -10_000,
  },
};

export const BlockMenuPlugin = createPlatePlugin({
  key: KEYS.blockMenu,
  initialState,

  editOnly: true,
  api: ({ editor, store }) => {
    const hide = () => {
      store.set({
        openId: null,
        position: {
          x: -10_000,
          y: -10_000,
        },
      });
    };
    const show = (id: OpenId, position?: BlockMenuPosition) => {
      if (position) {
        store.set({
          openId: id,
          position,
        });
      } else {
        store.set({ openId: id });
      }
    };

    return {
      hide,
      show,
      showContextMenu: (blockId: string, position: BlockMenuPosition) => {
        const blockSelection = editor.plugin<BlockSelectionConfig>({
          key: KEYS.blockSelection,
        });

        if (blockSelection.installed) {
          blockSelection.store.set({ selectedIds: new Set([blockId]) });
        }
        show(BLOCK_CONTEXT_MENU_ID, position);
      },
    };
  },
}).extend({
  handlers: {
    onMouseDown: ({ api, event, store }) => {
      if (event.button === 0 && store.get().openId) {
        event.preventDefault();
        api.hide();
      }
      if (event.button === 2) event.preventDefault();
    },
  },
});

export type BlockMenuConfig = InferConfig<typeof BlockMenuPlugin>;
