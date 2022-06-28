export const basicPluginsDefaultAppCode = `import React from 'react';
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
import { basicNodesValue } from './basic-nodes/basicNodesValue';
import { editableProps } from './common/editableProps';
import { MyPlatePlugin, MyValue } from './typescript/plateTypes';

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

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    initialValue={basicNodesValue}
    plugins={plugins}
  />
);
`;

export const basicPluginsDefaultAppFile = {
  '/BasicPluginsDefaultApp.tsx': basicPluginsDefaultAppCode,
};
