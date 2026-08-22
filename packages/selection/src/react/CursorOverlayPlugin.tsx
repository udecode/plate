import type { DefinitionOf } from '@platejs/core';
import { definePlatePlugin } from '@platejs/core/react';
import type { CursorData, CursorState } from '@platejs/cursor';
import { PLUGINS } from '@platejs/utils';

import { useCursorOverlayPlugin } from './useCursorOverlay.internal';

export type CursorOverlayPluginState = {
  cursors: Record<string, CursorState<CursorData>>;
};

const initialState: CursorOverlayPluginState = { cursors: {} };

export const CursorOverlayPlugin = definePlatePlugin(PLUGINS.cursorOverlay, {
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
      const dnd = editor.plugin(PLUGINS.dnd);

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
          selection: selection ? { ...selection } : null,
        });
      }, 0);
    },
  },
}));

export type CursorOverlayDefinition = DefinitionOf<typeof CursorOverlayPlugin>;
