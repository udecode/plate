import React from 'react';
import {
  createDeserializeCsvPlugin,
  createHighlightPlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createMentionPlugin,
  createPlateUI,
  createSoftBreakPlugin,
  createTablePlugin,
  createTodoListPlugin,
  Plate,
} from '@udecode/plate';
import { createExcalidrawPlugin } from '@udecode/plate-ui-excalidraw';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { deserializeCsvValue } from './serializing-csv/deserializeCsvValue';
import { softBreakPlugin } from './soft-break/softBreakPlugin';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createImagePlugin(),
    createLinkPlugin(),
    createListPlugin(),
    createTablePlugin(),
    createTodoListPlugin(),
    createMediaEmbedPlugin(),
    createExcalidrawPlugin(),
    createHighlightPlugin(),
    createMentionPlugin(),
    createSoftBreakPlugin(softBreakPlugin),
    createDeserializeCsvPlugin(),
  ],
  {
    components: createPlateUI(),
  }
);

export default () => (
  <Plate<MyValue>
    editableProps={editableProps}
    plugins={plugins}
    initialValue={deserializeCsvValue}
  />
);
