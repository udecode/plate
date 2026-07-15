import type { BaseEditor } from '@platejs/core';
import {
  type EditorUpdateTransaction,
  type Element,
  ElementApi,
  type Point,
  PointApi,
  type Range,
  type TextUnit,
  TextApi,
} from '@platejs/plite';
import { PathApi } from '@platejs/plite';
import { type TSuggestionElement, KEYS } from '@platejs/utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { findSuggestionProps } from '../queries/';
import {
  getInlineSuggestionData,
  getSuggestionKey,
  isCurrentUserSuggestion,
} from '../utils';
import { setSuggestionNodesWithTx } from './setSuggestionNodes';

const isRangeAcrossBlocks = (editor: BaseEditor, range: Range) => {
  const anchorBlock = editor.read.nodes.block({ at: range.anchor });
  const focusBlock = editor.read.nodes.block({ at: range.focus });

  if (!anchorBlock || !focusBlock) return false;

  return !PathApi.equals(anchorBlock[1], focusBlock[1]);
};

const isEmptyCurrentUserInsertBlock = (
  editor: BaseEditor,
  entry: [Element, number[]]
) => {
  const [node] = entry;
  const text = editor.read.text.string(entry[1]);

  if (text.length > 0) return false;

  return node.children.some(
    (child) =>
      TextApi.isText(child) &&
      !!child[KEYS.suggestion] &&
      getInlineSuggestionData(child)?.type === 'insert' &&
      isCurrentUserSuggestion(editor, child)
  );
};

/**
 * Suggest deletion one character at a time until target point is reached.
 * Suggest additions are safely deleted.
 */
export const deleteSuggestion = (
  editor: BaseEditor,
  at: Range,
  {
    moveSelection,
    reverse,
    unit = 'character',
  }: {
    moveSelection?: boolean;
    reverse?: boolean;
    unit?: TextUnit;
  } = {}
) => {
  let resId: string | undefined;

  editor.update((tx) => {
    resId = deleteSuggestionWithTx(editor, tx, at, {
      moveSelection,
      reverse,
      unit,
    });
  });

  return resId;
};

