import {
  type ExtendEditor,
  type SlateEditor,
  getNode,
  getPointAfter,
  getPointBefore,
  removeNodes,
  setNodes,
  unsetNodes,
} from '@udecode/plate-common';

import type { SuggestionEditorProps, TSuggestionText } from './types';

import { SUGGESTION_KEYS, SuggestionPlugin } from './SuggestionPlugin';
import { deleteFragmentSuggestion } from './transforms/deleteFragmentSuggestion';
import { deleteSuggestion } from './transforms/deleteSuggestion';
import { insertFragmentSuggestion } from './transforms/insertFragmentSuggestion';
import { insertTextSuggestion } from './transforms/insertTextSuggestion';
import { getSuggestionId, getSuggestionKeys } from './utils/index';

export const withSuggestion: ExtendEditor = ({ editor: e }) => {
  const editor = e as unknown as SlateEditor & SuggestionEditorProps;

  const {
    deleteBackward,
    deleteForward,
    deleteFragment,
    insertBreak,
    insertFragment,
    insertText,
    normalizeNode,
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

    if (node[SuggestionPlugin.key]) {
      const pointBefore = getPointBefore(editor, path);

      // Merge with previous suggestion
      if (pointBefore) {
        const nodeBefore = getNode(editor, pointBefore.path);

        if (
          (nodeBefore as any)?.[SuggestionPlugin.key] &&
          (nodeBefore as any)[SUGGESTION_KEYS.id] !== node[SUGGESTION_KEYS.id]
        ) {
          setNodes<TSuggestionText>(
            editor,
            { [SUGGESTION_KEYS.id]: (nodeBefore as any)[SUGGESTION_KEYS.id] },
            { at: path }
          );

          return;
        }
      }
      // Unset suggestion when there is no suggestion id
      if (!getSuggestionId(node)) {
        const keys = getSuggestionKeys(node);
        unsetNodes(
          editor,
          [SuggestionPlugin.key, 'suggestionDeletion', ...keys],
          {
            at: path,
          }
        );

        return;
      }
      // Unset suggestion when there is no suggestion user id
      if (getSuggestionKeys(node).length === 0) {
        if (node.suggestionDeletion) {
          // Unset deletions
          unsetNodes(editor, [SuggestionPlugin.key, SUGGESTION_KEYS.id], {
            at: path,
          });
        } else {
          // Remove additions
          removeNodes(editor, { at: path });
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
//         { text, [SuggestionPlugin.key]: true, [SUGGESTION_KEYS.id]: id },
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
//         suggestionNode[SuggestionPlugin.key] &&
//         suggestionNode[SUGGESTION_KEYS.id] &&
//         !suggestionNode.suggestionDeletion
//       ) {
//         apply(op);
//         return;
//       }
//
//       if (!suggestionNode[SuggestionPlugin.key]) {
//         // Add suggestion mark
//         suggestionNode[SuggestionPlugin.key] = true;
//       }
//       if (suggestionNode.suggestionDeletion) {
//         // Remove suggestion deletion mark
//         delete suggestionNode.suggestionDeletion;
//       }
//
//       const id = findSuggestionId(editor, path) ?? nanoid();
//       suggestionNode[SUGGESTION_KEYS.id] = id;
//
//       insertNodes(editor, cloneDeep(node) as any, { at: path });
//       return;
//     }
//     if (op.type === 'remove_node') {
//       const { node } = op;
//
//       // additions are safe to remove
//       if (node[SuggestionPlugin.key]) {
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
//       if (node[SuggestionPlugin.key] && !node.suggestionDeletion) {
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
//       if (node && isBlock(editor, node) && !node[SuggestionPlugin.key]) {
//         // TODO: ?
//         return;
//       }
//     }
//     if (op.type === 'merge_node') {
//       const node = getNode(editor, op.path);
//       if (node && isBlock(editor, node)) {
//         // if (node && isBlock(editor, node) && !node[SuggestionPlugin.key]) {
//         // TODO: delete block suggestion
//         return;
//       }
//     }
//     if (op.type === 'split_node') {
//       const node = getNode(editor, op.path);
//       // allow splitting suggestion blocks
//       if (node && isBlock(editor, node) && !node[SuggestionPlugin.key]) {
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
