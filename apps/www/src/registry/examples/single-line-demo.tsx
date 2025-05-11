'use client';

import * as React from 'react';

import { SingleLinePlugin } from '@udecode/plate-break/react';
import { Plate } from '@udecode/plate/react';

import { editorPlugins } from '@/registry/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/components/editor/use-create-editor';
import { singleLineValue } from '@/registry/examples/values/single-line-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';

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
