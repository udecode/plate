import React, { useState } from 'react';
import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { Plate } from '@udecode/plate-common';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { basicEditorValue } from './BasicPluginsComponentsApp';

import { editableProps } from '@/plate/demo/editableProps';
import { MyPlatePlugin, MyValue } from '@/plate/plate.types';

const plugins: MyPlatePlugin[] = [
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

export default function BasicPluginsDefaultApp() {
  const [debugValue, setDebugValue] = useState<MyValue | null>(null);

  return (
    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={basicEditorValue}
      plugins={plugins}
      onChange={(newValue) => {
        setDebugValue(newValue);
        // save newValue...
      }}
    >
      debug value:
      <br />
      {JSON.stringify(debugValue)}
    </Plate>
  );
}
