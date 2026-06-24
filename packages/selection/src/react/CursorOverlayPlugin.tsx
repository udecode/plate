import { useEffect } from 'react';

import type { PluginConfig } from 'platejs';

import { KEYS } from 'platejs';
import { createTPlatePlugin, usePluginOption } from 'platejs/react';

import type { CursorData, CursorState } from './types';

import { BlockSelectionPlugin } from './BlockSelectionPlugin';

export type CursorOverlayConfig = PluginConfig<
  'cursorOverlay',
  {
    cursors: Record<string, CursorState<CursorData>>;
  },
  {
    cursorOverlay: {
      addCursor: (
        id: string,
        cursor: Omit<CursorState<CursorData>, 'id'>
      ) => void;
      removeCursor: (id: (string & {}) | 'drag' | 'selection') => void;
    };
  }
>;

const getRemoveCursorHandler =
  (id: string) =>
  ({ api }: { api: Pick<CursorOverlayConfig['api'], 'cursorOverlay'> }) => {
    api.cursorOverlay.removeCursor(id);
  };

export const CursorOverlayPlugin = createTPlatePlugin<CursorOverlayConfig>({
  key: KEYS.cursorOverlay,
  editOnly: {
    render: false,
  },
  options: { cursors: {} },
})
  .extendApi<CursorOverlayConfig['api']['cursorOverlay']>(
    ({ editor, plugin }) => ({
      addCursor: (id, cursor) => {
        const newCursors = { ...editor.getOptions(plugin).cursors };
        newCursors[id] = {
          id,
          ...cursor,
        };
        editor.setOption(plugin, 'cursors', newCursors);
      },
      removeCursor: (id) => {
        const newCursors = { ...editor.getOptions(plugin).cursors };

        if (!newCursors[id]) return;

        delete newCursors[id];
        editor.setOption(plugin, 'cursors', newCursors);
      },
    })
  )
  .extend(() => ({
    handlers: {
      onBlur: ({ api, editor, event }) => {
        if (!editor.selection) return;

        const relatedTarget = event.relatedTarget as HTMLElement;
        const enabled = relatedTarget?.dataset?.plateFocus === 'true';

        if (!enabled) return;

        api.cursorOverlay.addCursor('selection', {
          selection: editor.selection,
        });
      },
      onDragEnd: getRemoveCursorHandler('drag'),
      onDragLeave: getRemoveCursorHandler('drag'),
      onDragOver: ({ api, editor, event }) => {
        if (
          !editor.plugins.dnd ||
          editor.getOptions({ key: KEYS.dnd }).isDragging
        ) {
          return;
        }

        const types = event.dataTransfer?.types || [];

        if (types.some((type) => type.startsWith('Files'))) return;

        const range = editor.api.findEventRange(event);

        if (!range) return;

        api.cursorOverlay.addCursor('drag', {
          selection: range,
        });
      },
      onDrop: getRemoveCursorHandler('drag'),
      onFocus: getRemoveCursorHandler('selection'),
    },
    useHooks: ({ api, setOption }) => {
      const isSelecting = usePluginOption(BlockSelectionPlugin, 'isSelecting');

      useEffect(() => {
        if (isSelecting) {
          setTimeout(() => {
            api.cursorOverlay.removeCursor('selection');
          }, 0);
        }
      }, [isSelecting, setOption, api.cursorOverlay]);
    },
  }));
