import {
  type EditorUpdateTransaction,
  type Element,
  type Point,
  type Range,
  type SlateEditor,
  type TSuggestionElement,
  ElementApi,
  KEYS,
  PathApi,
  PointApi,
  TextApi,
} from "platejs";

import { BaseSuggestionPlugin } from "../BaseSuggestionPlugin";
import { findSuggestionProps } from "../queries/";
import {
  getInlineSuggestionData,
  getSuggestionKey,
  isCurrentUserSuggestion,
} from "../utils";
import { getSuggestionApi } from "../utils/getSuggestionApi";
import { setSuggestionNodes } from "./setSuggestionNodes";

/**
 * Suggest deletion one character at a time until target point is reached.
 * Suggest additions are safely deleted.
 */
export const deleteSuggestion = (
  editor: SlateEditor,
  at: Range,
  {
    reverse,
    tx: activeTx,
  }: {
    reverse?: boolean;
    tx?: EditorUpdateTransaction;
  } = {}
) => {
  let resId: string | undefined;
  const suggestionApi = getSuggestionApi(editor);

  const getInlineEntryAt = (point: Point) =>
    editor.api.above<Element>({
      at: point,
      match: (node) => ElementApi.isElement(node) && editor.api.isInline(node),
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

      const entry = editor.api.node<Element>(adjacentPath);

      if (
        entry &&
        ElementApi.isElement(entry[0]) &&
        editor.api.isInline(entry[0]) &&
        editor.api.isVoid(entry[0])
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
    const range = editor.api.range(point.path);

    if (!range) return false;

    return reverse
      ? editor.api.isStart(point, range)
      : editor.api.isEnd(point, range);
  };

  const applyDeleteSuggestion = (tx: EditorUpdateTransaction) => {
    const { anchor: from, focus: to } = at;

    const { id, createdAt } = findSuggestionProps(editor, {
      at: from,
      type: "remove",
    });

    resId = id;

    const toRef = editor.api.pointRef(to);

    let pointCurrent: Point | undefined;

    while (true) {
      pointCurrent = editor.selection?.anchor;

      if (!pointCurrent) break;

      const pointTarget = toRef.current;

      if (!pointTarget) break;
      if (PointApi.equals(pointCurrent, pointTarget)) break;
      // don't delete across blocks
      if (
        !editor.api.isAt({
          at: { anchor: pointCurrent, focus: pointTarget },
          blocks: true,
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
        const str = editor.api.string(inlineRange);
        const hasInlineNode = editor.api.some({
          at: inlineRange,
          match: (n) => ElementApi.isElement(n) && editor.api.isInline(n),
        });

        if (str.length === 0 && !hasInlineNode) break;
      }

      const getPoint = reverse ? editor.api.before : editor.api.after;

      const pointNext: Point | undefined = getPoint(pointCurrent, {
        unit: "character",
      });

      if (!pointNext) break;

      let range: Range = reverse
        ? {
            anchor: pointNext,
            focus: pointCurrent,
          }
        : {
            anchor: pointCurrent,
            focus: pointNext,
          };
      range = editor.api.unhangRange(range, { character: true });

      const inlineEntryAtNext = getInlineEntryAt(pointNext);
      const inlineEntryAtCurrent = inlineEntryAtNext
        ? undefined
        : getInlineEntryAt(pointCurrent);
      const canUseAdjacentInlineFallback = isBoundaryPoint(pointCurrent, {
        reverse,
      });
      const adjacentInlineEntry =
        inlineEntryAtNext ||
        inlineEntryAtCurrent ||
        !canUseAdjacentInlineFallback
          ? undefined
          : getAdjacentInlineVoidEntry(pointCurrent, { reverse });
      const inlineEntryAtCurrentIsNonSelectable =
        !!inlineEntryAtCurrent &&
        !editor.api.isSelectable(inlineEntryAtCurrent[0]);
      const adjacentInlineEntryIsNonSelectable =
        !!adjacentInlineEntry &&
        !editor.api.isSelectable(adjacentInlineEntry[0]);
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
        editor.api.isVoid(inlineEntry[0]) &&
        (!inlineEntryAtNext || !pointCurrentInsideInline)
      ) {
        tx.nodes.set(
          {
            [getSuggestionKey(id)]: {
              id,
              createdAt,
              type: "remove",
              userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
            },
            [KEYS.suggestion]: true,
          },
          { at: inlineEntry[1] }
        );

        const beforeInlineElement = editor.api.before(inlineEntry[1]);
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

        const afterInlineElement = editor.api.after(inlineEntry[1]);

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
      const entryBlock = editor.api.node<Element>({
        at: pointCurrent,
        block: true,
        match: (n) =>
          n[KEYS.suggestion] &&
          TextApi.isText(n) &&
          getInlineSuggestionData(n)?.type === "insert" &&
          isCurrentUserSuggestion(editor, n),
      });

      if (
        entryBlock &&
        editor.api.isStart(pointCurrent, entryBlock[1]) &&
        editor.api.isEmpty(
          entryBlock[0] as Parameters<typeof editor.api.isEmpty>[0]
        )
      ) {
        tx.nodes.remove({
          at: entryBlock[1],
        });

        continue;
      }
      // if the range is across blocks, delete the line break
      if (editor.api.isAt({ at: range, blocks: true })) {
        const previousAboveNode = editor.api.above({ at: range.anchor });

        if (previousAboveNode && ElementApi.isElement(previousAboveNode[0])) {
          const isBlockSuggestion = suggestionApi.isBlockSuggestion(
            previousAboveNode[0]
          );

          if (isBlockSuggestion) {
            const node = previousAboveNode[0] as TSuggestionElement;

            if (node.suggestion.type === "insert") {
              suggestionApi.withoutSuggestions(() => {
                tx.nodes.unset([KEYS.suggestion], {
                  at: previousAboveNode[1],
                });
                tx.nodes.merge({
                  at: PathApi.next(previousAboveNode[1]),
                });
                tx.normalize({ force: true });
              });
            }
            if (node.suggestion.type === "remove") {
              tx.selection.move({
                reverse,
                unit: "character",
              });
            }
            break;
          }

          if (!isBlockSuggestion) {
            const isPreviousBlockVoid =
              editor.api.isVoid(previousAboveNode[0]) &&
              !editor.api.isInline(previousAboveNode[0]);

            tx.nodes.set(
              {
                [KEYS.suggestion]: {
                  id,
                  createdAt,
                  type: "remove",
                  userId:
                    editor.getOptions(BaseSuggestionPlugin).currentUserId!,
                  ...(isPreviousBlockVoid ? {} : { isLineBreak: true }),
                },
              },
              { at: previousAboveNode[1] }
            );
            tx.selection.move({
              reverse,
              unit: "character",
            });
            break;
          }
        }

        break;
      }
      // move selection if still the same
      if (PointApi.equals(pointCurrent, editor.selection!.anchor)) {
        tx.selection.move({
          reverse,
          unit: "character",
        });
      }

      // if the current point is in addition suggestion, delete
      const entryText = suggestionApi.node({
        at: range,
        isText: true,
        match: (n) =>
          TextApi.isText(n) &&
          getInlineSuggestionData(n)?.type === "insert" &&
          isCurrentUserSuggestion(editor, n),
      });

      if (entryText) {
        tx.text.delete({ at: range, unit: "character" });

        continue;
      }

      setSuggestionNodes(editor, {
        at: range,
        createdAt: createdAt as number,
        includeInlineElements: false,
        suggestionDeletion: true,
        suggestionId: id,
        tx,
      });
    }
  };

  if (activeTx) {
    applyDeleteSuggestion(activeTx);
  } else {
    editor.update(applyDeleteSuggestion);
  }

  return resId;
};
