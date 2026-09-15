'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';

export default function MyEditorPage() {
  const editor = useCreateEditor();

  return (
    <EditorRoot editor={editor}>
      <EditorContainer>
        <Editor placeholder="Type your amazing content here..." />
      </EditorContainer>
    </EditorRoot>
  );
}
