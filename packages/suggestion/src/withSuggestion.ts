import {
  addRangeMark,
  collapseSelection,
  findNode,
  getEditorString,
  getNodeEntries,
  getPointBefore,
  isExpanded,
  isInline,
  moveSelection,
  nanoid,
  PlateEditor,
  setNodes,
  SetNodesOptions,
  TNodeProps,
  unsetNodes,
  Value,
  withoutNormalizing,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { Point, Range } from 'slate';
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
    suggestionId?: string;
  }
) => {
  const { at = editor.selection, suggestionId = nanoid() } = options ?? {};

  if (!Range.isRange(at)) return;

  // TODO: get all inline nodes to be set
  const _nodeEntries = getNodeEntries(editor, {
    match: (n) => isInline(editor, n),
    ...options,
  });
  const nodeEntries = [..._nodeEntries];

  withoutNormalizing(editor, () => {
    const props: TNodeProps<TSuggestionText> = {
      [MARK_SUGGESTION]: true,
      [KEY_SUGGESTION_ID]: editor.activeSuggestionId ?? suggestionId,
    };
    if (options?.suggestionDeletion) {
      props.suggestionDeletion = true;
    }

    addRangeMark(editor, props, {
      at,
    });

    nodeEntries.forEach(([, path]) => {
      // const node = _node as TSuggestionText;
      // if (!node[KEY_SUGGESTION_ID]) {
      //   node[KEY_SUGGESTION_ID] = editor.activeSuggestionId ?? nanoid();
      // }
      // if (node[MARK_SUGGESTION]) {
      //   if (node[KEY_SUGGESTION_ID] === props[KEY_SUGGESTION_ID]) {
      //     return;
      //   }
      // }

      setNodes<TSuggestionText>(
        editor,
        { ...props },
        {
          at: path,
          match: (n) => {
            if (!isInline(editor, n)) return false;

            // if (n[MARK_SUGGESTION]) {
            // }

            return true;
          },
          ...options,
        }
      );
    });
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
    // deleteForward,
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
      collapseSelection(editor, { edge: 'start' });
      return;
    }

    deleteFragment(direction);
  };

  editor.deleteBackward = (unit) => {
    if (editor.isSuggesting) {
      const selection = editor.selection!;

      withoutNormalizing(editor, () => {
        const pointTarget = getPointBefore(editor, selection, { unit });
        if (!pointTarget) return;

        // delete one character at a time until target point is reached
        let pointCurrent: Point | undefined;
        while (true) {
          pointCurrent = editor.selection?.anchor;
          if (!pointCurrent) break;

          const str = getEditorString(editor, {
            anchor: pointTarget,
            focus: pointCurrent,
          });
          if (str.length === 0) break;

          const pointBefore = getPointBefore(editor, pointCurrent);
          if (!pointBefore) break;

          const at = {
            anchor: pointBefore,
            focus: pointCurrent,
          };

          const entry = findNode<TSuggestionText>(editor, {
            at,
            match: (n) => !!n[MARK_SUGGESTION] && !n.suggestionDeletion,
          });
          if (entry) {
            // delete suggestion additions only
            deleteBackward('character');
            continue;
          }

          setSuggestionNodes(editor, {
            at,
            suggestionDeletion: true,
          });
          moveSelection(editor, {
            reverse: true,
            unit: 'character',
          });
          // hack to get in the correct path
          moveSelection(editor, {
            reverse: true,
            unit: 'character',
          });
          moveSelection(editor, {
            unit: 'character',
          });
        }
      });

      return;
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
