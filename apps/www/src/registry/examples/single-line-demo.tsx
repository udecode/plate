'use client';

import * as React from 'react';

import { Plate, SingleLinePlugin, usePlateEditor } from '@udecode/plate/react';

import { EditorKit } from '@/registry/components/editor/editor-kit';
import { singleLineValue } from '@/registry/examples/values/single-line-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';

export default function SingleLineDemo() {
  const editor = usePlateEditor({
    plugins: [...EditorKit, SingleLinePlugin],
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
