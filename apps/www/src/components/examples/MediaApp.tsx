import React from 'react';
import {
  createImagePlugin,
  createMediaEmbedPlugin,
  createSelectOnBackspacePlugin,
  ELEMENT_IMAGE,
  ELEMENT_MEDIA_EMBED,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { mediaValue } from '@/plate/demo/values/mediaValue';
import { HeadingToolbar } from '@/plate/toolbar/HeadingToolbar';

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

export default function MediaApp() {
  return (
    <PlateProvider<MyValue> plugins={plugins} initialValue={mediaValue}>
      <HeadingToolbar>
        {/* <ImageToolbarButton> */}
        {/*  <Icons.image /> */}
        {/* </ImageToolbarButton> */}
        {/* <MediaEmbedToolbarButton> */}
        {/*  <Icons.embed /> */}
        {/* </MediaEmbedToolbarButton> */}
      </HeadingToolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
