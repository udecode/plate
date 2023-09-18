'use client';

import React, { CSSProperties, useState } from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { exitBreakPlugin } from '@/plate/demo/plugins/exitBreakPlugin';
import { resetBlockTypePlugin } from '@/plate/demo/plugins/resetBlockTypePlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { editableVoidsValue } from '@/plate/demo/values/editableVoidsValue';
import { createBasicElementsPlugin } from '@udecode/plate-basic-elements';
import {
  createExitBreakPlugin,
  createSoftBreakPlugin,
} from '@udecode/plate-break';
import {
  createPluginFactory,
  Plate,
  PlateRenderElementProps,
  TElement,
} from '@udecode/plate-common';
import { createResetNodePlugin } from '@udecode/plate-reset-node';

import { createMyPlugins, MyEditor, MyValue } from '@/types/plate-types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Editor } from '@/registry/default/plate-ui/editor';
import { Input } from '@/registry/default/plate-ui/input';

export const ELEMENT_EDITABLE_VOID = 'editable-void';

export const createEditableVoidPlugin = createPluginFactory({
  key: ELEMENT_EDITABLE_VOID,
  isElement: true,
  isVoid: true,
});

const editableVoidPlugins = createMyPlugins(
  [
    createBasicElementsPlugin(),
    createResetNodePlugin(resetBlockTypePlugin),
    createSoftBreakPlugin(softBreakPlugin),
    createExitBreakPlugin(exitBreakPlugin),
  ],
  {
    components: plateUI,
  }
);
const styles: Record<string, CSSProperties> = {
  input: { margin: '8px 0' },
  radio: { width: 'unset' },
  editor: { padding: '20px', border: '2px solid #ddd' },
};

export function EditableVoidElement({
  attributes,
  children,
}: PlateRenderElementProps<MyValue, TElement>) {
  const [inputValue, setInputValue] = useState('');

  return (
    // Need contentEditable=false or Firefox has issues with certain input types.
    <div {...attributes} contentEditable={false}>
      <div className="mt-2 grid gap-6 rounded-md border p-6 shadow">
        <Input
          type="text"
          id="name"
          placeholder="Name"
          className="my-2"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />

        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="handed">Left or right handed:</Label>

          <RadioGroup id="handed" defaultValue="r1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="r1" id="r1" />
              <Label htmlFor="r1">Left</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="r2" id="r2" />
              <Label htmlFor="r2">Right</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="editable-void-basic-elements">
            Tell us about yourself:
          </Label>

          <Plate<MyValue, MyEditor>
            id="editable-void-basic-elements"
            plugins={editableVoidPlugins}
            // initialValue={basicElementsValue}
          >
            <Editor {...editableProps} />
          </Plate>
        </div>
      </div>
      {children}
    </div>
  );
}

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createEditableVoidPlugin({
      component: EditableVoidElement,
    }),
  ],
  {
    components: plateUI,
  }
);

export default function EditableVoidsDemo() {
  return (
    <div className="p-10">
      <Plate<MyValue> plugins={plugins} initialValue={editableVoidsValue}>
        <Editor {...editableProps} />
      </Plate>
    </div>
  );
}
