'use client';

import React from 'react';

import { SingleLinePlugin } from '@udecode/plate-break/react';
import { Plate } from '@udecode/plate-common/react';

import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
import { singleLineValue } from '@/registry/default/example/values/single-line-value';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

export default function SingleLineDemo() {
  const editor = useCreateEditor({
    plugins: [...editorPlugins, SingleLinePlugin],
    value: singleLineValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
