'use client';

import { Plate, usePlateEditor } from '@udecode/plate-common/react';

import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

export default function EditorDisabled() {
  const editor = usePlateEditor();

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor disabled placeholder="Type your message here." />
      </EditorContainer>
    </Plate>
  );
}
