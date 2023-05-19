import React from 'react';
import {
  createBlockquotePlugin,
  createBoldPlugin,
  createCodePlugin,
  createHeadingPlugin,
  createItalicPlugin,
  createParagraphPlugin,
  createPlugins,
  createStrikethroughPlugin,
  createUnderlinePlugin,
  Plate,
} from '@udecode/plate';
import { basicElementsValue } from './basic-elements/basicElementsValue';
import { basicMarksValue } from './basic-marks/basicMarksValue';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
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
    components: plateUI,
  }
);

export default function BasicPluginsComponentsApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={[...basicElementsValue, ...basicMarksValue]}
      plugins={plugins}
    />
  );
}
