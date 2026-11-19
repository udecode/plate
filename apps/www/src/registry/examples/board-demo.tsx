'use client';

import { CommentsPlugin } from 'platejs/comments/react';
import { EditorRoot, useCreateEditor } from 'platejs/react';

import { BoardImageKit, BoardKit } from '@/registry/components/editor/board';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { aiUser } from '@/registry/components/editor/use-chat';
import { boardValue } from '@/registry/examples/values/board-value';

export default function BoardDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...EditorKit,
      ...BoardKit,
      ...BoardImageKit,
      ...DiscussionKit,
      CommentsPlugin.configure({
        initialState: {
          users: {
            local: { id: 'local', name: 'You' },
            [aiUser.id]: aiUser,
          },
        },
      }),
    ],
    initialValue: boardValue,
  });

  return (
    <EditorRoot editor={editor}>
      <EditorFrame className="h-[650px]">
        <EditorContainer>
          <Editor />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}
