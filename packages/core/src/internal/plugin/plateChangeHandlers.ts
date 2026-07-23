import type {
  EditorNodeChangeContext,
  EditorTextChangeContext,
} from '@platejs/plite';
import { defineEditorExtension } from '@platejs/plite';

import type { BaseEditor } from '../../lib/editor';
import { pipeOnNodeChange } from '../../lib/utils/pipeOnNodeChange';
import { pipeOnTextChange } from '../../lib/utils/pipeOnTextChange';
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
    onNodeChange(context) {
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
      pipeOnNodeChange(editor, change);

      for (const callback of callbacks ?? []) {
        callback.onNodeChange?.(change);
      }
    },
    onTextChange(context) {
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
      pipeOnTextChange(editor, change);

      for (const callback of callbacks ?? []) {
        callback.onTextChange?.(change);
      }
    },
  });
