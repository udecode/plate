'use client';

import { Plate, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { Separator } from '@/components/ui/separator';
import { AlignKit } from '@/registry/components/editor/align';
import { BasicNodesKit } from '@/registry/components/editor/basic-nodes';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { FixedToolbar } from '@/registry/components/editor/fixed-toolbar';
import { MediaKit } from '@/registry/components/editor/media';
import { TurnIntoToolbarButton } from '@/registry/components/editor/turn-into-toolbar-button';
import { basicBlocksValue } from '@/registry/examples/values/basic-blocks-value';
import { basicMarksValue } from '@/registry/examples/values/basic-marks-value';
import { imageValue } from '@/registry/examples/values/media-value';

export default function MultipleEditorsDemo() {
  const editor = useCreateEditor({
    id: 'editor1',
    plugins: BasicNodesKit,
    initialValue: basicBlocksValue,
  });

  const editorMarks = useCreateEditor({
    id: 'marks',
    plugins: BasicNodesKit,
    initialValue: basicMarksValue,
  });

  const editorImage = useCreateEditor({
    id: 'image',
    plugins: [...BasicNodesKit, ...AlignKit, ...MediaKit],
    initialValue: imageValue,
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
