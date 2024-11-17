'use client';

import React from 'react';

import { BasicElementsPlugin } from '@udecode/plate-basic-elements/react';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { Plate, usePlateEditor } from '@udecode/plate-common/react';
import { ImagePlugin } from '@udecode/plate-media/react';

import { PlateUI } from '@/plate/demo/plate-ui';
import { basicElementsValue } from '@/plate/demo/values/basicElementsValue';
import { basicMarksValue } from '@/plate/demo/values/basicMarksValue';
import { imageValue } from '@/plate/demo/values/mediaValue';
import { deletePlugins } from '@/registry/default/components/editor/plugins/delete-plugins';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';
import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';
import { Separator } from '@/registry/default/plate-ui/separator';
import { TurnIntoDropdownMenu } from '@/registry/default/plate-ui/turn-into-dropdown-menu';

export default function MultipleEditorsDemo() {
  const editor = usePlateEditor({
    override: { components: PlateUI },
    plugins: [BasicElementsPlugin, BasicMarksPlugin],
    value: basicElementsValue,
  });

  const editorMarks = usePlateEditor({
    id: 'marks',
    override: { components: PlateUI },
    plugins: [BasicElementsPlugin, BasicMarksPlugin],
    value: basicMarksValue,
  });

  const editorImage = usePlateEditor({
    id: 'marks',
    override: { components: PlateUI },
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
