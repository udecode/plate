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
  TNodeProps,
  unsetNodes,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { MoveUnit } from 'slate/dist/interfaces/types';
import { addSuggestionMark } from './transforms/addSuggestionMark';
import { getSuggestionId } from './utils/index';
import { KEY_SUGGESTION_ID, MARK_SUGGESTION } from './constants';
import {
  SuggestionEditorProps,
  SuggestionPlugin,
  TSuggestionText,
} from './types';

export const setSuggestionNodes = <V extends Value = Value>(
  editor: PlateEditor<V> & SuggestionEditorProps,
  options?: SetNodesOptions & {
    suggestionDeletion?: boolean;
  }
) => {
  const props: TNodeProps<TSuggestionText> = {
    [MARK_SUGGESTION]: true,
    [KEY_SUGGESTION_ID]: editor.activeSuggestionId ?? nanoid(),
  };
  if (options?.suggestionDeletion) {
    props.suggestionDeletion = true;
  }

  setNodes<TSuggestionText>(editor, props, {
    match: (n) => isText(n) || isInline(editor, n),
    split: true,
    ...options,
  });
};

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

  editor.deleteFragment = (direction) => {
    const selection = editor.selection!;

    if (isExpanded(selection)) {
      setSuggestionNodes(editor, {
        suggestionDeletion: true,
      });
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
        setSuggestionNodes(editor, {
          at: {
            anchor: pointBefore,
            focus: selection.focus,
          },
          suggestionDeletion: true,
        });
        moveSelection(editor, { reverse: true, unit: unit as MoveUnit });

        return;
      }
    }

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
