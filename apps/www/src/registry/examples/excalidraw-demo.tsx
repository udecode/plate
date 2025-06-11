'use client';

import * as React from 'react';

import { ExcalidrawPlugin } from '@platejs/excalidraw/react';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/registry/components/editor/editor-kit';
import { excalidrawValue } from '@/registry/examples/values/excalidraw-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';
import { ExcalidrawElement } from '@/registry/ui/excalidraw-node';

export default function ExcalidrawDemo() {
  const editor = usePlateEditor({
    plugins: [...EditorKit, ExcalidrawPlugin.withComponent(ExcalidrawElement)],
    value: excalidrawValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
