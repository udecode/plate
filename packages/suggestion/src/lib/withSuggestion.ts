import {
  type BaseEditor,
  type ExtendPlateEditorExtension,
  nanoid,
} from '@platejs/core';
import {
  type Element,
  ElementApi,
  type Range,
  PathApi,
  type Text,
  TextApi,
} from '@platejs/plite';
import { type TSuggestionElement, KEYS } from '@platejs/utils';

import {
  type BaseSuggestionConfig,
  BaseSuggestionPlugin,
} from './BaseSuggestionPlugin';
import { findSuggestionProps } from './queries';
import { addMarkSuggestion } from './transforms/addMarkSuggestion';
import { deleteFragmentSuggestionWithTx } from './transforms/deleteFragmentSuggestion';
import { deleteSuggestionWithTx } from './transforms/deleteSuggestion';
import { insertFragmentSuggestionWithTx } from './transforms/insertFragmentSuggestion';
import { insertTextSuggestion } from './transforms/insertTextSuggestion';
import { removeMarkSuggestion } from './transforms/removeMarkSuggestion';
import { removeNodesSuggestionWithTx } from './transforms/removeNodesSuggestion';
import { getInlineSuggestionData, getSuggestionKeyId } from './utils/index';

const isRangeAcrossBlocks = (editor: BaseEditor, range: Range) => {
  const anchorBlock = editor.read.nodes.block({ at: range.anchor });
  const focusBlock = editor.read.nodes.block({ at: range.focus });

  if (!anchorBlock || !focusBlock) return false;

  return !PathApi.equals(anchorBlock[1], focusBlock[1]);
};

export const withSuggestion: ExtendPlateEditorExtension<
  BaseSuggestionConfig
