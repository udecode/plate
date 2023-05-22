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

import { basicElementsValue } from '@/plate/basic-elements/basicElementsValue';
import { basicMarksValue } from '@/plate/basic-marks/basicMarksValue';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { MyValue } from '@/plate/typescript/plateTypes';

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
