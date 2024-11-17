'use client';

import React, { useState } from 'react';

import type { Value } from '@udecode/plate-common';

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { Plate, usePlateEditor } from '@udecode/plate-common/react';
import { HeadingPlugin } from '@udecode/plate-heading/react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

import { basicEditorValue } from './basic-plugins-components-demo';

export default function BasicPluginsDefaultDemo() {
  const [debugValue, setDebugValue] = useState<Value>(basicEditorValue);
  const editor = usePlateEditor({
    plugins: [
      BlockquotePlugin,
      CodeBlockPlugin,
      HeadingPlugin,
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin,
    ],
    value: basicEditorValue,
  });

  return (
    <Plate
      onChange={({ value }) => {
        setDebugValue(value);
        // save newValue...
      }}
      editor={editor}
    >
      <EditorContainer>
        <Editor />
      </EditorContainer>

      <Accordion type="single" collapsible>
        <AccordionItem value="manual-installation">
          <AccordionTrigger>Debug Value</AccordionTrigger>
          <AccordionContent>{JSON.stringify(debugValue)}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Plate>
  );
}
