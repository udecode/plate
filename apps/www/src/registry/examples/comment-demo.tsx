'use client';

import { CommentsPlugin } from 'platejs/comments/react';
import { Plate, useCreateEditor } from 'platejs/react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { CommentToolbarButton } from '@/registry/components/editor/comment-toolbar-button';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { LinkKit } from '@/registry/components/editor/link';
import { SuggestionKit } from '@/registry/components/editor/suggestion';
import { Toolbar } from '@/registry/components/editor/toolbar';
import {
  commentThreads,
  commentUsers,
  commentValue,
} from '@/registry/examples/values/comment-value';

export default function CommentDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...BasicBlocksKit,
      ...LinkKit,
      ...SuggestionKit,
      ...DiscussionKit,
      CommentsPlugin.configure({
        initialState: {
          currentUserId: 'alice',
          users: commentUsers,
          initialThreads: commentThreads,
        },
      }),
    ],
    initialValue: commentValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer className="h-[420px]" variant="demo">
        <Toolbar className="border-b px-3 py-1">
          <CommentToolbarButton />
        </Toolbar>
        <Editor
          aria-label="Comments document"
          className="h-auto min-h-[280px] px-8 pb-16 sm:px-12"
          variant="demo"
        />
      </EditorContainer>
    </Plate>
  );
}
