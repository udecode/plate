import React, { useState } from 'react';

import { Plate, type Value, usePlateEditor } from '@udecode/plate-common';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { editableProps } from '@/plate/demo/editableProps';
import { Editor } from '@/registry/default/plate-ui/editor';

const initialValue = [
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
  const [debugValue, setDebugValue] = useState<Value>(initialValue);
  const editor = usePlateEditor();

  return (
    <Plate
      editor={editor}
      initialValue={initialValue}
      onChange={({ value }) => {
        setDebugValue(value);
        // save newValue...
      }}
    >
      <Editor {...editableProps} />

      <Accordion collapsible type="single">
        <AccordionItem value="manual-installation">
          <AccordionTrigger>Debug Value</AccordionTrigger>
          <AccordionContent>{JSON.stringify(debugValue)}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Plate>
  );
}
