import { definePlatePlugin } from '@platejs/core/react';

import type { CursorData, CursorState } from './types';

type CursorOverlayPluginState = {
  cursors: Record<string, CursorState<CursorData>>;
};

const initialState: CursorOverlayPluginState = { cursors: {} };

export const CursorOverlayPlugin = definePlatePlugin('cursorOverlay', {
  api: ({ store }) => ({
    addCursor: (id: string, cursor: CursorState<CursorData>) => {
      const cursors = { ...store.get().cursors, [id]: cursor };

      store.set({ cursors });
    },
    removeCursor: (id: string) => {
      const cursors = { ...store.get().cursors };

      if (!cursors[id]) return;

      delete cursors[id];
      store.set({ cursors });
    },
  }),
  editOnly: {
    render: false,
  },
  initialState,
}).extend(({ api }) => ({
  on: {
    blur: ({ editor, event }) => {
      const selection = editor.read.selection();

      if (!selection) return;

      const enabled =
        event.relatedTarget instanceof HTMLElement &&
        event.relatedTarget.dataset.plateFocus === 'true';

      if (!enabled) return;

      api.addCursor('selection', {
        selection,
      });
    },
    dragEnd: () => {
      api.removeCursor('drag');
    },
    dragLeave: () => {
      api.removeCursor('drag');
    },
    dragOver: ({ editor, event }) => {
      const dnd = editor.plugin('dnd');

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
    mouseDown: ({ event }) => {
      if (event.button !== 0 || !(event.target instanceof HTMLElement)) return;

      const editable = event.target.closest('[contenteditable="true"]');

      if (!editable || editable === event.currentTarget) return;

      api.removeCursor('selection');
    },
    commit({ commit, editor, store }) {
      if (
        !store.get().cursors.selection ||
        (!commit.selectionChanged && !commit.changed.hasAny('document'))
      ) {
        return;
      }

      setTimeout(() => {
        const cursor = store.get().cursors.selection;

        if (!cursor) return;
        const selection = editor.read.selection();

        api.addCursor('selection', {
          ...cursor,
          selection,
        });
      }, 0);
    },
  },
}));
