import { useEffect } from 'react';

import type { PluginConfig } from '@platejs/core';
import { getPlateRuntime } from '@platejs/core/internal';

import {
  type DOMHandler,
  createPlatePlugin,
  usePluginStore,
} from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import type { CursorData, CursorState } from './types';

import { BlockSelectionPlugin } from './BlockSelectionPlugin';

export type CursorOverlayConfig = PluginConfig<
  'cursorOverlay',
  {
    cursors: Record<string, CursorState<CursorData>>;
  },
  {},
  {},
  {},
  {},
  readonly [],
  never,
  {
    addCursor: (
      id: string,
      cursor: Omit<CursorState<CursorData>, 'id'>
    ) => void;
    removeCursor: (id: (string & {}) | 'drag' | 'selection') => void;
  }
>;

const getRemoveCursorHandler =
  (id: string): DOMHandler<CursorOverlayConfig> =>
  ({ api }) => {
    api.removeCursor(id);
  };

export const CursorOverlayPlugin = createPlatePlugin<CursorOverlayConfig>({
  api: ({ store }) => ({
    addCursor: (id, cursor) => {
      const newCursors = { ...store.get().cursors };
      newCursors[id] = {
        id,
        ...cursor,
      };
      store.set({ cursors: newCursors });
    },
    removeCursor: (id) => {
      const newCursors = { ...store.get().cursors };

      if (!newCursors[id]) return;

      delete newCursors[id];
      store.set({ cursors: newCursors });
    },
  }),
  extension: ({ api, editor, store }) => {
    const refreshSelectionCursor = () => {
      if (!store.get().cursors?.selection) return;

      setTimeout(() => {
        api.addCursor('selection', {
          selection: editor.read.selection(),
        });
      }, 0);
    };

    return {
      onCommit({ commit }) {
        if (commit.selectionChanged) refreshSelectionCursor();
      },
    };
  },
  handlers: {
    onBlur: ({ api, editor, event }) => {
      if (!editor.read.selection()) return;

      const relatedTarget = event.relatedTarget as HTMLElement;
      const enabled = relatedTarget?.dataset?.plateFocus === 'true';

      if (!enabled) return;

      api.addCursor('selection', {
        selection: editor.read.selection(),
      });
    },
    onDragEnd: getRemoveCursorHandler('drag') as any,
    onDragLeave: getRemoveCursorHandler('drag') as any,
    onDragOver: ({ api, editor, event }) => {
      if (
        !getPlateRuntime(editor).plugins.dnd ||
        editor.plugin({ key: KEYS.dnd }).store.get().isDragging
      ) {
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
    onDrop: getRemoveCursorHandler('drag') as any,
    onFocus: getRemoveCursorHandler('selection') as any,
  },
  key: KEYS.cursorOverlay,
  initialState: { cursors: {} },

  editOnly: {
    render: false,
  },
  useHooks: ({ api, store }) => {
    const isSelecting = usePluginStore(BlockSelectionPlugin, 'isSelecting');

    useEffect(() => {
      if (isSelecting) {
        setTimeout(() => {
          api.removeCursor('selection');
        }, 0);
      }
    }, [isSelecting, store, api]);
  },
});
