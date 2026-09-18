'use client';

import { CommentsPlugin } from 'platejs/comments/react';
import { EditorRoot, useCreateEditor } from 'platejs/react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import {
  AllCommentsButton,
  CommentToolbarButton,
} from '@/registry/components/editor/comment-toolbar-button';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { LinkKit } from '@/registry/components/editor/link';
import { Toolbar } from '@/registry/components/editor/toolbar';
import {
  createCommentSnapshot,
  commentUsers,
} from '@/registry/examples/values/comment-value';

const snapshot = createCommentSnapshot();

export default function CommentDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...BasicBlocksKit,
      ...LinkKit,
      ...DiscussionKit,
      CommentsPlugin.configure({
        initialState: {
          currentUserId: 'alice',
          users: commentUsers,
          initialComments: snapshot.comments,
        },
      }),
    ],
    initialValue: snapshot.document,
  });

  return (
    <EditorRoot editor={editor}>
      <EditorContainer className="h-[420px]">
        <Toolbar className="border-b px-3 py-1">
          <CommentToolbarButton />
          <AllCommentsButton />
        </Toolbar>
        <Editor
          aria-label="Comments document"
          className="h-auto min-h-[280px] px-8 pb-16 sm:px-12"
          variant="demo"
        />
      </EditorContainer>
    </EditorRoot>
  );
}
