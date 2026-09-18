'use client';

import {
  type EditorElementProps,
  definePlugin,
  EditorRoot,
  EditorElement,
  useCreateEditor,
} from 'platejs/react';
import * as React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { editableVoidsValue } from '@/registry/examples/values/editable-voids-value';

export const EditableVoidPlugin = definePlugin('editableVoid', {
  schema: { element: { void: 'block' } },
});

export function EditableVoidElement({
  children,
  ...props
}: EditorElementProps<typeof EditableVoidPlugin>) {
  const [inputValue, setInputValue] = React.useState('');

  const editor = useCreateEditor({
    plugins: EditorKit,
  });

  return (
    // Need contentEditable=false or Firefox has issues with certain input types.
    <EditorElement
      {...props}
      attributes={{ ...props.attributes, contentEditable: false }}
    >
      <div className="mt-2 grid gap-6 rounded-md border p-6 shadow-sm">
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
          <Label htmlFor="editable-void-basic-blocks">
            Tell us about yourself:
          </Label>

          <EditorRoot
            editor={editor}
            // initialValue={basicBlocksValue}
          >
            <EditorFrame className="h-auto">
              <EditorContainer>
                <Editor />
              </EditorContainer>
            </EditorFrame>
          </EditorRoot>
        </div>
      </div>
      {children}
    </EditorElement>
  );
}

export default function EditableVoidsDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...EditorKit,
      EditableVoidPlugin.configure({ component: EditableVoidElement }),
    ],
    initialValue: editableVoidsValue,
  });

  return (
    <EditorRoot editor={editor}>
      <EditorFrame>
        <EditorContainer>
          <Editor />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}
