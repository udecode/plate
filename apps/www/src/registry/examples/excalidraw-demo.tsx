'use client';

import { ExcalidrawPlugin } from 'platejs/excalidraw/react';
import { Plate, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { ExcalidrawElement } from '@/registry/components/editor/excalidraw';
import { EditorKit } from '@/registry/components/editor/plugins';
import { excalidrawValue } from '@/registry/examples/values/excalidraw-value';

export default function ExcalidrawDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...EditorKit,
      ExcalidrawPlugin.configure({ component: ExcalidrawElement }),
    ],
    initialValue: excalidrawValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
