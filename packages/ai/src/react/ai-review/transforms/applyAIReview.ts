import {
  KEYS,
  NodeApi,
  PathApi,
  SlateEditor,
  TCommentText,
  TElement,
  Text,
  TextApi,
} from 'platejs';
import { PlateEditor } from 'platejs/react';

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

export const applyAIReview = (
  editor: PlateEditor,
  aiPreviewEditor: SlateEditor
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

    if (NodeApi.string(currentEditorNode) !== NodeApi.string(currentAiNode)) {
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
        NodeApi.string(currentAiNode).indexOf(CommentText, 1) !== -1;

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

        editor.tf.setNodes(
          {
            comment: true,
            ...restCommentProps,
          },
          {
            at: targetRange,
            match: TextApi.isText,
            split: true,
          }
        );
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

        const startIndex = targetNode.text.indexOf(commentText, leftCount);

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

        editor.tf.setNodes(
          {
            comment: true,
            ...restCommentProps,
          },
          {
            at: targetRange,
            match: TextApi.isText,
            split: true,
          }
        );
      }
    }
  }
};
