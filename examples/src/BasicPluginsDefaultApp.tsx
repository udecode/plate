import React from 'react';
import {
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createHeadingPlugin,
  createItalicPlugin,
  createParagraphPlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
  Plate,
} from '@udecode/plate';
import {
  MyPlatePlugin,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { basicMarksValue } from './basic-marks/basicMarksValue';
import { editableProps } from './common/editableProps';

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
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={[...basicElementsValue, ...basicMarksValue]}
      plugins={plugins}
    />
  );
}
