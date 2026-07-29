import type {
  EditorNodeChangeContext,
  EditorTextChangeContext,
} from '@platejs/plite';
import { defineEditorExtension } from '@platejs/plite';

import type { BaseEditor } from '../../lib/editor';
import { getEditorPlugin } from '../../lib/plugin/getEditorPlugin';
import { getPlateRuntime } from './compilePlateModel';

type PlateNodeChangeCallback<E extends BaseEditor = BaseEditor> = (
  options: EditorNodeChangeContext<E>
) => void;

type PlateTextChangeCallback<E extends BaseEditor = BaseEditor> = (
  options: EditorTextChangeContext<E>
) => void;

type PlateChangeCallbacks<E extends BaseEditor = BaseEditor> = {
  onNodeChange?: PlateNodeChangeCallback<E>;
  onTextChange?: PlateTextChangeCallback<E>;
};

const PLATE_CHANGE_CALLBACKS = new WeakMap<
  BaseEditor,
  Set<PlateChangeCallbacks>
>();

export const subscribePlateChangeCallbacks = <E extends BaseEditor>(
  editor: E,
  callbacks: PlateChangeCallbacks<E>
) => {
  const listeners = PLATE_CHANGE_CALLBACKS.get(editor) ?? new Set();
  const { onNodeChange, onTextChange } = callbacks;
  const listener: PlateChangeCallbacks = {
    onNodeChange: onNodeChange
      ? (context) => onNodeChange(context as EditorNodeChangeContext<E>)
      : undefined,
    onTextChange: onTextChange
      ? (context) => onTextChange(context as EditorTextChangeContext<E>)
      : undefined,
  };

  listeners.add(listener);
  PLATE_CHANGE_CALLBACKS.set(editor, listeners);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      PLATE_CHANGE_CALLBACKS.delete(editor);
    }
  };
};

const getPlateChangeCallbacks = (editor: BaseEditor) =>
  PLATE_CHANGE_CALLBACKS.get(editor);

export const createPlateChangeHandlersExtension = (editor: BaseEditor) =>
  defineEditorExtension({
    name: 'plate:change-handlers',
    on: {
      nodeChange(context) {
        const callbacks = getPlateChangeCallbacks(editor);

        if (
          getPlateRuntime(editor).pluginCache.handlers.onNodeChange.length ===
            0 &&
          !callbacks?.size
        ) {
          return;
        }

        const change = {
          ...context,
          editor,
        } as EditorNodeChangeContext<BaseEditor>;
        getPlateRuntime(editor).pluginCache.handlers.onNodeChange.some(
          (key) => {
            const plugin = editor.getPlugin({ key });

            if (!plugin || editor.read.view.isReadOnly()) return false;

            const handler = plugin.handlers?.onNodeChange;
            if (!handler) return false;

            return (
              handler({
                ...getEditorPlugin(editor, plugin),
                ...change,
                editor,
                plugin,
                root: change.root === 'main' ? undefined : change.root,
              }) ?? false
            );
          }
        );

        for (const callback of callbacks ?? []) {
          callback.onNodeChange?.(change);
        }
      },
      textChange(context) {
        const callbacks = getPlateChangeCallbacks(editor);

        if (
          getPlateRuntime(editor).pluginCache.handlers.onTextChange.length ===
            0 &&
          !callbacks?.size
        ) {
          return;
        }

        const change = {
          ...context,
          editor,
        } as EditorTextChangeContext<BaseEditor>;
        getPlateRuntime(editor).pluginCache.handlers.onTextChange.some(
          (key) => {
            const plugin = editor.getPlugin({ key });

            if (!plugin || editor.read.view.isReadOnly()) return false;

            const handler = plugin.handlers?.onTextChange;
            if (!handler) return false;

            return (
              handler({
                ...getEditorPlugin(editor, plugin),
                ...change,
                editor,
                plugin,
                root: change.root === 'main' ? undefined : change.root,
              }) ?? false
            );
          }
        );

        for (const callback of callbacks ?? []) {
          callback.onTextChange?.(change);
        }
      },
    },
  });
