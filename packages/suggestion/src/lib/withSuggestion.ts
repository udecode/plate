import { type OverrideEditor, nanoid, TextApi } from '@udecode/plate';
import { ParagraphPlugin } from '@udecode/plate/react';

import type { TSuggestionElement } from './types';

import {
  type BaseSuggestionConfig,
  BaseSuggestionPlugin,
} from './BaseSuggestionPlugin';
import { findSuggestionProps } from './queries';
import { addMarkSuggestion } from './transforms/addMarkSuggestion';
import { deleteFragmentSuggestion } from './transforms/deleteFragmentSuggestion';
import { deleteSuggestion } from './transforms/deleteSuggestion';
import { insertFragmentSuggestion } from './transforms/insertFragmentSuggestion';
import { insertTextSuggestion } from './transforms/insertTextSuggestion';
import { removeMarkSuggestion } from './transforms/removeMarkSuggestion';
import { removeNodesSuggestion } from './transforms/removeNodesSuggestion';
import { getInlineSuggestionData, getSuggestionKeyId } from './utils/index';

export const withSuggestion: OverrideEditor<BaseSuggestionConfig> = ({
  api,
  editor,
  getOptions,
  tf: {
    addMark,
    apply,
    deleteBackward,
    deleteForward,
    deleteFragment,
    insertBreak,
    insertFragment,
    insertNodes,
    insertText,
    normalizeNode,
    removeMark,
    removeNodes,
  },
}) => ({
  transforms: {
    addMark(key, value) {
      if (getOptions().isSuggesting && api.isExpanded()) {
        return addMarkSuggestion(editor, key, value);
      }

      return addMark(key, value);
    },
    apply(operation) {
      return apply(operation);
    },
    deleteBackward(unit) {
      const selection = editor.selection!;
      const pointTarget = editor.api.before(selection, { unit });

      if (getOptions().isSuggesting) {
        const node = editor.api.above<TSuggestionElement>();
        // without set suggestion when delete backward in block suggestion
        if (
          node?.[0][BaseSuggestionPlugin.key] &&
          !node?.[0].suggestion.isLineBreak
        ) {
          return deleteBackward(unit);
        }

        if (!pointTarget) return;

        deleteSuggestion(
          editor,
          { anchor: selection.anchor, focus: pointTarget },
          { reverse: true }
        );

        return;
      } else {
        // remove line break when across blocks
        if (pointTarget) {
          const isCrossBlock = editor.api.isAt({
            at: { anchor: selection.anchor, focus: pointTarget },
            blocks: true,
          });

          if (isCrossBlock) {
            editor.tf.unsetNodes([BaseSuggestionPlugin.key], {
              at: pointTarget,
            });
          }
        }
      }

      deleteBackward(unit);
    },
    deleteForward(unit) {
      if (getOptions().isSuggesting) {
        const selection = editor.selection!;
        const pointTarget = editor.api.after(selection, { unit });

        if (!pointTarget) return;

        deleteSuggestion(editor, {
          anchor: selection.anchor,
          focus: pointTarget,
        });

        return;
      }

      deleteForward(unit);
    },

    deleteFragment(direction) {
      if (getOptions().isSuggesting) {
        deleteFragmentSuggestion(editor, { reverse: true });

        return;
      }

      deleteFragment(direction);
    },

    insertBreak() {
      if (getOptions().isSuggesting) {
        const [node, path] = editor.api.above()!;

        if (path.length > 1 || node.type !== ParagraphPlugin.key) {
          return insertTextSuggestion(editor, '\n');
        }

        const { id, createdAt } = findSuggestionProps(editor, {
          at: editor.selection!,
          type: 'insert',
        });

        insertBreak();

        editor.tf.withoutMerging(() => {
          editor.tf.setNodes(
            {
              [BaseSuggestionPlugin.key]: {
                id,
                createdAt,
                isLineBreak: true,
                type: 'insert',
                userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
              },
            },
            { at: path }
          );
        });

        return;
      }

      insertBreak();
    },

    insertFragment(fragment) {
      if (getOptions().isSuggesting) {
        insertFragmentSuggestion(editor, fragment, { insertFragment });

        return;
      }

      insertFragment(fragment);
    },

    insertNodes(nodes, options) {
      if (getOptions().isSuggesting) {
        const nodesArray = Array.isArray(nodes) ? nodes : [nodes];

        // TODO: options
        if (nodesArray.some((n) => n.type === 'slash_input')) {
          api.suggestion.withoutSuggestions(() => {
            insertNodes(nodes, options);
          });

          return;
        }

        const suggestionNodes = nodesArray.map((node) => {
          return {
            ...node,
            [BaseSuggestionPlugin.key]: {
              id: nanoid(),
              createdAt: Date.now(),
              type: 'insert',
              userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
            },
          };
        });

        return insertNodes(suggestionNodes, options);
      }

      return insertNodes(nodes, options);
    },

    insertText(text, options) {
      if (getOptions().isSuggesting) {
        const node = editor.api.above<TSuggestionElement>();

        if (
          node?.[0][BaseSuggestionPlugin.key] &&
          !node?.[0].suggestion.isLineBreak
        ) {
          return insertText(text, options);
        }

        insertTextSuggestion(editor, text);

        return;
      }

      insertText(text, options);
    },

    normalizeNode(entry) {
      api.suggestion.withoutSuggestions(() => {
        const [node, path] = entry;

        if (
          node[BaseSuggestionPlugin.key] && // Unset suggestion when there is no suggestion id
          TextApi.isText(node) &&
          !getSuggestionKeyId(node)
        ) {
          editor.tf.unsetNodes([BaseSuggestionPlugin.key, 'suggestionData'], {
            at: path,
          });

          return;
        }
        // Unset suggestion when there is no suggestion user id
        if (
          node[BaseSuggestionPlugin.key] &&
          TextApi.isText(node) &&
          !getInlineSuggestionData(node)?.userId
        ) {
          if (getInlineSuggestionData(node)?.type === 'remove') {
            // Unset deletions
            editor.tf.unsetNodes(
              [BaseSuggestionPlugin.key, getSuggestionKeyId(node)!],
              {
                at: path,
              }
            );
          } else {
            // Remove additions
            editor.tf.removeNodes({ at: path });
          }

          return;
        }

        normalizeNode(entry);
      });
    },
    removeMark(key) {
      if (getOptions().isSuggesting && api.isExpanded()) {
        return removeMarkSuggestion(editor, key);
      }

      return removeMark(key);
    },
    // Remove nodes by block selection
    removeNodes(options) {
      if (getOptions().isSuggesting) {
        const nodes = [...editor.api.nodes(options)];

        if (nodes.some(([n]) => n.type === 'slash_input')) {
          api.suggestion.withoutSuggestions(() => {
            removeNodes(options);
          });

          return;
        }

        return removeNodesSuggestion(editor, nodes);
      }

      return removeNodes(options);
    },
  },
});
