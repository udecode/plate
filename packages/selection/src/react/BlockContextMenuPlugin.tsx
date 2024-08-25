import type { PluginConfig } from '@udecode/plate-common';

import { createTPlatePlugin } from '@udecode/plate-common/react';

export type BlockContextMenuConfig = PluginConfig<
  'blockContextMenu',
  {
    action: {
      group: null | string;
      value: null | string;
    } | null;
    anchorRect: { x: number; y: number };
    openEditorId: null | string;
    store: any | null;
  },
  {
    blockContextMenu: BlockContextMenuApi;
  }
>;

export type BlockContextMenuApi = {
  hide: () => void;
  reset: () => void;
  show: (
    editorId: string,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
};

export const BlockContextMenuPlugin =
  createTPlatePlugin<BlockContextMenuConfig>({
    key: 'blockContextMenu',
    options: {
      action: { group: null, value: null },
      anchorRect: { x: 0, y: 0 },
      openEditorId: null,
      store: null,
    },
  })
    .extendApi<Partial<BlockContextMenuApi>>(({ getOptions, setOptions }) => ({
      hide: () => {
        setOptions({
          anchorRect: { x: 0, y: 0 },
          openEditorId: null,
        });
      },
      reset: () => {
        setOptions({ anchorRect: { x: 0, y: 0 } });
      },
      show: (
        editorId: string,
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
      ) => {
        const { store } = getOptions();
        setOptions({
          anchorRect: { x: event.clientX, y: event.clientY },
          openEditorId: editorId,
        });

        if (store) {
          store.show();
          store.setAutoFocusOnShow(true);
          store.setInitialFocus('first');
        }
      },
    }))
    .extendOptions(({ getOptions }) => ({
      isOpen: (editorId: string) => getOptions().openEditorId === editorId,
    }))
    .extend(({ api }) => ({
      handlers: {
        onMouseDown: ({ editor, event, getOption }) => {
          if (event.button === 0 && getOption('isOpen', editor.id)) {
            event.preventDefault();
            api.blockContextMenu.hide();
          }
          if (event.button === 2) event.preventDefault();
        },
      },
    }));
