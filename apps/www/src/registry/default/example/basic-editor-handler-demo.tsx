import React, { useState } from 'react';

import type { Value } from '@udecode/plate-common';

import { Plate, usePlateEditor } from '@udecode/plate-common/react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { editableProps } from '@/plate/demo/editableProps';
import { Editor } from '@/registry/default/plate-ui/editor';

const value = [
  {
    children: [
      {
        text: 'This is editable plain text with react and history plugins, just like a textarea!',
      },
    ],
    type: 'p',
  },
];

export default function BasicEditorHandlerDemo() {
  const [debugValue, setDebugValue] = useState<Value>(value);

  const localValue =
    typeof window !== 'undefined' && localStorage.getItem('editorContent');

  const editor = usePlateEditor({
    value: localValue ? JSON.parse(localValue) : value,
  });

  return (
    <Plate
      onChange={({ value }) => {
        localStorage.setItem('editorContent', JSON.stringify(value));
        setDebugValue(value);
      }}
      editor={editor}
    >
      <Editor {...editableProps} />

      <Accordion type="single" collapsible>
        <AccordionItem value="manual-installation">
          <AccordionTrigger>Debug Value</AccordionTrigger>
          <AccordionContent>{JSON.stringify(debugValue)}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Plate>
  );
}
