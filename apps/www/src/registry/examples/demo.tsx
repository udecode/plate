'use client';

import * as React from 'react';

import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/registry/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/registry/ui/editor';

import { createValue } from './values/demo-values';

export default function Demo({ id }: { id: string }) {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: createValue(id),
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
