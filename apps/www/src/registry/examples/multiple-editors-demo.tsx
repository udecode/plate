'use client';

import {
  EditorRoot,
  EditorController,
  useCreateEditor,
  useOptionalEditor,
} from 'platejs/react';
import * as React from 'react';

import { Separator } from '@/components/ui/separator';
import { AlignKit } from '@/registry/components/editor/align';
import { BasicNodesKit } from '@/registry/components/editor/basic-nodes';
import { DndKit } from '@/registry/components/editor/dnd';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { FixedToolbar } from '@/registry/components/editor/fixed-toolbar';
import { MediaKit } from '@/registry/components/editor/media';
import { TurnIntoToolbarButton } from '@/registry/components/editor/turn-into-toolbar-button';
import { basicBlocksValue } from '@/registry/examples/values/basic-blocks-value';
import { basicMarksValue } from '@/registry/examples/values/basic-marks-value';
import { imageValue } from '@/registry/examples/values/media-value';

function SharedToolbar() {
  const editor = useOptionalEditor();

  return <FixedToolbar>{editor && <TurnIntoToolbarButton />}</FixedToolbar>;
}

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
    plugins: [...BasicNodesKit, ...AlignKit, ...MediaKit, ...DndKit],
    initialValue: imageValue,
  });

  return (
    <EditorController>
      <SharedToolbar />

      <div>
        <EditorRoot editor={editor}>
          <EditorContainer>
            <Editor />
          </EditorContainer>
        </EditorRoot>
        <Separator />
        <EditorRoot editor={editorMarks}>
          <EditorContainer>
            <Editor />
          </EditorContainer>
        </EditorRoot>
        <Separator />
        <EditorRoot editor={editorImage}>
          <EditorContainer>
            <Editor />
          </EditorContainer>
        </EditorRoot>
      </div>
    </EditorController>
  );
}
