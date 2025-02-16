import React from 'react';

import { type NodeEntry, type Path, type Value, PathApi } from '@udecode/plate';
import {
  type TCommentText,
  getCommentLastId,
  isExistComment,
} from '@udecode/plate-comments';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { type PlateEditor, useEditorPlugin } from '@udecode/plate-core/react';

import { CommentCreateForm } from './comment-create-form';
import { CommentItem } from './comment-item';

export interface Discussion {
  id: string;
  comments: TCommentItem[];
  createdAt: Date;
  documentContent: string;
  isResolved: boolean;
  userId: string;
}

export type TCommentItem = {
  id: string;
  contentRich: Value;
  createdAt: Date;
  discussionId: string;
  isEdited: boolean;
  userId: string;
};

export const BlockCommentsCard = ({
  discussion,
  isLast,
}: {
  discussion: Discussion;
  isLast: boolean;
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);

  return (
    <React.Fragment key={discussion.id}>
      <div className="p-4">
        {discussion.comments.map((comment, index) => (
          <CommentItem
            key={comment.id ?? index}
            comment={comment}
            discussionLength={discussion.comments.length}
            documentContent={discussion?.documentContent}
            editingId={editingId}
            index={index}
            setEditingId={setEditingId}
            showDocumentContent
          />
        ))}
        <CommentCreateForm discussionId={discussion.id} />
      </div>

      {!isLast && <div className="h-px w-full bg-muted" />}
    </React.Fragment>
  );
};

export const useResolvedDiscussion = (
  editor: PlateEditor,
  commentNodes: NodeEntry<TCommentText>[],
  blockPath: Path
) => {
  const { getOption, setOption } = useEditorPlugin(CommentsPlugin);

  commentNodes.forEach(([node]) => {
    const id = getCommentLastId(node);
    const map = getOption('uniquePathMap');

    if (!id || map.has(id)) return;

    setOption('uniquePathMap', new Map(map).set(id, blockPath));
  });

  const commentsIds = new Set(
    commentNodes.map(([node]) => getCommentLastId(node)!).filter(Boolean)
  );

  const discussions: Discussion[] = JSON.parse(
    sessionStorage.getItem('discussions') || '[]'
  )
    .map((d: Discussion) => ({
      ...d,
      createdAt: new Date(d.createdAt),
    }))
    .filter((item: Discussion) => {
      /** If comment cross blocks just show it in the first block */
      const commentsPathMap = getOption('uniquePathMap');
      const firstBlockPath = commentsPathMap.get(item.id);

      if (!firstBlockPath) return false;
      if (!PathApi.equals(firstBlockPath, blockPath)) return false;

      return (
        isExistComment(item.id, editor.children) &&
        commentsIds.has(item.id) &&
        !item.isResolved
      );
    });

  return discussions;
};
