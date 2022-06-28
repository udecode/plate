import React from 'react';
import { Image } from '@styled-icons/material/Image';
import {
  createImagePlugin,
  createSelectOnBackspacePlugin,
  ELEMENT_IMAGE,
  ImageToolbarButton,
  Plate,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { imageValue } from './image/imageValue';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createImagePlugin(),
    createSelectOnBackspacePlugin({
      options: { query: { allow: [ELEMENT_IMAGE] } },
    }),
  ],
  {
    components: plateUI,
  }
);

export default () => (
  <>
    <Toolbar>
      <ImageToolbarButton icon={<Image />} />
    </Toolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={imageValue}
    />
  </>
);