export const deleteSuggestionWithTx = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  at: Range,
  {
    moveSelection = true,
    reverse,
    unit = 'character',
  }: {
    moveSelection?: boolean;
    reverse?: boolean;
    unit?: TextUnit;
  } = {}
) => {
  const suggestionApi = editor.plugin(BaseSuggestionPlugin).api;

  const getInlineEntryAt = (point: Point) =>
    editor.read.nodes.above<Element>({
      at: point,
      match: (node) =>
        ElementApi.isElement(node) && editor.read.schema.isInline(node),
    });

  const getAdjacentInlineVoidEntry = (
    point: Point,
    {
      reverse,
    }: {
      reverse?: boolean;
    }
  ) => {
    try {
      const adjacentPath = reverse
        ? PathApi.previous(point.path)
        : PathApi.next(point.path);

      if (!adjacentPath) return;

      const entry = editor.read.nodes.get<Element>(adjacentPath);

      if (
        entry &&
        ElementApi.isElement(entry[0]) &&
        editor.read.schema.isInline(entry[0]) &&
        editor.read.schema.isVoid(entry[0])
      ) {
        return entry;
      }
    } catch {}
  };

  const isBoundaryPoint = (
    point: Point,
    {
      reverse,
    }: {
      reverse?: boolean;
    }
  ) => {
    const range = editor.read.ranges.get(point.path);

    if (!range) return false;

    return reverse
      ? editor.read.points.isStart(point, range)
      : editor.read.points.isEnd(point, range);
  };

  const { anchor: from, focus: to } = at;

  const { id, createdAt } = findSuggestionProps(editor, {
    at: from,
    type: 'remove',
  });

  const toRef = tx.refs.point(to);

  let pointCurrent: Point | undefined;

  while (true) {
    pointCurrent = editor.read.selection()?.anchor;

    if (!pointCurrent) break;

    const pointTarget = toRef.current;

    if (!pointTarget) break;
    if (PointApi.equals(pointCurrent, pointTarget)) break;
    // don't delete across blocks
    if (
      !isRangeAcrossBlocks(editor, {
        anchor: pointCurrent,
        focus: pointTarget,
      })
    ) {
      const inlineRange = reverse
        ? {
            anchor: pointTarget,
            focus: pointCurrent,
          }
        : {
            anchor: pointCurrent,
            focus: pointTarget,
          };
      // always 0 when across blocks
      const str = editor.read.text.string(inlineRange);
      const hasInlineNode = editor.read.nodes.some({
        at: inlineRange,
        match: (node) =>
          ElementApi.isElement(node) && editor.read.schema.isInline(node),
      });

      if (str.length === 0 && !hasInlineNode) break;
    }

    const pointNext =
      unit === 'character'
        ? reverse
          ? editor.read.points.before(pointCurrent, { unit: 'character' })
          : editor.read.points.after(pointCurrent, { unit: 'character' })
        : pointTarget;

    if (!pointNext) break;
    if (PointApi.equals(pointNext, pointCurrent)) break;

    let range: Range = reverse
      ? {
          anchor: pointNext,
          focus: pointCurrent,
        }
      : {
          anchor: pointCurrent,
          focus: pointNext,
        };
    if (unit === 'character') {
      range = editor.read.ranges.unhang(range, { character: true });
    }

    const inlineEntryAtNext = getInlineEntryAt(pointNext);
    const inlineEntryAtCurrent = inlineEntryAtNext
      ? undefined
      : getInlineEntryAt(pointCurrent);
    const canUseAdjacentInlineFallback = isBoundaryPoint(pointCurrent, {
      reverse,
    });
    const adjacentInlineEntry =
      inlineEntryAtNext || inlineEntryAtCurrent || !canUseAdjacentInlineFallback
        ? undefined
        : getAdjacentInlineVoidEntry(pointCurrent, { reverse });
    const inlineEntryAtCurrentIsNonSelectable =
      !!inlineEntryAtCurrent &&
      !editor.read.schema.isSelectable(inlineEntryAtCurrent[0]);
    const adjacentInlineEntryIsNonSelectable =
      !!adjacentInlineEntry &&
      !editor.read.schema.isSelectable(adjacentInlineEntry[0]);
    const inlineEntry =
      inlineEntryAtNext ??
      (inlineEntryAtCurrentIsNonSelectable
        ? inlineEntryAtCurrent
        : undefined) ??
      (adjacentInlineEntryIsNonSelectable ? adjacentInlineEntry : undefined);
    const pointCurrentInsideInline =
      !!inlineEntry && PathApi.isAncestor(inlineEntry[1], pointCurrent.path);

    if (
      inlineEntry &&
      editor.read.schema.isVoid(inlineEntry[0]) &&
      (!inlineEntryAtNext || !pointCurrentInsideInline)
    ) {
      tx.nodes.set(
        {
          [getSuggestionKey(id)]: {
            id,
            createdAt,
            type: 'remove',
            userId: editor.plugin(BaseSuggestionPlugin).getOptions()
              .currentUserId!,
          },
          [KEYS.suggestion]: true,
        },
        { at: inlineEntry[1] }
      );

      const beforeInlineElement = editor.read.points.before(inlineEntry[1]);
      const targetIsInsideInlineElement =
        PathApi.equals(inlineEntry[1], pointTarget.path) ||
        PathApi.isAncestor(inlineEntry[1], pointTarget.path);

      if (reverse) {
        if (beforeInlineElement) {
          tx.selection.set(beforeInlineElement);

          if (
            !targetIsInsideInlineElement &&
            !PointApi.equals(beforeInlineElement, pointTarget)
          ) {
            continue;
          }
        }

        break;
      }

      const afterInlineElement = editor.read.points.after(inlineEntry[1]);

      if (afterInlineElement) {
        tx.selection.set(afterInlineElement);

        if (!PointApi.equals(afterInlineElement, pointTarget)) {
          continue;
        }
      } else if (beforeInlineElement) {
        tx.selection.set(beforeInlineElement);
      }

      break;
    }

    // if the current point is in block addition suggestion, delete block
    const entryBlock = editor.read.nodes.block({ at: pointCurrent });

    if (
      entryBlock &&
      editor.read.points.isStart(pointCurrent, entryBlock[1]) &&
      isEmptyCurrentUserInsertBlock(editor, entryBlock)
    ) {
      tx.nodes.remove({
        at: entryBlock[1],
      });

      continue;
    }
    // if the range is across blocks, delete the line break
    if (isRangeAcrossBlocks(editor, range)) {
      const previousAboveNode = editor.read.nodes.above({ at: range.anchor });

      if (previousAboveNode && ElementApi.isElement(previousAboveNode[0])) {
        const isBlockSuggestion = suggestionApi.isBlockSuggestion(
          previousAboveNode[0]
        );

        if (isBlockSuggestion) {
          const node = previousAboveNode[0] as TSuggestionElement;

          if (node.suggestion.type === 'insert') {
            editor.plugin(BaseSuggestionPlugin).api.untracked(() => {
              tx.nodes.unset([KEYS.suggestion], {
                at: previousAboveNode[1],
              });
              tx.nodes.merge({
                at: PathApi.next(previousAboveNode[1]),
              });
            });
          }
          if (node.suggestion.type === 'remove') {
            tx.selection.move({
              reverse,
              unit: 'character',
            });
          }
          break;
        }

        if (!isBlockSuggestion) {
          const isPreviousBlockVoid =
            editor.read.schema.isVoid(previousAboveNode[0]) &&
            !editor.read.schema.isInline(previousAboveNode[0]);

          tx.nodes.set(
            {
              [KEYS.suggestion]: {
                id,
                createdAt,
                type: 'remove',
                userId: editor.plugin(BaseSuggestionPlugin).getOptions()
                  .currentUserId!,
                ...(isPreviousBlockVoid ? {} : { isLineBreak: true }),
              },
            },
            { at: previousAboveNode[1] }
          );
          tx.selection.move({
            reverse,
            unit: 'character',
          });
          break;
        }
      }

      break;
    }
    // move selection if still the same
    if (PointApi.equals(pointCurrent, editor.read.selection()!.anchor)) {
      if (unit === 'character') {
        tx.selection.move({
          reverse,
          unit: 'character',
        });
      } else if (moveSelection) {
        tx.selection.set(pointNext);
      }
    }

    // if the current point is in addition suggestion, delete
    const entryText = suggestionApi.node({
      at: range,
      isText: true,
      match: (node) =>
        TextApi.isText(node) &&
        getInlineSuggestionData(node)?.type === 'insert' &&
        isCurrentUserSuggestion(editor, node),
    });

    if (entryText) {
      tx.text.delete({ at: range, unit: 'character' });

      continue;
    }

    setSuggestionNodesWithTx(editor, tx, {
      at: range,
      createdAt: createdAt as number,
      includeInlineElements: unit !== 'character',
      suggestionDeletion: true,
      suggestionId: id,
    });

    if (unit !== 'character') break;
  }

  tx.normalize({ force: false });

  return id;
};
