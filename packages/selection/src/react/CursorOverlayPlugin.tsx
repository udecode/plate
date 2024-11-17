import { useEffect } from 'react';

import type { PluginConfig } from '@udecode/plate-common';

import {
  type DOMHandler,
  createTPlatePlugin,
  findEventRange,
  useEditorPlugin,
} from '@udecode/plate-common/react';

import type { CursorData, CursorState } from './types';

import { BlockSelectionPlugin } from './BlockSelectionPlugin';

export type CursorOverlayConfig = PluginConfig<
  'cursorOverlay',
  {
    cursors: Record<string, CursorState<CursorData>>;
  },
  {
    cursorOverlay: CursorOverlayApi;
  }
>;

type CursorOverlayApi = {
  addCursor: (id: string, cursor: Omit<CursorState<CursorData>, 'id'>) => void;
  removeCursor: (id: (string & {}) | 'drag' | 'selection') => void;
};

const getRemoveCursorHandler =
  (id: string): DOMHandler<CursorOverlayConfig> =>
  ({ api }) => {
    api.cursorOverlay.removeCursor(id);
  };

export const CursorOverlayPlugin = createTPlatePlugin<CursorOverlayConfig>({
  key: 'cursorOverlay',
  options: { cursors: {} },
})
  .extendApi<CursorOverlayApi>(({ editor, plugin }) => ({
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
  }))
  .extend(() => ({
    extendEditor: ({ api, editor, getOptions }) => {
      const { setSelection } = editor;

      editor.setSelection = (...args) => {
        if (getOptions().cursors?.selection) {
          setTimeout(() => {
            api.cursorOverlay.addCursor('selection', {
              selection: editor.selection,
            });
          }, 0);
        }

        setSelection(...args);
      };

      return editor;
    },
    useHooks: ({ api, setOption }) => {
      const { editor } = useEditorPlugin(BlockSelectionPlugin);
      const isSelecting = editor.useOption(BlockSelectionPlugin, 'isSelecting');

      useEffect(() => {
        if (isSelecting) {
          setTimeout(() => {
            api.cursorOverlay.removeCursor('selection');
          }, 0);
        }
      }, [isSelecting, setOption, api.cursorOverlay]);
    },
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
      onDragEnd: getRemoveCursorHandler('drag') as any,
      onDragLeave: getRemoveCursorHandler('drag') as any,
      onDragOver: ({ api, editor, event }) => {
        if (
          !editor.plugins.dnd ||
          editor.getOptions({ key: 'dnd' }).isDragging
        ) {
          return;
        }

        const types = event.dataTransfer?.types || [];

        if (types.some((type) => type.startsWith('Files'))) return;

        const range = findEventRange(editor, event);

        if (!range) return;

        api.cursorOverlay.addCursor('drag', {
          selection: range,
        });
      },
      onDrop: getRemoveCursorHandler('drag') as any,
      onFocus: getRemoveCursorHandler('selection') as any,
    },
  }));
