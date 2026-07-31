import type { DefinitionOf } from '@platejs/core';

import type { CursorData, CursorState } from '@platejs/cursor';
import { createPlatePlugin } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import { useCursorOverlayPlugin } from './useCursorOverlay';

export type CursorOverlayPluginState = {
  cursors: Record<string, CursorState<CursorData>>;
};

const initialState: CursorOverlayPluginState = { cursors: {} };

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
  name: KEYS.cursorOverlay,
  initialState,
  useHooks: useCursorOverlayPlugin,
}).extend(({ api }) => ({
  on: {
    blur: ({ editor, event }) => {
      if (!editor.read.selection()) return;

      const enabled =
        event.relatedTarget instanceof HTMLElement &&
        event.relatedTarget.dataset.plateFocus === 'true';

      if (!enabled) return;

      api.addCursor('selection', {
        selection: editor.read.selection(),
      });
    },
    dragEnd: () => {
      api.removeCursor('drag');
    },
    dragLeave: () => {
      api.removeCursor('drag');
    },
    dragOver: ({ editor, event }) => {
      const dnd = editor.plugin(KEYS.dnd);

      if (!dnd.installed || document.body.classList.contains('dragging')) {
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
    drop: () => {
      api.removeCursor('drag');
    },
    focus: () => {
      api.removeCursor('selection');
    },
    commit({ commit, editor, store }) {
      if (commit.selectionChanged && store.get().cursors?.selection) {
        setTimeout(() => {
          api.addCursor('selection', {
            selection: editor.read.selection(),
          });
        }, 0);
      }
    },
  },
}));

export type CursorOverlayDefinition = DefinitionOf<typeof CursorOverlayPlugin>;
