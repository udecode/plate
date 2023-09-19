import React, { useState } from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import { Plate, Value } from '@udecode/plate-common';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Editor } from '@/registry/default/plate-ui/editor';

const initialValue = [
  {
    type: 'p',
    children: [
      {
        text: 'This is editable plain text with react and history plugins, just like a textarea!',
      },
    ],
  },
];

export default function BasicEditorHandlerDemo() {
  const [debugValue, setDebugValue] = useState<Value>(initialValue);

  return (
    <Plate
      initialValue={initialValue}
      onChange={(newValue) => {
        setDebugValue(newValue);
        // save newValue...
      }}
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
