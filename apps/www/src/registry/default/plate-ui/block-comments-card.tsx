import React from 'react';

import type { TCommentText } from '@udecode/plate-comments';

import { type NodeEntry, type Path, type Value, PathApi } from '@udecode/plate';
import { type PlateEditor, useEditorPlugin } from '@udecode/plate-core/react';

import { commentsPlugin } from '../components/editor/plugins/comments-plugin';
import { CommentCreateForm } from './comment-create-form';
import { CommentItem } from './comment-item';

export interface TCommentItem {
  id: string;
  contentRich: Value;
  createdAt: Date;
  discussionId: string;
  isEdited: boolean;
  userId: string;
}

export interface TDiscussion {
  id: string;
  comments: TCommentItem[];
  createdAt: Date;
  documentContent: string;
  isResolved: boolean;
  userId: string;
}

export const BlockCommentsCard = ({
  discussion,
  isLast,
}: {
  discussion: TDiscussion;
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
  const { api, getOption, setOption } = useEditorPlugin(commentsPlugin);

  commentNodes.forEach(([node]) => {
    const id = api.comment.nodeId(node);
    const map = getOption('uniquePathMap');

    if (!id || map.has(id)) return;

    setOption('uniquePathMap', new Map(map).set(id, blockPath));
  });

  const commentsIds = new Set(
    commentNodes.map(([node]) => api.comment.nodeId(node)).filter(Boolean)
  );

  const discussions: TDiscussion[] = JSON.parse(
    sessionStorage.getItem('discussions') || '[]'
  )
    .map((d: TDiscussion) => ({
      ...d,
      createdAt: new Date(d.createdAt),
    }))
    .filter((item: TDiscussion) => {
      /** If comment cross blocks just show it in the first block */
      const commentsPathMap = getOption('uniquePathMap');
      const firstBlockPath = commentsPathMap.get(item.id);

      if (!firstBlockPath) return false;
      if (!PathApi.equals(firstBlockPath, blockPath)) return false;

      return (
        api.comment.isExist({ id: item.id }) &&
        commentsIds.has(item.id) &&
        !item.isResolved
      );
    });

  return discussions;
};
