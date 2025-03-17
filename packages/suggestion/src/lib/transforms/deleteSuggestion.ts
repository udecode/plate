import {
  type Point,
  type SlateEditor,
  type TElement,
  type TRange,
  ElementApi,
  PathApi,
  PointApi,
  TextApi,
} from '@udecode/plate';

import type { TSuggestionElement } from '../types';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { findSuggestionProps } from '../queries/';
import { getInlineSuggestionData, isCurrentUserSuggestion } from '../utils';
import { setSuggestionNodes } from './setSuggestionNodes';

/**
 * Suggest deletion one character at a time until target point is reached.
 * Suggest additions are safely deleted.
 */
export const deleteSuggestion = (
  editor: SlateEditor,
  at: TRange,
  {
    reverse,
  }: {
    reverse?: boolean;
  } = {}
) => {
  let resId: string | undefined;

  editor.tf.withoutNormalizing(() => {
    const { anchor: from, focus: to } = at;

    const { id, createdAt: createdAt } = findSuggestionProps(editor, {
      at: from,
      type: 'remove',
    });

    resId = id;

    const toRef = editor.api.pointRef(to);

    let pointCurrent: Point | undefined;

    while (true) {
      pointCurrent = editor.selection?.anchor;

      if (!pointCurrent) break;

      const pointTarget = toRef.current;

      if (!pointTarget) break;
      // don't delete across blocks
      if (
        !editor.api.isAt({
          at: { anchor: pointCurrent, focus: pointTarget },
          blocks: true,
        })
      ) {
        // always 0 when across blocks
        const str = editor.api.string(
          reverse
            ? {
                anchor: pointTarget,
                focus: pointCurrent,
              }
            : {
                anchor: pointCurrent,
                focus: pointTarget,
              }
        );

        if (str.length === 0) break;
      }

      const getPoint = reverse ? editor.api.before : editor.api.after;

      const pointNext: Point | undefined = getPoint(pointCurrent, {
        unit: 'character',
      });

      if (!pointNext) break;

      let range: TRange = reverse
        ? {
            anchor: pointNext,
            focus: pointCurrent,
          }
        : {
            anchor: pointCurrent,
            focus: pointNext,
          };
      range = editor.api.unhangRange(range, { character: true });

      // if the current point is in block addition suggestion, delete block
      const entryBlock = editor.api.node<TElement>({
        at: pointCurrent,
        block: true,
        match: (n) =>
          n[BaseSuggestionPlugin.key] &&
          TextApi.isText(n) &&
          getInlineSuggestionData(n)?.type === 'insert' &&
          isCurrentUserSuggestion(editor, n),
      });

      if (
        entryBlock &&
        editor.api.isStart(pointCurrent, entryBlock[1]) &&
        editor.api.isEmpty(entryBlock[0] as any)
      ) {
        editor.tf.removeNodes({
          at: entryBlock[1],
        });

        continue;
      }
      // if the range is across blocks, delete the line break
      if (editor.api.isAt({ at: range, blocks: true })) {
        const previousAboveNode = editor.api.above({ at: range.anchor });

        if (previousAboveNode && ElementApi.isElement(previousAboveNode[0])) {
          const isBlockSuggestion = editor
            .getApi(BaseSuggestionPlugin)
            .suggestion.isBlockSuggestion(previousAboveNode[0]);

          if (isBlockSuggestion) {
            const node = previousAboveNode[0] as TSuggestionElement;

            if (node.suggestion.type === 'insert') {
              editor
                .getApi(BaseSuggestionPlugin)
                .suggestion.withoutSuggestions(() => {
                  editor.tf.unsetNodes([BaseSuggestionPlugin.key], {
                    at: previousAboveNode[1],
                  });
                  editor.tf.mergeNodes({
                    at: PathApi.next(previousAboveNode[1]),
                  });
                });
            }
            if (node.suggestion.type === 'remove') {
              editor.tf.move({
                reverse,
                unit: 'character',
              });
            }
            break;
          }

          if (!isBlockSuggestion) {
            editor.tf.setNodes(
              {
                [BaseSuggestionPlugin.key]: {
                  id,
                  createdAt,
                  type: 'remove',
                  userId:
                    editor.getOptions(BaseSuggestionPlugin).currentUserId!,
                },
              },
              { at: previousAboveNode[1] }
            );
            editor.tf.move({
              reverse,
              unit: 'character',
            });
            break;
          }
        }

        break;
      }
      // move selection if still the same
      if (PointApi.equals(pointCurrent, editor.selection!.anchor)) {
        editor.tf.move({
          reverse,
          unit: 'character',
        });
      }

      // if the current point is in addition suggestion, delete
      const entryText = editor.getApi(BaseSuggestionPlugin).suggestion.node({
        at: range,
        isText: true,
        match: (n) =>
          TextApi.isText(n) &&
          getInlineSuggestionData(n)?.type === 'insert' &&
          isCurrentUserSuggestion(editor, n),
      });

      if (entryText) {
        editor.tf.delete({ at: range, unit: 'character' });

        continue;
      }

      setSuggestionNodes(editor, {
        at: range,
        createdAt: createdAt as number,
        suggestionDeletion: true,
        suggestionId: id,
      });
    }
  });

  return resId;
};
