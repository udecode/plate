import type { PluginConfig } from '@platejs/core';

import { createPlatePlugin } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

export const BLOCK_CONTEXT_MENU_ID = 'context';

export type BlockMenuConfig = PluginConfig<
  'blockMenu',
  {
    openId: OpenId | null;
    position: {
      x: number;
      y: number;
    };
  },
  {},
  {},
  {},
  {},
  readonly [],
  never,
  {
    hide: () => void;
    show: (id: OpenId, position?: { x: number; y: number }) => void;
    showContextMenu: (
      blockId: string,
      position: { x: number; y: number }
    ) => void;
  }
>;

type OpenId = (string & {}) | typeof BLOCK_CONTEXT_MENU_ID;

export const BlockMenuPlugin = createPlatePlugin<BlockMenuConfig>({
  key: KEYS.blockMenu,
  initialState: {
    openId: null,
    position: {
      x: -10_000,
      y: -10_000,
    },
  },

  editOnly: true,
  api: ({ api, editor, store }) => ({
    hide: () => {
      store.set({
        openId: null,
        position: {
          x: -10_000,
          y: -10_000,
        },
      });
    },
    show: (id, position) => {
      if (position) {
        store.set({
          openId: id,
          position,
        });
      } else {
        store.set({ openId: id });
      }
    },
    showContextMenu: (blockId, position) => {
      editor
        .plugin({ key: KEYS.blockSelection })
        .store.set({ selectedIds: new Set([blockId]) });
      api.show(BLOCK_CONTEXT_MENU_ID, position);
    },
  }),
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
