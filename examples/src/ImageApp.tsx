import React from 'react';
import { Image } from '@styled-icons/material/Image';
import {
  createImagePlugin,
  createPlateUI,
  createSelectOnBackspacePlugin,
  ELEMENT_IMAGE,
  HeadingToolbar,
  ImageToolbarButton,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { imageValue } from './image/imageValue';
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
    components: createPlateUI(),
  }
);

export default () => (
  <>
    <PlateProvider>
      <HeadingToolbar>
        <ImageToolbarButton icon={<Image />} />
      </HeadingToolbar>
    </PlateProvider>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={imageValue}
    />
  </>
);
