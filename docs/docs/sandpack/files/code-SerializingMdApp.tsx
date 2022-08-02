export const serializingMdAppCode = `import React from 'react';
import {
  createDeserializeMdPlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createTablePlugin,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { linkPlugin } from './link/linkPlugin';
import { deserializeMdValue } from './serializing-md/deserializeMdValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createImagePlugin(),
    createLinkPlugin(linkPlugin),
    createListPlugin(),
    createTablePlugin(),
    createDeserializeMdPlugin(),
  ],
  {
    components: plateUI,
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
