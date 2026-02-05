'use client';

import * as React from 'react';

import { Plate, usePlateEditor } from 'platejs/react';

import { Separator } from '@/components/ui/separator';
import { BasicNodesKit } from '@/registry/components/editor/plugins/basic-nodes-kit';
import { MediaKit } from '@/registry/components/editor/plugins/media-kit';
import { basicBlocksValue } from '@/registry/examples/values/basic-blocks-value';
import { basicMarksValue } from '@/registry/examples/values/basic-marks-value';
import { imageValue } from '@/registry/examples/values/media-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';
import { FixedToolbar } from '@/registry/ui/fixed-toolbar';
import { TurnIntoToolbarButton } from '@/registry/ui/turn-into-toolbar-button';

export default function MultipleEditorsDemo() {
  const editor = usePlateEditor({
    id: 'editor1',
    plugins: BasicNodesKit,
    value: basicBlocksValue,
  });

  const editorMarks = usePlateEditor({
    id: 'marks',
    plugins: BasicNodesKit,
    value: basicMarksValue,
  });

  const editorImage = usePlateEditor({
    id: 'image',
    plugins: [...BasicNodesKit, ...MediaKit],
    value: imageValue,
  });

  return (
    <Plate editor={editor}>
      <Plate editor={editorMarks}>
        <Plate editor={editorImage}>
          <FixedToolbar>
            <TurnIntoToolbarButton />
          </FixedToolbar>

          <div>
            <EditorContainer>
              <Editor />
            </EditorContainer>
            <Separator />
            <EditorContainer>
              <Editor id="marks" />
            </EditorContainer>
            <Separator />
            <EditorContainer>
              <Editor id="image" />
            </EditorContainer>
          </div>
        </Plate>
      </Plate>
    </Plate>
  );
}
