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

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { linkPlugin } from '@/plate/link/linkPlugin';
import { deserializeCsvValue } from '@/plate/serializing-csv/deserializeCsvValue';
import { softBreakPlugin } from '@/plate/soft-break/softBreakPlugin';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

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
