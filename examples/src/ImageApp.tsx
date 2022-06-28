import 'tippy.js/dist/tippy.css';
import React from 'react';
import { Image } from '@styled-icons/material/Image';
import {
  createImagePlugin,
  createPlateUI,
  createSelectOnBackspacePlugin,
  HeadingToolbar,
  Plate,
} from '@udecode/plate';
import { PlateProvider } from '@udecode/plate-core/src/index';
import { ELEMENT_IMAGE } from '@udecode/plate-image/src/index';
import { ImageToolbarButton } from '@udecode/plate-ui-image/src/index';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
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
