'use client';

import React from 'react';

import { Plate } from '@udecode/plate-common/react';
import { TablePlugin } from '@udecode/plate-table/react';

import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
import { tableValue } from '@/registry/default/example/values/table-value';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

export default function TableMergeDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...editorPlugins,
      TablePlugin.configure({
        options: {
          enableMerging: false,
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
