'use client';

import React from 'react';

import { Plate, usePlateEditor } from '@udecode/plate-common/react';

import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

export default function BasicEditorStylingDemo() {
  const editor = usePlateEditor();

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor placeholder="Type..." />
      </EditorContainer>
    </Plate>
  );
}
