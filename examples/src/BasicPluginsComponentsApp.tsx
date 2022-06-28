import React from 'react';
import {
  createBlockquotePlugin,
  createBoldPlugin,
  createCodePlugin,
  createHeadingPlugin,
  createItalicPlugin,
  createParagraphPlugin,
  createPlateUI,
  createPlugins,
  createStrikethroughPlugin,
  createUnderlinePlugin,
  Plate,
} from '@udecode/plate';
import { basicNodesValue } from './basic-elements/basicElementsValue';
import { editableProps } from './common/editableProps';
import { MyValue } from './typescript/plateTypes';

// try to remove a few plugins!
const plugins = createPlugins<MyValue>(
  [
    createParagraphPlugin(),
    createBlockquotePlugin(),
    // createCodeBlockPlugin({
    //   // You can either pass a component per plugin
    //   component: CodeBlockElement,
    // }),
    createHeadingPlugin(),

    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createStrikethroughPlugin(),
    createCodePlugin(),
  ],
  {
    // Or pass all components at once
    components: createPlateUI(),
  }
);

export default () => (
  <Plate
    editableProps={editableProps}
    initialValue={basicNodesValue}
    plugins={plugins}
  />
);
