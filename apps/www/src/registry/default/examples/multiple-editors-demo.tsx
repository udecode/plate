'use client';

import React from 'react';

import { BasicElementsPlugin } from '@udecode/plate-basic-elements/react';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { ImagePlugin } from '@udecode/plate-media/react';
import { Plate } from '@udecode/plate/react';

import { deletePlugins } from '@/registry/default/components/editor/plugins/delete-plugins';
import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
import { basicElementsValue } from '@/registry/default/examples/values/basic-elements-value';
import { basicMarksValue } from '@/registry/default/examples/values/basic-marks-value';
import { imageValue } from '@/registry/default/examples/values/media-value';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';
import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';
import { Separator } from '@/registry/default/plate-ui/separator';
import { TurnIntoDropdownMenu } from '@/registry/default/plate-ui/turn-into-dropdown-menu';

export default function MultipleEditorsDemo() {
  const editor = useCreateEditor({
    plugins: [BasicElementsPlugin, BasicMarksPlugin],
    value: basicElementsValue,
  });

  const editorMarks = useCreateEditor({
    id: 'marks',
    plugins: [BasicElementsPlugin, BasicMarksPlugin],
    value: basicMarksValue,
  });

  const editorImage = useCreateEditor({
    id: 'marks',
    plugins: [
      BasicElementsPlugin,
      BasicMarksPlugin,
      ImagePlugin,
      ...deletePlugins,
    ],
    value: imageValue,
  });

  return (
    <Plate editor={editor}>
      <Plate editor={editorMarks}>
        <Plate editor={editorImage}>
          <FixedToolbar>
            <TurnIntoDropdownMenu />
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
