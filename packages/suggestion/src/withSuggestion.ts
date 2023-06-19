import {
  getNode,
  getPointAfter,
  getPointBefore,
  PlateEditor,
  removeNodes,
  setNodes,
  unsetNodes,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { deleteFragmentSuggestion } from './transforms/deleteFragmentSuggestion';
import { deleteSuggestion } from './transforms/deleteSuggestion';
import { insertFragmentSuggestion } from './transforms/insertFragmentSuggestion';
import { insertTextSuggestion } from './transforms/insertTextSuggestion';
import { getSuggestionId, getSuggestionKeys } from './utils/index';
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
  // eslint-disable-next-line unused-imports/no-unused-vars
  plugin: WithPlatePlugin<SuggestionPlugin, V, E>
) => {
  const editor = e as unknown as EE;

  const {
    normalizeNode,
    insertText,
    insertFragment,
    insertBreak,
    deleteBackward,
    deleteForward,
    deleteFragment,
  } = editor;

  editor.isSuggesting = false;

  editor.insertBreak = () => {
    if (editor.isSuggesting) {
      // TODO: split node
      insertTextSuggestion(editor, '\n');
      return;
    }

    insertBreak();
  };

  editor.insertText = (text) => {
    if (editor.isSuggesting) {
      insertTextSuggestion(editor, text);
      return;
    }

    insertText(text);
  };

  editor.insertFragment = (fragment) => {
    if (editor.isSuggesting) {
      insertFragmentSuggestion(editor, fragment, { insertFragment });
      return;
    }

    insertFragment(fragment);
  };

  editor.deleteFragment = (direction) => {
    if (editor.isSuggesting) {
      deleteFragmentSuggestion(editor, { reverse: true });
      return;
    }

    deleteFragment(direction);
  };

  editor.deleteBackward = (unit) => {
    if (editor.isSuggesting) {
      const selection = editor.selection!;
      const pointTarget = getPointBefore(editor, selection, {
        unit,
      });
      if (!pointTarget) return;

      deleteSuggestion(
        editor,
        { anchor: selection.anchor, focus: pointTarget },
        {
          reverse: true,
        }
      );

      return;
    }

    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    if (editor.isSuggesting) {
      const selection = editor.selection!;

      const pointTarget = getPointAfter(editor, selection, { unit });
      if (!pointTarget) return;

      deleteSuggestion(editor, {
        anchor: selection.anchor,
        focus: pointTarget,
      });

      return;
    }

    deleteForward(unit);
  };

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (node[MARK_SUGGESTION]) {
      const pointBefore = getPointBefore(editor, path);
      // Merge with previous suggestion
      if (pointBefore) {
        const nodeBefore = getNode(editor, pointBefore.path);
        if (
          (nodeBefore as any)?.[MARK_SUGGESTION] &&
          (nodeBefore as any)[KEY_SUGGESTION_ID] !== node[KEY_SUGGESTION_ID]
        ) {
          setNodes<TSuggestionText>(
            editor,
            { [KEY_SUGGESTION_ID]: (nodeBefore as any)[KEY_SUGGESTION_ID] },
            { at: path }
          );
          return;
        }
      }

      // Unset suggestion when there is no suggestion id
      if (!getSuggestionId(node)) {
        const keys = getSuggestionKeys(node);
        unsetNodes(editor, [MARK_SUGGESTION, 'suggestionDeletion', ...keys], {
          at: path,
        });
        return;
      }

      // Unset suggestion when there is no suggestion user id
      if (!getSuggestionKeys(node).length) {
        if (!node.suggestionDeletion) {
          // Remove additions
          removeNodes(editor, { at: path });
        } else {
          // Unset deletions
          unsetNodes(editor, [MARK_SUGGESTION, KEY_SUGGESTION_ID], {
            at: path,
          });
        }
        return;
      }
    }

    normalizeNode(entry);
  };

  return editor;
};

