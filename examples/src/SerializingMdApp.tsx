import React from 'react';
import {
  createDeserializeMdPlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createTablePlugin,
  Plate,
} from '@udecode/plate';
import {
  createMyPlugins,
  MyPlatePlugin,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { linkPlugin } from './link/linkPlugin';
import { deserializeMdValue } from './serializing-md/deserializeMdValue';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createImagePlugin(),
    createLinkPlugin(linkPlugin),
    createListPlugin(),
    createTablePlugin(),
    createDeserializeMdPlugin() as MyPlatePlugin,
  ],
  {
    components: plateUI,
  }
);

export default function SerializingMdApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={deserializeMdValue}
    />
  );
}
