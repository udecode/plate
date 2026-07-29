import type { InferConfig, PluginConfig } from '@platejs/core';

import type { CursorData, CursorState } from '@platejs/cursor';
import { createPlatePlugin } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import { useCursorOverlayPlugin } from './useCursorOverlay';

export type CursorOverlayPluginState = {
  cursors: Record<string, CursorState<CursorData>>;
};

const initialState: CursorOverlayPluginState = { cursors: {} };

type DndConfig = PluginConfig<typeof KEYS.dnd, { isDragging: boolean }>;

export const CursorOverlayPlugin = createPlatePlugin({
  api: ({ store }) => ({
    addCursor: (id: string, cursor: CursorState<CursorData>) => {
      const newCursors = { ...store.get().cursors };
      newCursors[id] = cursor;
      store.set({ cursors: newCursors });
    },
    removeCursor: (id: (string & {}) | 'drag' | 'selection') => {
      const newCursors = { ...store.get().cursors };

      if (!newCursors[id]) return;

      delete newCursors[id];
      store.set({ cursors: newCursors });
    },
  }),
  editOnly: {
    render: false,
  },
  key: KEYS.cursorOverlay,
  initialState,
}).extend(({ api, editor, store }) => ({
  extension: {
    on: {
      commit({ commit }) {
        if (commit.selectionChanged && store.get().cursors?.selection) {
          setTimeout(() => {
            api.addCursor('selection', {
              selection: editor.read.selection(),
            });
          }, 0);
        }
      },
    },
  },
  handlers: {
    onBlur: ({ api, editor, event }) => {
      if (!editor.read.selection()) return;

      const enabled =
        event.relatedTarget instanceof HTMLElement &&
        event.relatedTarget.dataset.plateFocus === 'true';

      if (!enabled) return;

      api.addCursor('selection', {
        selection: editor.read.selection(),
      });
    },
    onDragEnd: () => {
      api.removeCursor('drag');
    },
    onDragLeave: () => {
      api.removeCursor('drag');
    },
    onDragOver: ({ api, editor, event }) => {
      const dnd = editor.plugin<DndConfig>({ key: KEYS.dnd });

      if (!dnd.installed || dnd.store.get('isDragging')) {
        return;
      }

      const types = event.dataTransfer?.types || [];

      if (types.some((type) => type.startsWith('Files'))) return;

      const range = editor.api.dom.resolveEventRange(event);

      if (!range) return;

      api.addCursor('drag', {
        selection: range,
      });
    },
    onDrop: () => {
      api.removeCursor('drag');
    },
    onFocus: () => {
      api.removeCursor('selection');
    },
  },

  useHooks: useCursorOverlayPlugin,
}));

export type CursorOverlayConfig = InferConfig<typeof CursorOverlayPlugin>;
