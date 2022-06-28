import React from 'react';
import {
  createImagePlugin,
  createPlateUI,
  createTablePlugin,
  Plate,
} from '@udecode/plate';
import { createLinkPlugin } from '@udecode/plate-link/src/index';
import { createListPlugin } from '@udecode/plate-list/src/index';
import { createDeserializeMdPlugin } from '@udecode/plate-serializer-md/src/index';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
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