> = ({ api, editor, getOptions }) => ({
  normalizers: {
    node({ entry, next, tx }) {
      api.withoutSuggestions(() => {
        const [node, path] = entry;
        const hasSuggestion = !!(node as Record<string, unknown>)[
          KEYS.suggestion
        ];
        const inlineSuggestion =
          (ElementApi.isElement(node) && editor.read.schema.isInline(node)) ||
          TextApi.isText(node);

        if (
          hasSuggestion &&
          inlineSuggestion &&
          !getSuggestionKeyId(node as Element)
        ) {
          tx.nodes.unset([KEYS.suggestion, 'suggestionData'], {
            at: path,
          });

          return;
        }

        if (
          hasSuggestion &&
          inlineSuggestion &&
          !getInlineSuggestionData(node as Element)?.userId
        ) {
          if (getInlineSuggestionData(node as Element)?.type === 'remove') {
            tx.nodes.unset(
              [KEYS.suggestion, getSuggestionKeyId(node as Element)!],
              {
                at: path,
              }
            );
          } else {
            tx.nodes.remove({ at: path });
          }

          return;
        }

        next();
      });
    },
  },
  transforms: {
    addMark({ key, next, tx, value }) {
      if (getOptions().isSuggesting && editor.read.selection.isExpanded()) {
        addMarkSuggestion(editor, tx, key, value);
        return true;
      }

      return next();
    },
    deleteBackward({ next, tx, unit }) {
      const selection = editor.read.selection();
      const resolvedUnit = unit ?? 'character';

      if (!selection) return next({ unit: resolvedUnit });

      const pointTarget = editor.read.points.before(selection, {
        unit: resolvedUnit,
      });

      if (getOptions().isSuggesting) {
        const node = editor.read.nodes.above<TSuggestionElement>();

        if (node?.[0][KEYS.suggestion] && !node[0].suggestion.isLineBreak) {
          return next({ unit: resolvedUnit });
        }

        if (!pointTarget) return true;

        deleteSuggestionWithTx(
          editor,
          tx,
          { anchor: selection.anchor, focus: pointTarget },
          { reverse: true, unit: resolvedUnit }
        );

        return true;
      }

      if (
        pointTarget &&
        isRangeAcrossBlocks(editor, {
          anchor: selection.anchor,
          focus: pointTarget,
        })
      ) {
        tx.nodes.unset([KEYS.suggestion], {
          at: pointTarget,
        });
      }

      return next({ unit: resolvedUnit });
    },
    deleteForward({ next, tx, unit }) {
      const selection = editor.read.selection();
      const resolvedUnit = unit ?? 'character';

      if (!selection) return next({ unit: resolvedUnit });

      if (getOptions().isSuggesting) {
        const pointTarget = editor.read.points.after(selection, {
          unit: resolvedUnit,
        });

        if (!pointTarget) return true;

        deleteSuggestionWithTx(
          editor,
          tx,
          {
            anchor: selection.anchor,
            focus: pointTarget,
          },
          { unit: resolvedUnit }
        );

        return true;
      }

      return next({ unit: resolvedUnit });
    },
    deleteFragment({ next, options, tx }) {
      if (getOptions().isSuggesting) {
        deleteFragmentSuggestionWithTx(editor, tx, { reverse: true });
        return true;
      }

      return next({ options });
    },
    insertBreak({ next, tx }) {
      if (!getOptions().isSuggesting) {
        return next();
      }

      const selection = editor.read.selection();
      const above = editor.read.nodes.above<Element>();

      if (!selection || !above) return true;

      const [node, path] = above;

      if (path.length > 1 || node.type !== editor.getType(KEYS.p)) {
        insertTextSuggestion(editor, tx, '\n');
        return true;
      }

      const { id, createdAt } = findSuggestionProps(editor, {
        at: selection,
        type: 'insert',
      });

      const inserted = next();

      tx.metadata.merge({ history: { mode: 'merge' } });
      tx.nodes.set(
        {
          [KEYS.suggestion]: {
            id,
            createdAt,
            isLineBreak: true,
            type: 'insert',
            userId: editor.plugin(BaseSuggestionPlugin).getOptions()
              .currentUserId!,
          },
        },
        { at: path }
      );

      return inserted;
    },
    insertFragment({ fragment, next, options, tx }) {
      if (getOptions().isSuggesting) {
        insertFragmentSuggestionWithTx(editor, tx, fragment, () =>
          next({ fragment, options })
        );
        return true;
      }

      return next({ fragment, options });
    },
    insertNodes({ next, nodes, options }) {
      if (getOptions().isSuggesting) {
        const nodesArray = Array.isArray(nodes) ? nodes : [nodes];

        if (
          nodesArray.some(
            (node) => ElementApi.isElement(node) && node.type === 'slash_input'
          )
        ) {
          let result = true;
          api.withoutSuggestions(() => {
            result = next({ nodes, options });
          });

          return result;
        }

        const suggestionNodes = nodesArray.map((node) => ({
          ...node,
          [KEYS.suggestion]: {
            id: nanoid(),
            createdAt: Date.now(),
            type: 'insert',
            userId: editor.plugin(BaseSuggestionPlugin).getOptions()
              .currentUserId!,
          },
        }));

        return next({ nodes: suggestionNodes, options });
      }

      return next({ nodes, options });
    },
    insertText({ next, options, text, tx }) {
      if (getOptions().isSuggesting) {
        const node = editor.read.nodes.above<TSuggestionElement>();

        if (node?.[0][KEYS.suggestion] && !node[0].suggestion.isLineBreak) {
          return next({ options, text });
        }

        insertTextSuggestion(editor, tx, text);
        return true;
      }

      return next({ options, text });
    },
    removeMark({ key, next, tx }) {
      if (getOptions().isSuggesting && editor.read.selection.isExpanded()) {
        removeMarkSuggestion(editor, tx, key);
        return true;
      }

      return next({ key });
    },
    removeNodes({ next, options, tx }) {
      if (getOptions().isSuggesting) {
        const nodes = editor.read.nodes.toArray<Element | Text>(options);

        if (
          nodes.some(
            ([node]) =>
              ElementApi.isElement(node) && node.type === 'slash_input'
          )
        ) {
          let result = true;
          api.withoutSuggestions(() => {
            result = next({ options });
          });

          return result;
        }

        removeNodesSuggestionWithTx(editor, tx, nodes);
        return true;
      }

      return next({ options });
    },
  },
});
