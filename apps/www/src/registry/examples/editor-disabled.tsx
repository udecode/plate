'use client';

import { Plate, useCreateEditor } from 'platejs/react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';

export default function EditorDisabled() {
  const editor = useCreateEditor();

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor disabled placeholder="Type your message here." />
      </EditorContainer>
    </Plate>
  );
}
