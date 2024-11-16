'use client';

import React, { useState } from 'react';

import type { PlateRenderElementProps } from '@udecode/plate-common/react';

import { BasicElementsPlugin } from '@udecode/plate-basic-elements/react';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import {
  Plate,
  createPlatePlugin,
  usePlateEditor,
} from '@udecode/plate-common/react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlateUI } from '@/plate/demo/plate-ui';
import { basicNodesPlugins } from '@/registry/default/components/editor/plugins/basic-nodes-plugins';
import { exitBreakPlugin } from '@/registry/default/components/editor/plugins/exit-break-plugin';
import { resetBlockTypePlugin } from '@/registry/default/components/editor/plugins/reset-block-type-plugin';
import { softBreakPlugin } from '@/registry/default/components/editor/plugins/soft-break-plugin';
import { editableVoidsValue } from '@/registry/default/example/values/editable-voids-value';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';
import { Input } from '@/registry/default/plate-ui/input';

export const EditableVoidPlugin = createPlatePlugin({
  key: 'editable-void',
  node: {
    component: EditableVoidElement,
    isElement: true,
    isVoid: true,
  },
});

export function EditableVoidElement({
  attributes,
  children,
}: PlateRenderElementProps) {
  const [inputValue, setInputValue] = useState('');

  const editor = usePlateEditor({
    id: 'editable-void-basic-elements',
    override: { components: PlateUI },
    plugins: [
      ...basicNodesPlugins,
      resetBlockTypePlugin,
      softBreakPlugin,
      exitBreakPlugin,
    ],
  });

  return (
    // Need contentEditable=false or Firefox has issues with certain input types.
    <div {...attributes} contentEditable={false}>
      <div className="mt-2 grid gap-6 rounded-md border p-6 shadow">
        <Input
          id="name"
          className="my-2"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          placeholder="Name"
          type="text"
        />

        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="handed">Left or right handed:</Label>

          <RadioGroup id="handed" defaultValue="r1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="r1" value="r1" />
              <Label htmlFor="r1">Left</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem id="r2" value="r2" />
              <Label htmlFor="r2">Right</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="editable-void-basic-elements">
            Tell us about yourself:
          </Label>

          <Plate
            editor={editor}
            // initialValue={basicElementsValue}
          >
            <EditorContainer>
              <Editor />
            </EditorContainer>
          </Plate>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function EditableVoidsDemo() {
  const editor = usePlateEditor({
    override: { components: PlateUI },
    plugins: [BasicElementsPlugin, BasicMarksPlugin, EditableVoidPlugin],
    value: editableVoidsValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
