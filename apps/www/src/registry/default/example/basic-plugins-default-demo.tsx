import React, { useState } from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { Plate, PlatePlugin, Value } from '@udecode/plate-common';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createParagraphPlugin } from '@udecode/plate-paragraph';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Editor } from '@/registry/default/plate-ui/editor';

import { basicEditorValue } from './basic-plugins-components-demo';

const plugins: PlatePlugin[] = [
  createParagraphPlugin(),
  createBlockquotePlugin(),
  createCodeBlockPlugin(),
  createHeadingPlugin(),

  createBoldPlugin(),
  createItalicPlugin(),
  createUnderlinePlugin(),
  createStrikethroughPlugin(),
  createCodePlugin(),
];

export default function BasicPluginsDefaultDemo() {
  const [debugValue, setDebugValue] = useState<Value>(basicEditorValue);

  return (
    <Plate
      initialValue={basicEditorValue}
      plugins={plugins}
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
