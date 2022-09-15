export const mediaAppCode = `import React from 'react';
import { Image } from '@styled-icons/material/Image';
import { OndemandVideo } from '@styled-icons/material/OndemandVideo';
import {
  createImagePlugin,
  createMediaEmbedPlugin,
  createSelectOnBackspacePlugin,
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  ImageToolbarButton,
  MediaEmbedToolbarButton,
  Plate,
  PlateProvider,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { mediaValue } from './media/mediaValue';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createImagePlugin(),
    createMediaEmbedPlugin(),
    createSelectOnBackspacePlugin({
      options: {
        query: {
          allow: [ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED],
        },
      },
    }),
  ],
  {
    components: plateUI,
  }
);

export default () => (
  <PlateProvider<MyValue> plugins={plugins} initialValue={mediaValue}>
    <Toolbar>
      <ImageToolbarButton icon={<Image />} />
      <MediaEmbedToolbarButton icon={<OndemandVideo />} />
    </Toolbar>

    <Plate<MyValue> editableProps={editableProps} />
  </PlateProvider>
);
`;

export const mediaAppFile = {
  '/MediaApp.tsx': mediaAppCode,
};
