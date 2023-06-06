import React from 'react';
import { Plate } from '@udecode/plate-common';
import { createLinkPlugin } from '@udecode/plate-link';
import { createListPlugin } from '@udecode/plate-list';
import { createImagePlugin } from '@udecode/plate-media';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md';
import { createTablePlugin } from '@udecode/plate-table';

import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { linkPlugin } from '@/plate/demo/plugins/linkPlugin';
import { deserializeMdValue } from '@/plate/demo/values/deserializeMdValue';
import { createMyPlugins, MyPlatePlugin, MyValue } from '@/plate/plate.types';

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
