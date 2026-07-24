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
  editOnly: true,
  options: {
    openId: null,
    position: {
      x: -10_000,
      y: -10_000,
    },
  },
})
  .extendApi<Pick<BlockMenuConfig['pluginApi'], 'hide' | 'show'>>(
    ({ setOption, setOptions }) => ({
      hide: () => {
        setOptions({
          openId: null,
          position: {
            x: -10_000,
            y: -10_000,
          },
        });
      },
      show: (id, position) => {
        if (position) {
          setOptions({
            openId: id,
            position,
          });
        } else {
          setOption('openId', id);
        }
      },
    })
  )
  .extendApi<Pick<BlockMenuConfig['pluginApi'], 'showContextMenu'>>(
    ({ api, editor }) => ({
      showContextMenu: (blockId, position) => {
        editor
          .plugin({ key: KEYS.blockSelection })
          .setOption('selectedIds', new Set([blockId]));
        api.show(BLOCK_CONTEXT_MENU_ID, position);
      },
    })
  )
  .extend(({ api }) => ({
    handlers: {
      onMouseDown: ({ event, getOptions }) => {
        if (event.button === 0 && getOptions().openId) {
          event.preventDefault();
          api.hide();
        }
        if (event.button === 2) event.preventDefault();
      },
    },
  }));
