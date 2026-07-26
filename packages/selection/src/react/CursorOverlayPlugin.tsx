import { useEffect } from 'react';

import type { PluginConfig } from '@platejs/core';
import { getPlateRuntime } from '@platejs/core/internal';

import {
  type DOMHandler,
  createPlatePlugin,
  usePluginOption,
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
  api: ({ editor, plugin }) => ({
    addCursor: (id, cursor) => {
      const newCursors = { ...editor.plugin(plugin).getOptions().cursors };
      newCursors[id] = {
        id,
        ...cursor,
      };
      editor.plugin(plugin).setOption('cursors', newCursors);
    },
    removeCursor: (id) => {
      const newCursors = { ...editor.plugin(plugin).getOptions().cursors };

      if (!newCursors[id]) return;

      delete newCursors[id];
      editor.plugin(plugin).setOption('cursors', newCursors);
    },
  }),
  extension: ({ api, editor, getOptions }) => {
    const refreshSelectionCursor = () => {
      if (!getOptions().cursors?.selection) return;

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
        editor.plugin({ key: KEYS.dnd }).getOptions().isDragging
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
  options: { cursors: {} },

  editOnly: {
    render: false,
  },
  useHooks: ({ api, setOption }) => {
    const isSelecting = usePluginOption(BlockSelectionPlugin, 'isSelecting');

    useEffect(() => {
      if (isSelecting) {
        setTimeout(() => {
          api.removeCursor('selection');
        }, 0);
      }
    }, [isSelecting, setOption, api]);
  },
});
