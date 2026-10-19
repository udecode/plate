'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';
import { TablePlugin } from 'platejs/table/react';

import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { createValue } from '@/registry/examples/values/demo-values';

export default function TableNoMergeDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...EditorKit,
      TablePlugin.configure({
        initialState: {
          allowCellSpanEditing: false,
        },
      }),
    ],
    initialValue: createValue('table'),
  });

  return (
    <EditorRoot editor={editor}>
      <EditorFrame className="h-[650px]">
        <EditorContainer>
          <Editor />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}
