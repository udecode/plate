import {
  PlateEditor,
  unsetNodes,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { addSuggestionMark } from './transforms/addSuggestionMark';
import { getSuggestionId } from './utils/index';
import { MARK_SUGGESTION } from './constants';
import { SuggestionEditorProps, SuggestionPlugin } from './types';

export const withSuggestion = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
  EE extends E & SuggestionEditorProps = E & SuggestionEditorProps
>(
  e: E,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  plugin: WithPlatePlugin<SuggestionPlugin, V, E>
) => {
  const editor = e as EE;

  const {
    apply,
    normalizeNode,
    insertText,
    deleteBackward,
    deleteForward,
    deleteFragment,
  } = editor;

  editor.isSuggesting = true;

  editor.insertText = (text) => {
    // TODO:
    if (editor.isSuggesting) {
      addSuggestionMark(editor);
    }

    insertText(text);
  };

  // editor.deleteBackward = (unit) => {
  //   if (editor.isSuggesting) {
  //     const a = getPointBefore(editor, editor.selection, {});
  //
  //     addSuggestionMark(editor);
  //
  //     return;
  //   }
  //
  //   deleteBackward(unit);
  // };

  editor.apply = (op) => {
    if (op.type === 'insert_text') {
    }

    apply(op);
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Unset MARK_SUGGESTION prop when there is no suggestion id
    if (node[MARK_SUGGESTION]) {
      if (!getSuggestionId(node)) {
        unsetNodes(editor, MARK_SUGGESTION, { at: path });
        return;
      }
    }

    normalizeNode(entry);
  };

  return editor;
};
