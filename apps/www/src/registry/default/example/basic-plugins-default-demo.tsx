import React, { useState } from 'react';

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { BlockquotePlugin } from '@udecode/plate-block-quote';
import { CodeBlockPlugin } from '@udecode/plate-code-block';
import { Plate, type Value, usePlateEditor } from '@udecode/plate-common';
import { HeadingPlugin } from '@udecode/plate-heading';
import { ParagraphPlugin } from '@udecode/plate-paragraph';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { editableProps } from '@/plate/demo/editableProps';
import { Editor } from '@/registry/default/plate-ui/editor';

import { basicEditorValue } from './basic-plugins-components-demo';

export default function BasicPluginsDefaultDemo() {
  const [debugValue, setDebugValue] = useState<Value>(basicEditorValue);
  const editor = usePlateEditor({
    plugins: [
      ParagraphPlugin,
      BlockquotePlugin,
      CodeBlockPlugin,
      HeadingPlugin,
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin,
    ],
  });

  return (
    <Plate
      editor={editor}
      initialValue={basicEditorValue}
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
