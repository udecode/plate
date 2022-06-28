export const serializingMdAppCode = `import React from 'react';
import {
  createDeserializeMdPlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createPlateUI,
  createTablePlugin,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { deserializeMdValue } from './serializing-md/deserializeMdValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createImagePlugin(),
    createLinkPlugin(),
    createListPlugin(),
    createTablePlugin(),
    createDeserializeMdPlugin(),
  ],
  {
    components: createPlateUI(),
  }
);

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={deserializeMdValue}
  />
);
`;

export const serializingMdAppFile = {
  '/SerializingMdApp.tsx': serializingMdAppCode,
};
