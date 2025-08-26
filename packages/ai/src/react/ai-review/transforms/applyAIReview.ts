import {
  KEYS,
  NodeApi,
  PathApi,
  Range,
  SlateEditor,
  TCommentText,
  TElement,
  Text,
  TextApi,
} from 'platejs';
import { PlateEditor } from 'platejs/react';
import { getAIReviewCommentKey } from '../utils/getAIReviewKey';
import { distance } from 'fastest-levenshtein';

/** @experimental */
export const applyAIReview = (
  editor: PlateEditor,
  aiPreviewEditor: SlateEditor,
  {
    onComment,
  }: {
    onComment: (comment: {
      text: string;
      content: string;
      range: Range;
    }) => void;
  }
) => {
  const aiNodes = aiPreviewEditor.children;
  const editorNodes = editor.children;

  let j = 0;
  let i = 0;

  while (i < aiNodes.length && j < editorNodes.length) {
    const currentEditorNode = editorNodes[j];
    const currentAiNode = aiNodes[i];

    const currentAIBlock = [i];
    const currentEditorBlock = [j];

    const currentBlockString = NodeApi.string(currentEditorNode);
    const currentAiBlockString = NodeApi.string(currentAiNode);

    if (distance(currentBlockString, currentAiBlockString) > 5) {
      if (i > j) {
        j++;
      } else {
        i++;
      }
      j++;
      continue;
    }

    i++;
    j++;

    if (!hasAIComment(currentAiNode)) continue;

    const aiComments = aiPreviewEditor.api.nodes<TCommentText>({
      at: currentAIBlock,
      match: (n) => n[KEYS.comment],
    });

    for (const [comment, commentPath] of aiComments) {
      const { text: CommentText, ...restCommentProps } = comment;

      const isDuplicate =
        indexOfOccurrence(NodeApi.string(currentAiNode), CommentText, 1) !== -1;

      if (!isDuplicate) {
        const targetNodeEntry = editor.api.node<Text>({
          at: currentEditorBlock,
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
            path: targetPath,
            offset: startIndex,
          },
          focus: {
            path: targetPath,
            offset: endIndex,
          },
        };

        onComment({
          text: CommentText,
          content: restCommentProps[getAIReviewCommentKey()] as any,
          range: targetRange,
        });
      } else {
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
          at: currentEditorBlock,
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
            path: targetPath,
            offset: startIndex,
          },
          focus: {
            path: targetPath,
            offset: endIndex,
          },
        };

        onComment({
          text: CommentText,
          content: restCommentProps[getAIReviewCommentKey()] as any,
          range: targetRange,
        });
      }
    }
  }
};

const hasAIComment = (node: TElement): boolean => {
  return node.children.some((child: any) => {
    if (child[KEYS.comment]) {
      return true;
    }
    if (Array.isArray(child.children)) {
      return hasAIComment(child as TElement);
    }
    return false;
  });
};

const getCommentNodeSubStringCount = ({
  commentNode,
  commentText,
}: {
  commentNode: TCommentText;
  commentText: string;
}): number => {
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
