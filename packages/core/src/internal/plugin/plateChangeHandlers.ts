import type { Descendant, NodeOperation, TextOperation } from '@platejs/plite';
import { defineEditorExtension } from '@platejs/plite';

import type { BaseEditor } from '../../lib/editor';
import { pipeOnNodeChange } from '../../lib/utils/pipeOnNodeChange';
import { pipeOnTextChange } from '../../lib/utils/pipeOnTextChange';

type PlateNodeChangeCallback = (options: {
  editor: BaseEditor;
  node: Descendant;
  operation: NodeOperation;
  prevNode: Descendant;
}) => void;

type PlateTextChangeCallback = (options: {
  editor: BaseEditor;
  node: Descendant;
  operation: TextOperation;
  prevText: string;
  text: string;
}) => void;

type PlateChangeCallbacks = {
  onNodeChange?: PlateNodeChangeCallback | null;
  onTextChange?: PlateTextChangeCallback | null;
};

const PLATE_CHANGE_CALLBACKS = new WeakMap<BaseEditor, PlateChangeCallbacks>();

export const setPlateChangeCallbacks = (
  editor: BaseEditor,
  callbacks: PlateChangeCallbacks
) => {
  PLATE_CHANGE_CALLBACKS.set(editor, callbacks);
};

const getPlateChangeCallbacks = (editor: BaseEditor): PlateChangeCallbacks =>
  PLATE_CHANGE_CALLBACKS.get(editor) ?? {};

export const createPlateChangeHandlersExtension = (editor: BaseEditor) =>
  defineEditorExtension({
    name: 'plate:change-handlers',
    onNodeChange({ node, operation, prevNode }) {
      if (
        editor.runtime.pluginCache.handlers.onNodeChange.length === 0 &&
        !getPlateChangeCallbacks(editor).onNodeChange
      ) {
        return;
      }

      const handled = pipeOnNodeChange(editor, node, prevNode, operation);

      if (handled) return;

      getPlateChangeCallbacks(editor).onNodeChange?.({
        editor,
        node,
        operation,
        prevNode,
      });
    },
    onTextChange({ node, operation, prevText, text }) {
      if (
        editor.runtime.pluginCache.handlers.onTextChange.length === 0 &&
        !getPlateChangeCallbacks(editor).onTextChange
      ) {
        return;
      }

      const handled = pipeOnTextChange(editor, node, text, prevText, operation);

      if (handled) return;

      getPlateChangeCallbacks(editor).onTextChange?.({
        editor,
        node,
        operation,
        prevText,
        text,
      });
    },
  });
