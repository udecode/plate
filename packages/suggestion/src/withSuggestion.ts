import {
  findNodePath,
  getNode,
  insertNodes,
  isBlock,
  nanoid,
  PlateEditor,
  TText,
  unsetNodes,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { cloneDeep } from 'lodash';
import { getSuggestionId } from './utils/index';
import { KEY_SUGGESTION_ID, MARK_SUGGESTION } from './constants';
import { findSuggestionId } from './findSuggestionId';
import { setSuggestionNodes } from './setSuggestionNodes';
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
    apply,
    normalizeNode,
    insertFragment,
    deleteBackward,
    // deleteForward,
    // deleteFragment,
  } = editor;

  editor.isSuggesting = true;

  editor.apply = (op) => {
    if (editor.isSuggesting) {
      console.log(op);
      if (op.type === 'insert_text') {
        const { text, path, offset } = op;

        const id = findSuggestionId(editor, { path, offset }) ?? nanoid();

        // const node = getNode(editor, path) as TSuggestionText;
        // if (node && node.suggestionId !== id) {
        insertNodes<TSuggestionText>(
          editor,
          { text, [MARK_SUGGESTION]: true, [KEY_SUGGESTION_ID]: id },
          {
            at: {
              path,
              offset,
            },
            select: true,
          }
        );
        return;
        // }
      }
      if (op.type === 'insert_node') {
        const { node, path } = op;

        const suggestionNode = node as TSuggestionText;

        if (
          suggestionNode[MARK_SUGGESTION] &&
          suggestionNode[KEY_SUGGESTION_ID] &&
          !suggestionNode.suggestionDeletion
        ) {
          apply(op);
          return;
        }

        if (!suggestionNode[MARK_SUGGESTION]) {
          // Add suggestion mark
          suggestionNode[MARK_SUGGESTION] = true;
        }
        if (suggestionNode.suggestionDeletion) {
          // Remove suggestion deletion mark
          delete suggestionNode.suggestionDeletion;
        }

        const id = findSuggestionId(editor, path) ?? nanoid();
        suggestionNode[KEY_SUGGESTION_ID] = id;

        insertNodes(editor, cloneDeep(node) as any, { at: path });
        return;
      }
      if (op.type === 'remove_node') {
        const { node } = op;

        // additions are safe to remove
        if (node[MARK_SUGGESTION]) {
          if (!node.suggestionDeletion) {
            apply(op);
          }
          return;
        }

        const path = findNodePath(editor, node);
        if (!path) return;

        const id = findSuggestionId(editor, path) ?? nanoid();

        setSuggestionNodes(editor, {
          at: path,
          suggestionDeletion: true,
          suggestionId: id,
        });
        // 💡 set instead of remove -> selection gets wrong
        return;
      }
      if (op.type === 'remove_text') {
        const { path, offset, text } = op;

        const from = { path, offset };

        const node = getNode<TText>(editor, path);
        if (!node) return;

        // additions are safe to remove
        if (node[MARK_SUGGESTION] && !node.suggestionDeletion) {
          apply(op);
          return;
        }

        const to = {
          path,
          offset: offset + text.length,
        };
        const id =
          findSuggestionId(editor, {
            anchor: from,
            focus: to,
          }) ?? nanoid();

        setSuggestionNodes(editor, {
          at: {
            anchor: from,
            focus: to,
          },
          suggestionDeletion: true,
          suggestionId: id,
        });
        // 💡 set instead of remove -> selection gets wrong
        return;
      }
      if (op.type === 'move_node') {
        const node = getNode(editor, op.path);
        if (node && isBlock(editor, node) && !node[MARK_SUGGESTION]) {
          // TODO: ?
          return;
        }
      }
      if (op.type === 'merge_node') {
        const node = getNode(editor, op.path);
        if (node && isBlock(editor, node)) {
          // if (node && isBlock(editor, node) && !node[MARK_SUGGESTION]) {
          // TODO: delete block suggestion
          return;
        }
      }
      if (op.type === 'split_node') {
        const node = getNode(editor, op.path);
        // allow splitting suggestion blocks
        if (node && isBlock(editor, node) && !node[MARK_SUGGESTION]) {
          // TODO: insert block suggestion
          return;
        }
      }
      if (op.type === 'set_selection') {
        if (editor.preventSelection) {
          return;
        }
      }
    }

    apply(op);
  };

  const { apply: applyNext } = editor;

  // 🧪 without apply method
  // editor.deleteFragment = (direction) => {
  //   if (editor.isSuggesting) {
  //     const selection = editor.selection!;
  //
  //     if (isExpanded(selection)) {
  //       withoutNormalizing(editor, () => {
  //         const [start, end] = getEdgePoints(editor, selection);
  //
  //         collapseSelection(editor, { edge: 'end' });
  //
  //         deleteSuggesting(editor, end, start, { reverse: true });
  //       });
  //
  //       return;
  //     }
  //   }
  //
  //   deleteFragment(direction);
  // };

  editor.deleteBackward = (unit) => {
    if (editor.isSuggesting) {
      // 🧪 without apply method
      // if (isSelectionAtBlockStart(editor)) {
      //   moveSelection(editor, { reverse: true });
      //   return;
      // }
      //
      // const selection = editor.selection!;
      // const pointTarget = getPointBefore(editor, selection, {
      //   unit,
      // });
      // if (!pointTarget) return;
      //
      // deleteSuggesting(editor, selection.anchor, pointTarget, {
      //   reverse: true,
      // });
      //
      // return;
      // 🧐 latest experiment: should we handle selection ourself?
      // editor.apply = (op) => {
      //   if (op.type === 'set_selection') {
      //     return;
      //   }
      //
      //   applyNext(op);
      // };
      //
      // deleteBackward(unit);
      //
      // editor.apply = (op) => {
      //   applyNext(op);
      // };
      // return;
    }

    deleteBackward(unit);
  };

  // 🐛 select all -> paste one word
  editor.insertFragment = (fragment) => {
    (editor.preventSelection as any) = true;
    insertFragment(fragment);
    (editor.preventSelection as any) = false;
  };

  // 🧪 without apply method
  // editor.deleteForward = (unit) => {
  //   if (editor.isSuggesting) {
  //     if (isSelectionAtBlockEnd(editor)) {
  //       moveSelection(editor);
  //       return;
  //     }
  //
  //     const selection = editor.selection!;
  //
  //     const pointTarget = getPointAfter(editor, selection, { unit });
  //     if (!pointTarget) return;
  //
  //     deleteSuggesting(editor, selection.anchor, pointTarget);
  //
  //     return;
  //   }
  //
  //   deleteForward(unit);
  // };

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