// editor.apply = (op) => {
//   if (editor.isSuggesting) {
//     if (op.type === 'insert_text') {
//       const { text, path, offset } = op;
//
//       const id = findSuggestionId(editor, { path, offset }) ?? nanoid();
//
//       // const node = getNode(editor, path) as TSuggestionText;
//       // if (node && node.suggestionId !== id) {
//       insertNodes<TSuggestionText>(
//         editor,
//         { text, [MARK_SUGGESTION]: true, [KEY_SUGGESTION_ID]: id },
//         {
//           at: {
//             path,
//             offset,
//           },
//           select: true,
//         }
//       );
//       return;
//       // }
//     }
//     if (op.type === 'insert_node') {
//       const { node, path } = op;
//
//       const suggestionNode = node as TSuggestionText;
//
//       if (
//         suggestionNode[MARK_SUGGESTION] &&
//         suggestionNode[KEY_SUGGESTION_ID] &&
//         !suggestionNode.suggestionDeletion
//       ) {
//         apply(op);
//         return;
//       }
//
//       if (!suggestionNode[MARK_SUGGESTION]) {
//         // Add suggestion mark
//         suggestionNode[MARK_SUGGESTION] = true;
//       }
//       if (suggestionNode.suggestionDeletion) {
//         // Remove suggestion deletion mark
//         delete suggestionNode.suggestionDeletion;
//       }
//
//       const id = findSuggestionId(editor, path) ?? nanoid();
//       suggestionNode[KEY_SUGGESTION_ID] = id;
//
//       insertNodes(editor, cloneDeep(node) as any, { at: path });
//       return;
//     }
//     if (op.type === 'remove_node') {
//       const { node } = op;
//
//       // additions are safe to remove
//       if (node[MARK_SUGGESTION]) {
//         if (!node.suggestionDeletion) {
//           apply(op);
//         }
//         return;
//       }
//
//       const path = findNodePath(editor, node);
//       if (!path) return;
//
//       const id = findSuggestionId(editor, path) ?? nanoid();
//
//       setSuggestionNodes(editor, {
//         at: path,
//         suggestionDeletion: true,
//         suggestionId: id,
//       });
//       // 💡 set instead of remove -> selection gets wrong
//       return;
//     }
//     if (op.type === 'remove_text') {
//       const { path, offset, text } = op;
//
//       const from = { path, offset };
//
//       const node = getNode<TText>(editor, path);
//       if (!node) return;
//
//       // additions are safe to remove
//       if (node[MARK_SUGGESTION] && !node.suggestionDeletion) {
//         apply(op);
//         return;
//       }
//
//       const to = {
//         path,
//         offset: offset + text.length,
//       };
//       const id =
//         findSuggestionId(editor, {
//           anchor: from,
//           focus: to,
//         }) ?? nanoid();
//
//       setSuggestionNodes(editor, {
//         at: {
//           anchor: from,
//           focus: to,
//         },
//         suggestionDeletion: true,
//         suggestionId: id,
//       });
//       // 💡 set instead of remove -> selection gets wrong
//       return;
//     }
//     if (op.type === 'move_node') {
//       const node = getNode(editor, op.path);
//       if (node && isBlock(editor, node) && !node[MARK_SUGGESTION]) {
//         // TODO: ?
//         return;
//       }
//     }
//     if (op.type === 'merge_node') {
//       const node = getNode(editor, op.path);
//       if (node && isBlock(editor, node)) {
//         // if (node && isBlock(editor, node) && !node[MARK_SUGGESTION]) {
//         // TODO: delete block suggestion
//         return;
//       }
//     }
//     if (op.type === 'split_node') {
//       const node = getNode(editor, op.path);
//       // allow splitting suggestion blocks
//       if (node && isBlock(editor, node) && !node[MARK_SUGGESTION]) {
//         // TODO: insert block suggestion
//         return;
//       }
//     }
//     if (op.type === 'set_selection') {
//       if (editor.preventSelection) {
//         return;
//       }
//     }
//   }
//
//   apply(op);
// };
