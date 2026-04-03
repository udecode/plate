'use client';

import * as React from 'react';

import { TablePlugin } from '@platejs/table/react';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/registry/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/registry/ui/editor';
import { createValue } from '@/registry/examples/values/demo-values';

export default function TableNoMergeDemo() {
  const editor = usePlateEditor({
    plugins: [
      ...EditorKit,
      TablePlugin.configure({
        options: {
          disableMerge: true,
        },
      }),
    ],
    value: createValue('table'),
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
