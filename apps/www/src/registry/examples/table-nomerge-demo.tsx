'use client';

import { TablePlugin } from '@platejs/table/react';
import { Plate, usePlateEditor } from 'platejs/react';
import * as React from 'react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { createValue } from '@/registry/examples/values/demo-values';

export default function TableNoMergeDemo() {
  const editor = usePlateEditor({
    plugins: [
      ...EditorKit,
      TablePlugin.configure({
        initialState: {
          disableMerge: true,
        },
      }),
    ],
    initialValue: createValue('table'),
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
