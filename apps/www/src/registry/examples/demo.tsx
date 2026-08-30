'use client';

import { Plate, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';

import { createValue } from './values/demo-values';

export default function Demo({ id }: { id: string }) {
  const editor = useCreateEditor({
    plugins: EditorKit,
    initialValue: createValue(id),
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
