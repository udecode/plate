'use client';

import { CommentsPlugin } from 'platejs/comments/react';
import { EditorRoot, useCreateEditor } from 'platejs/react';

import { DiscussionKit } from '@/registry/components/editor/discussion';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';

import { aiValue } from './values/ai-value';

export default function AIDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...EditorKit,
      ...DiscussionKit,
      CommentsPlugin.configure({
        initialState: {
          users: { local: { id: 'local', name: 'You' } },
        },
      }),
    ],
    initialValue: aiValue,
  });

  return (
    <EditorRoot
      editor={editor}
      authored={{ intent: 'edit', projection: 'markup' }}
    >
      <EditorFrame className="h-[650px]">
        <EditorContainer>
          <Editor />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}
