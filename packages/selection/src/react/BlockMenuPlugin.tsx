import type { PluginConfig } from '@udecode/plate-common';

import { createTPlatePlugin } from '@udecode/plate-common/react';

import type { BlockSelectionConfig } from './BlockSelectionPlugin';

export const BLOCK_CONTEXT_MENU_ID = 'context';

type OpenId = (string & {}) | typeof BLOCK_CONTEXT_MENU_ID;

export type BlockMenuConfig = PluginConfig<
  'blockMenu',
  {
    position: {
      x: number;
      y: number;
    };
    openId: OpenId | null;
  },
  {
    blockMenu: BlockMenuApi;
  }
>;

export type BlockMenuApi = {
  hide: () => void;
  show: (id: OpenId, position?: { x: number; y: number }) => void;
};

export const BlockMenuPlugin = createTPlatePlugin<BlockMenuConfig>({
  key: 'blockMenu',
  options: {
    openId: null,
    position: {
      x: -10_000,
      y: -10_000,
    },
  },
})
  .extendApi<Partial<BlockMenuApi>>(({ setOption, setOptions }) => ({
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
  }))
  .extendApi(({ api, editor }) => ({
    showContextMenu: (blockId: string, position: { x: number; y: number }) => {
      editor
        .getApi<BlockSelectionConfig>({ key: 'blockSelection' })
        .blockSelection?.addSelectedRow(blockId);
      api.blockMenu.show(BLOCK_CONTEXT_MENU_ID, position);
    },
  }))
  .extend(({ api }) => ({
    handlers: {
      onMouseDown: ({ event, getOptions }) => {
        if (event.button === 0 && getOptions().openId) {
          event.preventDefault();
          api.blockMenu.hide();
        }
        if (event.button === 2) event.preventDefault();
      },
    },
  }));
