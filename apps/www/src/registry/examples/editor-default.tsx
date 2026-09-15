'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';

export default function EditorDefault() {
  const editor = useCreateEditor({
    plugins: EditorKit,
  });

  return (
    <EditorRoot editor={editor}>
      <EditorContainer>
        <Editor placeholder="Type your message here." />
      </EditorContainer>
    </EditorRoot>
  );
}
