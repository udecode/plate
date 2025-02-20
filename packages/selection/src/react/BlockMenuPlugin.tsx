import type { PluginConfig } from '@udecode/plate';

import { createTPlatePlugin } from '@udecode/plate/react';

import type { BlockSelectionConfig } from './BlockSelectionPlugin';

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
  {
    blockMenu: {
      hide: () => void;
      show: (id: OpenId, position?: { x: number; y: number }) => void;
      showContextMenu: (
        blockId: string,
        position: { x: number; y: number }
      ) => void;
    };
  }
>;

type OpenId = (string & {}) | typeof BLOCK_CONTEXT_MENU_ID;

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
  .extendApi<Partial<BlockMenuConfig['api']['blockMenu']>>(
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
  .extendApi<Partial<BlockMenuConfig['api']['blockMenu']>>(
    ({ api, editor }) => ({
      showContextMenu: (blockId, position) => {
        editor
          .getApi<BlockSelectionConfig>({ key: 'blockSelection' })
          .blockSelection?.set(blockId);
        api.blockMenu.show(BLOCK_CONTEXT_MENU_ID, position);
      },
    })
  )
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
