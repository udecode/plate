import React from 'react';
import { createSoftBreakPlugin } from '@udecode/plate-break';
import { Plate } from '@udecode/plate-common';
import { createExcalidrawPlugin } from '@udecode/plate-excalidraw';
import { createHighlightPlugin } from '@udecode/plate-highlight';
import { createLinkPlugin } from '@udecode/plate-link';
import { createListPlugin, createTodoListPlugin } from '@udecode/plate-list';
import {
  createImagePlugin,
  createMediaEmbedPlugin,
} from '@udecode/plate-media';
import { createMentionPlugin } from '@udecode/plate-mention';
import { createDeserializeCsvPlugin } from '@udecode/plate-serializer-csv';
import { createTablePlugin } from '@udecode/plate-table';

import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { linkPlugin } from '@/plate/demo/plugins/linkPlugin';
import { softBreakPlugin } from '@/plate/demo/plugins/softBreakPlugin';
import { deserializeCsvValue } from '@/plate/demo/values/deserializeCsvValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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
