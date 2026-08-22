import type {
  EditorNodeChangeContext,
  EditorTextChangeContext,
} from '@platejs/plite';
import { defineExtension } from '@platejs/plite';
import { failInvariant } from '@platejs/plite/internal';

import type { BaseEditor } from '../../lib/editor';
import { createPluginContext } from '../../lib/plugin/createPluginContext.internal';
import { getCompiledPlatePlugin, getPlateRuntime } from './compilePlateModel';

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
  const { onNodeChange, onTextChange } = callbacks;

  if (!onNodeChange && !onTextChange) return () => {};

  const listeners = PLATE_CHANGE_CALLBACKS.get(editor) ?? new Set();
  const listener: PlateChangeCallbacks = {
    onNodeChange: onNodeChange
      ? (context) => {
          onNodeChange(context as EditorNodeChangeContext<E>);
        }
      : undefined,
    onTextChange: onTextChange
      ? (context) => {
          onTextChange(context as EditorTextChangeContext<E>);
        }
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
  defineExtension('plate:change-handlers', {
    on: {
      nodeChange(context) {
        const callbacks = getPlateChangeCallbacks(editor);

        if (
          getPlateRuntime(editor).pluginCache.on.nodeChange.length === 0 &&
          !callbacks?.size
        ) {
          return;
        }

        const change = {
          ...context,
          editor,
        } as EditorNodeChangeContext<BaseEditor>;
        getPlateRuntime(editor).pluginCache.on.nodeChange.forEach((name) => {
          const plugin =
            getCompiledPlatePlugin(editor, name) ??
            failInvariant('Expected value to be defined');

          if (!plugin) return;

          const handler = plugin.on?.nodeChange;
          if (!handler) return;

          Reflect.apply(handler, undefined, [
            {
              ...createPluginContext(editor, plugin),
              ...change,
              editor,
              plugin,
              root: change.root === 'main' ? undefined : change.root,
            },
          ]);
        });

        for (const callback of callbacks ?? []) {
          callback.onNodeChange?.(change);
        }
      },
      textChange(context) {
        const callbacks = getPlateChangeCallbacks(editor);

        if (
          getPlateRuntime(editor).pluginCache.on.textChange.length === 0 &&
          !callbacks?.size
        ) {
          return;
        }

        const change = {
          ...context,
          editor,
        } as EditorTextChangeContext<BaseEditor>;
        getPlateRuntime(editor).pluginCache.on.textChange.forEach((name) => {
          const plugin =
            getCompiledPlatePlugin(editor, name) ??
            failInvariant('Expected value to be defined');

          if (!plugin) return;

          const handler = plugin.on?.textChange;
          if (!handler) return;

          Reflect.apply(handler, undefined, [
            {
              ...createPluginContext(editor, plugin),
              ...change,
              editor,
              plugin,
              root: change.root === 'main' ? undefined : change.root,
            },
          ]);
        });

        for (const callback of callbacks ?? []) {
          callback.onTextChange?.(change);
        }
      },
    },
  });
