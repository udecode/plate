import React from 'react';
import {
  createDeserializeCsvPlugin,
  createHighlightPlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createMentionPlugin,
  createSoftBreakPlugin,
  createTablePlugin,
  createTodoListPlugin,
  Plate,
} from '@udecode/plate';
import { createExcalidrawPlugin } from '@udecode/plate-excalidraw';

import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { linkPlugin } from '@/plate/demo/plugins/linkPlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { deserializeCsvValue } from '@/plate/demo/values/deserializeCsvValue';
import { createMyPlugins, MyValue } from '@/types/plate.types';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createImagePlugin(),
    createLinkPlugin(linkPlugin),
    createListPlugin(),
    createTablePlugin(),
    createTodoListPlugin(),
    createMediaEmbedPlugin(),
    createExcalidrawPlugin(),
    createHighlightPlugin(),
    createMentionPlugin(),
    createSoftBreakPlugin(softBreakPlugin),
    createDeserializeCsvPlugin({
      options: {
        parseOptions: {
          header: false,
        },
      },
    }),
  ],
  {
    components: plateUI,
  }
);

export default function SerializingCsvApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={deserializeCsvValue}
    />
  );
}
