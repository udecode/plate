import {
  isExpanded,
  isInline,
  isText,
  PlateEditor,
  setNodes,
  unsetNodes,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { addSuggestionMark } from './transforms/addSuggestionMark';
import { getSuggestionId } from './utils/index';
import { MARK_SUGGESTION } from './constants';
import {
  SuggestionEditorProps,
  SuggestionPlugin,
  TSuggestionText,
} from './types';

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

  editor.deleteBackward = (unit) => {
    console.log('ab');
    if (editor.isSuggesting) {
      console.log('b');
      const selection = editor.selection!;

      if (isExpanded(selection)) {
        setNodes<TSuggestionText>(
          editor,
          { [MARK_SUGGESTION]: true },
          {
            match: (n) => isText(n) || isInline(editor, n),
          }
        );
        return;
        // addSuggestionMark();
      }

      // const pointBefore = getPointBefore(editor, selection, { unit });
      // const anchorPoint = selection.anchor;
      //
      // addSuggestionMark(editor);

      return;
    }

    console.log('..');

    deleteBackward(unit);
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
