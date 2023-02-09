import {
  collapseSelection,
  getPointBefore,
  isExpanded,
  isInline,
  isText,
  moveSelection,
  nanoid,
  PlateEditor,
  setNodes,
  SetNodesOptions,
  unsetNodes,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { addSuggestionMark } from './transforms/addSuggestionMark';
import { getSuggestionId } from './utils/index';
import { KEY_SUGGESTION_ID, MARK_SUGGESTION } from './constants';
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

  const setSuggestionNodes = (options?: SetNodesOptions) => {
    setNodes<TSuggestionText>(
      editor,
      {
        [MARK_SUGGESTION]: true,
        [KEY_SUGGESTION_ID]: editor.activeSuggestionId ?? nanoid(),
      },
      {
        match: (n) => isText(n) || isInline(editor, n),
        split: true,
        ...options,
      }
    );
  };

  editor.deleteFragment = (direction) => {
    const selection = editor.selection!;

    if (isExpanded(selection)) {
      setSuggestionNodes();
      collapseSelection(editor);
      return;
    }

    deleteFragment(direction);
  };

  editor.deleteBackward = (unit) => {
    if (editor.isSuggesting) {
      const selection = editor.selection!;

      const pointBefore = getPointBefore(editor, selection, { unit });
      if (pointBefore) {
        setSuggestionNodes({
          at: {
            anchor: pointBefore,
            focus: selection.focus,
          },
        });
        moveSelection(editor, { reverse: true, unit });

        return;
      }
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
