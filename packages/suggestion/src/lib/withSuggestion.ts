import { type OverrideEditor, TextApi } from '@udecode/plate';
import { ParagraphPlugin } from '@udecode/plate/react';

import {
  type SuggestionConfig,
  BaseSuggestionPlugin,
  SUGGESTION_KEYS,
} from './BaseSuggestionPlugin';
import { findSuggestionProps } from './queries';
import { addMarkSuggestion } from './transforms/addMarkSuggestion';
import { deleteFragmentSuggestion } from './transforms/deleteFragmentSuggestion';
import { deleteSuggestion } from './transforms/deleteSuggestion';
import { insertFragmentSuggestion } from './transforms/insertFragmentSuggestion';
import { insertTextSuggestion } from './transforms/insertTextSuggestion';
import { removeMarkSuggestion } from './transforms/removeMarkSuggestion';
import { removeNodesSuggestion } from './transforms/removeNodesSuggestion';
import { getSuggestionData, getSuggestionKeyId } from './utils/index';

export const withSuggestion: OverrideEditor<SuggestionConfig> = ({
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
      console.log("🚀 ~ apply ~ operation:", operation)
      return apply(operation);
    },
    deleteBackward(unit) {
      const selection = editor.selection!;
      const pointTarget = editor.api.before(selection, { unit });

      if (getOptions().isSuggesting) {
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
            editor.tf.unsetNodes([SUGGESTION_KEYS.lineBreak], {
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

        // TODO: options
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
              [SUGGESTION_KEYS.lineBreak]: {
                id,
                createdAt,
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

    insertText(text, options) {
      if (getOptions().isSuggesting) {
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
          !getSuggestionData(node)?.userId
        ) {
          if (getSuggestionData(node)?.type === 'remove') {
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
        return removeNodesSuggestion(editor, options);
      }

      return removeNodes(options);
    },
  },
});
