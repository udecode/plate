export const basicPluginsDefaultAppCode = `import React, { useState } from 'react';
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
  PlatePlugin,
} from '@udecode/plate';
import { basicNodesValue } from './basic-elements/basicElementsValue';
import { editableProps } from './common/editableProps';
import { MyValue } from './typescript/plateTypes';

const plugins: PlatePlugin<{}, MyValue>[] = [
  // elements
  createParagraphPlugin(), // paragraph element
  createBlockquotePlugin(), // blockquote element
  createCodeBlockPlugin(), // code block element
  createHeadingPlugin(), // heading elements

  // marks
  createBoldPlugin(), // bold mark
  createItalicPlugin(), // italic mark
  createUnderlinePlugin(), // underline mark
  createStrikethroughPlugin(), // strikethrough mark
  createCodePlugin(), // code mark
];

export default () => {
  const [debugValue, setDebugValue] = useState('');

  return (
    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={basicNodesValue}
      onChange={(newValue) => {
        setDebugValue(JSON.stringify(newValue));
      }}
      plugins={plugins}
    >
      {debugValue}
    </Plate>
  );
};
`;

export const basicPluginsDefaultAppFile = {
  '/BasicPluginsDefaultApp.tsx': basicPluginsDefaultAppCode,
};
