'use client';

import * as React from 'react';

import { TablePlugin } from '@udecode/plate-table/react';
import { Plate } from '@udecode/plate/react';

import { editorPlugins } from '@/registry/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/components/editor/use-create-editor';
import { tableValue } from '@/registry/examples/values/table-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';

export default function TableMergeDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...editorPlugins,
      TablePlugin.configure({
        options: {
          disableMerge: true,
        },
      }),
    ],
    value: tableValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
