import React from 'react';
import {
  createDeserializeMdPlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createTablePlugin,
  Plate,
} from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import {
  createMyPlugins,
  MyPlatePlugin,
  MyValue,
} from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { linkPlugin } from '@/plate/demo/plugins/linkPlugin';
import { deserializeMdValue } from '@/plate/demo/values/deserializeMdValue';

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
