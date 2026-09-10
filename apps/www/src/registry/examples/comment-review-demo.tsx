'use client';

import { BaseCommentsPlugin } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { Plate, useCreateEditor, useStaticEditor } from 'platejs/react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BaseBasicBlocksKit } from '@/registry/components/editor/basic-blocks-static';
import { commentDecorationAttributes } from '@/registry/components/editor/comment-static';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorStatic } from '@/registry/components/editor/editor-static';
import { LinkKit } from '@/registry/components/editor/link';
import { BaseLinkKit } from '@/registry/components/editor/link-static';
import { SuggestionKit } from '@/registry/components/editor/suggestion';
import {
  commentThreads,
  commentUsers,
  commentValue,
} from '@/registry/examples/values/comment-value';

export default function CommentReviewDemo() {
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
    initialValue: commentValue.slice(0, 2),
  });
  const staticEditor = useStaticEditor({
    plugins: [
      ...BaseBasicBlocksKit,
      ...BaseLinkKit,
      BaseCommentsPlugin.configure({
        initialState: { initialThreads: commentThreads },
        decorate: { attributes: commentDecorationAttributes },
      }),
    ],
    initialValue: commentValue.slice(0, 2),
  });

  return (
    <div className="flex w-full flex-col gap-6 p-4 sm:p-6">
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Read-only document</h3>
        <p className="text-sm text-muted-foreground">
          Open highlights to read and reply. The document itself cannot be
          edited.
        </p>
        <Plate editor={editor} readOnly>
          <EditorContainer className="h-auto rounded-md border" variant="demo">
            <Editor
              aria-label="Read-only comments document"
              className="h-auto px-8 pb-6 sm:px-12"
              readOnly
              variant="demo"
            />
          </EditorContainer>
        </Plate>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Static snapshot</h3>
        <p className="text-sm text-muted-foreground">
          The same initial document and ranges, rendered without editing or
          thread controls.
        </p>
        <div className="rounded-md border px-8 py-4">
          <EditorStatic
            aria-label="Static comments document"
            editor={staticEditor}
          />
        </div>
      </section>
    </div>
  );
}
