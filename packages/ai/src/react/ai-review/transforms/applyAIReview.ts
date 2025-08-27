import type { PlateEditor } from 'platejs/react';

import { distance } from 'fastest-levenshtein';
import {
  type Range,
  type SlateEditor,
  type TCommentText,
  type Text,
  type TNode,
  type TText,
  type Value,
  ElementApi,
  KEYS,
  NodeApi,
  PathApi,
  TextApi,
} from 'platejs';

import { getAIReviewCommentKey } from '../utils/getAIReviewKey';

/** @experimental */
export const applyAIReview = (
  editor: SlateEditor,
  aiPreviewEditor: SlateEditor,
  {
    onComment,
  }: {
    onComment: (comment: {
      content: string;
      range: Range;
      text: string;
    }) => void;
  }
) => {
  const aiNodes = aiPreviewEditor.children;
  const editorNodes = editor.children;

  const matchIndexes = lcsMatchIndexes(
    editorNodes,
    aiNodes,
    (x, y) =>
      x.type === y.type &&
      hasAIComment(y) &&
      distance(NodeApi.string(x), NodeApi.string(y)) < 5
  );

  for (const [editorIndex, aiIndex] of matchIndexes) {
    const currentAiNode = aiNodes[aiIndex];

    const currentEditorBlockPath = [editorIndex];
    const currentAIBlock = [aiIndex];

    if (!hasAIComment(currentAiNode)) continue;

    const aiComments = aiPreviewEditor.api.nodes<TCommentText>({
      at: currentAIBlock,
      match: (n) => n[KEYS.comment],
    });

    for (const [comment, commentPath] of aiComments) {
      const { text: CommentText, ...restCommentProps } = comment;

      const currentEditorBlockString = NodeApi.string(currentAiNode);

      if (currentEditorBlockString.length === 0 || CommentText.length === 0)
        continue;

      const isDuplicate =
        indexOfOccurrence(currentEditorBlockString, CommentText, 1) !== -1;

      if (isDuplicate) {
        // A low-probability scenario, for example, when we need to add a comment mark to "hello",
        // but there are multiple instances of "hello" in the paragraph.
        const commentText = comment.text;

        const allDuplicatedTexts = Array.from(
          aiPreviewEditor.api.nodes<Text>({
            at: currentAIBlock,
            match: (n) => {
              return TextApi.isText(n) && n.text.includes(commentText);
            },
          })
        );

        const index = allDuplicatedTexts.findIndex((n) => {
          return PathApi.equals(n[1], commentPath);
        });

        // Count how many times commentText appears as a substring in all previous texts in allDuplicatedTexts
        const targeCommentIndex = allDuplicatedTexts
          .slice(0, index)
          .reduce((count, [node]) => {
            return (
              count +
              getCommentNodeSubStringCount({
                commentNode: node,
                commentText,
              })
            );
          }, 0);

        let leftCount = targeCommentIndex;

        const targetNodeEntry = editor.api.node<Text>({
          at: currentEditorBlockPath,
          match: (n) => {
            if (TextApi.isText(n) && n.text.includes(commentText)) {
              const count = getCommentNodeSubStringCount({
                commentNode: n,
                commentText,
              });

              if (leftCount - count < 0) {
                return true;
              } else {
                leftCount -= count;
              }
            }
          },
        });

        if (!targetNodeEntry) continue;

        const [targetNode, targetPath] = targetNodeEntry;

        const startIndex = indexOfOccurrence(
          targetNode.text,
          commentText,
          leftCount
        );

        const endIndex = startIndex + commentText.length;

        const targetRange = {
          anchor: {
            offset: startIndex,
            path: targetPath,
          },
          focus: {
            offset: endIndex,
            path: targetPath,
          },
        };

        onComment({
          content: restCommentProps[getAIReviewCommentKey()] as any,
          range: targetRange,
          text: CommentText,
        });
      } else {
        const targetNodeEntry = editor.api.node<Text>({
          at: currentEditorBlockPath,
          mode: 'lowest',
          match: (n) =>
            !n[KEYS.comment] &&
            TextApi.isText(n) &&
            n.text.includes(CommentText),
        });

        if (!targetNodeEntry) {
          continue;
        }

        const [targetNode, targetPath] = targetNodeEntry;

        const text = targetNode.text;
        const startIndex = text.indexOf(CommentText);
        const endIndex = startIndex + CommentText.length;

        const targetRange: Range = {
          anchor: {
            offset: startIndex,
            path: targetPath,
          },
          focus: {
            offset: endIndex,
            path: targetPath,
          },
        };

        onComment({
          content: restCommentProps[getAIReviewCommentKey()] as any,
          range: targetRange,
          text: CommentText,
        });
      }
    }
  }
};

const hasAIComment = (node: TNode): boolean => {
  if (ElementApi.isElement(node)) {
    return node.children.some((child) => hasAIComment(child));
  } else {
    // prevent ai comment empty blocks
    return !!node[KEYS.comment] && (node as TText).text.length > 0;
  }
};

const getCommentNodeSubStringCount = ({
  commentNode,
  commentText,
}: {
  commentNode: TCommentText;
  commentText: string;
}): number => {
  if (commentText.length === 0) return 0;

  let count = 0;
  let idx = 0;
  while ((idx = commentNode.text.indexOf(commentText, idx)) !== -1) {
    count++;
    idx += commentText.length;
  }
  return count;
};

/**
 * IndexOfOccurrence Find the index of the nth occurrence of a substring in a
 * string.
 *
 * @param str - The original string
 * @param searchValue - The substring to search for
 * @param occurrence - Which occurrence to find (starting from 0)
 * @returns The index, or -1 if not found
 *
 *   Example: indexOfOccurrence("xxhello,hello", "hello", 0) // => 2
 *   indexOfOccurrence("xxhello,hello", "hello", 1) // => 8
 *   indexOfOccurrence("xxhello,hello", "hello", 2) // => -1
 */
const indexOfOccurrence = (
  str: string,
  searchValue: string,
  occurrence: number
): number => {
  if (occurrence < 0) return -1;

  let index = -1;
  let from = 0;

  for (let i = 0; i <= occurrence; i++) {
    index = str.indexOf(searchValue, from);
    if (index === -1) return -1;
    from = index + searchValue.length;
  }

  return index;
};

function lcsMatchIndexes(
  a: Value,
  b: Value,
  equalFn = (x: TNode, y: TNode) => x === y
) {
  const m = b.length,
    n = a.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  // 1. Build LCS length table
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (equalFn(a[i - 1], b[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 2. Backtrack to get matching indexes
  const matches = [];
  let i = n,
    j = m;
  while (i > 0 && j > 0) {
    if (equalFn(a[i - 1], b[j - 1])) {
      matches.push([i - 1, j - 1]);
      i--, j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return matches.reverse();
}
